import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, database } from './firebase';
import Auth from './components/Auth';
import ManagerDashboard from './components/ManagerDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Fetch user role and name from database
        try {
          const userRef = ref(database, `users/${currentUser.uid}`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUserRole(userData.role);
            setUserName(userData.name);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUser(null);
        setUserRole(null);
        setUserName('');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserRole(null);
      setUserName('');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="App">
        <h1>Maintenance Manager</h1>
        <Auth />
      </div>
    );
  }

  return (
    <div className="App">
      <header>
        <h1>
          {userRole === 'manager' 
            ? 'Maintenance Manager Dashboard' 
            : 'Technician Dashboard'}
        </h1>
        <div className="user-info">
          <span>
            {userRole === 'manager' ? 'Manager' : 'Technician'}: {userName || user.email}
          </span>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      </header>
      
      <main>
        <ManagerDashboard />
      </main>
    </div>
  );
}

export default App;
