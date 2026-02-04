import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LayoutDashboard,
    Calendar,
    Users,
    Download,
    LogOut,
    Loader2,
    RefreshCw,
    Check,
    Mail,
    Home
} from 'lucide-react';

// Dynamic API base URL for production/development
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [events, setEvents] = useState([]);
    const [leads, setLeads] = useState([]);
    const [activeTab, setActiveTab] = useState('events');
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await axios.get(`${API_BASE}/auth/current_user`, {
                    withCredentials: true
                });

                if (!userRes.data.success || !userRes.data.user) {
                    window.location.href = '/';
                    return;
                }

                setUser(userRes.data.user);

                const [statsRes, eventsRes, leadsRes] = await Promise.all([
                    axios.get(`${API_BASE}/api/admin/stats`, { withCredentials: true }),
                    axios.get(`${API_BASE}/api/admin/events`, { withCredentials: true }),
                    axios.get(`${API_BASE}/api/admin/leads`, { withCredentials: true }),
                ]);

                setStats(statsRes.data.data);
                setEvents(eventsRes.data.data);
                setLeads(leadsRes.data.data);
            } catch (err) {
                console.error('Error fetching admin data:', err);
                if (err.response?.status === 401) {
                    window.location.href = '/';
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleImport = async (eventId) => {
        try {
            setImporting(eventId);
            await axios.post(`${API_BASE}/api/admin/events/${eventId}/import`, {}, { withCredentials: true });

            setEvents(events.map(e =>
                e._id === eventId
                    ? { ...e, status: 'imported', isImported: true }
                    : e
            ));

            if (stats) {
                setStats({
                    ...stats,
                    events: {
                        ...stats.events,
                        imported: stats.events.imported + 1,
                        new: stats.events.new > 0 ? stats.events.new - 1 : 0,
                    }
                });
            }
        } catch (err) {
            console.error('Error importing event:', err);
            alert('Failed to import event');
        } finally {
            setImporting(null);
        }
    };

    const handleTriggerScrape = async () => {
        try {
            await axios.post(`${API_BASE}/api/admin/scrape`, {}, { withCredentials: true });
            alert('Scraping started! Check server logs for progress.');
        } catch (err) {
            console.error('Error triggering scrape:', err);
            alert('Failed to start scraper');
        }
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                backgroundColor: '#0a0a0a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Loader2 style={{ width: '32px', height: '32px', color: '#525252', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a' }}>
            {/* Fixed Navbar */}
            <nav style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                backgroundColor: 'rgba(10, 10, 10, 0.9)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid #262626',
                height: '64px',
            }}>
                <div style={{
                    maxWidth: '1280px',
                    margin: '0 auto',
                    padding: '0 24px',
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <LayoutDashboard style={{ width: '24px', height: '24px', color: '#10b981' }} />
                        <span style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff' }}>
                            Admin Dashboard
                        </span>
                    </div>

                    {/* User Info & Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {user && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {user.photo && (
                                    <img
                                        src={user.photo}
                                        alt=""
                                        style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                                    />
                                )}
                                <span style={{ color: '#a3a3a3', fontSize: '14px' }}>{user.displayName}</span>
                            </div>
                        )}
                        <a
                            href="/"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 12px',
                                color: '#a3a3a3',
                                textDecoration: 'none',
                                fontSize: '14px',
                            }}
                        >
                            <Home style={{ width: '16px', height: '16px' }} />
                            Home
                        </a>
                        <a
                            href={`${API_BASE}/auth/logout`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '8px',
                                color: '#ef4444',
                                textDecoration: 'none',
                                fontSize: '14px',
                            }}
                        >
                            <LogOut style={{ width: '16px', height: '16px' }} />
                            Logout
                        </a>
                    </div>
                </div>
            </nav>

            {/* Spacer for fixed navbar */}
            <div style={{ height: '64px' }} />

            {/* Main Content */}
            <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
                {/* Stats Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '32px',
                }}>
                    {/* Total Events */}
                    <div style={{
                        backgroundColor: '#171717',
                        border: '1px solid #262626',
                        borderRadius: '12px',
                        padding: '20px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Calendar style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                            </div>
                            <div>
                                <p style={{ color: '#737373', fontSize: '13px', marginBottom: '2px' }}>Total Events</p>
                                <p style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700 }}>{stats?.events?.total || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* New Events */}
                    <div style={{
                        backgroundColor: '#171717',
                        border: '1px solid #262626',
                        borderRadius: '12px',
                        padding: '20px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Calendar style={{ width: '20px', height: '20px', color: '#10b981' }} />
                            </div>
                            <div>
                                <p style={{ color: '#737373', fontSize: '13px', marginBottom: '2px' }}>New Events</p>
                                <p style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700 }}>{stats?.events?.new || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Imported */}
                    <div style={{
                        backgroundColor: '#171717',
                        border: '1px solid #262626',
                        borderRadius: '12px',
                        padding: '20px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Download style={{ width: '20px', height: '20px', color: '#a855f7' }} />
                            </div>
                            <div>
                                <p style={{ color: '#737373', fontSize: '13px', marginBottom: '2px' }}>Imported</p>
                                <p style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700 }}>{stats?.events?.imported || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Total Leads */}
                    <div style={{
                        backgroundColor: '#171717',
                        border: '1px solid #262626',
                        borderRadius: '12px',
                        padding: '20px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Users style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
                            </div>
                            <div>
                                <p style={{ color: '#737373', fontSize: '13px', marginBottom: '2px' }}>Total Leads</p>
                                <p style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700 }}>{stats?.leads?.total || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '24px',
                }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setActiveTab('events')}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: 'none',
                                fontSize: '14px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                backgroundColor: activeTab === 'events' ? '#ffffff' : '#171717',
                                color: activeTab === 'events' ? '#000000' : '#a3a3a3',
                            }}
                        >
                            Events ({events.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('leads')}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: 'none',
                                fontSize: '14px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                backgroundColor: activeTab === 'leads' ? '#ffffff' : '#171717',
                                color: activeTab === 'leads' ? '#000000' : '#a3a3a3',
                            }}
                        >
                            Leads ({leads.length})
                        </button>
                    </div>

                    {/* Scrape Button */}
                    <button
                        onClick={handleTriggerScrape}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            backgroundColor: '#10b981',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                    >
                        <RefreshCw style={{ width: '16px', height: '16px' }} />
                        Run Scraper
                    </button>
                </div>

                {/* Content Table */}
                <div style={{
                    backgroundColor: '#171717',
                    border: '1px solid #262626',
                    borderRadius: '12px',
                    overflow: 'hidden',
                }}>
                    {activeTab === 'events' && (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#0a0a0a' }}>
                                        <th style={{ padding: '14px 20px', textAlign: 'left', color: '#737373', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Image</th>
                                        <th style={{ padding: '14px 20px', textAlign: 'left', color: '#737373', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</th>
                                        <th style={{ padding: '14px 20px', textAlign: 'left', color: '#737373', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                                        <th style={{ padding: '14px 20px', textAlign: 'left', color: '#737373', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                        <th style={{ padding: '14px 20px', textAlign: 'left', color: '#737373', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.map((event, idx) => (
                                        <tr key={event._id} style={{ borderTop: '1px solid #262626' }}>
                                            <td style={{ padding: '14px 20px' }}>
                                                <img
                                                    src={event.image}
                                                    alt=""
                                                    style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '6px', backgroundColor: '#0a0a0a' }}
                                                    onError={(e) => e.target.src = 'https://placehold.co/60x40/171717/525252?text=...'}
                                                />
                                            </td>
                                            <td style={{ padding: '14px 20px', color: '#ffffff', fontSize: '14px', fontWeight: 500, maxWidth: '250px' }}>
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                                    {event.title}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 20px', color: '#a3a3a3', fontSize: '13px' }}>
                                                {event.date || 'TBA'}
                                            </td>
                                            <td style={{ padding: '14px 20px' }}>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '999px',
                                                    fontSize: '11px',
                                                    fontWeight: 500,
                                                    backgroundColor: event.status === 'new' ? 'rgba(16, 185, 129, 0.1)' :
                                                        event.status === 'imported' ? 'rgba(168, 85, 247, 0.1)' :
                                                            event.status === 'updated' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(115, 115, 115, 0.1)',
                                                    color: event.status === 'new' ? '#10b981' :
                                                        event.status === 'imported' ? '#a855f7' :
                                                            event.status === 'updated' ? '#3b82f6' : '#737373',
                                                }}>
                                                    {event.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 20px' }}>
                                                {event.status !== 'imported' ? (
                                                    <button
                                                        onClick={() => handleImport(event._id)}
                                                        disabled={importing === event._id}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            padding: '6px 14px',
                                                            backgroundColor: '#a855f7',
                                                            color: '#ffffff',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            fontSize: '13px',
                                                            fontWeight: 500,
                                                            cursor: 'pointer',
                                                            opacity: importing === event._id ? 0.6 : 1,
                                                        }}
                                                    >
                                                        {importing === event._id ? (
                                                            <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                                                        ) : (
                                                            <Download style={{ width: '14px', height: '14px' }} />
                                                        )}
                                                        Import
                                                    </button>
                                                ) : (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '13px' }}>
                                                        <Check style={{ width: '14px', height: '14px' }} />
                                                        Done
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'leads' && (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#0a0a0a' }}>
                                        <th style={{ padding: '14px 20px', textAlign: 'left', color: '#737373', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                                        <th style={{ padding: '14px 20px', textAlign: 'left', color: '#737373', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Event</th>
                                        <th style={{ padding: '14px 20px', textAlign: 'left', color: '#737373', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leads.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" style={{ padding: '48px 20px', textAlign: 'center', color: '#525252' }}>
                                                No leads collected yet
                                            </td>
                                        </tr>
                                    ) : (
                                        leads.map((lead) => (
                                            <tr key={lead._id} style={{ borderTop: '1px solid #262626' }}>
                                                <td style={{ padding: '14px 20px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Mail style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
                                                        <span style={{ color: '#ffffff', fontSize: '14px' }}>{lead.email}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '14px 20px', color: '#a3a3a3', fontSize: '14px', maxWidth: '300px' }}>
                                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                                        {lead.eventTitle || lead.eventId?.title || 'N/A'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 20px', color: '#a3a3a3', fontSize: '13px' }}>
                                                    {new Date(lead.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
