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
    <section className="hero-container" aria-label="Project Sahaya Hero Section">
      <div className="hero-content">
        {/* Hero Badge */}
        <div className="hero-badge">
          <span className="badge-icon">✨</span>
          <span className="badge-text">AI-Powered Civic Reporting</span>
        </div>

        <header className="hero-header">
          <h1 className="hero-title">
            <span className="title-main">Project Sahaya</span>
            <span className="title-separator">:</span>
            <span className="highlight">Empowering Bengaluru</span>
            <span className="title-tagline">One Report at a Time</span>
          </h1>
          
          <p className="hero-subtitle">
            Transform civic reporting with AI-powered intelligence. Simply capture, describe, and watch as your community concerns become actionable solutions through smart automation.
          </p>
        </header>

        <nav className="hero-actions" aria-label="Main Actions">
          <button 
            className="cta-button primary-button"
            onClick={handleReportIssue}
            aria-label="Report an issue to make a difference"
          >
            <div className="button-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="button-content">
              <span className="button-title">Report an Issue</span>
              <span className="button-subtitle">Start making a difference today</span>
            </div>
            <div className="button-shine"></div>
          </button>

          <button 
            className="cta-button secondary-button"
            onClick={handleAdminAccess}
            aria-label="Access admin panel for municipal administrators"
          >
            <div className="button-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="button-content">
              <span className="button-title">Admin Access</span>
              <span className="button-subtitle">Municipal administration portal</span>
            </div>
            <div className="button-shine"></div>
          </button>
        </nav>

        <section className="hero-features" aria-label="Key Features">
          <div className="feature" data-feature="ai">
            <div className="feature-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.3"/>
              </svg>
            </div>
            <h3>AI-Powered Intelligence</h3>
            <p>Advanced machine learning categorizes and routes your reports to the right departments instantly</p>
          </div>
          
          <div className="feature" data-feature="visual">
            <div className="feature-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 2L7.17 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4H16.83L15 2H9ZM12 7C14.76 7 17 9.24 17 12S14.76 17 12 17S7 14.76 7 12S9.24 7 12 7Z" fill="currentColor"/>
              </svg>
            </div>
            <h3>Visual Documentation</h3>
            <p>Capture high-quality images with automatic enhancement for precise issue identification</p>
          </div>
          
          <div className="feature" data-feature="speed">
            <div className="feature-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 1L23 6V10C23 16.12 19.49 21.84 13 22.74C6.51 21.84 3 16.12 3 10V6L13 1ZM12 7C9.24 7 7 9.24 7 12S9.24 17 12 17S17 14.76 17 12S14.76 7 12 7Z" fill="currentColor"/>
              </svg>
            </div>
            <h3>Lightning Fast</h3>
            <p>Real-time processing ensures your reports reach the right hands within seconds</p>
          </div>
          
          <div className="feature" data-feature="tracking">
            <div className="feature-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3V21H21V3H3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="currentColor"/>
              </svg>
            </div>
            <h3>Progress Tracking</h3>
            <p>Complete transparency from submission to resolution with real-time status updates</p>
          </div>
        </section>
      </div>

      {/* Modern Background Elements */}
      <div className="hero-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="geometric-pattern"></div>
        <div className="mesh-gradient"></div>
      </div>

      {/* Scroll Indicator */}
      <div className="scroll-indicator" aria-label="Scroll down for more content">
        <div className="scroll-arrow"></div>
      </div>
    </section>
  )
}

export default Hero