import { useState } from 'react'
import './App.css'
import Chatbot from './components/Chatbot'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Namma Bengaluru - Multiple Problems, one solution</h1>
      </header>
      <main className="app-main">
        <Chatbot />
      </main>
    </div>
  )
}

export default App
