import { io } from 'socket.io-client';

let socket = null;

/**
 * Get or initialize the Socket.io client instance
 */
export function getSocket() {
  if (!socket) {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    socket = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      autoConnect: true
    });

    socket.on('connect', () => {
      console.log('⚡ [CivicFix Realtime] Connected to WebSocket live stream (ID:', socket.id, ')');
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 [CivicFix Realtime] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ [CivicFix Realtime] Connection error:', err.message);
    });
  }
  return socket;
}

/**
 * Subscribe to complaints feed (State or Pan-India)
 * @param {string|null} stateName - Optional state to filter, or null for all-India
 * @param {Object} handlers - Event handlers
 */
export function subscribeToRealtimeComplaints(stateName, { onCreated, onUpdated, onVerified }) {
  const s = getSocket();

  if (stateName) {
    s.emit('join:state', stateName);
  }

  const handleCreated = (complaint) => {
    if (onCreated) onCreated(complaint);
  };

  const handleUpdated = (complaint) => {
    if (onUpdated) onUpdated(complaint);
  };

  const handleVerified = (complaint) => {
    if (onVerified) onVerified(complaint);
  };

  s.on('complaint:created', handleCreated);
  s.on('complaint:updated', handleUpdated);
  s.on('complaint:verified', handleVerified);

  return () => {
    if (stateName) {
      s.emit('leave:state', stateName);
    }
    s.off('complaint:created', handleCreated);
    s.off('complaint:updated', handleUpdated);
    s.off('complaint:verified', handleVerified);
  };
}

/**
 * Subscribe to a specific complaint detail stream (real-time comments & status)
 */
export function subscribeToComplaintDetails(complaintId, { onUpdated, onCommentAdded, onVerified }) {
  const s = getSocket();
  const idStr = String(complaintId);

  s.emit('join:complaint', idStr);

  const handleUpdated = (complaint) => {
    if (String(complaint._id) === idStr && onUpdated) onUpdated(complaint);
  };

  const handleComment = (payload) => {
    if (String(payload.complaintId) === idStr && onCommentAdded) {
      onCommentAdded(payload.comment);
    }
  };

  const handleVerified = (complaint) => {
    if (String(complaint._id) === idStr && onVerified) onVerified(complaint);
  };

  s.on('complaint:updated', handleUpdated);
  s.on('comment:added', handleComment);
  s.on('complaint:verified', handleVerified);

  return () => {
    s.emit('leave:complaint', idStr);
    s.off('complaint:updated', handleUpdated);
    s.off('comment:added', handleComment);
    s.off('complaint:verified', handleVerified);
  };
}
