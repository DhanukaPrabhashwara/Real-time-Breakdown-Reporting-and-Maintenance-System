import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import Auth from './components/Auth';
import ManagerDashboard from './components/ManagerDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
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
        <h1>Maintenance Manager Dashboard</h1>
        <div className="user-info">
          <span>Manager: {user.email}</span>
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
