import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { CurrentListBuilder } from '../../components/lists/CurrentListBuilder';
import { api } from '../../api/client';
import type { GroceryList, ListItem } from '../../types';
import Modal from '../../components/common/Modal';
import { useToast } from '../../components/common/ToastProvider';

// --- Icons (Inline SVGs for no-dependency usage) ---
const Icons = {
  Plus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Refresh: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  Share: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>,
  Info: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  List: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  X: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
};

// --- Quick Guide Component ---
const QuickGuide = () => (
  <div className="bg-linear-to from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 shadow-sm">
    <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
      <span className="text-xl">🎯</span> Quick Guide
    </h3>
    <ol className="flex flex-col gap-4 text-sm text-blue-800">
      <li className="flex gap-3 items-start">
        <span className="font-bold bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs shadow-sm">1</span>
        <span>Create a new list for your shopping trip.</span>
      </li>
      <li className="flex gap-3 items-start">
        <span className="font-bold bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs shadow-sm">2</span>
        <span>Add items (e.g., "Milk", "Bread") to your list.</span>
      </li>
      <li className="flex gap-3 items-start">
        <span className="font-bold bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs shadow-sm">3</span>
        <span>Click the <strong>Share</strong> button at the top.</span>
      </li>
      <li className="flex gap-3 items-start">
        <span className="font-bold bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs shadow-sm">4</span>
        <span>Send the link to shopkeepers or family.</span>
      </li>
      <li className="flex gap-3 items-start">
        <span className="font-bold bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs shadow-sm">5</span>
        <span>They update statuses live as they shop!</span>
      </li>
    </ol>
  </div>
);

export const ListPage: React.FC = () => {
  const [currentList, setCurrentList] = useState<GroceryList | null>(null);
  const [allLists, setAllLists] = useState<GroceryList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showMobileGuide, setShowMobileGuide] = useState(false);
  const { showToast } = useToast();

  const location = useLocation();

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to load list details:', err);
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

      if (!currentList && lists.length > 0) {
        const draftList = lists.find((l) => l.status === 'draft') || lists[0];
        if (draftList) {
          await loadListDetails(draftList._id || draftList.id || '');
        }
      }
    } catch (err) {
      setError('Failed to load lists');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [loadListDetails, currentList]);

  useEffect(() => {
    loadLists();
  }, []);

  const handleCreateNewList = async () => {
    if (!newListName.trim()) return;

    try {
      const newList = await api.lists.create(newListName);
      setCurrentList({ ...newList, items: [] });
      setAllLists([newList, ...allLists]);
      setNewListName('');
      setShowNewListForm(false);
      showToast('success', `List "${newListName}" created successfully!`);
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
      showToast('success', 'Item removed from list');
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
      setAllLists(allLists.map(l => (l._id || l.id) === (currentList._id || currentList.id) ? { ...l, name: updated.name } : l));
      showToast('success', 'List name saved');
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
      navigator.clipboard.writeText(shareUrl);
      showToast('success', `Link copied! Share this: ${shareUrl}`);
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

  if (loading && !currentList) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading your lists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 pb-20 overflow-scroll h-full relative">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Shopping Lists</h1>
              <p className="text-sm text-gray-500">Manage and share your grocery needs</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNewListForm(true)}
                className="flex-1 sm:flex-none justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors font-semibold flex items-center gap-2 shadow-sm text-sm"
              >
                <Icons.Plus />
                <span>New List</span>
              </button>

              <button
                onClick={() => loadLists()}
                className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition shadow-sm"
                title="Refresh all lists"
              >
                <Icons.Refresh />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-6">
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 flex items-center gap-3 shadow-sm">
            <span className="text-xl">⚠️</span>
            <span className="font-medium">{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-sm opacity-70 hover:opacity-100">Dismiss</button>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN: Main List Area */}
          <div className="lg:col-span-8 space-y-6 h-[700px] overflow-auto">

            {/* Active List Builder */}
            {currentList ? (
              <div className="animate-fade-in">
                <CurrentListBuilder
                  list={currentList}
                  onUpdateItemStatus={handleUpdateItemStatus}
                  onRemoveItem={handleRemoveItem}
                  onSaveList={handleSaveList}
                  onShareList={handleShareList}
                  onItemAdded={() => loadListDetails(currentList._id || currentList.id || '')}
                  onRefreshList={handleRefreshList}
                />
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icons.List />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No lists selected</h3>
                <p className="text-gray-500 mb-6">Select a list from the sidebar or create a new one.</p>
                <button
                  onClick={() => setShowNewListForm(true)}
                  className="inline-flex items-center px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-md"
                >
                  Create New List
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sidebar (Lists & Guide) */}
          <aside className="lg:col-span-4 space-y-6 h-[700px] overflow-auto">

            {/* Desktop: Quick Guide */}
            <div className="my-4">
              <button
                onClick={() => setShowMobileGuide(!showMobileGuide)}
                className="w-full flex items-center justify-between p-4 bg-white border border-blue-100 rounded-xl shadow-sm text-blue-800 font-medium"
              >
                <span className="flex items-center gap-2"><Icons.Info /> How to use this app</span>
                <span className={`transform transition-transform ${showMobileGuide ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {showMobileGuide && (
                <div className="mt-3">
                  <QuickGuide />
                </div>
              )}
            </div>

            {/* List Switcher */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  Your Lists
                </h3>
                <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-1 rounded-full">{allLists.length}</span>
              </div>

              <div className="max-h-[500px] overflow-y-auto flex flex-col gap-3 p-4 space-y-1">
                {allLists.length === 0 ? (
                  <p className="p-4 text-center text-sm text-gray-500">No lists found.</p>
                ) : (
                  allLists.map((l) => (
                    <button
                      key={l._id || l.id}
                      onClick={() => {
                        loadListDetails(l._id || l.id || '');
                      }}
                      className={`w-full  p-3 text-left rounded-lg transition-all border ${(currentList?._id || currentList?.id) === (l._id || l.id)
                        ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-sm ring-1 ring-blue-200'
                        : 'bg-transparent border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold truncate pr-2">{l.name}</span>
                        {l.status === 'draft' && <span className="text-[10px] uppercase tracking-wider font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Draft</span>}
                      </div>
                      <div className="flex items-center justify-between mt-1 text-xs opacity-70">
                        <span>{l.items?.length || 0} items</span>
                        <span>{new Date(l.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* --- MODAL: Create New List --- */}
      <Modal
        isOpen={showNewListForm}
        onClose={() => {
          setShowNewListForm(false);
          setNewListName('');
        }}
        title="Create New List"
        maxWidth="md"
      >
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">List Name</label>
            <input
              type="text"
              placeholder="e.g., Weekend BBQ, Monthly Ration"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateNewList()}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              autoFocus
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleCreateNewList}
              disabled={!newListName.trim()}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md transition-colors"
            >
              Create List
            </button>
            <button
              onClick={() => {
                setShowNewListForm(false);
                setNewListName('');
              }}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};