import { useState, useEffect } from 'react'
import './AdminPanel.css'

const AdminPanel = () => {
  const [complaints, setComplaints] = useState([])
  const [expandedCards, setExpandedCards] = useState(new Set())
  const [loading, setLoading] = useState(true)

  // Mock data for now - this will be replaced with API call
  const mockComplaints = [
    {
      id: 1,
      title: "Pothole on Main Road",
      department: "Roads & Infrastructure",
      description: "There is a large pothole on the main road near Brigade Mall that is causing traffic issues and is dangerous for vehicles. The pothole has been there for over a month and keeps getting bigger due to monsoon rains. Multiple vehicles have been damaged due to this.",
      image: null,
      timestamp: "2025-09-13T10:30:00Z",
      status: "pending"
    },
    {
      id: 2,
      title: "Garbage Collection Issue",
      department: "Waste Management",
      description: "Garbage has not been collected from our street (MG Road area) for the past 5 days. The waste is piling up and creating unhygienic conditions.",
      image: "/api/images/garbage1.jpg",
      timestamp: "2025-09-13T09:15:00Z",
      status: "in-progress"
    },
    {
      id: 3,
      title: "Street Light Not Working",
      department: "Electricity",
      description: "Street light near the bus stop on Koramangala 4th Block has been non-functional for 2 weeks. This is causing safety concerns for pedestrians at night.",
      image: null,
      timestamp: "2025-09-12T18:45:00Z",
      status: "pending"
    },
    {
      id: 4,
      title: "Water Logging During Rain",
      department: "Drainage",
      description: "The entire stretch of Indiranagar 100 feet road gets completely waterlogged during heavy rains. This has been a recurring issue for the past 3 years. The drainage system needs immediate attention and upgrades. Residents and commuters face severe difficulties during monsoon season. Multiple shops in the area also get flooded.",
      image: "/api/images/waterlog1.jpg",
      timestamp: "2025-09-11T14:20:00Z",
      status: "resolved"
    },
    {
      id: 5,
      title: "Traffic Signal Malfunction",
      department: "Traffic Management",
      description: "Traffic signal at the Silk Board junction has been malfunctioning intermittently, causing major traffic jams during peak hours.",
      image: null,
      timestamp: "2025-09-10T16:30:00Z",
      status: "in-progress"
    }
  ]

  useEffect(() => {
    // Fetch complaints from the API
    const fetchComplaints = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/complaints')
        const data = await response.json()
        
        if (data.success) {
          setComplaints(data.complaints)
        } else {
          console.error('Error fetching complaints:', data.error)
          // Fall back to mock data if API fails
          setComplaints(mockComplaints)
        }
      } catch (error) {
        console.error('Error fetching complaints:', error)
        // Fall back to mock data if API fails
        setComplaints(mockComplaints)
      } finally {
        setLoading(false)
      }
    }

    fetchComplaints()
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