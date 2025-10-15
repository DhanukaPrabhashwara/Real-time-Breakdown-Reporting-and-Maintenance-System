import { useState } from 'react';
import { ref, push } from 'firebase/database';
import { database, auth } from '../firebase';

function ReportBreakdown() {
  const [message, setMessage] = useState('');

  const submitReport = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    
    await push(ref(database, 'breakdowns'), {
      reporterUid: user.uid,
      reporterName: user.displayName || user.email,
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
  };

  return (
    <form onSubmit={submitReport}>
      <textarea
        placeholder="Describe the breakdown issue"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
      />
      <button type="submit">Submit Report</button>
    </form>
  );
}
