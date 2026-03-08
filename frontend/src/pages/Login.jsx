import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', form);
            login(data);
            navigate(data.role === 'admin' ? '/admin' : '/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Decorative blobs */}
            <div style={{
                position: 'fixed', top: '-200px', right: '-200px', width: 500, height: 500,
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'fixed', bottom: '-200px', left: '-200px', width: 500, height: 500,
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />

            <div style={{ width: '100%', maxWidth: 440, padding: '1.5rem' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', fontSize: '2rem', margin: '0 auto 1rem auto',
                        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)'
                    }}>🎓</div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.25rem' }}>
                        Welcome Back
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Sign in to CertVault</p>
                </div>

                {/* Form Card */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {error && (
                            <div className="alert alert-error">⚠️ {error}</div>
                        )}

                        <div className="form-group">
                            <label>Email Address / Admin ID</label>
                            <input
                                id="login-email"
                                className="form-input"
                                type="text"
                                placeholder="Student Email or Admin ID"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                id="login-password"
                                className="form-input"
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>

                        <button id="login-submit" className="btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center', width: '100%', padding: '0.8rem' }}>
                            {loading ? <><span className="spinner" /> Signing in...</> : '🔐 Sign In'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>
                            Register here
                        </Link>
                    </div>
                </div>


            </div>
        </div>
    );
}
