import React, { useState, useEffect } from 'react';
import {
  Trash2, Plus, Share2, RefreshCw,
  ShoppingBag, AlignLeft, Check, Scale, Type
} from 'lucide-react';
import type { GroceryList, ItemStatus, ListItem } from '../../types';
import { api } from '../../api/client';
import { useListRealtime } from '../../hooks/useListRealtime';
import AddItemModal from './AddItemModal';
import Modal from '../common/Modal';
import { useToast } from '../common/ToastProvider';

interface CurrentListBuilderProps {
  list: GroceryList | null;
  onUpdateItemStatus: (itemId: string, status: ItemStatus) => void;
  onRemoveItem: (itemId: string) => void;
  onSaveList: (name: string) => void;
  onShareList?: () => void;
  onItemAdded?: () => void;
  onRefreshList?: () => void;
}

// Helper for status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case 'to_buy': return 'border-gray-300 bg-white text-transparent';
    case 'in_progress': return 'border-blue-500 bg-blue-50 text-blue-500';
    case 'done': return 'border-green-500 bg-green-500 text-white';
    case 'unavailable': return 'border-red-300 bg-red-50 text-red-300';
    case 'substituted': return 'border-yellow-400 bg-yellow-50 text-yellow-600';
    default: return 'border-gray-300 bg-white';
  }
};

