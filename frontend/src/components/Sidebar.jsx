import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const studentLinks = [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/upload', icon: '📤', label: 'Upload Certificate' },
    { path: '/profile', icon: '👤', label: 'My Profile' },
];

const adminLinks = [
    { path: '/admin', icon: '📊', label: 'Dashboard' },
    { path: '/admin/certificates', icon: '📋', label: 'All Certificates' },
    { path: '/admin/students', icon: '👨‍🎓', label: 'Students' },
];

const categoryColors = {
    sports: '#ef4444',
    hackathon: '#6366f1',
    workshop: '#f59e0b',
    online: '#10b981',
};

export default function Sidebar() {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const links = isAdmin ? adminLinks : studentLinks;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="sidebar">
            {/* Logo */}
            <div style={{ marginBottom: '2rem', padding: '0 0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', fontSize: '1.1rem'
                    }}>🎓</div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#f1f5f9' }}>CertVault</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {isAdmin ? 'Admin Panel' : 'Student Portal'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 0.5rem', marginBottom: '0.5rem' }}>
                    Menu
                </div>
                {links.map((link) => (
                    <button
                        key={link.path}
                        onClick={() => navigate(link.path)}
                        className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
                    >
                        <span>{link.icon}</span>
                        <span>{link.label}</span>
                    </button>
                ))}
            </div>

            {/* User info + Logout */}
            <div style={{ borderTop: '1px solid rgba(99, 102, 241, 0.15)', paddingTop: '1rem', marginTop: '1rem' }}>
                <div style={{ padding: '0.75rem 0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isAdmin ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'linear-gradient(135deg, #6366f1, #06b6d4)',
                            fontWeight: 700, fontSize: '0.9rem', color: 'white'
                        }}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#f1f5f9', lineHeight: 1.2 }}>{user?.name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{user?.regNo || user?.email}</div>
                        </div>
                    </div>
                </div>
                <button onClick={handleLogout} className="sidebar-link" style={{ color: '#ef4444' }}>
                    <span>🚪</span>
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}
