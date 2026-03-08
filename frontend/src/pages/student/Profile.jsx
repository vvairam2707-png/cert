import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function Profile() {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({
        name: '',
        regNo: '',
        email: '',
        phone: '',
        department: '',
    });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || '',
                regNo: user.regNo || '',
                email: user.email || '',
                phone: user.phone || '',
                department: user.department || '',
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg({ type: '', text: '' });
        setLoading(true);

        try {
            const { data } = await api.put('/auth/profile', form);

            updateUser({
                name: data.name,
                regNo: data.regNo,
                email: data.email,
                phone: data.phone,
                department: data.department
            });
            setMsg({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMsg({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Sidebar />
            <div className="main-content" style={{ maxWidth: 640 }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Profile</h1>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>View and update your personal information</p>
                </div>

                <div className="glass-card" style={{ padding: '2rem' }}>
                    {msg.text && (
                        <div className={`alert ${msg.type === 'error' ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: '1.5rem' }}>
                            {msg.type === 'error' ? '⚠️ ' : '✅ '} {msg.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                className="form-input"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Register Number</label>
                            <input
                                className="form-input"
                                value={form.regNo}
                                onChange={(e) => setForm({ ...form, regNo: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                className="form-input"
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                className="form-input"
                                placeholder="e.g. +91 9876543210"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Department</label>
                            <input
                                className="form-input"
                                value={form.department}
                                onChange={(e) => setForm({ ...form, department: e.target.value })}
                            />
                        </div>

                        <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '1rem', justifyContent: 'center' }}>
                            {loading ? <><span className="spinner" /> Saving...</> : '💾 Save Profile'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
