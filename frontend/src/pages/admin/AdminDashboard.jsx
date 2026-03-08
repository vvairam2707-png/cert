import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [recentCerts, setRecentCerts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/admin/stats').then(({ data }) => setStats(data));
        api.get('/certificates?status=pending').then(({ data }) => setRecentCerts(data.slice(0, 5)));
    }, []);

    const statCards = stats ? [
        { label: 'Total Certificates', value: stats.total, icon: '📜', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
        { label: 'Pending Review', value: stats.pending, icon: '⏳', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        { label: 'Approved', value: stats.approved, icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
        { label: 'Rejected', value: stats.rejected, icon: '❌', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
        { label: 'Total Students', value: stats.totalStudents, icon: '👨‍🎓', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
    ] : [];

    const categoryStats = stats?.categories ? [
        { label: 'Sports', value: stats.categories.sports, icon: '🏆', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
        { label: 'Hackathon', value: stats.categories.hackathon, icon: '💻', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
        { label: 'Workshop', value: stats.categories.workshop, icon: '🔧', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        { label: 'Online Course', value: stats.categories.online, icon: '📚', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    ] : [];

    return (
        <div>
            <Sidebar />
            <div className="main-content">
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                        Admin <span className="gradient-text">Dashboard</span>
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Overview of all student certificates</p>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    {statCards.map((s) => (
                        <div key={s.label} className="stat-card">
                            <div className="stat-icon" style={{ background: s.bg, fontSize: '1.2rem' }}>{s.icon}</div>
                            <div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value ?? '—'}</div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    {/* Category breakdown */}
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <h2 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '1rem' }}>By Category</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {categoryStats.map((cat) => {
                                const pct = stats?.total ? Math.round((cat.value / stats.total) * 100) : 0;
                                return (
                                    <div key={cat.label}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                            <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{cat.icon} {cat.label}</span>
                                            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: cat.color }}>{cat.value} ({pct}%)</span>
                                        </div>
                                        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.05)' }}>
                                            <div style={{ height: '100%', borderRadius: 3, background: cat.color, width: `${pct}%`, transition: 'width 0.5s ease' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Pending certificates */}
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Pending Reviews</h2>
                            <button className="btn-outline" onClick={() => navigate('/admin/certificates?status=pending')} style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
                                View All →
                            </button>
                        </div>
                        {recentCerts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                                <p style={{ fontSize: '0.875rem' }}>No pending certificates</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {recentCerts.map((cert) => (
                                    <div key={cert._id} style={{
                                        padding: '0.75rem 1rem', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)',
                                        borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#f1f5f9' }}>{cert.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{cert.student?.name} • {cert.student?.regNo}</div>
                                        </div>
                                        <button onClick={() => navigate('/admin/certificates')} className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                                            Review
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