export const CurrentListBuilder: React.FC<CurrentListBuilderProps> = ({
  list,
  onUpdateItemStatus,
  onRemoveItem,
  onSaveList,
  onItemAdded,
  onRefreshList,
}) => {
  const [listName, setListName] = useState(list?.name || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [items, setItems] = useState<ListItem[]>(list?.items || []);
  const [shopkeeperName, setShopkeeperName] = useState<string | null>(null);
  const { showToast } = useToast();

  const listId = list?._id || list?.id || null;

  useEffect(() => {
    setItems(list?.items || []);
    setListName(list?.name || 'My List');
  }, [list]);

  // Realtime logic
  useListRealtime(listId, {
    onItemUpdated: (payload: unknown) => {
      const updatedItem = payload as ListItem;
      setItems((prev) => prev.map((i) => ((i._id || i.id) === (updatedItem._id || updatedItem.id) ? updatedItem : i)));
    },
    onListUpdated: (payload: unknown) => {
      const updatedList = payload as GroceryList;
      if (updatedList.items) setItems(updatedList.items as ListItem[]);
      const listWithShare = updatedList as GroceryList & { share?: { shopkeeperName?: string } };
      if (listWithShare.share?.shopkeeperName) setShopkeeperName(listWithShare.share.shopkeeperName);
    },
  });

  if (!list) return null;

  const statusCycle: ItemStatus[] = ['to_buy', 'in_progress', 'done', 'unavailable', 'substituted'];
  const getNextStatus = (currentStatus: ItemStatus) => {
    const idx = statusCycle.indexOf(currentStatus);
    return statusCycle[(idx + 1) % statusCycle.length];
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 relative min-h-[600px] flex flex-col overflow-hidden">

      {/* --- App Header --- */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-100 p-4 sticky top-0 z-20 transition-all">
        <div className="flex flex-col gap-4">

          {/* Top Row: Name & Status */}
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0 pr-4">
              {isEditingName ? (
                <input
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  onBlur={() => { setIsEditingName(false); onSaveList(listName); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { setIsEditingName(false); onSaveList(listName); } }}
                  autoFocus
                  className="w-full text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-600 focus:outline-none px-0 py-1"
                />
              ) : (
                <div
                  onClick={() => setIsEditingName(true)}
                  className="group cursor-pointer"
                >
                  <h2 className="text-2xl font-bold text-gray-900 truncate flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                    {listName}
                    <span className="opacity-0 group-hover:opacity-100 text-gray-400 text-sm"><Type size={16} /></span>
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-gray-100 text-gray-600">
                      {list.status}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{items.length} items</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  try {
                    const res = await api.share.generateLink(list._id || list.id || '');
                    setShareLink(`${window.location.origin}/share/${res.shareToken}`);
                    setShowShareModal(true);
                  } catch {
                    showToast('error', 'Error generating link');
                  }
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                title="Share"
              >
                <Share2 size={20} />
              </button>
              {onRefreshList && (
                <button
                  onClick={onRefreshList}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <RefreshCw size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Shopkeeper Status Toast */}
          {shopkeeperName && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2 flex items-center gap-2 text-sm text-emerald-800 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold">{shopkeeperName}</span> is viewing this list
            </div>
          )}
        </div>
      </div>

      {/* --- Items List --- */}
      <div className="flex-1 overflow-y-auto pb-32 bg-gray-50/50">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center px-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-blue-500 animate-bounce-slow">
              <ShoppingBag size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Your list is empty</h3>
            <p className="text-gray-500 mb-8 max-w-xs">Tap the + button below to add your groceries.</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {items.map((item) => {
              const status = item.status as ItemStatus;
              const isDone = status === 'done';

              return (
                <div
                  key={item._id || item.id}
                  className={`relative group bg - white rounded - 2xl p - 4 shadow - sm border transition - all duration - 200 ${isDone ? 'border-gray-100 bg-gray-50' : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                    } `}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox / Status Toggle */}
                    <button
                      onClick={() => onUpdateItemStatus(item._id || item.id || '', getNextStatus(status))}
                      className={`shrink - 0 w - 8 h - 8 rounded - full border - 2 flex items - center justify - center transition - all duration - 300 mt - 0.5 ${getStatusColor(status)} `}
                    >
                      {isDone && <Check size={16} strokeWidth={3} />}
                      {status === 'in_progress' && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`text - lg font - semibold leading - tight transition - all ${isDone ? 'text-gray-400 line-through decoration-2' : 'text-gray-800'} `}>
                        {item.name}
                      </h3>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {(item.quantity || item.unit) && (
                          <span className={`inline - flex items - center gap - 1 text - xs font - medium px - 2 py - 1 rounded - md ${isDone ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-700'} `}>
                            <Scale size={12} />
                            {item.quantity} {item.unit}
                          </span>
                        )}
                        {item.notes && (
                          <span className={`inline - flex items - center gap - 1 text - xs font - medium px - 2 py - 1 rounded - md ${isDone ? 'bg-gray-100 text-gray-400' : 'bg-amber-50 text-amber-700'} `}>
                            <AlignLeft size={12} />
                            {item.notes}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete Action */}
                    <button
                      onClick={() => onRemoveItem(item._id || item.id || '')}
                      className="text-gray-300 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- Floating Action Button (Sticky) --- */}
      <div className="absolute bottom-6 left-0 right-0 px-6 flex justify-center z-30 pointer-events-none">
        <button
          onClick={() => setShowAddItemModal(true)}
          className="pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 rounded-full px-6 py-4 flex items-center gap-3 font-bold text-lg transform transition-transform active:scale-95"
        >
          <Plus size={24} />
          <span>Add Item</span>
        </button>
      </div>

      {/* --- MODALS --- */}
      {showAddItemModal && (
        <AddItemModal
          listId={listId || ''}
          onClose={() => setShowAddItemModal(false)}
          onItemAdded={() => { setShowAddItemModal(false); onItemAdded?.(); }}
        />
      )}

      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share with Shopkeeper"
        maxWidth="sm"
      >
        <div className="bg-blue-50 p-4 rounded-2xl mb-6">
          <p className="text-sm text-blue-900 leading-relaxed">
            Send this link to your shopkeeper. They can check off items as they find them!
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-xl mb-6 border border-gray-200">
          <input type="text" readOnly value={shareLink} className="bg-transparent flex-1 text-sm px-2 outline-none text-gray-600 truncate" />
          <button onClick={() => { navigator.clipboard.writeText(shareLink); showToast('success', 'Link copied to clipboard!'); }} className="bg-white shadow-sm border border-gray-200 px-4 py-2 rounded-lg text-sm font-bold text-blue-600 hover:bg-gray-50">
            Copy
          </button>
        </div>
      </Modal>
    </div>
  );
};




