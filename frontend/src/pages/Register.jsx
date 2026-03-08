import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Register() {
    const [form, setForm] = useState({ name: '', regNo: '', email: '', phone: '', department: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirmPassword) {
            return setError('Passwords do not match');
        }
        if (form.password.length < 6) {
            return setError('Password must be at least 6 characters');
        }
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', {
                name: form.name,
                regNo: form.regNo,
                email: form.email,
                phone: form.phone,
                department: form.department,
                password: form.password,
            });
            login(data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    return (
        <div className="auth-page">
            <div style={{
                position: 'fixed', top: '-200px', right: '-200px', width: 500, height: 500,
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />

            <div style={{ width: '100%', maxWidth: 480, padding: '1.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', fontSize: '2rem', margin: '0 auto 1rem auto',
                        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)'
                    }}>🎓</div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.25rem' }}>
                        Create Account
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Join CertVault as a student</p>
                </div>

                <div className="glass-card" style={{ padding: '2rem' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {error && <div className="alert alert-error">⚠️ {error}</div>}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input id="reg-name" className="form-input" placeholder="John Doe" value={form.name} onChange={update('name')} required />
                            </div>
                            <div className="form-group">
                                <label>Register No. *</label>
                                <input id="reg-regno" className="form-input" placeholder="21CS001" value={form.regNo} onChange={update('regNo')} required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Email Address *</label>
                            <input id="reg-email" className="form-input" type="email" placeholder="student@college.edu" value={form.email} onChange={update('email')} required />
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input id="reg-phone" className="form-input" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={update('phone')} />
                        </div>

                        <div className="form-group">
                            <label>Department</label>
                            <select id="reg-dept" className="form-input" value={form.department} onChange={update('department')}>
                                <option value="">Select Department</option>
                                <option>Computer Science</option>
                                <option>Information Technology</option>
                                <option>Electronics & Communication</option>
                                <option>Mechanical Engineering</option>
                                <option>Civil Engineering</option>
                                <option>Electrical Engineering</option>
                                <option>Business Administration</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Password *</label>
                                <input id="reg-password" className="form-input" type="password" placeholder="Min 6 chars" value={form.password} onChange={update('password')} required />
                            </div>
                            <div className="form-group">
                                <label>Confirm Password *</label>
                                <input id="reg-confirm" className="form-input" type="password" placeholder="Re-enter" value={form.confirmPassword} onChange={update('confirmPassword')} required />
                            </div>
                        </div>

                        <button id="reg-submit" className="btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center', width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}>
                            {loading ? <><span className="spinner" /> Creating account...</> : '✨ Create Account'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
