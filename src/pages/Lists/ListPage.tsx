import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { CurrentListBuilder } from '../../components/lists/CurrentListBuilder';
import { api } from '../../api/client';
import type { GroceryList, ListItem } from '../../types';

export const ListPage: React.FC = () => {
  const [currentList, setCurrentList] = useState<GroceryList | null>(null);
  const [allLists, setAllLists] = useState<GroceryList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [newListName, setNewListName] = useState('');

  const location = useLocation();

  // Open new-list form when URL contains ?new=1
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('new') === '1') {
      setShowNewListForm(true);
    }
  }, [location.search]);

  const loadListDetails = useCallback(async (listId: string) => {
    try {
      const list = await api.lists.getById(listId);
      const items = await api.items.getAll(listId);
      setCurrentList({ ...list, items });
    } catch (err) {
      console.error('Failed to load list details:', err);
      // Don't show error if it's a 404 (list not found), just clear the current list
      if (axios.isAxiosError(err) && err.response?.status !== 404) {
        setError('Failed to load list details');
      }
    }
  }, []);

  const loadLists = useCallback(async () => {
    try {
      setLoading(true);
      const lists = await api.lists.getAll();
      setAllLists(lists);

      // Load the first draft list or create one
      const draftList = lists.find((l) => l.status === 'draft');
      if (draftList) {
        await loadListDetails(draftList._id || draftList.id || '');
      }
    } catch (err) {
      setError('Failed to load lists');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [loadListDetails]);

  // Load lists on mount
  useEffect(() => {
    loadLists();
  }, [loadLists]);

  const handleCreateNewList = async () => {
    if (!newListName.trim()) return;

    try {
      const newList = await api.lists.create(newListName);
      setCurrentList({ ...newList, items: [] });
      setAllLists([...allLists, newList]);
      setNewListName('');
      setShowNewListForm(false);
    } catch (err) {
      setError('Failed to create list');
      console.error(err);
    }
  };

  const handleUpdateItemStatus = async (
    itemId: string,
    status: 'to_buy' | 'in_progress' | 'done' | 'unavailable' | 'substituted'
  ) => {
    if (!currentList) return;

    try {
      const updatedItem = await api.items.update(currentList._id || currentList.id || '', itemId, {
        status,
      } as Partial<ListItem>);

      const updatedItems =
        currentList.items?.map((item) => ((item._id || item.id) === itemId ? updatedItem : item)) ||
        [];

      setCurrentList({ ...currentList, items: updatedItems });
    } catch (err) {
      setError('Failed to update item');
      console.error(err);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!currentList) return;

    try {
      await api.items.delete(currentList._id || currentList.id || '', itemId);

      const updatedItems = (currentList.items || []).filter(
        (item) => (item._id || item.id) !== itemId
      );
      setCurrentList({ ...currentList, items: updatedItems });
    } catch (err) {
      setError('Failed to remove item');
      console.error(err);
    }
  };

  const handleSaveList = async (name: string) => {
    if (!currentList) return;
    try {
      const updated = await api.lists.update(currentList._id || currentList.id || '', { name });
      setCurrentList({ ...currentList, name: updated.name });
      alert('List saved successfully!');
    } catch (err) {
      setError('Failed to save list');
      console.error(err);
    }
  };

  const handleShareList = async () => {
    if (!currentList) return;
    try {
      const result = await api.share.generateLink(currentList._id || currentList.id || '');
      const shareUrl = `${window.location.origin}/share/${result.shareToken}`;

      // Copy to clipboard
      navigator.clipboard.writeText(shareUrl);

      // Show success message with link
      alert(
        `✅ Share link copied to clipboard!\n\nShare this link with shopkeepers:\n\n${shareUrl}\n\nThey can click the link to view and update the shopping list status.`
      );
    } catch (err) {
      setError('Failed to generate share link');
      console.error(err);
    }
  };

  const handleRefreshList = async () => {
    if (!currentList) return;
    try {
      await loadListDetails(currentList._id || currentList.id || '');
    } catch (err) {
      console.error('Failed to refresh list:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading lists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">My Shopping Lists</h1>
              <p className="text-gray-600">Create and manage your grocery shopping lists</p>
            </div>
            <button
              onClick={() => setShowNewListForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2 shadow-md hover:shadow-lg"
              aria-label="Create a new shopping list"
            >
              <span className="text-xl">+</span>
              Create List
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-6">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <div>
              <h3 className="font-semibold">Error</h3>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Area */}
          <div className="lg:col-span-9">
            {/* Create New List Form */}
            {showNewListForm && (
              <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Shopping List</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="e.g., Weekly Groceries, Party Shopping"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateNewList()}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={handleCreateNewList}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowNewListForm(false);
                      setNewListName('');
                    }}
                    className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Current List */}
            {currentList && (
              <CurrentListBuilder
                list={currentList}
                onUpdateItemStatus={handleUpdateItemStatus}
                onRemoveItem={handleRemoveItem}
                onSaveList={handleSaveList}
                onShareList={handleShareList}
                onItemAdded={() => loadListDetails(currentList._id || currentList.id || '')}
                onRefreshList={handleRefreshList}
              />
            )}

            {/* Empty State */}
            {!currentList && !showNewListForm && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-5xl">📋</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No shopping lists yet</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Create your first shopping list to start managing your groceries efficiently. Add
                  items, track their status, and share with shopkeepers.
                </p>
                <button
                  onClick={() => setShowNewListForm(true)}
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  <span className="text-2xl mr-2">+</span>
                  Create Your First List
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-3">
            {/* Instructions Card */}
            <div className="bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 mb-6 sticky top-4">
              <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                <span>🎯</span> Quick Guide
              </h3>
              <ol className="space-y-4 text-sm text-blue-900">
                <li className="flex gap-3">
                  <span className="font-bold bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs">
                    1
                  </span>
                  <span>Create a new list</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <span>Add items to your list</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs">
                    3
                  </span>
                  <span>
                    Click <strong>Share</strong> button
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs">
                    4
                  </span>
                  <span>Share link with shopkeepers</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs">
                    5
                  </span>
                  <span>They update item status</span>
                </li>
              </ol>
            </div>

            {/* All Lists Card */}
            {allLists.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Your Lists</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {allLists.map((list) => (
                    <button
                      key={list._id || list.id}
                      onClick={() => {
                        loadListDetails(list._id || list.id || '');
                        setShowNewListForm(false);
                      }}
                      className={`w-full p-3 text-left rounded-lg border transition-all ${
                        (currentList?._id || currentList?.id) === (list._id || list.id)
                          ? 'bg-blue-50 border-blue-300 shadow-sm'
                          : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                      }`}
                    >
                      <h4 className="font-semibold text-gray-900 truncate text-sm">{list.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {list.items?.length || 0} items •{' '}
                        <span className="capitalize">{list.status}</span>
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
