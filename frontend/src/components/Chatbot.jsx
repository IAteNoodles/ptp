import { useState, useRef } from 'react'
import './Chatbot.css'

const Chatbot = () => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [showCamera, setShowCamera] = useState(false)

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file)
    }
  }

  // Handle camera capture
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      })
      setShowCamera(true)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Unable to access camera. Please check permissions.')
    }
  }

  const captureImage = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' })
      setSelectedImage(file)
      stopCamera()
    })
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject
      const tracks = stream.getTracks()
      tracks.forEach(track => track.stop())
    }
    setShowCamera(false)
  }

  // Send message to backend
  const sendMessage = async () => {
    if (!inputMessage.trim() && !selectedImage) return

    const userMessage = {
      type: 'user',
      content: inputMessage,
      image: selectedImage ? URL.createObjectURL(selectedImage) : null,
      timestamp: new Date().toLocaleTimeString()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('message', inputMessage)
      if (selectedImage) {
        formData.append('image', selectedImage)
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      
      const botMessage = {
        type: 'bot',
        content: data.response || 'I received your message!',
        timestamp: new Date().toLocaleTimeString()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toLocaleTimeString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setInputMessage('')
      setSelectedImage(null)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="chatbot-container">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <p>Welcome! I'm here to help with Bengaluru's problems. Send me a message or upload an image to get started.</p>
          </div>
        )}
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            <div className="message-content">
              {message.image && (
                <img src={message.image} alt="Uploaded" className="message-image" />
              )}
              <p>{message.content}</p>
              <span className="timestamp">{message.timestamp}</span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCamera && (
        <div className="camera-modal">
          <div className="camera-container">
            <video ref={videoRef} autoPlay playsInline></video>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
            <div className="camera-controls">
              <button onClick={captureImage} className="capture-btn">
                📸 Capture
              </button>
              <button onClick={stopCamera} className="cancel-btn">
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="chat-input-container">
        {selectedImage && (
          <div className="selected-image-preview">
            <img src={URL.createObjectURL(selectedImage)} alt="Selected" />
            <button onClick={() => setSelectedImage(null)} className="remove-image">
              ❌
            </button>
          </div>
        )}
        
        <div className="chat-input">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message about Bengaluru's problems..."
            rows="1"
            className="message-input"
          />
          
          <div className="input-actions">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            
            <button
              onClick={() => fileInputRef.current.click()}
              className="action-btn upload-btn"
              title="Upload Image"
            >
              📁
            </button>
            
            <button
              onClick={startCamera}
              className="action-btn camera-btn"
              title="Take Picture"
            >
              📷
            </button>
            
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() && !selectedImage}
              className="action-btn send-btn"
              title="Send Message"
            >
              🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chatbot