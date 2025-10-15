import { useList } from 'react-firebase-hooks/database';
import { ref, update } from 'firebase/database';
import { database } from '../firebase';
import { useState } from 'react';

function ManagerDashboard() {
  const [snapshots, loading, error] = useList(ref(database, 'breakdowns'));
  const [selectedReport, setSelectedReport] = useState(null);
  const [technician, setTechnician] = useState('');
  const [fixDetails, setFixDetails] = useState('');

  const updateStatus = async (reportId, newStatus) => {
    await update(ref(database, `breakdowns/${reportId}`), {
      status: newStatus,
      'timestamps/updated': Date.now()
    });
  };

  const assignTechnician = async (reportId) => {
    await update(ref(database, `breakdowns/${reportId}`), {
      assignedTechnician: technician,
      status: 'approved',
      'timestamps/updated': Date.now()
    });
    setTechnician('');
  };

  const completeReport = async (reportId) => {
    await update(ref(database, `breakdowns/${reportId}`), {
      fixDetails: fixDetails,
      status: 'completed',
      'timestamps/updated': Date.now()
    });
    setFixDetails('');
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>All Breakdown Reports</h2>
      {snapshots && snapshots.map((snapshot) => {
        const data = snapshot.val();
        const reportId = snapshot.key;
        
        return (
          <div key={reportId} className={`report-card ${data.status}`}>
            <h3>Report from: {data.reporterName}</h3>
            <p><strong>Issue:</strong> {data.message}</p>
            <p><strong>Status:</strong> {data.status}</p>
            
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
                />
                <button onClick={() => completeReport(reportId)}>
                  Mark as Completed
                </button>
              </div>
            )}
            
            {data.status === 'completed' && (
              <div>
                <p><strong>Resolution:</strong> {data.fixDetails}</p>
                <p>Completed by: {data.assignedTechnician}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
