import { useEffect, useRef, useState } from "react";
import { api } from "../../api/client";
import { AlignLeft, Plus, ShoppingBag } from "lucide-react";
import Modal from "../common/Modal";
import { useToast } from "../common/ToastProvider";

interface AddItemModalProps {
  listId: string;
  onClose: () => void;
  onItemAdded: () => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ listId, onClose, onItemAdded }) => {
  const [data, setData] = useState({ name: '', quantity: '', unit: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => nameInputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!data.name.trim()) return;

    setLoading(true);
    try {
      await api.items.add(listId, {
        name: data.name,
        quantity: data.quantity ? parseInt(data.quantity) : undefined,
        unit: data.unit || undefined,
        notes: data.notes || undefined,
      });
      showToast('success', `"${data.name}" added to list`);
      onItemAdded();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Add New Item">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Item Name</label>
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent px-3 py-3">
            <ShoppingBag size={20} className="text-gray-400 shrink-0" />
            <input
              ref={nameInputRef}
              type="text"
              placeholder="e.g. Milk"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="flex-1 ml-5 bg-transparent outline-none placeholder-gray-400 text-gray-900 text-lg"
            />
          </div>
        </div>

        {/* Quantity & Unit */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          <div className="col-span-5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Quantity</label>
            <input
              type="number"
              min="1"
              placeholder="1"
              value={data.quantity}
              onChange={(e) => setData({ ...data, quantity: e.target.value })}
              className="w-full px-5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-center placeholder-gray-400 text-lg"
            />
          </div>
          <div className="col-span-7">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Unit</label>
            <div className="relative">
              <input
                type="text"
                placeholder="kg, liters, pcs"
                value={data.unit}
                onChange={(e) => setData({ ...data, unit: e.target.value })}
                className="w-full px-6 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400 text-lg"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Notes (Optional)</label>
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent px-3 py-3">
            <AlignLeft size={20} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Brand, color, preference..."
              value={data.notes}
              onChange={(e) => setData({ ...data, notes: e.target.value })}
              className="flex-1 ml-5 bg-transparent outline-none placeholder-gray-400 text-gray-900 text-lg"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !data.name.trim()}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Plus size={20} strokeWidth={3} /> Add Item
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddItemModal;