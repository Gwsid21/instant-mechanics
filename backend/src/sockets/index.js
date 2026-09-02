let ioInstance = null;

function initSockets(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[ws] client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`[ws] client disconnected: ${socket.id}`);
    });
  });
}

// Emitters used by controllers/simulator to push live updates to every
// connected dashboard client. Keeping these as named events (rather than one
// generic "update" event) lets the frontend patch only the slice of state
// that actually changed instead of refetching everything.
function emitBookingCreated(booking) {
  ioInstance?.emit('booking:created', booking);
}

function emitBookingUpdated(booking) {
  ioInstance?.emit('booking:updated', booking);
}

function emitMechanicUpdated(mechanic) {
  ioInstance?.emit('mechanic:updated', mechanic);
}

function emitDashboardStats(stats) {
  ioInstance?.emit('dashboard:stats', stats);
}

module.exports = {
  initSockets,
  emitBookingCreated,
  emitBookingUpdated,
  emitMechanicUpdated,
  emitDashboardStats,
};
