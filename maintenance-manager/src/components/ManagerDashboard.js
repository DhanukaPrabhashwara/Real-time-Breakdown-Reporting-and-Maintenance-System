import { useList } from 'react-firebase-hooks/database';
import { ref, update } from 'firebase/database';
import { database } from '../firebase';
import { useState } from 'react';

function ManagerDashboard() {
  const [snapshots, loading, error] = useList(ref(database, 'breakdowns'));
  const [technician, setTechnician] = useState('');
  const [fixDetails, setFixDetails] = useState('');

  const updateStatus = async (reportId, newStatus) => {
    try {
      await update(ref(database, `breakdowns/${reportId}`), {
        status: newStatus,
        'timestamps/updated': Date.now()
      });
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error updating status. Please try again.');
    }
  };

  const assignTechnician = async (reportId) => {
    if (!technician.trim()) {
      alert('Please enter a technician name');
      return;
    }
    
    try {
      await update(ref(database, `breakdowns/${reportId}`), {
        assignedTechnician: technician,
        status: 'approved',
        'timestamps/updated': Date.now()
      });
      setTechnician('');
    } catch (err) {
      console.error('Error assigning technician:', err);
      alert('Error assigning technician. Please try again.');
    }
  };

  const completeReport = async (reportId) => {
    if (!fixDetails.trim()) {
      alert('Please enter fix details');
      return;
    }
    
    try {
      await update(ref(database, `breakdowns/${reportId}`), {
        fixDetails: fixDetails,
        status: 'completed',
        'timestamps/updated': Date.now()
      });
      setFixDetails('');
    } catch (err) {
      console.error('Error completing report:', err);
      alert('Error completing report. Please try again.');
    }
  };

  // Show loading state
  if (loading) {
    return <div className="loading">Loading reports...</div>;
  }

  // Show error if Firebase error occurred
  if (error) {
    return (
      <div className="error-message">
        <h3>Error loading reports</h3>
        <p>{error.message}</p>
        <p>Please check your Firebase connection and security rules.</p>
      </div>
    );
  }

  // Check if snapshots exists and has data
  if (!snapshots || snapshots.length === 0) {
    return (
      <div className="empty-state">
        <h2>No Breakdown Reports</h2>
        <p>No reports have been submitted yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>All Breakdown Reports</h2>
      {snapshots.map((snapshot) => {
        const data = snapshot.val();
        const reportId = snapshot.key;
        
        // Safety check for data
        if (!data) return null;
        
        return (
          <div key={reportId} className={`report-card ${data.status || 'pending'}`}>
            <h3>Report from: {data.reporterName || 'Unknown'}</h3>
            <p><strong>Issue:</strong> {data.message || 'No description'}</p>
            <p><strong>Status:</strong> {data.status || 'pending'}</p>
            
            {data.status === 'pending' && (
              <div>
                <input
                  type="text"
                  placeholder="Assign technician"
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                />
                <button onClick={() => assignTechnician(reportId)}>
                  Approve & Assign
                </button>
                <button onClick={() => updateStatus(reportId, 'rejected')}>
                  Reject
                </button>
              </div>
            )}
            
            {data.status === 'approved' && (
              <div>
                <p>Assigned to: {data.assignedTechnician}</p>
                <textarea
                  placeholder="Enter fix details"
                  value={fixDetails}
                  onChange={(e) => setFixDetails(e.target.value)}
                  rows="3"
                />
                <button onClick={() => completeReport(reportId)}>
                  Mark as Completed
                </button>
              </div>
            )}
            
            {data.status === 'completed' && (
              <div>
                <p><strong>Resolution:</strong> {data.fixDetails || 'N/A'}</p>
                <p>Completed by: {data.assignedTechnician || 'N/A'}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ManagerDashboard;
