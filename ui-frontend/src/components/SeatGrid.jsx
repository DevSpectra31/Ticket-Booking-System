'use client';

import { SEAT_STATUS } from '@/lib/constants';

export default function SeatGrid({ seats, selectedSeats, onSeatClick, currentUserId }) {
  // Group seats by row
  const rows = {};
  seats.forEach((seat) => {
    if (!rows[seat.row]) rows[seat.row] = [];
    rows[seat.row].push(seat);
  });

  // Sort seats within each row
  Object.values(rows).forEach((row) => row.sort((a, b) => a.seatNumber - b.seatNumber));

  const getSeatClass = (seat) => {
    if (selectedSeats.includes(seat._id)) return 'seat seat-selected';
    switch (seat.status) {
      case SEAT_STATUS.AVAILABLE: return 'seat seat-available';
      case SEAT_STATUS.HELD:
        // If held by current user, show as selected
        if (seat.heldBy === currentUserId) return 'seat seat-selected';
        return 'seat seat-held';
      case SEAT_STATUS.BOOKED: return 'seat seat-booked';
      case SEAT_STATUS.BLOCKED: return 'seat seat-blocked';
      default: return 'seat seat-available';
    }
  };

  const isClickable = (seat) => {
    return seat.status === SEAT_STATUS.AVAILABLE || selectedSeats.includes(seat._id);
  };

  return (
    <div className="seat-grid-container">
      <div className="seat-screen" />
      <div className="seat-screen-label">Screen / Stage</div>

      {Object.entries(rows)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([rowLabel, rowSeats], rowIndex) => (
          <div key={rowLabel} className="seat-row fade-in" style={{ animationDelay: `${rowIndex * 0.04}s`, opacity: 0 }}>
            <span className="seat-row-label">{rowLabel}</span>
            {rowSeats.map((seat) => (
              <button
                key={seat._id}
                className={getSeatClass(seat)}
                onClick={() => isClickable(seat) && onSeatClick(seat)}
                disabled={!isClickable(seat)}
                title={`${seat.label} - ${seat.category?.name || ''} - ₹${seat.category?.price || 0}`}
              >
                {seat.seatNumber}
              </button>
            ))}
            <span className="seat-row-label">{rowLabel}</span>
          </div>
        ))}

      <div className="seat-legend">
        <div className="seat-legend-item">
          <div className="seat-legend-color" style={{ background: 'var(--seat-available)' }} />
          Available
        </div>
        <div className="seat-legend-item">
          <div className="seat-legend-color" style={{ background: 'var(--seat-selected)' }} />
          Selected
        </div>
        <div className="seat-legend-item">
          <div className="seat-legend-color" style={{ background: 'var(--seat-held)' }} />
          Held
        </div>
        <div className="seat-legend-item">
          <div className="seat-legend-color" style={{ background: 'var(--seat-booked)' }} />
          Booked
        </div>
      </div>
    </div>
  );
}
