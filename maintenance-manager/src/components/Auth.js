import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, database } from '../firebase';
import './Auth.css';

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('manager'); // Add role selection
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await set(ref(database, `users/${userCredential.user.uid}`), {
          role: role, // Use selected role
          name: name,
          email: email
        });
        alert('Account created successfully!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('This email is already registered.');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password.');
          break;
        default:
          setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleAuth}>
        <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>
        
        {error && <div className="error">{error}</div>}
        
        {isSignUp && (
          <>
            <div>
              <input 
                type="text" 
                placeholder="Your Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            {/* Role Selection */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>
                Select Role:
              </label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '16px'
                }}
              >
                <option value="manager">Manager</option>
                <option value="technician">Technician</option>
              </select>
            </div>
          </>
        )}
        
        <div>
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div>
          <input 
            type="password" 
            placeholder="Password (min 6 characters)" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </button>
        
        <button 
          type="button" 
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError('');
          }}
        >
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </button>
      </form>
    </div>
  );
}

export default Auth;
