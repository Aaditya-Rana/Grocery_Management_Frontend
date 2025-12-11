import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export type Handlers = {
  onListUpdated?: (updatedList: unknown) => void;
  onItemUpdated?: (updatedItem: unknown) => void;
  onListCompleted?: (data: unknown) => void;
  onShareRevoked?: (data: unknown) => void;
  onShareAccepted?: (data: unknown) => void;
  onSubscribed?: (data: unknown) => void;
  onUnsubscribed?: (data: unknown) => void;
};

let socket: Socket | null = null;

function getSocket() {
  if (socket) return socket;

  const WS_URL = (import.meta.env.VITE_WS_URL as string) || 'http://localhost:3000/realtime';

  console.log('[Socket] Connecting to:', WS_URL);

  socket = io(WS_URL, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected successfully, ID:', socket?.id);
  });

  socket.on('connect_error', (err: unknown) => {
    console.error('[Socket] Connect error:', err);
  });

  socket.on('disconnect', (reason: unknown) => {
    console.warn('[Socket] Disconnected:', reason);
  });

  return socket;
}

export function useListRealtime(
  listId?: string | null,
  handlers: Handlers = {},
  options?: { shareToken?: string }
) {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!listId) {
      console.log('[useListRealtime] No listId provided, skipping subscription');
      return;
    }

    const s = getSocket();
    let cleanup: (() => void) | null = null;

    function subscribeToList() {
      console.log(
        `[useListRealtime] Subscribing to list: ${listId}, Socket connected: ${s.connected}, ShareToken: ${options?.shareToken || 'none'}`
      );

      const handleListUpdated = (payload: unknown) => {
        console.log(`[useListRealtime] Received list.updated for ${listId}:`, payload);
        handlersRef.current.onListUpdated?.(payload);
      };
      const handleItemUpdated = (payload: unknown) => {
        console.log(`[useListRealtime] Received item.updated for ${listId}:`, payload);
        handlersRef.current.onItemUpdated?.(payload);
      };
      const handleListCompleted = (payload: unknown) => {
        console.log(`[useListRealtime] Received list.completed for ${listId}:`, payload);
        handlersRef.current.onListCompleted?.(payload);
      };
      const handleShareRevoked = (payload: unknown) => {
        console.log(`[useListRealtime] Received share.revoked for ${listId}:`, payload);
        handlersRef.current.onShareRevoked?.(payload);
      };
      const handleShareAccepted = (payload: unknown) => {
        console.log(`[useListRealtime] Received share.accepted for ${listId}:`, payload);
        handlersRef.current.onShareAccepted?.(payload);
      };
      const handleSubscribed = (payload: unknown) => {
        console.log(`[useListRealtime] Subscribed confirmation for ${listId}:`, payload);
        handlersRef.current.onSubscribed?.(payload);
      };
      const handleUnsubscribed = (payload: unknown) => {
        console.log(`[useListRealtime] Unsubscribed confirmation for ${listId}:`, payload);
        handlersRef.current.onUnsubscribed?.(payload);
      };

      // Emit subscribe event with listId and optional shareToken for authorization
      const subscriptionPayload: { listId: string; shareToken?: string } = { listId: listId! };
      if (options?.shareToken) {
        subscriptionPayload.shareToken = options.shareToken;
      }

      s.emit('subscribe', subscriptionPayload, (ack: unknown) => {
        console.log(`[useListRealtime] Subscribe acknowledged for ${listId}:`, ack);
      });

      s.on('list.updated', handleListUpdated);
      s.on('item.updated', handleItemUpdated);
      s.on('list.completed', handleListCompleted);
      s.on('share.revoked', handleShareRevoked);
      s.on('share.accepted', handleShareAccepted);
      s.on('subscribed', handleSubscribed);
      s.on('unsubscribed', handleUnsubscribed);

      // Set cleanup function
      cleanup = () => {
        console.log(`[useListRealtime] Cleaning up subscription for ${listId}`);
        try {
          s.emit('unsubscribe', { listId }, (ack: unknown) => {
            console.log(`[useListRealtime] Unsubscribe acknowledged for ${listId}:`, ack);
          });
        } catch (e) {
          console.error('[useListRealtime] Error unsubscribing:', e);
        }

        s.off('list.updated', handleListUpdated);
        s.off('item.updated', handleItemUpdated);
        s.off('list.completed', handleListCompleted);
        s.off('share.revoked', handleShareRevoked);
        s.off('share.accepted', handleShareAccepted);
        s.off('subscribed', handleSubscribed);
        s.off('unsubscribed', handleUnsubscribed);
      };
    }

    // Wait for socket to be connected before subscribing
    if (s.connected) {
      subscribeToList();
    } else {
      console.log('[useListRealtime] Waiting for socket connection...');
      s.once('connect', subscribeToList);
    }

    return () => {
      if (cleanup) {
        cleanup();
      } else {
        // If not connected yet, try to unsubscribe anyway
        try {
          s.emit('unsubscribe', { listId });
        } catch {
          // ignore
        }
      }
    };
  }, [listId, options?.shareToken, handlers]); // Added handlers to dependency array
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export default getSocket;
