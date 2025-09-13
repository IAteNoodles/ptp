import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Hero from './components/Hero'
import Chatbot from './components/Chatbot'
import AdminPanel from './components/AdminPanel'

function App() {
  return (
    <Router>
      <div className="app">
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/chat" element={<Chatbot />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
