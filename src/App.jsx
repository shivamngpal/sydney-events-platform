import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { Search, Loader2, Shield } from 'lucide-react';
import EventCard from './components/EventCard';
import LeadModal from './components/LeadModal';
import AdminDashboard from './components/AdminDashboard';

// Dynamic API base URL for production/development
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/api/events`, {
          params: {
            limit: 20,
            search: searchTerm || undefined,
          },
        });
        setEvents(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [searchTerm]);

  const handleTicketClick = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

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
          <span style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#ffffff',
            letterSpacing: '-0.025em',
          }}>
            Sydney Events
          </span>

          {/* Search Bar */}
          <div style={{ position: 'relative' }}>
            <Search style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              color: '#737373',
            }} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                backgroundColor: '#171717',
                border: '1px solid #262626',
                borderRadius: '8px',
                padding: '8px 16px 8px 40px',
                fontSize: '14px',
                color: '#ffffff',
                width: '240px',
                outline: 'none',
              }}
            />
          </div>

          {/* Admin Link */}
          <a
            href={`${API_BASE}/auth/google`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#a3a3a3',
              textDecoration: 'none',
            }}
          >
            <Shield style={{ width: '16px', height: '16px' }} />
            <span>Admin</span>
          </a>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div style={{ height: '64px' }} />

      {/* Hero Section */}
      <div style={{
        padding: '80px 24px 48px 24px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 700,
          color: '#ffffff',
          letterSpacing: '-0.025em',
          marginBottom: '16px',
          lineHeight: 1.1,
        }}>
          Discover Events in Sydney
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#737373',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: 1.6,
        }}>
          Find the best events happening in Sydney. From concerts to exhibitions,
          festivals to workshops.
        </p>
      </div>

      {/* Main Content */}
      <main style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px 96px 24px',
      }}>
        {/* Section Header */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#ffffff',
            marginBottom: '4px',
          }}>
            Upcoming Events
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#737373',
          }}>
            {loading ? 'Loading...' : `${events.length} events available`}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '96px 0',
          }}>
            <Loader2 style={{
              width: '32px',
              height: '32px',
              color: '#525252',
              animation: 'spin 1s linear infinite',
            }} />
            <p style={{ color: '#737373', fontSize: '14px', marginTop: '16px' }}>
              Loading events...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={{ textAlign: 'center', padding: '96px 0' }}>
            <p style={{ color: '#ef4444' }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '16px',
                color: '#a3a3a3',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '24px',
          }}>
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onTicketClick={handleTicketClick}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && events.length === 0 && (
          <div style={{ textAlign: 'center', padding: '96px 0' }}>
            <p style={{ color: '#737373' }}>No events found.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #262626',
        padding: '32px 24px',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <p style={{ color: '#525252', fontSize: '14px' }}>
            © 2026 Sydney Events. Data sourced from What's On Sydney.
          </p>
        </div>
      </footer>

      {/* Lead Capture Modal */}
      <LeadModal
        isOpen={selectedEvent !== null}
        onClose={handleCloseModal}
        event={selectedEvent}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
