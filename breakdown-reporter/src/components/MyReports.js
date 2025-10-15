import { useList } from 'react-firebase-hooks/database';
import { ref, query, orderByChild, equalTo } from 'firebase/database';
import { database, auth } from '../firebase';

function MyReports() {
  const user = auth.currentUser;
  const breakdownsRef = query(
    ref(database, 'breakdowns'),
    orderByChild('reporterUid'),
    equalTo(user.uid)
  );
  
  const [snapshots, loading, error] = useList(breakdownsRef);

  if (loading) return <p>Loading reports...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>My Reports</h2>
      {snapshots && snapshots.map((snapshot) => {
        const data = snapshot.val();
        return (
          <div key={snapshot.key} className={`report ${data.status}`}>
            <h3>Status: {data.status}</h3>
            <p>{data.message}</p>
            {data.assignedTechnician && <p>Assigned to: {data.assignedTechnician}</p>}
            {data.fixDetails && <p>Resolution: {data.fixDetails}</p>}
            <small>Reported: {new Date(data.timestamps.created).toLocaleString()}</small>
          </div>
        );
      })}
    </div>
  );
}

export default MyReports;