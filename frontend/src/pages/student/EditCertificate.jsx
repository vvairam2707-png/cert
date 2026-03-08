import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';

export default function EditCertificate() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileRef = useRef();
    const [cert, setCert] = useState(null);
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({});

    useEffect(() => {
        api.get(`/certificates/${id}`).then(({ data }) => {
            setCert(data);
            setForm({
                title: data.title || '', date: data.date?.slice(0, 10) || '',
                yearSem: data.yearSem || '', eventName: data.eventName || '', venue: data.venue || '', place: data.place || '',
                sportName: data.sportName || '', competitionLevel: data.competitionLevel || '', position: data.position || '',
                hackathonName: data.hackathonName || '', organizer: data.organizer || '',
                teamMembers: data.teamMembers || '', projectName: data.projectName || '',
                workshopName: data.workshopName || '', workshopOrganizer: data.workshopOrganizer || '', duration: data.duration || '',
                platform: data.platform || '', courseName: data.courseName || '', courseDuration: data.courseDuration || '',
                learningMode: data.learningMode || '',
            });
            setLoading(false);
        }).catch(() => navigate('/dashboard'));
    }, [id]);

    const upd = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleFile = (f) => {
        if (!f) return;
        const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowed.includes(f.type)) return setError('Only PDF, JPG, PNG files are allowed');
        if (f.size > 5 * 1024 * 1024) return setError('File size must be under 5MB');
        setError('');
        setFile(f);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            const fd = new FormData();
            if (file) fd.append('file', file);
            fd.append('category', cert.category);
            for (const [key, val] of Object.entries(form)) fd.append(key, val);
            await api.put(`/certificates/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div><Sidebar /><div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
            <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
        </div></div>
    );

    return (
        <div>
            <Sidebar />
            <div className="main-content" style={{ maxWidth: 800 }}>
                <div style={{ marginBottom: '2rem' }}>
                    <button onClick={() => navigate('/dashboard')} className="btn-ghost" style={{ marginBottom: '1rem' }}>← Back</button>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Edit Certificate</h1>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
                        Category: <strong style={{ color: '#818cf8' }}>{cert?.category}</strong> — Status resets to <strong style={{ color: '#f59e0b' }}>Pending</strong> after edit
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>⚠️ {error}</div>}

                    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label>Certificate Title *</label>
                                <input className="form-input" value={form.title} onChange={upd('title')} required />
                            </div>
                            <div className="form-group">
                                <label>Date *</label>
                                <input className="form-input" type="date" value={form.date} onChange={upd('date')} required />
                            </div>
                            <div className="form-group">
                                <label>Year / Semester</label>
                                <input className="form-input" placeholder="e.g. 3rd Year / 5th Sem" value={form.yearSem} onChange={upd('yearSem')} />
                            </div>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label>{cert?.category === 'online' ? 'Topic learned' : 'Name of the Event'}</label>
                                <input className="form-input" placeholder={cert?.category === 'online' ? 'e.g. Python for Data Science' : 'e.g. TechFest, Symposium'} value={form.eventName} onChange={upd('eventName')} />
                            </div>
                            {cert?.category !== 'online' ? (
                                <div className="form-group">
                                    <label>Venue</label>
                                    <input className="form-input" placeholder="e.g. Main Auditorium" value={form.venue} onChange={upd('venue')} />
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label>Mode of Learning *</label>
                                    <select className="form-input" value={form.learningMode} onChange={upd('learningMode')} required>
                                        <option value="">Select Mode</option>
                                        <option>Online</option>
                                        <option>Offline</option>
                                    </select>
                                </div>
                            )}
                            <div className="form-group">
                                <label>Place / Ranking</label>
                                <select className="form-input" value={form.place} onChange={upd('place')}>
                                    <option value="">Select Place</option>
                                    <option>1st Place</option>
                                    <option>2nd Place</option>
                                    <option>3rd Place</option>
                                    <option>Participated</option>
                                </select>
                            </div>
                        </div>

                        {cert?.category === 'sports' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                <div className="form-group"><label>Sport Name</label><input className="form-input" value={form.sportName} onChange={upd('sportName')} /></div>
                                <div className="form-group"><label>Level</label>
                                    <select className="form-input" value={form.competitionLevel} onChange={upd('competitionLevel')}>
                                        <option value="">Select</option><option>College</option><option>State</option><option>National</option>
                                    </select>
                                </div>
                                <div className="form-group"><label>Position</label>
                                    <select className="form-input" value={form.position} onChange={upd('position')}>
                                        <option value="">Select</option><option>Winner</option><option>Runner</option><option>Participant</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {cert?.category === 'hackathon' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                <div className="form-group"><label>Hackathon Name</label><input className="form-input" value={form.hackathonName} onChange={upd('hackathonName')} /></div>
                                <div className="form-group"><label>Organizer</label><input className="form-input" value={form.organizer} onChange={upd('organizer')} /></div>
                                <div className="form-group"><label>Project Name</label><input className="form-input" value={form.projectName} onChange={upd('projectName')} /></div>
                                <div className="form-group"><label>Team Members</label><input className="form-input" value={form.teamMembers} onChange={upd('teamMembers')} /></div>
                            </div>
                        )}

                        {cert?.category === 'workshop' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                <div className="form-group"><label>Workshop Name</label><input className="form-input" value={form.workshopName} onChange={upd('workshopName')} /></div>
                                <div className="form-group"><label>Organizer</label><input className="form-input" value={form.workshopOrganizer} onChange={upd('workshopOrganizer')} /></div>
                                <div className="form-group"><label>Duration</label><input className="form-input" value={form.duration} onChange={upd('duration')} /></div>
                            </div>
                        )}

                        {cert?.category === 'online' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                <div className="form-group"><label>Platform</label>
                                    <select className="form-input" value={form.platform} onChange={upd('platform')}>
                                        <option value="">Select</option>
                                        {['Coursera', 'NPTEL', 'Udemy', 'edX', 'LinkedIn Learning', 'Google', 'Microsoft', 'AWS', 'Other'].map(p => <option key={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div className="form-group"><label>Course Name</label><input className="form-input" value={form.courseName} onChange={upd('courseName')} /></div>
                                <div className="form-group"><label>Duration</label><input className="form-input" value={form.courseDuration} onChange={upd('courseDuration')} /></div>
                            </div>
                        )}
                    </div>

                    {/* File re-upload */}
                    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Replace File (optional)
                        </h3>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Current: </span>
                            <a href={cert?.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
                                👁️ View Current File
                            </a>
                        </div>
                        <div
                            className={`upload-zone ${dragging ? 'dragover' : ''}`}
                            onClick={() => fileRef.current.click()}
                            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
                        >
                            {file ? (
                                <div><div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>{file.type === 'application/pdf' ? '📄' : '🖼️'}</div>
                                    <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{file.name}</div></div>
                            ) : (
                                <div><div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>📎</div>
                                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Click or drop new file to replace (PDF, JPG, PNG — 5MB max)</div></div>
                            )}
                            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn-ghost" onClick={() => navigate('/dashboard')}>Cancel</button>
                        <button className="btn-primary" type="submit" disabled={saving} style={{ padding: '0.75rem 2rem' }}>
                            {saving ? <><span className="spinner" /> Saving...</> : '💾 Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
