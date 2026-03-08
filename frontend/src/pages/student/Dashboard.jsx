import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import CategoryBadge from '../../components/CategoryBadge';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function StudentDashboard() {
    const { user } = useAuth();
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [deleteId, setDeleteId] = useState(null);
    const [viewCert, setViewCert] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            const { data } = await api.get('/certificates');
            setCertificates(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/certificates/${id}`);
            setCertificates(prev => prev.filter(c => c._id !== id));
            setDeleteId(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Delete failed');
        }
    };

    const filtered = filter === 'all' ? certificates : certificates.filter(c =>
        filter === 'pending' || filter === 'approved' || filter === 'rejected'
            ? c.status === filter
            : c.category === filter
    );

    const stats = {
        total: certificates.length,
        approved: certificates.filter(c => c.status === 'approved').length,
        pending: certificates.filter(c => c.status === 'pending').length,
        rejected: certificates.filter(c => c.status === 'rejected').length,
    };

    return (
        <div>
            <Sidebar />
            <div className="main-content">
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9' }}>
                        Welcome, <span className="gradient-text">{user?.name}</span> 👋
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
                        {user?.regNo} • {user?.department || 'Student'}
                    </p>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Total Uploaded', value: stats.total, icon: '📜', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
                        { label: 'Approved', value: stats.approved, icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
                        { label: 'Pending', value: stats.pending, icon: '⏳', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                        { label: 'Rejected', value: stats.rejected, icon: '❌', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
                    ].map((s) => (
                        <div key={s.label} className="stat-card">
                            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                            <div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Certificates Section */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>My Certificates</h2>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            {/* Filter */}
                            <select
                                className="form-input"
                                style={{ width: 'auto', padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="sports">Sports</option>
                                <option value="hackathon">Hackathon</option>
                                <option value="workshop">Workshop</option>
                                <option value="online">Online Course</option>
                            </select>
                            <button className="btn-primary" onClick={() => navigate('/upload')}>
                                📤 Upload Certificate
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                            <div className="spinner" style={{ margin: '0 auto 1rem auto', width: 32, height: 32, borderWidth: 3 }} />
                            Loading certificates...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
                            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                                {filter === 'all' ? 'No certificates uploaded yet.' : `No ${filter} certificates found.`}
                            </p>
                            <button className="btn-primary" onClick={() => navigate('/upload')} style={{ marginTop: '1rem' }}>
                                Upload your first certificate
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                            {filtered.map((cert) => (
                                <CertCard
                                    key={cert._id}
                                    cert={cert}
                                    onView={() => setViewCert(cert)}
                                    onEdit={() => navigate(`/edit/${cert._id}`)}
                                    onDelete={() => setDeleteId(cert._id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* View Modal */}
            {viewCert && (
                <div className="modal-overlay" onClick={() => setViewCert(null)}>
                    <div className="modal-box" style={{ padding: '2rem' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem' }}>{viewCert.title}</h2>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <CategoryBadge category={viewCert.category} />
                                    <StatusBadge status={viewCert.status} />
                                </div>
                            </div>
                            <button onClick={() => setViewCert(null)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>
                        <CertDetails cert={viewCert} />
                        {viewCert.adminNote && (
                            <div className="alert alert-info" style={{ marginTop: '1rem' }}>
                                📝 Admin Note: {viewCert.adminNote}
                            </div>
                        )}
                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                            <a href={viewCert.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-outline">
                                👁️ View File
                            </a>
                            <a href={viewCert.fileUrl} download className="btn-ghost">
                                ⬇️ Download
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteId && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ padding: '2rem', maxWidth: 380 }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🗑️</div>
                            <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Delete Certificate?</h2>
                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>This action cannot be undone.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            <button className="btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
                            <button className="btn-danger" onClick={() => handleDelete(deleteId)}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function CertCard({ cert, onView, onEdit, onDelete }) {
    const date = new Date(cert.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 14,
            padding: '1.25rem', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer'
        }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <CategoryBadge category={cert.category} />
                <StatusBadge status={cert.status} />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem', color: '#f1f5f9', lineHeight: 1.3 }}>
                {cert.title}
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>📅 {date}</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn-ghost" onClick={onView} style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem', padding: '0.45rem' }}>
                    👁️ View
                </button>
                <button className="btn-outline" onClick={onEdit} style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem', padding: '0.45rem' }}>
                    ✏️ Edit
                </button>
                <button className="btn-danger" onClick={onDelete} style={{ padding: '0.45rem 0.6rem', fontSize: '0.78rem' }}>
                    🗑️
                </button>
            </div>
        </div>
    );
}

function CertDetails({ cert }) {
    const rows = [];
    if (cert.yearSem) rows.push(['Year / Sem', cert.yearSem]);
    if (cert.eventName) rows.push([cert.category === 'online' ? 'Topic learned' : 'Event', cert.eventName]);
    if (cert.venue) rows.push(['Venue', cert.venue]);
    if (cert.place) rows.push(['Place', cert.place]);
    if (cert.sportName) rows.push(['Sport', cert.sportName]);
    if (cert.competitionLevel) rows.push(['Level', cert.competitionLevel]);
    if (cert.position) rows.push(['Position', cert.position]);
    if (cert.hackathonName) rows.push(['Hackathon', cert.hackathonName]);
    if (cert.organizer) rows.push(['Organizer', cert.organizer]);
    if (cert.teamMembers) rows.push(['Team Members', cert.teamMembers]);
    if (cert.projectName) rows.push(['Project', cert.projectName]);
    if (cert.workshopName) rows.push(['Workshop', cert.workshopName]);
    if (cert.workshopOrganizer) rows.push(['Organizer', cert.workshopOrganizer]);
    if (cert.duration) rows.push(['Duration', cert.duration]);
    if (cert.platform) rows.push(['Platform', cert.platform]);
    if (cert.courseName) rows.push(['Course', cert.courseName]);
    if (cert.courseDuration) rows.push(['Duration', cert.courseDuration]);
    if (cert.learningMode) rows.push(['Mode of Learning', cert.learningMode]);
    rows.push(['Date', new Date(cert.date).toLocaleDateString()]);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {rows.map(([label, val]) => (
                <div key={label} style={{ padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.1)' }}>
                    <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{label}</div>
                    <div style={{ fontSize: '0.875rem', color: '#f1f5f9', fontWeight: 500, marginTop: '0.2rem' }}>{val}</div>
                </div>
            ))}
        </div>
    );
}
