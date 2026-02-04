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
    Mail
} from 'lucide-react';

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
                // Check if user is logged in - call backend directly
                const userRes = await axios.get('http://localhost:5000/auth/current_user', {
                    withCredentials: true
                });

                if (!userRes.data.success || !userRes.data.user) {
                    // Not logged in, redirect to home
                    window.location.href = '/';
                    return;
                }

                setUser(userRes.data.user);

                // Fetch admin data - call backend directly
                const [statsRes, eventsRes, leadsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/admin/stats', { withCredentials: true }),
                    axios.get('http://localhost:5000/api/admin/events', { withCredentials: true }),
                    axios.get('http://localhost:5000/api/admin/leads', { withCredentials: true }),
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
            await axios.post(`http://localhost:5000/api/admin/events/${eventId}/import`, {}, { withCredentials: true });

            // Update local state
            setEvents(events.map(e =>
                e._id === eventId
                    ? { ...e, status: 'imported', isImported: true }
                    : e
            ));

            // Update stats
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
            await axios.post('http://localhost:5000/api/admin/scrape', {}, { withCredentials: true });
            alert('Scraping started! Check server logs for progress.');
        } catch (err) {
            console.error('Error triggering scrape:', err);
            alert('Failed to start scraper');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-sky-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Header */}
            <header className="bg-slate-800 border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <LayoutDashboard className="w-8 h-8 text-sky-500" />
                        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        {user && (
                            <div className="flex items-center gap-3">
                                {user.photo && (
                                    <img src={user.photo} alt="" className="w-8 h-8 rounded-full" />
                                )}
                                <span className="text-slate-300">{user.displayName}</span>
                            </div>
                        )}
                        <a
                            href="http://localhost:5000/auth/logout"
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </a>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-sky-500/20 rounded-lg">
                                <Calendar className="w-6 h-6 text-sky-500" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Total Events</p>
                                <p className="text-2xl font-bold text-white">{stats?.events?.total || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500/20 rounded-lg">
                                <Calendar className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">New Events</p>
                                <p className="text-2xl font-bold text-white">{stats?.events?.new || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500/20 rounded-lg">
                                <Download className="w-6 h-6 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Imported</p>
                                <p className="text-2xl font-bold text-white">{stats?.events?.imported || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500/20 rounded-lg">
                                <Users className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Leads Collected</p>
                                <p className="text-2xl font-bold text-white">{stats?.leads?.total || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={handleTriggerScrape}
                        className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Run Scraper
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'events'
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        Event Management ({events.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('leads')}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'leads'
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        Leads ({leads.length})
                    </button>
                </div>

                {/* Tab Content */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    {activeTab === 'events' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-700/50">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Image</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {events.map((event) => (
                                        <tr key={event._id} className="hover:bg-slate-700/30">
                                            <td className="px-6 py-4">
                                                <img
                                                    src={event.image}
                                                    alt=""
                                                    className="w-16 h-12 object-cover rounded"
                                                    onError={(e) => e.target.src = 'https://placehold.co/100x75?text=Event'}
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-white font-medium max-w-xs truncate">
                                                {event.title}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 text-sm">
                                                {event.date || 'TBA'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${event.status === 'new' ? 'bg-green-500/20 text-green-400' :
                                                    event.status === 'imported' ? 'bg-purple-500/20 text-purple-400' :
                                                        event.status === 'updated' ? 'bg-blue-500/20 text-blue-400' :
                                                            'bg-slate-500/20 text-slate-400'
                                                    }`}>
                                                    {event.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {event.status !== 'imported' ? (
                                                    <button
                                                        onClick={() => handleImport(event._id)}
                                                        disabled={importing === event._id}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                                                    >
                                                        {importing === event._id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Download className="w-4 h-4" />
                                                        )}
                                                        Import
                                                    </button>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-green-400 text-sm">
                                                        <Check className="w-4 h-4" />
                                                        Imported
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
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-700/50">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Event</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {leads.map((lead) => (
                                        <tr key={lead._id} className="hover:bg-slate-700/30">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-sky-500" />
                                                    <span className="text-white">{lead.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 max-w-xs truncate">
                                                {lead.eventTitle || lead.eventId?.title || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 text-sm">
                                                {new Date(lead.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {leads.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                                                No leads collected yet
                                            </td>
                                        </tr>
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
