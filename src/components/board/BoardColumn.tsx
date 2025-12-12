import React from 'react';
import type { KanbanItem, KanbanStatus } from '../../types';
import { BoardCard } from './BoardCard';

interface BoardColumnProps {
  status: KanbanStatus;
  title: string;
  items: KanbanItem[];
  color: 'gray' | 'blue' | 'emerald' | 'red' | 'yellow';
  onMoveItem: (itemId: string, newStatus: KanbanStatus) => void;
  onDeleteItem: (itemId: string) => void;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({
  status,
  title,
  items,
  color,
  onMoveItem,
  onDeleteItem,
}) => {
  const getPrevStatus = (current: KanbanStatus): KanbanStatus | null => {
    if (current === 'in_progress') return 'to_buy';
    if (current === 'done') return 'in_progress';
    if (current === 'unavailable') return 'to_buy';
    if (current === 'substituted') return 'done';
    return null;
  };

  const getNextStatus = (current: KanbanStatus): KanbanStatus | null => {
    if (current === 'to_buy') return 'in_progress';
    if (current === 'in_progress') return 'done';
    if (current === 'done') return 'unavailable';
    if (current === 'unavailable') return 'substituted';
    return null;
  };

  const colorStyles = {
    gray: 'bg-gray-100 border-gray-200 text-gray-700',
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    red: 'bg-red-50 border-red-100 text-red-700',
    yellow: 'bg-yellow-50 border-yellow-100 text-yellow-700',
  };

  const badgeStyles = {
    gray: 'bg-gray-200 text-gray-700',
    blue: 'bg-blue-100 text-blue-800',
    emerald: 'bg-emerald-100 text-emerald-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div
      className={`flex min-w-60 flex-col h-full min-h-[500px] rounded-xl ${colorStyles[color]} border p-4`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">{title}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${badgeStyles[color]}`}>
          {items.length}
        </span>
      </div>

      <div className="flex-1 space-y-3">
        {items.map((item) => {
          const prev = getPrevStatus(status);
          const next = getNextStatus(status);
          const itemId = item._id || item.id || '';

          return (
            <BoardCard
              key={itemId}
              item={item}
              onMoveLeft={prev ? () => onMoveItem(itemId, prev) : undefined}
              onMoveRight={next ? () => onMoveItem(itemId, next) : undefined}
              onDelete={() => onDeleteItem(itemId)}
            />
          );
        })}
        {items.length === 0 && (
          <div className="flex h-32 items-center justify-center border-2 border-dashed border-gray-300/50 rounded-lg">
            <p className="text-gray-400 text-sm font-medium">Empty</p>
          </div>
        )}
      </div>
    </div>
  );
};
