import { useState, useEffect } from 'react'
import './AdminPanel.css'

const AdminPanel = () => {
  const [complaints, setComplaints] = useState([])
  const [expandedCards, setExpandedCards] = useState(new Set())
  const [loading, setLoading] = useState(false)

  // Load complaints from localStorage (where we'll store submitted reports)
  const loadComplaintsFromStorage = () => {
    try {
      const storedComplaints = localStorage.getItem('submittedComplaints')
      if (storedComplaints) {
        const parsedComplaints = JSON.parse(storedComplaints)
        return parsedComplaints.map((complaint, index) => ({
          id: index + 1,
          ...complaint,
          timestamp: complaint.submitted_at || new Date().toISOString()
        }))
      }
    } catch (error) {
      console.error('Error loading complaints from storage:', error)
    }
    return []
  }

  // Mock data for demonstration (keeping some sample data)
  const mockComplaints = [
    {
      id: 101,
      title: "Sample: Garbage Collection Issue",
      department: "Waste Management",
      severity: "Medium",
      description: "Sample complaint for demonstration purposes. Garbage has not been collected from MG Road area for the past 5 days.",
      suggested_action: "Schedule immediate waste collection and review collection routes",
      estimated_timeline: "1-2 days",
      location: "MG Road area",
      category: "Sanitation",
      status: "pending",
      timestamp: "2025-09-13T09:15:00Z"
    }
  ]

  useEffect(() => {
    // Load complaints from localStorage and combine with mock data
    const fetchComplaints = async () => {
      setLoading(true)
      try {
        // Load submitted complaints from localStorage
        const storedComplaints = loadComplaintsFromStorage()
        
        // Combine stored complaints with mock data
        const allComplaints = [...storedComplaints, ...mockComplaints]
        
        // Sort by timestamp (newest first)
        const sortedComplaints = allComplaints.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        )
        
        setComplaints(sortedComplaints)
      } catch (error) {
        console.error('Error loading complaints:', error)
        setComplaints(mockComplaints)
      } finally {
        setLoading(false)
      }
    }

    fetchComplaints()
    
    // Set up an interval to check for new complaints every 5 seconds
    const interval = setInterval(fetchComplaints, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const toggleExpand = (complaintId) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(complaintId)) {
      newExpanded.delete(complaintId)
    } else {
      newExpanded.add(complaintId)
    }
    setExpandedCards(newExpanded)
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending'
      case 'in-progress': return 'status-in-progress'
      case 'resolved': return 'status-resolved'
      default: return 'status-pending'
    }
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateDescription = (description, maxLength = 150) => {
    if (description.length <= maxLength) return description
    return description.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div className="admin-panel">
        <div className="admin-header">
          <h1>Admin Panel - Complaints Dashboard</h1>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading complaints...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Panel - Complaints Dashboard</h1>
        <div className="stats">
          <div className="stat-card">
            <span className="stat-number">{complaints.length}</span>
            <span className="stat-label">Total Complaints</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{complaints.filter(c => c.status === 'pending').length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{complaints.filter(c => c.status === 'in-progress').length}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{complaints.filter(c => c.status === 'resolved').length}</span>
            <span className="stat-label">Resolved</span>
          </div>
        </div>
      </div>

      <div className="complaints-grid">
        {complaints.map((complaint) => {
          const isExpanded = expandedCards.has(complaint.id)
          const shouldShowReadMore = complaint.description.length > 150

          return (
            <div key={complaint.id} className={`complaint-card ${isExpanded ? 'expanded' : ''}`}>
              <div className="card-header">
                <h3 className="complaint-title">{complaint.title}</h3>
                <span className={`status-badge ${getStatusBadgeClass(complaint.status)}`}>
                  {complaint.status.replace('-', ' ').toUpperCase()}
                </span>
              </div>

              <div className="card-body">
                <div className="department-info">
                  <span className="department-label">Department:</span>
                  <span className="department-name">{complaint.department}</span>
                </div>

                {complaint.severity && (
                  <div className="department-info">
                    <span className="department-label">Severity:</span>
                    <span className={`severity-badge severity-${complaint.severity?.toLowerCase()}`}>
                      {complaint.severity}
                    </span>
                  </div>
                )}

                {complaint.location && (
                  <div className="department-info">
                    <span className="department-label">Location:</span>
                    <span className="department-name">{complaint.location}</span>
                  </div>
                )}

                {complaint.category && (
                  <div className="department-info">
                    <span className="department-label">Category:</span>
                    <span className="department-name">{complaint.category}</span>
                  </div>
                )}

                <div className="image-container">
                  {complaint.image ? (
                    <img 
                      src={complaint.image} 
                      alt="Complaint evidence" 
                      className="complaint-image"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div className="image-placeholder" style={{ display: complaint.image ? 'none' : 'flex' }}>
                    <span>📷</span>
                    <span>No Image Available</span>
                  </div>
                </div>

                <div className="description-container">
                  <p className="complaint-description">
                    {isExpanded ? complaint.description : truncateDescription(complaint.description)}
                  </p>
                  
                  {shouldShowReadMore && (
                    <button 
                      className="read-more-btn"
                      onClick={() => toggleExpand(complaint.id)}
                    >
                      {isExpanded ? 'Read Less' : 'Read More'}
                    </button>
                  )}
                </div>

                {complaint.suggested_action && (
                  <div className="additional-info">
                    <strong>Suggested Action:</strong>
                    <p>{complaint.suggested_action}</p>
                  </div>
                )}

                {complaint.estimated_timeline && (
                  <div className="additional-info">
                    <strong>Estimated Timeline:</strong>
                    <span>{complaint.estimated_timeline}</span>
                  </div>
                )}

                <div className="card-footer">
                  <span className="timestamp">
                    Reported: {formatDate(complaint.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {complaints.length === 0 && (
        <div className="no-complaints">
          <p>No complaints found.</p>
        </div>
      )}
    </div>
  )
}

export default AdminPanel