import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import api from '../../api/axios';

const CATEGORIES = [
    { value: 'sports', label: '🏆 Sports', color: '#ef4444' },
    { value: 'hackathon', label: '💻 Hackathon', color: '#6366f1' },
    { value: 'workshop', label: '🔧 Workshop / Seminar', color: '#f59e0b' },
    { value: 'online', label: '📚 Online Course', color: '#10b981' },
];

export default function UploadForm() {
    const navigate = useNavigate();
    const fileRef = useRef();
    const [category, setCategory] = useState('');
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        title: '', date: '', yearSem: '', eventName: '', venue: '', place: '',
        // Sports
        sportName: '', competitionLevel: '', position: '',
        // Hackathon
        hackathonName: '', organizer: '', teamMembers: '', projectName: '',
        // Workshop
        workshopName: '', workshopOrganizer: '', duration: '',
        // Online
        platform: '', courseName: '', courseDuration: '', learningMode: '',
    });

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
        if (!category) return setError('Please select a certificate category');
        if (!file) return setError('Please upload a certificate file');

        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('category', category);
            for (const [key, val] of Object.entries(form)) {
                fd.append(key, val);
            }
            await api.post('/certificates', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Sidebar />
            <div className="main-content" style={{ maxWidth: 800 }}>
                <div style={{ marginBottom: '2rem' }}>
                    <button onClick={() => navigate('/dashboard')} className="btn-ghost" style={{ marginBottom: '1rem' }}>
                        ← Back to Dashboard
                    </button>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9' }}>Upload Certificate</h1>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Add your achievement certificate to the vault</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>⚠️ {error}</div>}

                    {/* Category Selector */}
                    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Step 1 — Select Category
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => setCategory(cat.value)}
                                    style={{
                                        padding: '1rem 1.25rem', borderRadius: 12, border: `2px solid ${category === cat.value ? cat.color : 'rgba(99,102,241,0.15)'}`,
                                        background: category === cat.value ? `${cat.color}18` : 'rgba(255,255,255,0.02)',
                                        color: category === cat.value ? cat.color : '#94a3b8',
                                        cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
                                        textAlign: 'left'
                                    }}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Common Fields */}
                    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Step 2 — Certificate Details
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label>Certificate Title *</label>
                                <input className="form-input" placeholder="e.g. State Level Basketball Championship" value={form.title} onChange={upd('title')} required />
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
                                <label>{category === 'online' ? 'Topic learned' : 'Name of the Event'}</label>
                                <input className="form-input" placeholder={category === 'online' ? 'e.g. Python for Data Science' : 'e.g. TechFest, Symposium'} value={form.eventName} onChange={upd('eventName')} />
                            </div>
                            {category !== 'online' ? (
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

                        {/* Category-specific fields */}
                        {category === 'sports' && <SportsFields form={form} upd={upd} />}
                        {category === 'hackathon' && <HackathonFields form={form} upd={upd} />}
                        {category === 'workshop' && <WorkshopFields form={form} upd={upd} />}
                        {category === 'online' && <OnlineFields form={form} upd={upd} />}
                    </div>

                    {/* File Upload */}
                    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Step 3 — Upload File
                        </h2>
                        <div
                            className={`upload-zone ${dragging ? 'dragover' : ''}`}
                            onClick={() => fileRef.current.click()}
                            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
                        >
                            {file ? (
                                <div>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                                        {file.type === 'application/pdf' ? '📄' : '🖼️'}
                                    </div>
                                    <div style={{ fontWeight: 600, color: '#f1f5f9', marginBottom: '0.25rem' }}>{file.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{(file.size / 1024).toFixed(1)} KB • Click to change</div>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>☁️</div>
                                    <div style={{ fontWeight: 600, color: '#f1f5f9', marginBottom: '0.25rem' }}>Drop file here or click to upload</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>PDF, JPG, PNG — max 5MB</div>
                                </div>
                            )}
                            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
                        </div>
                    </div>

                    {/* Submit */}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn-ghost" onClick={() => navigate('/dashboard')}>Cancel</button>
                        <button id="upload-submit" className="btn-primary" type="submit" disabled={loading} style={{ padding: '0.75rem 2rem' }}>
                            {loading ? <><span className="spinner" /> Uploading...</> : '📤 Submit Certificate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SportsFields({ form, upd }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div className="form-group">
                <label>Sport Name *</label>
                <input className="form-input" placeholder="Basketball, Cricket..." value={form.sportName} onChange={upd('sportName')} required />
            </div>
            <div className="form-group">
                <label>Competition Level *</label>
                <select className="form-input" value={form.competitionLevel} onChange={upd('competitionLevel')} required>
                    <option value="">Select level</option>
                    <option>College</option>
                    <option>State</option>
                    <option>National</option>
                </select>
            </div>
            <div className="form-group">
                <label>Position *</label>
                <select className="form-input" value={form.position} onChange={upd('position')} required>
                    <option value="">Select position</option>
                    <option>Winner</option>
                    <option>Runner</option>
                    <option>Participant</option>
                </select>
            </div>
        </div>
    );
}

function HackathonFields({ form, upd }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div className="form-group">
                <label>Hackathon Name *</label>
                <input className="form-input" placeholder="Smart India Hackathon" value={form.hackathonName} onChange={upd('hackathonName')} required />
            </div>
            <div className="form-group">
                <label>Organizer *</label>
                <input className="form-input" placeholder="MHRD, AICTE..." value={form.organizer} onChange={upd('organizer')} required />
            </div>
            <div className="form-group">
                <label>Project Name</label>
                <input className="form-input" placeholder="AI-based attendance system" value={form.projectName} onChange={upd('projectName')} />
            </div>
            <div className="form-group">
                <label>Team Members</label>
                <input className="form-input" placeholder="John, Jane, Bob" value={form.teamMembers} onChange={upd('teamMembers')} />
            </div>
        </div>
    );
}

function WorkshopFields({ form, upd }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div className="form-group">
                <label>Workshop Name *</label>
                <input className="form-input" placeholder="Web Development Bootcamp" value={form.workshopName} onChange={upd('workshopName')} required />
            </div>
            <div className="form-group">
                <label>Organizer *</label>
                <input className="form-input" placeholder="NSS, College Club..." value={form.workshopOrganizer} onChange={upd('workshopOrganizer')} required />
            </div>
            <div className="form-group">
                <label>Duration</label>
                <input className="form-input" placeholder="2 days, 8 hours..." value={form.duration} onChange={upd('duration')} />
            </div>
        </div>
    );
}

function OnlineFields({ form, upd }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div className="form-group">
                <label>Platform *</label>
                <select className="form-input" value={form.platform} onChange={upd('platform')} required>
                    <option value="">Select platform</option>
                    <option>Coursera</option>
                    <option>NPTEL</option>
                    <option>Udemy</option>
                    <option>edX</option>
                    <option>LinkedIn Learning</option>
                    <option>Google</option>
                    <option>Microsoft</option>
                    <option>AWS</option>
                    <option>Other</option>
                </select>
            </div>
            <div className="form-group">
                <label>Course Name *</label>
                <input className="form-input" placeholder="Machine Learning" value={form.courseName} onChange={upd('courseName')} required />
            </div>
            <div className="form-group">
                <label>Duration</label>
                <input className="form-input" placeholder="4 weeks, 40 hours..." value={form.courseDuration} onChange={upd('courseDuration')} />
            </div>
        </div>
    );
}
