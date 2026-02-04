import { MapPin, ExternalLink, Calendar } from 'lucide-react';

const EventCard = ({ event, onTicketClick }) => {
    // Check if image is a placeholder or missing
    const hasRealImage = event.image &&
        !event.image.includes('placehold.co') &&
        !event.image.includes('placeholder');

    return (
        <div style={{
            backgroundColor: '#171717',
            border: '1px solid #262626',
            borderRadius: '16px',
            overflow: 'hidden',
            transition: 'border-color 0.2s ease',
        }}>
            {/* Image Section */}
            <div style={{
                position: 'relative',
                height: '200px',
                width: '100%',
                overflow: 'hidden',
                background: hasRealImage ? '#0a0a0a' : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            }}>
                {hasRealImage ? (
                    <img
                        src={event.image}
                        alt={event.title}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
                        }}
                    />
                ) : (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Calendar style={{ width: '48px', height: '48px', color: 'rgba(255,255,255,0.2)' }} />
                    </div>
                )}
                {/* Status Badge */}
                {event.status === 'new' && (
                    <span style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 500,
                        padding: '4px 10px',
                        borderRadius: '999px',
                    }}>
                        New
                    </span>
                )}
                {event.status === 'updated' && (
                    <span style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 500,
                        padding: '4px 10px',
                        borderRadius: '999px',
                    }}>
                        Updated
                    </span>
                )}
            </div>

            {/* Content Section */}
            <div style={{ padding: '20px' }}>
                {/* Date */}
                <p style={{
                    color: '#10b981',
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '8px',
                }}>
                    {event.date || 'Date TBA'}
                </p>

                {/* Title */}
                <h3 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#ffffff',
                    marginBottom: '8px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}>
                    {event.title}
                </h3>

                {/* Venue */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#a3a3a3',
                    fontSize: '14px',
                    marginBottom: '20px',
                }}>
                    <MapPin style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                    <span style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}>
                        {event.venue}
                    </span>
                </div>

                {/* Get Tickets Button */}
                <button
                    onClick={() => onTicketClick(event)}
                    style={{
                        width: '100%',
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        fontWeight: 600,
                        fontSize: '14px',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e5e5'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#ffffff'}
                >
                    Get Tickets
                    <ExternalLink style={{ width: '14px', height: '14px' }} />
                </button>
            </div>
        </div>
    );
};

export default EventCard;
