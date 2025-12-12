import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SharedListView } from '../../components/lists/SharedListView';
import { useListRealtime } from '../../hooks/useListRealtime';
import { api } from '../../api/client';
import axios from 'axios';
import type { ShareResponse, ItemStatus, ListItem, GroceryList } from '../../types';
import { useToast } from '../../components/common/ToastProvider';

export const SharedListPage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [data, setData] = useState<ShareResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shopkeeperName, setShopkeeperName] = useState('');
  const [hasAccepted, setHasAccepted] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (shareToken) {
      fetchSharedList();
    }
  }, [shareToken]);

  const fetchSharedList = async () => {
    if (!shareToken) return;
    setLoading(true);
    try {
      const result = await api.share.viewSharedList(shareToken!);
      setData(result);
      setHasAccepted(result.share?.status === 'accepted');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Error occurred');
      } else {
        setError('Error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const listId = data?.list?._id || data?.list?.id || null;
  useListRealtime(
    listId,
    {
      onItemUpdated: (payload: unknown) => {
        const updatedItem = payload as ListItem;
        console.log('[SharedListPage] Received item.updated:', updatedItem);
        setData((prev) => {
          if (!prev) return prev;
          const updatedItems = prev.items.map((i) =>
            (i._id || i.id) === (updatedItem._id || updatedItem.id) ? updatedItem : i
          );
          return { ...prev, items: updatedItems };
        });
      },
      onListUpdated: (payload: unknown) => {
        const updatedList = payload as GroceryList;
        setData((prev) => (prev ? { ...prev, list: updatedList } : prev));
      },
      onListCompleted: (_payload) => {
        void _payload;
        // Refresh UI to reflect completed status
        setData((prev) => (prev ? { ...prev, list: { ...prev.list, status: 'completed' } } : prev));
      },
      onShareRevoked: (_payload) => {
        void _payload;
        // If share revoked, inform the user
        setError('This share link has been revoked');
      },
      onShareAccepted: (payload: unknown) => {
        // payload expected to contain { listId, shopkeeperName }
        try {
          const data = payload as { shopkeeperName?: string };
          setHasAccepted(true);
          setShopkeeperName(data.shopkeeperName || shopkeeperName);
          setData((prev) =>
            prev
              ? {
                ...prev,
                share: { ...prev.share, shopkeeperName: data.shopkeeperName, status: 'accepted' },
              }
              : prev
          );
        } catch {
          // ignore
        }
      },
    },
    { shareToken }
  );

  const handleAcceptShare = async () => {
    if (!shareToken) return;

    try {
      await api.share.acceptShare(shareToken, shopkeeperName || undefined);
      setHasAccepted(true);

      // Refetch list
      const result = await api.share.viewSharedList(shareToken);
      setData(result);
      showToast('success', 'List accepted successfully!');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to accept share');
      } else {
        setError('Failed to accept share');
      }
    }
  };

  const handleUpdateItemStatus = async (itemId: string, status: ItemStatus) => {
    if (!shareToken || !data) return;

    try {
      const updatedItem = await api.share.updateItemStatus(shareToken, itemId, { status });

      const updatedItems = data.items.map((item) =>
        (item._id || item.id) === itemId ? updatedItem : item
      );

      setData({ ...data, items: updatedItems });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to update item');
      } else {
        setError('Failed to update item');
      }
    }
  };

  const handleCompleteList = async () => {
    if (!shareToken) return;

    try {
      const updatedList = await api.share.updateListStatus(shareToken, 'completed');
      if (data) {
        setData({ ...data, list: updatedList });
      }
      showToast('success', 'List marked as completed!');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to complete list');
      } else {
        setError('Failed to complete list');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading list...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-500">{error || 'List not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {!hasAccepted && (
        <div className="max-w-2xl mx-auto mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-bold text-blue-900 mb-4">Accept Shared List</h2>
          <p className="text-blue-700 mb-4">Please provide your store name to accept this list.</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Your store name (optional)"
              value={shopkeeperName}
              onChange={(e) => setShopkeeperName(e.target.value)}
              className="flex-1 px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAcceptShare}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold min-w-[140px]"
              aria-label="Accept Shared List"
            >
              Accept
            </button>
          </div>
        </div>
      )}

      <SharedListView
        list={data.list}
        items={data.items}
        shareData={data.share}
        onUpdateItemStatus={handleUpdateItemStatus}
        onCompleteList={handleCompleteList}
      />
    </div>
  );
};
