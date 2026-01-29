import { describe, it, expect, beforeEach } from 'vitest'
import { useWalletStore } from '../walletStore'

describe('WalletStore', () => {
    beforeEach(() => {
        // Reset store before each test
        useWalletStore.getState().resetWallet()
    })

    describe('Initial State', () => {
        it('should have correct initial balance', () => {
            const state = useWalletStore.getState()
            expect(state.balance).toBe(500)
            expect(state.initialDeposit).toBe(500)
        })

        it('should have no holdings initially', () => {
            const state = useWalletStore.getState()
            expect(Object.keys(state.holdings)).toHaveLength(0)
        })

        it('should have initial deposit transaction', () => {
            const state = useWalletStore.getState()
            expect(state.transactions).toHaveLength(1)
            expect(state.transactions[0].type).toBe('deposit')
        })
    })

    describe('Buy Operations', () => {
        it('should successfully buy crypto', () => {
            const { buy } = useWalletStore.getState()

            const result = buy('BTCUSDT', 'Bitcoin', 'BTC', 100, 50000, '#F7931A')

            expect(result.success).toBe(true)
            expect(result.executedPrice).toBeDefined()
        })

        it('should deduct balance after buy', () => {
            const { buy } = useWalletStore.getState()
            const initialBalance = useWalletStore.getState().balance

            buy('BTCUSDT', 'Bitcoin', 'BTC', 100, 50000, '#F7931A')

            const state = useWalletStore.getState()
            // Balance should be less by amount + fee (0.1%)
            expect(state.balance).toBeLessThan(initialBalance)
            expect(state.balance).toBeCloseTo(initialBalance - 100 - 0.1, 1) // 100 + 0.1% fee
        })

        it('should create holding after buy', () => {
            const { buy, getHolding } = useWalletStore.getState()

            buy('BTCUSDT', 'Bitcoin', 'BTC', 100, 50000, '#F7931A')

            const holding = getHolding('BTCUSDT')
            expect(holding).toBeDefined()
            expect(holding?.symbol).toBe('BTCUSDT')
            expect(holding?.amount).toBeGreaterThan(0)
        })

        it('should fail buy with insufficient balance', () => {
            const { buy } = useWalletStore.getState()

            const result = buy('BTCUSDT', 'Bitcoin', 'BTC', 1000, 50000, '#F7931A')

            expect(result.success).toBe(false)
            expect(result.error).toBe('Insufficient balance')
        })

        it('should add fee to transaction', () => {
            const { buy } = useWalletStore.getState()

            buy('BTCUSDT', 'Bitcoin', 'BTC', 100, 50000, '#F7931A')

            const state = useWalletStore.getState()
            const tx = state.transactions[0]
            expect(tx.fee).toBe(0.1) // 0.1% of 100
        })

        it('should average price on multiple buys', () => {
            const { buy, getHolding } = useWalletStore.getState()

            // Disable slippage for predictable test
            useWalletStore.getState().setSlippage(false)

            buy('BTCUSDT', 'Bitcoin', 'BTC', 100, 50000, '#F7931A')
            buy('BTCUSDT', 'Bitcoin', 'BTC', 100, 60000, '#F7931A')

            const holding = getHolding('BTCUSDT')
            // Average price should be between 50000 and 60000
            expect(holding?.avgBuyPrice).toBeGreaterThan(50000)
            expect(holding?.avgBuyPrice).toBeLessThan(60000)
        })
    })

    describe('Sell Operations', () => {
        beforeEach(() => {
            // Setup: Buy some crypto first
            useWalletStore.getState().setSlippage(false)
            useWalletStore.getState().buy('BTCUSDT', 'Bitcoin', 'BTC', 100, 50000, '#F7931A')
        })

        it('should successfully sell crypto', () => {
            const { sell, getHolding } = useWalletStore.getState()
            const holding = getHolding('BTCUSDT')!

            const result = sell('BTCUSDT', holding.amount, 55000)

            expect(result.success).toBe(true)
        })

        it('should increase balance after sell', () => {
            const { sell, getHolding } = useWalletStore.getState()
            const holding = getHolding('BTCUSDT')!
            const balanceBefore = useWalletStore.getState().balance

            sell('BTCUSDT', holding.amount, 55000)

            const balanceAfter = useWalletStore.getState().balance
            expect(balanceAfter).toBeGreaterThan(balanceBefore)
        })

        it('should remove holding after selling all', () => {
            const { sell, getHolding } = useWalletStore.getState()
            const holding = getHolding('BTCUSDT')!

            sell('BTCUSDT', holding.amount, 55000)

            expect(getHolding('BTCUSDT')).toBeUndefined()
        })

        it('should fail sell with insufficient holdings', () => {
            const { sell } = useWalletStore.getState()

            const result = sell('BTCUSDT', 999, 55000)

            expect(result.success).toBe(false)
            expect(result.error).toBe('Insufficient holdings')
        })
    })

    describe('P&L Calculations', () => {
        it('should calculate positive P&L correctly', () => {
            useWalletStore.getState().setSlippage(false)
            useWalletStore.getState().buy('BTCUSDT', 'Bitcoin', 'BTC', 100, 50000, '#F7931A')

            const { getPortfolioMetrics } = useWalletStore.getState()

            // If price goes up to 60000
            const metrics = getPortfolioMetrics({ BTCUSDT: 60000 })

            // Should show profit
            expect(metrics.profitLoss).toBeGreaterThan(0)
        })

        it('should calculate negative P&L correctly', () => {
            useWalletStore.getState().setSlippage(false)
            useWalletStore.getState().buy('BTCUSDT', 'Bitcoin', 'BTC', 100, 50000, '#F7931A')

            const { getPortfolioMetrics } = useWalletStore.getState()

            // If price drops to 40000
            const metrics = getPortfolioMetrics({ BTCUSDT: 40000 })

            // Should show loss
            expect(metrics.profitLoss).toBeLessThan(0)
        })

        it('should calculate portfolio value correctly', () => {
            useWalletStore.getState().setSlippage(false)
            useWalletStore.getState().buy('BTCUSDT', 'Bitcoin', 'BTC', 100, 50000, '#F7931A')

            const { getPortfolioValue, balance } = useWalletStore.getState()

            const value = getPortfolioValue({ BTCUSDT: 50000 })

            // Portfolio = cash balance + holdings value
            expect(value).toBeGreaterThan(balance)
        })
    })

    describe('Limit Orders', () => {
        it('should place limit buy order', () => {
            const { placeLimitOrder, pendingOrders } = useWalletStore.getState()

            const result = placeLimitOrder('buy', 'BTCUSDT', 'Bitcoin', 'BTC', 100, 45000, '#F7931A')

            expect(result.success).toBe(true)
            expect(result.orderId).toBeDefined()
            expect(useWalletStore.getState().pendingOrders).toHaveLength(1)
        })

        it('should cancel pending order', () => {
            const { placeLimitOrder, cancelOrder } = useWalletStore.getState()

            const orderResult = placeLimitOrder('buy', 'BTCUSDT', 'Bitcoin', 'BTC', 100, 45000, '#F7931A')
            const cancelResult = cancelOrder(orderResult.orderId!)

            expect(cancelResult.success).toBe(true)
            expect(useWalletStore.getState().pendingOrders[0].status).toBe('cancelled')
        })
    })

    describe('Stop-Loss Orders', () => {
        beforeEach(() => {
            useWalletStore.getState().setSlippage(false)
            useWalletStore.getState().buy('BTCUSDT', 'Bitcoin', 'BTC', 100, 50000, '#F7931A')
        })

        it('should place stop-loss order', () => {
            const { placeStopLoss, getHolding } = useWalletStore.getState()
            const holding = getHolding('BTCUSDT')!

            const result = placeStopLoss('BTCUSDT', holding.amount, 45000)

            expect(result.success).toBe(true)
            expect(result.orderId).toBeDefined()
        })

        it('should execute stop-loss when price drops', () => {
            const { placeStopLoss, checkAndExecuteOrders, getHolding } = useWalletStore.getState()
            const holding = getHolding('BTCUSDT')!

            placeStopLoss('BTCUSDT', holding.amount, 45000)
            checkAndExecuteOrders({ BTCUSDT: 44000 }) // Price below stop

            expect(useWalletStore.getState().pendingOrders[0].status).toBe('filled')
        })
    })

    describe('Slippage Simulation', () => {
        it('should apply slippage when enabled', () => {
            useWalletStore.getState().setSlippage(true, 0.5) // 0.5% max slippage

            const { buy } = useWalletStore.getState()
            const result = buy('BTCUSDT', 'Bitcoin', 'BTC', 100, 50000, '#F7931A')

            // Executed price should be different (higher for buy)
            expect(result.executedPrice).toBeGreaterThanOrEqual(50000)
        })

        it('should not apply slippage when disabled', () => {
            useWalletStore.getState().setSlippage(false)

            const { buy } = useWalletStore.getState()
            const result = buy('BTCUSDT', 'Bitcoin', 'BTC', 100, 50000, '#F7931A')

            expect(result.executedPrice).toBe(50000)
        })
    })

    describe('Trading Journal', () => {
        beforeEach(() => {
            useWalletStore.getState().setSlippage(false)
            useWalletStore.getState().buy('BTCUSDT', 'Bitcoin', 'BTC', 100, 50000, '#F7931A')
        })

        it('should add journal note to transaction', () => {
            const { addJournalNote, transactions, journalEntries } = useWalletStore.getState()
            const txId = transactions[0].id

            addJournalNote(txId, 'Test trade note', ['bitcoin', 'test'])

            expect(useWalletStore.getState().journalEntries).toHaveLength(1)
        })

        it('should retrieve journal note for transaction', () => {
            const { addJournalNote, getJournalForTransaction, transactions } = useWalletStore.getState()
            const txId = transactions[0].id

            addJournalNote(txId, 'My trade analysis', ['analysis'])

            const journal = getJournalForTransaction(txId)
            expect(journal?.note).toBe('My trade analysis')
            expect(journal?.tags).toContain('analysis')
        })
    })
})
