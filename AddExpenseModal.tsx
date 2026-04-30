import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, IndianRupee, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import DatePicker from './DatePicker';

interface AddExpenseModalProps {
  teacherId: string;
  onClose: () => void;
}

export default function AddExpenseModal({ teacherId, onClose }: AddExpenseModalProps) {
  const { teachers, addExpense } = useApp();
  const teacher = teachers.find((t) => t.id === teacherId);
  if (!teacher) return null;

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [item, setItem] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!amount.trim()) newErrors.amount = 'Amount is required';
    else if (parseInt(amount) <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!date) newErrors.date = 'Date is required';
    if (!item.trim()) newErrors.item = 'Item description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    addExpense({
      teacherId,
      amount: parseInt(amount),
      date,
      item: item.trim(),
      createdAt: new Date().toISOString(),
    });

    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Add Expense</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Teacher info */}
          <div className="p-3 rounded-xl bg-slate-50">
            <div className="text-sm font-medium text-slate-700">{teacher.name}</div>
            <div className="text-xs text-slate-500">{teacher.subject}</div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
                placeholder="Enter amount"
              />
            </div>
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>

          {/* Date */}
          <div>
            <DatePicker
              label="Expense Date"
              required
              value={date}
              onChange={setDate}
            />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>

          {/* Item */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Item / Description <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <ShoppingBag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
                placeholder="What was the expense for?"
              />
            </div>
            {errors.item && <p className="text-red-500 text-xs mt-1">{errors.item}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors cursor-pointer"
            >
              Save Expense
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
