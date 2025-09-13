import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()

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

  // Handle OK button click - save JSON and redirect
  const handleReportOK = (reportData) => {
    try {
      // Create JSON data with timestamp
      const jsonData = {
        ...reportData,
        submitted_at: new Date().toISOString(),
        status: 'submitted'
      }

      // Save to localStorage for admin panel
      const existingComplaints = JSON.parse(localStorage.getItem('submittedComplaints') || '[]')
      existingComplaints.push(jsonData)
      localStorage.setItem('submittedComplaints', JSON.stringify(existingComplaints))

      // Create and download JSON file
      const dataStr = JSON.stringify(jsonData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `complaint_report_${Date.now()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up the URL object
      URL.revokeObjectURL(url)

      // Show success message
      alert('Report submitted successfully! Redirecting to home page...')

      // Redirect to root page
      navigate('/')
    } catch (error) {
      console.error('Error creating JSON file:', error)
      alert('Error saving report. Please try again.')
    }
  }

  // Hardcoded civic issue reports
  const getHardcodedReport = (type) => {
    switch (type) {
      case 'pothole':
        return {
          title: "Large Pothole Causing Traffic Hazard",
          department: "Roads & Infrastructure", 
          severity: "High",
          description: "A significant pothole has formed on the main road, creating dangerous driving conditions. The pothole appears to be deep and wide enough to cause vehicle damage. Multiple vehicles have been observed swerving to avoid it, creating traffic safety concerns.",
          suggested_action: "Immediate road repair with asphalt filling. Installation of temporary warning signs until permanent repair is completed.",
          estimated_timeline: "2-3 days for emergency repair",
          location: "Main road (location needs to be specified)",
          category: "Infrastructure"
        }
      case 'drainage':
        return {
          title: "Blocked Drainage Causing Waterlogging",
          department: "Drainage",
          severity: "High",
          description: "Blocked drainage in the area is causing severe waterlogging, especially during rains. This is leading to unhygienic conditions and inconvenience for residents.",
          suggested_action: "Immediate cleaning and unclogging of the drainage system. Regular maintenance to prevent recurrence.",
          estimated_timeline: "1-2 days",
          location: "Area with reported waterlogging (specify location)",
          category: "Sanitation"
        }
      case 'garbage':
        return {
          title: "Uncollected Garbage Piling Up",
          department: "Waste Management",
          severity: "Medium",
          description: "Garbage has not been collected for several days, resulting in piles of waste on the street. This is attracting stray animals and causing foul smell.",
          suggested_action: "Schedule immediate waste collection and review collection routes for efficiency.",
          estimated_timeline: "1-2 days",
          location: "Street/area with garbage issue (specify location)",
          category: "Sanitation"
        }
      default:
        return null
    }
  }

  // Send message (frontend only processing)
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

    // Simulate processing delay
    setTimeout(() => {
      // Lowercase message for matching
      const msg = inputMessage.toLowerCase()
      let reportType = null
      if (msg.includes('pothole')) reportType = 'pothole'
      else if (msg.includes('drainage') || msg.includes('waterlogging')) reportType = 'drainage'
      else if (msg.includes('garbage') || msg.includes('waste')) reportType = 'garbage'

      if (reportType) {
        const reportMessage = {
          type: 'report',
          content: 'Report generated successfully',
          report: getHardcodedReport(reportType),
          timestamp: new Date().toLocaleTimeString()
        }
        setMessages(prev => [...prev, reportMessage])
      } else {
        const botMessage = {
          type: 'bot',
          content: 'Not identified as a valid report. Please try again with a clearer description of the civic issue.',
          timestamp: new Date().toLocaleTimeString()
        }
        setMessages(prev => [...prev, botMessage])
      }

      setIsLoading(false)
      setInputMessage('')
      setSelectedImage(null)
    }, 1500) // 1.5 second delay to simulate processing
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
              
              {message.type === 'report' ? (
                <div className="report-container">
                  <div className="report-header">
                    <h3>📋 Generated Report</h3>
                    {message.warning && (
                      <div className="report-warning">⚠️ {message.warning}</div>
                    )}
                  </div>
                  
                  <div className="report-content">
                    <div className="report-field">
                      <strong>Title:</strong> {message.report.title}
                    </div>
                    <div className="report-field">
                      <strong>Department:</strong> {message.report.department}
                    </div>
                    <div className="report-field">
                      <strong>Severity:</strong> 
                      <span className={`severity-badge severity-${message.report.severity?.toLowerCase()}`}>
                        {message.report.severity}
                      </span>
                    </div>
                    <div className="report-field">
                      <strong>Location:</strong> {message.report.location}
                    </div>
                    <div className="report-field">
                      <strong>Category:</strong> {message.report.category}
                    </div>
                    <div className="report-field">
                      <strong>Description:</strong>
                      <p className="report-description">{message.report.description}</p>
                    </div>
                    <div className="report-field">
                      <strong>Suggested Action:</strong>
                      <p className="report-action">{message.report.suggested_action}</p>
                    </div>
                    <div className="report-field">
                      <strong>Estimated Timeline:</strong> {message.report.estimated_timeline}
                    </div>
                  </div>
                  
                  <div className="report-actions">
                    <button 
                      className="report-btn btn-ok"
                      onClick={() => handleReportOK(message.report)}
                    >
                      ✅ OK
                    </button>
                  </div>
                </div>
              ) : (
                <p>{message.content}</p>
              )}
              
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