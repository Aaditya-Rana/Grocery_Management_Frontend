import React from 'react';
import type {
  GroceryList,
  ListItem,
  ShareData,
  ItemStatus,
  KanbanItem,
  KanbanStatus,
} from '../../types';
import { Check, AlertCircle } from 'lucide-react';
import { BoardColumn } from '../board/BoardColumn';

interface SharedListViewProps {
  list: GroceryList;
  items: ListItem[];
  shareData: ShareData;
  onUpdateItemStatus: (itemId: string, status: ItemStatus) => void;
  onCompleteList: () => void;
}

export const SharedListView: React.FC<SharedListViewProps> = ({
  list,
  items,
  shareData,
  onUpdateItemStatus,
  onCompleteList,
}) => {
  const doneCount = items.filter((item) => item.status === 'done').length;
  const progressPercentage = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;

  // Map ListItem to KanbanItem for Board columns
  const kanbanItems: KanbanItem[] = items.map((item) => ({
    _id: item._id || item.id,
    id: item.id,
    listId: item.listId,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    notes: item.notes,
    status: item.status as KanbanStatus,
    listName: list.name,
  }));

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-w-[77%] mx-auto">
      {/* Header */}
      <div className="bg-linear-to-r from-primary to-primary-dark p-6 text-blue-700">
        <h1 className="text-3xl font-bold mb-2">{list.name}</h1>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            {shareData.shopkeeperName && (
              <p className="text-blue-500 flex items-center gap-2">
                <span className="text-lg">🏪</span>
                Store: <span className="font-semibold">{shareData.shopkeeperName}</span>
              </p>
            )}
            <p className="text-blue-500">
              {doneCount}/{items.length} items done • Status:{' '}
              <span className="font-semibold capitalize">{list.status}</span>
            </p>
          </div>
          <div className="mt-3 md:mt-0">
            <div className="w-48 bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-linear-to-r from-primary to-secondary h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="px-4 py-6">
        {items.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-gray-500">No items in this list yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex items-center gap-6 px-2">
              {(
                [
                  { id: 'to_buy', title: 'To Buy', color: 'gray' },
                  { id: 'in_progress', title: 'In Progress', color: 'blue' },
                  { id: 'done', title: 'Done', color: 'emerald' },
                  { id: 'unavailable', title: 'Unavailable', color: 'red' },
                  { id: 'substituted', title: 'Substituted', color: 'yellow' },
                ] as const
              ).map((col) => (
                <BoardColumn
                  key={col.id}
                  status={col.id as KanbanStatus}
                  title={col.title}
                  color={col.color}
                  items={kanbanItems.filter((i) => i.status === col.id)}
                  onMoveItem={(itemId, newStatus) =>
                    onUpdateItemStatus(itemId, newStatus as ItemStatus)
                  }
                  onDeleteItem={() => {
                    /* shared view should not delete */
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-3 max-w-6xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            <span className="font-semibold">Tip:</span> Click on any item to cycle through its
            status (To Buy → In Progress → Done → Unavailable → Substituted)
          </p>
        </div>

        {list.status !== 'completed' && (
          <button
            onClick={onCompleteList}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <Check size={20} />
            Mark List as Completed
          </button>
        )}

        {list.status === 'completed' && (
          <div className="w-full px-4 py-3 bg-green-100 text-green-700 rounded-lg text-center font-semibold flex items-center justify-center gap-2">
            <Check size={20} />
            This list is completed!
          </div>
        )}
      </div>
    </div>
  );
};
