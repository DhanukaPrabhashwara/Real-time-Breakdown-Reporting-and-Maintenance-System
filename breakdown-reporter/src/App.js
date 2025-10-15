import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import Auth from './components/Auth';
import ReportBreakdown from './components/ReportBreakdown';
import MyReports from './components/MyReports';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication state on app load
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

  // Show login page if not authenticated
  if (!user) {
    return (
      <div className="App">
        <h1>Breakdown Reporter</h1>
        <Auth />
      </div>
    );
  }

  // Show main dashboard if authenticated
  return (
    <div className="App">
      <header>
        <h1>Breakdown Reporter</h1>
        <div className="user-info">
          <span>Welcome, {user.email}</span>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      </header>
      
      <main>
        <section className="report-section">
          <h2>Report a Breakdown</h2>
          <ReportBreakdown />
        </section>

        <section className="reports-section">
          <MyReports />
        </section>
      </main>
    </div>
  );
}

export default App;
