import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Save, Share2, RefreshCw } from 'lucide-react';
import type { GroceryList, ItemStatus, ListItem } from '../../types';
import axios from 'axios';
import { api } from '../../api/client';
import { useListRealtime } from '../../hooks/useListRealtime';

interface CurrentListBuilderProps {
  list: GroceryList | null;
  onUpdateItemStatus: (itemId: string, status: ItemStatus) => void;
  onRemoveItem: (itemId: string) => void;
  onSaveList: (name: string) => void;
  onShareList?: () => void;
  onItemAdded?: () => void;
  onRefreshList?: () => void;
}

export const CurrentListBuilder: React.FC<CurrentListBuilderProps> = ({
  list,
  onUpdateItemStatus,
  onRemoveItem,
  onSaveList,
  onItemAdded,
  onRefreshList,
}) => {
  const [listName, setListName] = useState(list?.name || 'My New List');
  const [isEditingName, setIsEditingName] = useState(false);
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const [items, setItems] = useState<ListItem[]>(list?.items || []);
  const [shopkeeperName, setShopkeeperName] = useState<string | null>(null);
  const listId = list?._id || list?.id || null; // Stable reference for subscription

  useEffect(() => {
    setItems(list?.items || []);
  }, [list]);

  // Subscribe to realtime updates for this list and update local items
  useListRealtime(listId, {
    onItemUpdated: (payload: unknown) => {
      const updatedItem = payload as ListItem;
      console.log('[CurrentListBuilder] Received item.updated:', updatedItem);
      setItems((prev) =>
        prev.map((i) => ((i._id || i.id) === (updatedItem._id || updatedItem.id) ? updatedItem : i))
      );
    },
    onListUpdated: (payload: unknown) => {
      const updatedList = payload as GroceryList;
      // If the list name or status changes, reflect it by updating local items if provided
      if (updatedList.items) setItems(updatedList.items as ListItem[]);
      // If backend provides shopkeeperName (share accepted), capture it
      // If backend provides shopkeeperName (share accepted), capture it
      const listWithShare = updatedList as GroceryList & { share?: { shopkeeperName?: string } };
      if (listWithShare.share?.shopkeeperName) {
        setShopkeeperName(listWithShare.share.shopkeeperName);
      }
    },
  });

  if (!list) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="text-gray-400" size={32} />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No list selected</h3>
        <p className="text-gray-500 mb-6">Create a new list to get started.</p>
      </div>
    );
  }

  if (!list.items || list.items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md border-2 border-blue-100 overflow-hidden">
        {/* List Header */}
        <div className="p-6 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{list.name}</h2>
          <p className="text-sm text-gray-500">
            Status: <span className="capitalize font-medium">{list.status}</span>
          </p>
        </div>

        {/* Empty State */}
        <div className="p-12 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus className="text-blue-400" size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Your list is empty</h3>
          <p className="text-gray-600 mb-8 max-w-sm mx-auto">
            Start by adding items to your shopping list. Click the button below to add your first
            item.
          </p>
          <button
            onClick={() => setShowAddItemForm(true)}
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-linear-to-r from-primary to-primary-dark text-white rounded-lg hover:from-primary-dark hover:to-primary-dark transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus size={24} />
            <span className="text-lg">Add Your First Item</span>
          </button>
        </div>

        {/* Add Item Form */}
        {showAddItemForm && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <AddItemForm
              listId={list._id || list.id || ''}
              onItemAdded={async () => {
                setShowAddItemForm(false);
                onItemAdded?.();
              }}
              onCancel={() => setShowAddItemForm(false)}
            />
          </div>
        )}
      </div>
    );
  }

  const statusColors: Record<ItemStatus, { bg: string; text: string; label: string }> = {
    to_buy: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'To Buy' },
    in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'In Progress' },
    done: { bg: 'bg-green-100', text: 'text-green-700', label: 'Done' },
    unavailable: { bg: 'bg-red-100', text: 'text-red-700', label: 'Unavailable' },
    substituted: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Substituted' },
  };

  const statusCycle: ItemStatus[] = ['to_buy', 'in_progress', 'done', 'unavailable', 'substituted'];

  const getNextStatus = (currentStatus: ItemStatus): ItemStatus => {
    const currentIndex = statusCycle.indexOf(currentStatus);
    return statusCycle[(currentIndex + 1) % statusCycle.length];
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          {isEditingName ? (
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              autoFocus
              className="text-2xl font-bold text-gray-900 dark:text-gray-100 bg-transparent border-b-2 border-primary focus:outline-none"
            />
          ) : (
            <h2
              onClick={() => setIsEditingName(true)}
              className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-700 flex items-center gap-2"
            >
              {listName}
            </h2>
          )}
          <p className="text-sm text-gray-500 mt-1">
            {items.length} items • Status:{' '}
            <span className="capitalize font-medium">{list.status}</span>
          </p>
          {shopkeeperName && (
            <div className="mt-2 text-sm text-emerald-700 bg-emerald-50 inline-flex px-3 py-1 rounded-full items-center gap-2">
              <span className="text-sm">🏪</span>
              <span className="font-medium">Shopkeeper:</span>
              <span className="font-semibold">{shopkeeperName}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          <button
            onClick={async () => {
              setIsGeneratingLink(true);
              try {
                const result = await api.share.generateLink(list._id || list.id || '');
                const url = `${window.location.origin}/share/${result.shareToken}`;
                setShareLink(url);
                setShowShareModal(true);
              } catch (error) {
                alert('Failed to generate share link. Please try again.');
                console.error(error);
              } finally {
                setIsGeneratingLink(false);
              }
            }}
            disabled={isGeneratingLink}
            className="flex-1 sm:flex-none min-w-[160px] flex items-center justify-center gap-2 px-6 py-3 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors font-semibold disabled:opacity-50 shadow-md hover:shadow-lg text-sm md:text-base whitespace-nowrap"
            title="Generate a share link for shopkeepers"
            aria-label="Share List"
          >
            <Share2 size={20} />
            <span>{isGeneratingLink ? 'Generating...' : 'Share List'}</span>
          </button>
          <button
            onClick={() => onSaveList(listName)}
            className="flex-1 sm:flex-none min-w-[120px] flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors font-semibold shadow-sm hover:shadow-md text-sm md:text-base whitespace-nowrap"
            aria-label="Save List"
          >
            <Save size={20} />
            <span>Save</span>
          </button>
          {onRefreshList && (
            <button
              onClick={onRefreshList}
              className="flex-1 sm:flex-none min-w-[120px] flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white hover:bg-primary-dark rounded-lg transition-colors font-semibold shadow-sm hover:shadow-md text-sm md:text-base whitespace-nowrap"
              aria-label="Refresh List"
              title="Refresh to get latest updates"
            >
              <RefreshCw size={20} />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Items List */}
      <div className="divide-y divide-gray-100">
        {items.map((item) => {
          const status = item.status as ItemStatus;
          const colors = statusColors[status];

          return (
            <div
              key={item._id || item.id}
              className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                {item.quantity && item.unit && (
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity} {item.unit}
                  </p>
                )}
                {item.notes && <p className="text-sm text-gray-500 italic">Note: {item.notes}</p>}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    onUpdateItemStatus(item._id || item.id || '', getNextStatus(status))
                  }
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${colors.bg} ${colors.text} hover:opacity-80 hover:shadow-md`}
                  title={`Click to change status from ${colors.label} to ${statusColors[getNextStatus(status)].label}`}
                  aria-label={`Change ${item.name} status from ${colors.label} to ${statusColors[getNextStatus(status)].label}`}
                >
                  {colors.label}
                </button>

                <button
                  onClick={() => onRemoveItem(item._id || item.id || '')}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Delete this item from the list"
                  aria-label={`Delete ${item.name} from list`}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Item Section */}
      <div className="p-6 bg-white border-t-2 border-blue-200">
        {!showAddItemForm ? (
          <button
            onClick={() => setShowAddItemForm(true)}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-linear-to-r from-primary to-primary-dark text-white rounded-lg hover:from-primary-dark hover:to-primary-dark transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 text-lg md:text-xl whitespace-nowrap"
            aria-label="Add Item"
          >
            <Plus size={22} />
            <span className="text-lg">Add Item</span>
          </button>
        ) : (
          <AddItemForm
            listId={list._id || list.id || ''}
            onItemAdded={async () => {
              setShowAddItemForm(false);
              onItemAdded?.();
            }}
            onCancel={() => setShowAddItemForm(false)}
          />
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Share List with Shopkeeper</h2>
            <p className="text-gray-600 mb-6">
              Share this link with shopkeepers so they can view and update item status:
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <p className="text-xs text-gray-500 mb-2">Share Link:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded font-mono text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                    alert('Link copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-900 flex items-start gap-2">
                <span className="shrink-0 text-lg">💡</span>
                <span>
                  <strong>How it works:</strong> Shopkeepers can click items to update their status
                  (To Buy → In Progress → Done → Unavailable → Substituted)
                </span>
              </p>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface AddItemFormProps {
  listId: string;
  onItemAdded: () => Promise<void>;
  onCancel: () => void;
}

const AddItemForm: React.FC<AddItemFormProps> = ({ listId, onItemAdded, onCancel }) => {
  const [itemData, setItemData] = useState({ name: '', quantity: '1', unit: '', notes: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!itemData.name.trim()) {
      setError('Item name is required');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      await api.items.add(listId, {
        name: itemData.name,
        quantity: itemData.quantity ? parseInt(itemData.quantity) : undefined,
        unit: itemData.unit || undefined,
        notes: itemData.notes || undefined,
      });

      await onItemAdded();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to add item');
      } else {
        setError('Failed to add item');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder="Item name (required)"
        value={itemData.name}
        onChange={(e) => setItemData({ ...itemData, name: e.target.value })}
        disabled={isLoading}
        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 dark:disabled:bg-gray-800 dark:bg-gray-800 dark:text-white"
      />

      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          placeholder="Quantity"
          min="1"
          value={itemData.quantity}
          onChange={(e) => setItemData({ ...itemData, quantity: e.target.value })}
          disabled={isLoading}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 dark:disabled:bg-gray-800 dark:bg-gray-800 dark:text-white"
        />
        <input
          type="text"
          placeholder="Unit (kg, L, pcs)"
          value={itemData.unit}
          onChange={(e) => setItemData({ ...itemData, unit: e.target.value })}
          disabled={isLoading}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 dark:disabled:bg-gray-800 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <input
        type="text"
        placeholder="Notes (optional)"
        value={itemData.notes}
        onChange={(e) => setItemData({ ...itemData, notes: e.target.value })}
        disabled={isLoading}
        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 dark:disabled:bg-gray-800 dark:bg-gray-800 dark:text-white"
      />

      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400 font-medium"
        >
          {isLoading ? 'Adding...' : 'Add Item'}
        </button>
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-3 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition-colors disabled:bg-gray-100 font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
