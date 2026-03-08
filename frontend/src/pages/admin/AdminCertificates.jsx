import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import CategoryBadge from '../../components/CategoryBadge';
import api from '../../api/axios';
import * as XLSX from 'xlsx';

export default function AdminCertificates() {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ category: '', status: '', department: '' });
    const [viewCert, setViewCert] = useState(null);
    const [noteInput, setNoteInput] = useState('');
    const [actionLoading, setActionLoading] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchCerts();
    }, [filters]);

    const fetchCerts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.category) params.append('category', filters.category);
            if (filters.status) params.append('status', filters.status);
            const { data } = await api.get(`/certificates?${params.toString()}`);
            setCertificates(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatus = async (id, status) => {
        setActionLoading(id + status);
        try {
            const { data } = await api.patch(`/admin/certificates/${id}/status`, {
                status,
                adminNote: noteInput,
            });
            setCertificates(prev => prev.map(c => c._id === id ? data : c));
            if (viewCert?._id === id) setViewCert(data);
        } catch (err) {
            alert(err.response?.data?.message || 'Action failed');
        } finally {
            setActionLoading('');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this certificate permanently?')) return;
        try {
            await api.delete(`/admin/certificates/${id}`);
            setCertificates(prev => prev.filter(c => c._id !== id));
            if (viewCert?._id === id) setViewCert(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Delete failed');
        }
    };

    const filtered = certificates.filter(c => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            c.title?.toLowerCase().includes(q) ||
            c.student?.name?.toLowerCase().includes(q) ||
            c.student?.regNo?.toLowerCase().includes(q)
        );
    }).filter(c => {
        if (filters.department && c.student?.department !== filters.department) return false;
        return true;
    });

    const uniqueDepartments = [...new Set(certificates.map(c => c.student?.department).filter(Boolean))];

    const handleDownloadExcel = () => {
        const isOnline = filters.category === 'online';

        const exportData = filtered.map((c, index) => {
            if (isOnline) {
                return {
                    'S.No': index + 1,
                    'Register No': c.student?.regNo || '-',
                    'Name of the Student': c.student?.name || '-',
                    'Year/Semester': c.yearSem || '-',
                    'Topic Learned': c.eventName || c.courseName || '-',
                    'Mode of Learning/Platform': `${c.learningMode || 'Online'} / ${c.platform || '-'}`,
                    'Duration/Hours': c.courseDuration || c.duration || '-',
                };
            }
            return {
                'S.No': index + 1,
                'Register No': c.student?.regNo || '-',
                'Name of Student': c.student?.name || '-',
                'Year/Semester': c.yearSem || '-',
                'Name of Event': c.category === 'sports' ? (c.sportName || 'Sport') : (c.eventName || c.hackathonName || c.workshopName || c.courseName || '-'),
                'Venue of the Event': c.category === 'online' ? (c.learningMode || 'Online') : (c.venue || '-'),
                'Place': c.place || c.position || '-',
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        // Auto-size columns loosely based on headers
        worksheet['!cols'] = [
            { wch: 6 }, { wch: 15 }, { wch: 25 }, { wch: 15 },
            { wch: 30 }, { wch: 20 }, { wch: 15 }
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Certificates");
        XLSX.writeFile(workbook, `Student_Certificates${filters.department ? '_' + filters.department : ''}.xlsx`);
    };

    return (
        <div>
            <Sidebar />
            <div className="main-content">
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                        All <span className="gradient-text">Certificates</span>
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Review, approve or reject student certificates</p>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    {/* Filters */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <input
                            className="form-input"
                            style={{ width: 240, padding: '0.55rem 0.9rem', fontSize: '0.85rem' }}
                            placeholder="🔍 Search by name, regno, title..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <select className="form-input" style={{ width: 'auto', padding: '0.55rem 0.9rem', fontSize: '0.85rem' }}
                            value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                            <option value="">All Categories</option>
                            <option value="sports">🏆 Sports</option>
                            <option value="hackathon">💻 Hackathon</option>
                            <option value="workshop">🔧 Workshop</option>
                            <option value="online">📚 Online Course</option>
                        </select>
                        <select className="form-input" style={{ width: 'auto', padding: '0.55rem 0.9rem', fontSize: '0.85rem' }}
                            value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                            <option value="">All Status</option>
                            <option value="pending">⏳ Pending</option>
                            <option value="approved">✅ Approved</option>
                            <option value="rejected">❌ Rejected</option>
                        </select>
                        <select className="form-input" style={{ width: 'auto', padding: '0.55rem 0.9rem', fontSize: '0.85rem' }}
                            value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })}>
                            <option value="">All Departments</option>
                            {uniqueDepartments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                        <button className="btn-success" onClick={handleDownloadExcel} style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}>
                            📥 Download Excel
                        </button>
                        <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#64748b' }}>
                            {filtered.length} certificate{filtered.length !== 1 ? 's' : ''}
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <div className="spinner" style={{ margin: '0 auto', width: 32, height: 32, borderWidth: 3 }} />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📭</div>
                            <p>No certificates found</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Certificate</th>
                                        <th>Category</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((cert) => (
                                        <tr key={cert._id}>
                                            <td>
                                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{cert.student?.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{cert.student?.regNo}</div>
                                                {cert.student?.department && <div style={{ fontSize: '0.7rem', color: '#475569' }}>{cert.student?.department}</div>}
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 500, fontSize: '0.875rem', maxWidth: 200 }}>{cert.title}</div>
                                            </td>
                                            <td><CategoryBadge category={cert.category} /></td>
                                            <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                                {new Date(cert.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td><StatusBadge status={cert.status} /></td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                                    <button className="btn-ghost" onClick={() => { setViewCert(cert); setNoteInput(cert.adminNote || ''); }}
                                                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}>
                                                        👁️
                                                    </button>
                                                    {cert.status !== 'approved' && (
                                                        <button className="btn-success" onClick={() => handleStatus(cert._id, 'approved')}
                                                            disabled={!!actionLoading}
                                                            style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}>
                                                            {actionLoading === cert._id + 'approved' ? '...' : '✅'}
                                                        </button>
                                                    )}
                                                    {cert.status !== 'rejected' && (
                                                        <button className="btn-danger" onClick={() => handleStatus(cert._id, 'rejected')}
                                                            disabled={!!actionLoading}
                                                            style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}>
                                                            {actionLoading === cert._id + 'rejected' ? '...' : '❌'}
                                                        </button>
                                                    )}
                                                    <a href={cert.fileUrl} download className="btn-outline" style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem', textDecoration: 'none' }}>
                                                        ⬇️
                                                    </a>
                                                    <button className="btn-danger" onClick={() => handleDelete(cert._id)} style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* View Certificate Modal */}
            {viewCert && (
                <div className="modal-overlay" onClick={() => setViewCert(null)}>
                    <div className="modal-box" style={{ padding: '2rem', maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.75rem' }}>{viewCert.title}</h2>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <CategoryBadge category={viewCert.category} />
                                    <StatusBadge status={viewCert.status} />
                                </div>
                            </div>
                            <button onClick={() => setViewCert(null)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>

                        {/* Student info */}
                        <div style={{ padding: '0.75rem 1rem', background: 'rgba(99,102,241,0.08)', borderRadius: 10, marginBottom: '1rem', border: '1px solid rgba(99,102,241,0.15)' }}>
                            <div style={{ fontWeight: 700, color: '#818cf8', marginBottom: '0.25rem' }}>👨‍🎓 {viewCert.student?.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{viewCert.student?.regNo} • {viewCert.student?.email} • {viewCert.student?.phone || 'No Phone'} • {viewCert.student?.department}</div>
                        </div>

                        {/* Cert details */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                            {[
                                viewCert.yearSem && ['Year / Sem', viewCert.yearSem],
                                viewCert.eventName && [viewCert.category === 'online' ? 'Topic learned' : 'Event', viewCert.eventName],
                                viewCert.venue && ['Venue', viewCert.venue],
                                viewCert.place && ['Place', viewCert.place],
                                viewCert.sportName && ['Sport', viewCert.sportName],
                                viewCert.competitionLevel && ['Level', viewCert.competitionLevel],
                                viewCert.position && ['Position', viewCert.position],
                                viewCert.hackathonName && ['Hackathon', viewCert.hackathonName],
                                viewCert.organizer && ['Organizer', viewCert.organizer],
                                viewCert.teamMembers && ['Team', viewCert.teamMembers],
                                viewCert.projectName && ['Project', viewCert.projectName],
                                viewCert.workshopName && ['Workshop', viewCert.workshopName],
                                viewCert.workshopOrganizer && ['Organizer', viewCert.workshopOrganizer],
                                viewCert.duration && ['Duration', viewCert.duration],
                                viewCert.platform && ['Platform', viewCert.platform],
                                viewCert.courseName && ['Course', viewCert.courseName],
                                viewCert.courseDuration && ['Duration', viewCert.courseDuration],
                                viewCert.learningMode && ['Mode', viewCert.learningMode],
                                ['Date', new Date(viewCert.date).toLocaleDateString()],
                            ].filter(Boolean).map(([label, val]) => (
                                <div key={label} style={{ padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.1)' }}>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{label}</div>
                                    <div style={{ fontSize: '0.875rem', color: '#f1f5f9', fontWeight: 500, marginTop: '0.15rem' }}>{val}</div>
                                </div>
                            ))}
                        </div>

                        {/* Admin Note */}
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label>Admin Note (optional)</label>
                            <input className="form-input" placeholder="Add a review note..." value={noteInput} onChange={(e) => setNoteInput(e.target.value)} />
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <a href={viewCert.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ textDecoration: 'none' }}>
                                👁️ View File
                            </a>
                            <a href={viewCert.fileUrl} download className="btn-ghost" style={{ textDecoration: 'none' }}>
                                ⬇️ Download
                            </a>
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                                {viewCert.status !== 'approved' && (
                                    <button className="btn-success" onClick={() => handleStatus(viewCert._id, 'approved')} disabled={!!actionLoading}>
                                        {actionLoading === viewCert._id + 'approved' ? '...' : '✅ Approve'}
                                    </button>
                                )}
                                {viewCert.status !== 'rejected' && (
                                    <button className="btn-danger" onClick={() => handleStatus(viewCert._id, 'rejected')} disabled={!!actionLoading}>
                                        {actionLoading === viewCert._id + 'rejected' ? '...' : '❌ Reject'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
