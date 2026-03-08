import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import CategoryBadge from '../../components/CategoryBadge';
import StatusBadge from '../../components/StatusBadge';
import api from '../../api/axios';

export default function AdminStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [certs, setCerts] = useState([]);
    const [certsLoading, setCertsLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        api.get('/admin/students').then(({ data }) => { setStudents(data); setLoading(false); });
    }, []);

    const viewStudent = async (student) => {
        setSelected(student);
        setCertsLoading(true);
        try {
            const { data } = await api.get(`/admin/students/${student._id}/certificates`);
            setCerts(data);
        } catch { setCerts([]); }
        finally { setCertsLoading(false); }
    };

    const filtered = students.filter(s => {
        if (!search) return true;
        const q = search.toLowerCase();
        return s.name?.toLowerCase().includes(q) || s.regNo?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
    });

    return (
        <div>
            <Sidebar />
            <div className="main-content">
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                        <span className="gradient-text">Students</span>
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>View all registered students and their achievements</p>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                        <input
                            className="form-input"
                            style={{ width: 280, padding: '0.55rem 0.9rem', fontSize: '0.85rem' }}
                            placeholder="🔍 Search by name, regno, email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#64748b' }}>
                            {filtered.length} student{filtered.length !== 1 ? 's' : ''}
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <div className="spinner" style={{ margin: '0 auto', width: 32, height: 32, borderWidth: 3 }} />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>👥</div>
                            <p>No students found</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Reg. No.</th>
                                    <th>Department</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Joined</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((s) => (
                                    <tr key={s._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: 'linear-gradient(135deg, #6366f1, #06b6d4)', fontWeight: 700, color: 'white', fontSize: '0.85rem', flexShrink: 0
                                                }}>
                                                    {s.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{s.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ fontFamily: 'monospace', color: '#818cf8' }}>{s.regNo}</td>
                                        <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{s.department || '—'}</td>
                                        <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{s.email}</td>
                                        <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{s.phone || '—'}</td>
                                        <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                            {new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td>
                                            <button className="btn-outline" onClick={() => viewStudent(s)} style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
                                                🏆 Achievements
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Student achievements modal */}
            {selected && (
                <div className="modal-overlay" onClick={() => setSelected(null)}>
                    <div className="modal-box" style={{ padding: '2rem', maxWidth: 700 }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 style={{ fontWeight: 700, fontSize: '1.2rem' }}>{selected.name}'s Achievements</h2>
                                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                                    {selected.regNo} • {selected.department} • {selected.phone || 'No phone'}
                                </p>
                            </div>
                            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>

                        {certsLoading ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <div className="spinner" style={{ margin: '0 auto', width: 28, height: 28, borderWidth: 3 }} />
                            </div>
                        ) : certs.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📭</div>
                                <p style={{ fontSize: '0.875rem' }}>No certificates uploaded yet</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '60vh', overflowY: 'auto' }}>
                                {certs.map((cert) => (
                                    <div key={cert._id} style={{
                                        padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,102,241,0.1)',
                                        borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem' }}>{cert.title}</div>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <CategoryBadge category={cert.category} />
                                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                    {new Date(cert.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <StatusBadge status={cert.status} />
                                            <a href={cert.fileUrl} download target="_blank" rel="noopener noreferrer"
                                                className="btn-ghost" style={{ textDecoration: 'none', fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                                                ⬇️
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
