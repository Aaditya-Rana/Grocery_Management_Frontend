import React from 'react';
import { ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import type { KanbanItem } from '../../types';

interface BoardCardProps {
  item: KanbanItem;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onDelete: () => void;
}

export const BoardCard: React.FC<BoardCardProps> = ({
  item,
  onMoveLeft,
  onMoveRight,
  onDelete,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
      <div className="flex gap-3 mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 leading-tight">{item.name}</h4>
          {item.listName && <p className="text-xs text-gray-400 mt-1">📋 {item.listName}</p>}
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-3">
        {item.quantity && item.unit && (
          <span>
            📦 {item.quantity} {item.unit}
          </span>
        )}
        {item.notes && <p className="text-xs text-gray-400 italic mt-1">{item.notes}</p>}
      </div>

      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
        <span className="text-xs font-semibold text-gray-400 capitalize">{item.status}</span>

        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          {onMoveLeft && (
            <button
              onClick={onMoveLeft}
              className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-900 transition-colors"
              title="Move item to previous status"
              aria-label={`Move ${item.name} to previous status`}
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-600 transition-colors"
            title="Delete this item"
            aria-label={`Delete ${item.name}`}
          >
            <Trash2 size={16} />
          </button>
          {onMoveRight && (
            <button
              onClick={onMoveRight}
              className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-900 transition-colors"
              title="Move item to next status"
              aria-label={`Move ${item.name} to next status`}
            >
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
