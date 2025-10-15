import { useList } from 'react-firebase-hooks/database';
import { ref, update, get, onValue } from 'firebase/database';
import { database, auth } from '../firebase';
import { useState, useEffect } from 'react';

function ManagerDashboard() {
  const [snapshots, loading, error] = useList(ref(database, 'breakdowns'));
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [technicians, setTechnicians] = useState([]);
  const [fixDetails, setFixDetails] = useState('');
  const [userRole, setUserRole] = useState(null);

  // Fetch current user's role
  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setUserRole(snapshot.val().role);
        }
      }
    };
    fetchUserRole();
  }, []);

  // Fetch technicians with REAL-TIME LISTENER
  useEffect(() => {
    const usersRef = ref(database, 'users');
    
    // Set up real-time listener
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const allUsers = snapshot.val();
        const techList = [];
        
        // Filter users with 'technician' role
        Object.keys(allUsers).forEach(uid => {
          const user = allUsers[uid];
          if (user.role === 'technician') {
            techList.push({
              uid: uid,
              name: user.name,
              email: user.email
            });
          }
        });
        
        console.log('Technicians loaded:', techList); // Debug log
        setTechnicians(techList);
      } else {
        setTechnicians([]);
      }
    }, (error) => {
      console.error('Error fetching technicians:', error);
    });

    // Cleanup function
    return () => unsubscribe();
  }, []);

  const updateStatus = async (reportId, newStatus) => {
    try {
      await update(ref(database, `breakdowns/${reportId}`), {
        status: newStatus,
        'timestamps/updated': Date.now()
      });
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error updating status.');
    }
  };

  const assignTechnician = async (reportId) => {
    if (!selectedTechnician) {
      alert('Please select a technician');
      return;
    }
    
    const techDetails = technicians.find(t => t.uid === selectedTechnician);
    
    try {
      await update(ref(database, `breakdowns/${reportId}`), {
        assignedTechnician: techDetails.name,
        assignedTechnicianUid: selectedTechnician,
        status: 'approved',
        'timestamps/updated': Date.now()
      });
      setSelectedTechnician('');
      alert(`Report assigned to ${techDetails.name}`);
    } catch (err) {
      console.error('Error assigning technician:', err);
      alert('Error assigning technician.');
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
      alert('Report marked as completed!');
    } catch (err) {
      console.error('Error completing report:', err);
      alert('Error completing report.');
    }
  };

  if (loading) return <div className="loading">Loading reports...</div>;
  if (error) return <div className="error-message">Error: {error.message}</div>;
  
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
      <h2>
        {userRole === 'manager' ? 'Manager Dashboard' : 'Technician Dashboard'}
      </h2>
      
      {userRole === 'manager' && (
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Available Technicians: {technicians.length}
        </p>
      )}
      
      {snapshots.map((snapshot) => {
        const data = snapshot.val();
        const reportId = snapshot.key;
        if (!data) return null;
        
        const currentUser = auth.currentUser;
        if (userRole === 'technician' && data.assignedTechnicianUid !== currentUser.uid) {
          return null;
        }
        
        return (
          <div key={reportId} className={`report-card ${data.status || 'pending'}`}>
            <h3>Report from: {data.reporterName || 'Unknown'}</h3>
            <p><strong>Issue:</strong> {data.message || 'No description'}</p>
            <p><strong>Status:</strong> <span className={`badge ${data.status}`}>{data.status || 'pending'}</span></p>
            <p className="timestamp">
              Reported: {new Date(data.timestamps?.created).toLocaleString()}
            </p>
            
            {userRole === 'manager' && data.status === 'pending' && (
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Assign to Technician:
                </label>
                <select
                  value={selectedTechnician}
                  onChange={(e) => setSelectedTechnician(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginBottom: '10px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select a Technician</option>
                  {technicians.map(tech => (
                    <option key={tech.uid} value={tech.uid}>
                      {tech.name} ({tech.email})
                    </option>
                  ))}
                </select>
                
                <button onClick={() => assignTechnician(reportId)}>
                  Approve & Assign
                </button>
                <button onClick={() => updateStatus(reportId, 'rejected')}>
                  Reject
                </button>
                
                {technicians.length === 0 && (
                  <p style={{ color: '#dc3545', fontSize: '14px', marginTop: '10px' }}>
                    No technicians available
                  </p>
                )}
              </div>
            )}
            
            {data.status === 'approved' && (
              <div>
                <p><strong>Assigned to:</strong> {data.assignedTechnician}</p>
                <label style={{ display: 'block', marginTop: '15px', marginBottom: '8px', fontWeight: '600' }}>
                  Fix Details:
                </label>
                <textarea
                  placeholder="Describe what was fixed"
                  value={fixDetails}
                  onChange={(e) => setFixDetails(e.target.value)}
                  rows="4"
                />
                <button onClick={() => completeReport(reportId)}>
                  Mark as Completed
                </button>
              </div>
            )}
            
            {data.status === 'completed' && (
              <div>
                <p><strong>Resolution:</strong> {data.fixDetails || 'N/A'}</p>
                <p><strong>Completed by:</strong> {data.assignedTechnician || 'N/A'}</p>
                <p className="timestamp">
                  Completed: {new Date(data.timestamps?.updated).toLocaleString()}
                </p>
              </div>
            )}
            
            {data.status === 'rejected' && (
              <p style={{ color: '#dc3545', fontWeight: '600' }}>
                This report was rejected by management.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ManagerDashboard;
