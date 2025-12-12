import React, { useState, useEffect, useRef } from 'react';
import { BoardColumn } from '../../components/board/BoardColumn';
import { api } from '../../api/client';
import type { KanbanItem, KanbanStatus, ListItem } from '../../types';
import getSocket from '../../hooks/useListRealtime';

export const BoardPage: React.FC = () => {
  const [items, setItems] = useState<KanbanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const listIdsRef = useRef<Set<string>>(new Set());

  // Load all items from all lists
  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        setError('');
        const lists = await api.lists.getAll();

        // Collect all items from all lists
        const allItems: KanbanItem[] = [];
        listIdsRef.current.clear();

        for (const list of lists) {
          if (list.status === 'draft' || list.status === 'shared') {
            const listId = list._id || list.id || '';
            listIdsRef.current.add(listId);

            const items = await api.items.getAll(listId);

            items.forEach((item: ListItem) => {
              allItems.push({
                _id: item._id || item.id,
                listId: listId,
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                status: (item.status as KanbanStatus) || 'to_buy',
                notes: item.notes || '',
                listName: list.name,
              });
            });
          }
        }

        setItems(allItems);

        // Subscribe to all loaded lists
        const socket = getSocket();
        listIdsRef.current.forEach((listId) => {
          console.log('[BoardPage] Subscribing to list on load:', listId);
          socket.emit('subscribe', { listId });
        });
      } catch (err) {
        console.error('Failed to load items:', err);
        setError('Failed to load items from your lists');
      } finally {
        setLoading(false);
      }
    };
    loadItems();
  }, []);

  // Subscribe to real-time updates for all lists
  useEffect(() => {
    const socket = getSocket();

    // Subscribe to all list IDs we have
    listIdsRef.current.forEach((listId) => {
      console.log('[BoardPage] Subscribing to list:', listId);
      socket.emit('subscribe', { listId });
    });

    // Handle real-time item updates
    const handleItemUpdated = (payload: unknown) => {
      const updatedItem = payload as ListItem;
      console.log('[BoardPage] Received item.updated:', updatedItem);
      setItems((prev) =>
        prev.map((item) =>
          (item._id || item.id) === (updatedItem._id || updatedItem.id)
            ? {
                ...item,
                status: (updatedItem.status as KanbanStatus) || 'to_buy',
                name: updatedItem.name,
                quantity: updatedItem.quantity,
                unit: updatedItem.unit,
                notes: updatedItem.notes,
              }
            : item
        )
      );
    };

    socket.on('item.updated', handleItemUpdated);

    return () => {
      // Cleanup subscriptions
      // eslint-disable-next-line react-hooks/exhaustive-deps
      listIdsRef.current.forEach((listId) => {
        console.log('[BoardPage] Unsubscribing from list:', listId);
        try {
          socket.emit('unsubscribe', { listId });
        } catch {
          // ignore
        }
      });
      socket.off('item.updated', handleItemUpdated);
    };
  }, []);

  const handleMoveItem = async (itemId: string, newStatus: KanbanStatus) => {
    // Find the item to get its list ID
    const item = items.find((i) => (i._id || i.id) === itemId);
    if (!item) return;

    try {
      await api.items.update(item.listId, itemId, { status: newStatus });

      setItems((prev) =>
        prev.map((i) => ((i._id || i.id) === itemId ? { ...i, status: newStatus } : i))
      );
    } catch (err) {
      console.error('Failed to update item:', err);
      setError('Failed to update item status');
    }
  };

  const handleDeleteItem = (itemId: string) => {
    const item = items.find((i) => (i._id || i.id) === itemId);
    if (!item) return;

    if (window.confirm(`Are you sure you want to remove "${item.name}" from "${item.listName}"?`)) {
      const deleteItem = async () => {
        try {
          await api.items.delete(item.listId, itemId);
          setItems((prev) => prev.filter((i) => (i._id || i.id) !== itemId));
        } catch (err) {
          console.error('Failed to delete item:', err);
          setError('Failed to delete item');
        }
      };
      deleteItem();
    }
  };

  const columns: {
    id: KanbanStatus;
    title: string;
    color: 'gray' | 'blue' | 'emerald' | 'red' | 'yellow';
  }[] = [
    { id: 'to_buy', title: 'To Buy', color: 'gray' },
    { id: 'in_progress', title: 'In Progress', color: 'blue' },
    { id: 'done', title: 'Done', color: 'emerald' },
    { id: 'unavailable', title: 'Unavailable', color: 'red' },
    { id: 'substituted', title: 'Substituted', color: 'yellow' },
  ];

  return (
    <div className=" bg-gray-50 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl text-center mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Shopping Task Board</h1>
          <p className="text-gray-600">
            Track your shopping progress efficiently with Kanban board
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-full px-4 py-8">
        {error && (
          <div className="max-w-7xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your shopping board...</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No items to track</h3>
            <p className="text-gray-600 mb-6">
              Create a shopping list and add items to see them appear on the board.
            </p>
            <a
              href="/lists"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md hover:shadow-lg"
              aria-label="Create a new shopping list"
            >
              Create a List
            </a>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-6 px-4">
                {columns.map((col) => (
                  <BoardColumn
                    key={col.id}
                    status={col.id}
                    title={col.title}
                    color={col.color}
                    items={items.filter((i) => i.status === col.id)}
                    onMoveItem={handleMoveItem}
                    onDeleteItem={handleDeleteItem}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
