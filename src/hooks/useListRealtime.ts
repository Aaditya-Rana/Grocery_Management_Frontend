import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

type Handlers = {
    onListUpdated?: (updatedList: any) => void;
    onItemUpdated?: (updatedItem: any) => void;
    onListCompleted?: (data: any) => void;
    onShareRevoked?: (data: any) => void;
    onShareAccepted?: (data: any) => void;
    onSubscribed?: (data: any) => void;
    onUnsubscribed?: (data: any) => void;
};

let socket: Socket | null = null;

function getSocket() {
    if (socket) return socket;

    const WS_URL = (import.meta.env.VITE_WS_URL as string) || 'http://localhost:3000/realtime';

    // eslint-disable-next-line no-console
    console.log('[Socket] Connecting to:', WS_URL);

    socket = io(WS_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
        // eslint-disable-next-line no-console
        console.log('[Socket] Connected successfully, ID:', socket?.id);
    });

    socket.on('connect_error', (err: any) => {
        // eslint-disable-next-line no-console
        console.error('[Socket] Connect error:', err);
    });

    socket.on('disconnect', (reason: any) => {
        // eslint-disable-next-line no-console
        console.warn('[Socket] Disconnected:', reason);
    });

    return socket;
}

export function useListRealtime(listId?: string | null, handlers: Handlers = {}, options?: { shareToken?: string }) {
    const handlersRef = useRef(handlers);
    handlersRef.current = handlers;

    useEffect(() => {
        if (!listId) {
            // eslint-disable-next-line no-console
            console.log('[useListRealtime] No listId provided, skipping subscription');
            return;
        }

        const s = getSocket();
        let cleanup: (() => void) | null = null;

        function subscribeToList() {
            // eslint-disable-next-line no-console
            console.log(`[useListRealtime] Subscribing to list: ${listId}, Socket connected: ${s.connected}, ShareToken: ${options?.shareToken || 'none'}`);

            const handleListUpdated = (payload: any) => {
                // eslint-disable-next-line no-console
                console.log(`[useListRealtime] Received list.updated for ${listId}:`, payload);
                handlersRef.current.onListUpdated?.(payload);
            };
            const handleItemUpdated = (payload: any) => {
                // eslint-disable-next-line no-console
                console.log(`[useListRealtime] Received item.updated for ${listId}:`, payload);
                handlersRef.current.onItemUpdated?.(payload);
            };
            const handleListCompleted = (payload: any) => {
                // eslint-disable-next-line no-console
                console.log(`[useListRealtime] Received list.completed for ${listId}:`, payload);
                handlersRef.current.onListCompleted?.(payload);
            };
            const handleShareRevoked = (payload: any) => {
                // eslint-disable-next-line no-console
                console.log(`[useListRealtime] Received share.revoked for ${listId}:`, payload);
                handlersRef.current.onShareRevoked?.(payload);
            };
            const handleShareAccepted = (payload: any) => {
                // eslint-disable-next-line no-console
                console.log(`[useListRealtime] Received share.accepted for ${listId}:`, payload);
                handlersRef.current.onShareAccepted?.(payload);
            };
            const handleSubscribed = (payload: any) => {
                // eslint-disable-next-line no-console
                console.log(`[useListRealtime] Subscribed confirmation for ${listId}:`, payload);
                handlersRef.current.onSubscribed?.(payload);
            };
            const handleUnsubscribed = (payload: any) => {
                // eslint-disable-next-line no-console
                console.log(`[useListRealtime] Unsubscribed confirmation for ${listId}:`, payload);
                handlersRef.current.onUnsubscribed?.(payload);
            };

            // Emit subscribe event with listId and optional shareToken for authorization
            const subscriptionPayload: any = { listId };
            if (options?.shareToken) {
                subscriptionPayload.shareToken = options.shareToken;
            }

            s.emit('subscribe', subscriptionPayload, (ack: any) => {
                // eslint-disable-next-line no-console
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
                // eslint-disable-next-line no-console
                console.log(`[useListRealtime] Cleaning up subscription for ${listId}`);
                try {
                    s.emit('unsubscribe', { listId }, (ack: any) => {
                        // eslint-disable-next-line no-console
                        console.log(`[useListRealtime] Unsubscribe acknowledged for ${listId}:`, ack);
                    });
                } catch (e) {
                    // eslint-disable-next-line no-console
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
            // eslint-disable-next-line no-console
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
                } catch (e) {
                    // ignore
                }
            }
        };
    }, [listId, options?.shareToken]);
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

export default getSocket;
