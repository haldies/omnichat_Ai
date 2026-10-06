/**
 * Helper functions for Socket.IO to handle BigInt serialization
 */

/**
 * Convert BigInt values to strings recursively in an object
 * Socket.IO cannot serialize BigInt, so we need to convert them to strings
 */
function serializeForSocket(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    return obj.toString();
  }

  if (obj instanceof Date) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => serializeForSocket(item));
  }

  if (typeof obj === 'object') {
    const serialized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        serialized[key] = serializeForSocket(obj[key]);
      }
    }
    return serialized;
  }

  return obj;
}

/**
 * Emit Socket.IO event with automatic BigInt serialization
 */
function emitSocketEvent(io, eventName, data) {
  if (!io) {
    console.warn('Socket.IO instance not available');
    return;
  }

  try {
    const serializedData = serializeForSocket(data);
    io.emit(eventName, serializedData);
  } catch (error) {
    console.error('Error emitting socket event:', error);
  }
}

module.exports = {
  serializeForSocket,
  emitSocketEvent
};
