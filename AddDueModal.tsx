import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, IndianRupee } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AddDueModalProps {
  studentId: string;
  onClose: () => void;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function AddDueModal({ studentId, onClose }: AddDueModalProps) {
  const { students, addDueEntry } = useApp();
  const student = students.find((s) => s.id === studentId);
  if (!student) return null;

  const allSiblings = students.filter((s) =>
    s.id === studentId || student.siblingIds.includes(s.id)
  );

  const [month, setMonth] = useState(months[new Date().getMonth()]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [amounts, setAmounts] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    allSiblings.forEach((s) => { init[s.id] = ''; });
    return init;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAmountChange = (id: string, value: string) => {
    const num = value.replace(/\D/g, '');
    setAmounts((prev) => ({ ...prev, [id]: num }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const hasAnyAmount = Object.values(amounts).some((v) => v && parseInt(v) > 0);
    if (!hasAnyAmount) newErrors.amount = 'Enter at least one due amount';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const validAmounts = allSiblings
      .map((s) => ({ studentId: s.id, amount: parseInt(amounts[s.id] || '0') }))
      .filter((a) => a.amount > 0);

    if (validAmounts.length === 0) return;

    addDueEntry({
      month,
      year,
      amounts: validAmounts,
      createdAt: new Date().toISOString(),
    });

    onClose();
  };

  const total = Object.values(amounts).reduce((sum, v) => sum + (parseInt(v) || 0), 0);

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
          <h2 className="text-xl font-bold text-slate-900">Add Due</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Month & Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Month <span className="text-red-500">*</span></label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all appearance-none bg-white"
              >
                {months.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Year <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
                min={2000}
                max={2100}
              />
            </div>
          </div>

          {/* Sibling amounts */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Due Amount per Student
            </label>
            <div className="space-y-3">
              {allSiblings.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {s.photo ? (
                      <img src={s.photo} alt={s.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-xs font-bold text-slate-400">{s.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-slate-900 truncate">{s.name}</div>
                    <div className="text-xs text-slate-500">Class {s.classId}</div>
                  </div>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={amounts[s.id]}
                      onChange={(e) => handleAmountChange(s.id, e.target.value)}
                      className="w-28 pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all text-right text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}
            </div>
            {errors.amount && <p className="text-red-500 text-xs mt-2">{errors.amount}</p>}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 text-white">
            <span className="font-medium">Total Family Due</span>
            <span className="text-xl font-bold flex items-center gap-1">
              <IndianRupee className="w-4 h-4" />
              {total.toLocaleString('en-IN')}
            </span>
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
              className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Save Due
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
