import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('parent');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password, displayName, role);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">🥜 Edward's Palforzia Tracker</h1>
        <p className="login-subtitle">Peanut immunotherapy dose tracking</p>

        <form onSubmit={handleSubmit} className="form">
          {isRegister && (
            <>
              <div className="form-group">
                <label>Display Name</label>
                <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={role} onChange={e => setRole(e.target.value)}>
                  <option value="parent">Parent</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>
            </>
          )}
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <button className="btn-link mt-2" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
        </button>
      </div>
    </div>
  );
}
