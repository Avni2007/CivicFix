const { Server } = require('socket.io');

let io = null;

/**
 * Initialize Socket.io Real-Time Engine
 * @param {import('http').Server} httpServer
 * @param {string|string[]|boolean} allowedOrigin
 */
function initSocket(httpServer, allowedOrigin = true) {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigin,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    // Automatically join pan-india feed
    socket.join('pan-india');

    // Client can subscribe to a specific State or Union Territory stream
    socket.on('join:state', (stateName) => {
      if (stateName) {
        socket.join(`state:${stateName.trim()}`);
      }
    });

    socket.on('leave:state', (stateName) => {
      if (stateName) {
        socket.leave(`state:${stateName.trim()}`);
      }
    });

    // Client can subscribe to a specific complaint detail stream
    socket.on('join:complaint', (complaintId) => {
      if (complaintId) {
        socket.join(`complaint:${complaintId}`);
      }
    });

    socket.on('leave:complaint', (complaintId) => {
      if (complaintId) {
        socket.leave(`complaint:${complaintId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  console.log('⚡ [Realtime] Socket.io Real-Time Engine Initialized (Pan-India Live Streaming Active)');
  return io;
}

function getIO() {
  return io;
}

/**
 * Broadcast new complaint creation in real-time
 */
function emitComplaintCreated(complaint) {
  if (!io) return;
  const state = complaint.location?.state;
  io.to('pan-india').emit('complaint:created', complaint);
  if (state) {
    io.to(`state:${state.trim()}`).emit('complaint:created', complaint);
  }
}

/**
 * Broadcast complaint updates (status change, assignment, proof-of-work)
 */
function emitComplaintUpdated(complaint) {
  if (!io) return;
  const state = complaint.location?.state;
  const complaintId = String(complaint._id);
  io.to('pan-india').emit('complaint:updated', complaint);
  io.to(`complaint:${complaintId}`).emit('complaint:updated', complaint);
  if (state) {
    io.to(`state:${state.trim()}`).emit('complaint:updated', complaint);
  }
}

/**
 * Broadcast citizen verification feedback
 */
function emitComplaintVerified(complaint) {
  if (!io) return;
  const state = complaint.location?.state;
  const complaintId = String(complaint._id);
  io.to('pan-india').emit('complaint:verified', complaint);
  io.to(`complaint:${complaintId}`).emit('complaint:verified', complaint);
  if (state) {
    io.to(`state:${state.trim()}`).emit('complaint:verified', complaint);
  }
}

/**
 * Broadcast real-time discussion comments
 */
function emitCommentAdded(complaintId, comment) {
  if (!io) return;
  io.to(`complaint:${String(complaintId)}`).emit('comment:added', {
    complaintId: String(complaintId),
    comment
  });
}

/**
 * Broadcast live aggregate metrics update
 */
function emitStatsUpdated(stats) {
  if (!io) return;
  io.to('pan-india').emit('stats:updated', stats);
}

module.exports = {
  initSocket,
  getIO,
  emitComplaintCreated,
  emitComplaintUpdated,
  emitComplaintVerified,
  emitCommentAdded,
  emitStatsUpdated
};
