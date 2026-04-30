import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, IndianRupee, AlertTriangle, BookOpen, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface BulkDueModalProps {
  onClose: () => void;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function BulkDueModal({ onClose }: BulkDueModalProps) {
  const { students, addDueEntry } = useApp();

  const [month, setMonth] = useState(months[new Date().getMonth()]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [classFees, setClassFees] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFeeChange = (classNum: number, value: string) => {
    const num = value.replace(/\D/g, '');
    setClassFees((prev) => ({ ...prev, [classNum]: num }));
  };

  const getClassStudentCount = (classNum: number) => {
    return students.filter((s) => s.classId === classNum).length;
  };

  const getActiveClasses = () => {
    return Array.from({ length: 12 }, (_, i) => i + 1).filter(
      (c) => classFees[c] && parseInt(classFees[c]) > 0 && getClassStudentCount(c) > 0
    );
  };

  const getTotalAmount = () => {
    return getActiveClasses().reduce((sum, c) => {
      return sum + parseInt(classFees[c]) * getClassStudentCount(c);
    }, 0);
  };

  const getTotalStudents = () => {
    return getActiveClasses().reduce((sum, c) => sum + getClassStudentCount(c), 0);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const active = getActiveClasses();
    if (active.length === 0) {
      newErrors.fees = 'Enter fee amount for at least one class with students';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceed = () => {
    if (!validate()) return;
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    const activeClasses = getActiveClasses();

    activeClasses.forEach((classNum) => {
      const classStudents = students.filter((s) => s.classId === classNum);
      const feeAmount = parseInt(classFees[classNum]);

      if (classStudents.length > 0 && feeAmount > 0) {
        addDueEntry({
          month,
          year,
          amounts: classStudents.map((s) => ({
            studentId: s.id,
            amount: feeAmount,
          })),
          createdAt: new Date().toISOString(),
        });
      }
    });

    setShowConfirm(false);
    onClose();
  };

  return (
    <>
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
          className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white rounded-t-2xl border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-slate-900">Bulk Add Due</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Month & Year */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Month <span className="text-red-500">*</span>
                </label>
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
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Year <span className="text-red-500">*</span>
                </label>
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

            {/* Class Fees */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fee per Class
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((classNum) => {
                  const count = getClassStudentCount(classNum);
                  const hasFee = classFees[classNum] && parseInt(classFees[classNum]) > 0;
                  return (
                    <div
                      key={classNum}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                        hasFee
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        hasFee ? 'bg-white/20' : 'bg-slate-100'
                      }`}>
                        <BookOpen className={`w-4 h-4 ${hasFee ? 'text-white' : 'text-slate-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-medium ${hasFee ? 'text-white/70' : 'text-slate-500'}`}>
                          Class {classNum}
                        </div>
                        <div className="relative">
                          <IndianRupee className={`absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 ${
                            hasFee ? 'text-white/60' : 'text-slate-400'
                          }`} />
                          <input
                            type="text"
                            value={classFees[classNum] || ''}
                            onChange={(e) => handleFeeChange(classNum, e.target.value)}
                            className={`w-full pl-4 pr-2 py-0.5 bg-transparent text-sm font-bold outline-none ${
                              hasFee ? 'text-white placeholder-white/40' : 'text-slate-900 placeholder-slate-400'
                            }`}
                            placeholder="0"
                          />
                        </div>
                      </div>
                      {count > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                          hasFee ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {count}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              {errors.fees && <p className="text-red-500 text-xs mt-2">{errors.fees}</p>}
            </div>

            {/* Summary */}
            {getActiveClasses().length > 0 && (
              <div className="p-4 rounded-xl bg-slate-900 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/70">Classes Selected</span>
                  <span className="text-sm font-bold">{getActiveClasses().length}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/70">Total Students</span>
                  <span className="text-sm font-bold">{getTotalStudents()}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/20">
                  <span className="text-sm font-medium">Total Due Amount</span>
                  <span className="text-xl font-bold flex items-center gap-1">
                    <IndianRupee className="w-5 h-5" />
                    {getTotalAmount().toLocaleString('en-IN')}
                  </span>
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
                onClick={handleProceed}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Proceed
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Confirmation */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-amber-600" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Confirm Bulk Due Entry?</h3>
              <p className="text-sm text-slate-500 text-center mb-4">
                This will add due entries for <strong>{getTotalStudents()}</strong> students across{' '}
                <strong>{getActiveClasses().length}</strong> classes for{' '}
                <strong>{month} {year}</strong>.
              </p>

              {/* Breakdown */}
              <div className="bg-slate-50 rounded-xl p-3 mb-6 space-y-1.5 max-h-40 overflow-y-auto">
                {getActiveClasses().map((c) => (
                  <div key={c} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      Class {c} <span className="text-slate-400">({getClassStudentCount(c)} students)</span>
                    </span>
                    <span className="font-medium text-slate-900 flex items-center gap-0.5">
                      <IndianRupee className="w-3 h-3" />
                      {(parseInt(classFees[c]) * getClassStudentCount(c)).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
                <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Grand Total</span>
                  <span className="text-sm font-bold text-slate-900 flex items-center gap-0.5">
                    <IndianRupee className="w-3 h-3" />
                    {getTotalAmount().toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
