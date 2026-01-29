import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'
import './i18n'

// Prevent flash on initial load
document.body.classList.add('no-transition')
setTimeout(() => {
    document.body.classList.remove('no-transition')
}, 100)

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
)
