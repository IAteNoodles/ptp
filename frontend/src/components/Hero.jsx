import { useNavigate } from 'react-router-dom'
import './Hero.css'

const Hero = () => {
  const navigate = useNavigate()

  const handleReportIssue = () => {
    navigate('/chat')
  }

  const handleAdminAccess = () => {
    navigate('/admin')
  }

  return (
    <div className="hero-container">
      <div className="hero-content">
        <div className="hero-header">
          <h1 className="hero-title">
            Project Sahaya: <span className="highlight">Empowering Bengaluru</span>, One Report at a Time.
          </h1>
          
          <p className="hero-subtitle">
            Tired of civic issues going unnoticed? Project Sahaya leverages AI to transform your reports into actionable change. Snap a photo, add a description, and let us handle the rest.
          </p>
        </div>

        <div className="hero-actions">
          <button 
            className="cta-button primary-button"
            onClick={handleReportIssue}
          >
            <span className="button-icon">📱</span>
            <div className="button-content">
              <span className="button-title">Report an Issue Now</span>
              <span className="button-subtitle">Start making a difference today</span>
            </div>
          </button>

          <button 
            className="cta-button secondary-button"
            onClick={handleAdminAccess}
          >
            <span className="button-icon">🛡️</span>
            <div className="button-content">
              <span className="button-title">Access Admin Panel</span>
              <span className="button-subtitle">For municipal administrators</span>
            </div>
          </button>
        </div>

        <div className="hero-features">
          <div className="feature">
            <div className="feature-icon">🤖</div>
            <h3>AI-Powered</h3>
            <p>Smart categorization and routing of your reports</p>
          </div>
          <div className="feature">
            <div className="feature-icon">📸</div>
            <h3>Visual Documentation</h3>
            <p>Upload photos for faster issue identification</p>
          </div>
          <div className="feature">
            <div className="feature-icon">⚡</div>
            <h3>Quick Action</h3>
            <p>Real-time processing and department routing</p>
          </div>
          <div className="feature">
            <div className="feature-icon">📊</div>
            <h3>Track Progress</h3>
            <p>Monitor your reports from submission to resolution</p>
          </div>
        </div>
      </div>

      <div className="hero-background">
        <div className="bg-pattern"></div>
        <div className="floating-elements">
          <div className="floating-element element-1"></div>
          <div className="floating-element element-2"></div>
          <div className="floating-element element-3"></div>
          <div className="floating-element element-4"></div>
        </div>
      </div>
    </div>
  )
}

export default Hero