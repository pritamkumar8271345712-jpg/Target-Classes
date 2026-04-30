import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, IndianRupee, Receipt, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import DatePicker from './DatePicker';
import type { PaidEntry } from '../types';

interface EditPaidModalProps {
  entry: PaidEntry;
  onClose: () => void;
}

export default function EditPaidModal({ entry, onClose }: EditPaidModalProps) {
  const { teachers, updatePaidEntry } = useApp();

  const [amount, setAmount] = useState(String(entry.amount));
  const [date, setDate] = useState(entry.date);
  const [receiptNumber, setReceiptNumber] = useState(entry.receiptNumber);
  const [collectedByTeacherId, setCollectedByTeacherId] = useState(entry.collectedByTeacherId || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!amount.trim()) newErrors.amount = 'Amount is required';
    else if (parseInt(amount) <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!date) newErrors.date = 'Date is required';
    if (!receiptNumber.trim()) newErrors.receipt = 'Receipt number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    updatePaidEntry(entry.id, {
      amount: parseInt(amount),
      date,
      receiptNumber: receiptNumber.trim(),
      collectedByTeacherId: collectedByTeacherId || null,
    });

    onClose();
  };

  const selectedTeacher = teachers.find((t) => t.id === collectedByTeacherId);

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
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-slate-900">Edit Payment</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Amount Paid <span className="text-red-500">*</span>
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
              label="Payment Date"
              required
              value={date}
              onChange={setDate}
            />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>

          {/* Receipt Number */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Receipt Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Receipt className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
                placeholder="Enter receipt number"
              />
            </div>
            {errors.receipt && <p className="text-red-500 text-xs mt-1">{errors.receipt}</p>}
          </div>

          {/* Collected By Teacher */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Collected By <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <UserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={collectedByTeacherId}
                onChange={(e) => setCollectedByTeacherId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all appearance-none bg-white"
                required
              >
                <option value="">Select teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
                ))}
              </select>
            </div>
            {teachers.length === 0 && (
              <p className="text-amber-600 text-xs mt-1">
                No teachers added yet. Please add teachers first in the Teachers tab.
              </p>
            )}
          </div>

          {/* Selected teacher preview */}
          {selectedTeacher && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="w-10 h-10 rounded-lg bg-white border border-emerald-200 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-emerald-600">
                  {selectedTeacher.name.charAt(0)}
                </span>
              </div>
              <div>
                <div className="text-sm font-medium text-emerald-900">{selectedTeacher.name}</div>
                <div className="text-xs text-emerald-600">{selectedTeacher.subject}</div>
              </div>
            </div>
          )}

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
              disabled={teachers.length === 0}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
