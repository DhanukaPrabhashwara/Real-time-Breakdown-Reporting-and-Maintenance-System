import { useState, useEffect } from 'react';
import { ref, push, get } from 'firebase/database';
import { database, auth } from '../firebase';

function ReportBreakdown() {
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch user's name from database when component loads
  useEffect(() => {
    const fetchUserName = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userRef = ref(database, `users/${user.uid}`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUserName(userData.name || user.email);
          } else {
            setUserName(user.email);
          }
        } catch (error) {
          console.error('Error fetching user name:', error);
          setUserName(user.email);
        }
      }
    };

    fetchUserName();
  }, []);

  const submitReport = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const user = auth.currentUser;
    
    try {
      await push(ref(database, 'breakdowns'), {
        reporterUid: user.uid,
        reporterName: userName,
        message: message,
        status: 'pending',
        assignedTechnician: null,
        fixDetails: null,
        timestamps: {
          created: Date.now(),
          updated: Date.now()
        }
      });
      
      setMessage('');
      alert('Report submitted successfully!');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-breakdown-container">
      <h2>Report a Breakdown</h2>
      <form onSubmit={submitReport}>
        <div className="user-info">
          <label>Your Name: {userName}</label>
        </div>
        
        <textarea
          placeholder="Describe the breakdown issue"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows="5"
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}

export default ReportBreakdown;
