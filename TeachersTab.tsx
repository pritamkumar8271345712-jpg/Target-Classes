import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IndianRupee, Receipt, Calculator, Pencil, User, Phone, Calendar, Filter, Save, X, Plus, GraduationCap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import EditTeacherModal from './EditTeacherModal';
import AddTeacherModal from './AddTeacherModal';
import DatePicker from './DatePicker';
import type { Teacher } from '../types';

export default function TeachersTab() {
  const { teachers, paidEntries, expenses, setViewingTeacherId } = useApp();
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [showAddTeacher, setShowAddTeacher] = useState(false);

  // Date range filter state
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [savedRanges, setSavedRanges] = useState<{ from: string; to: string; label: string }[]>([]);

  const getTeacherCollected = (teacherId: string, from?: string, to?: string) => {
    return paidEntries
      .filter((pe) => {
        if (pe.collectedByTeacherId !== teacherId) return false;
        if (from && pe.date < from) return false;
        if (to && pe.date > to) return false;
        return true;
      })
      .reduce((sum, pe) => sum + pe.amount, 0);
  };

  const getTeacherExpenses = (teacherId: string, from?: string, to?: string) => {
    return expenses
      .filter((e) => {
        if (e.teacherId !== teacherId) return false;
        if (from && e.date < from) return false;
        if (to && e.date > to) return false;
        return true;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const hasFilter = fromDate || toDate;

  const saveRange = () => {
    if (!fromDate && !toDate) return;
    const label = `${fromDate || 'Start'} to ${toDate || 'End'}`;
    setSavedRanges((prev) => [...prev, { from: fromDate, to: toDate, label }]);
  };

  const applySavedRange = (range: { from: string; to: string }) => {
    setFromDate(range.from);
    setToDate(range.to);
  };

  const clearFilter = () => {
    setFromDate('');
    setToDate('');
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Teachers</h2>
          <p className="text-slate-500 mt-1">Fee collection and expense management</p>
        </div>
        <button
          onClick={() => setShowAddTeacher(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Teacher
        </button>
      </motion.div>

      {/* Date Range Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Date Range Filter</span>
            {hasFilter && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                Active
              </span>
            )}
          </div>
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="text-sm text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            {showDateFilter ? 'Hide' : 'Show'}
          </button>
        </div>

        <AnimatePresence>
          {showDateFilter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-3 mb-3">
                <DatePicker
                  label="From Date"
                  value={fromDate}
                  onChange={setFromDate}
                />
                <DatePicker
                  label="To Date"
                  value={toDate}
                  onChange={setToDate}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={saveRange}
                  disabled={!fromDate && !toDate}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Range
                </button>
                <button
                  onClick={clearFilter}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>

              {savedRanges.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {savedRanges.map((range, i) => (
                    <button
                      key={i}
                      onClick={() => applySavedRange(range)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      <Calendar className="w-3 h-3" />
                      {range.label}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {teachers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <GraduationCap className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No Teachers Yet</h3>
          <p className="text-slate-500 max-w-sm mb-4">
            Add teachers to track their fee collections and expenses.
          </p>
          <button
            onClick={() => setShowAddTeacher(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Teacher
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teachers.map((teacher, index) => {
            const collected = getTeacherCollected(teacher.id, fromDate || undefined, toDate || undefined);
            const teacherExpenses = getTeacherExpenses(teacher.id, fromDate || undefined, toDate || undefined);
            const remaining = collected - teacherExpenses;

            const rangePaidEntries = paidEntries.filter((pe) => {
              if (pe.collectedByTeacherId !== teacher.id) return false;
              if (fromDate && pe.date < fromDate) return false;
              if (toDate && pe.date > toDate) return false;
              return true;
            });

            const rangeExpenses = expenses.filter((e) => {
              if (e.teacherId !== teacher.id) return false;
              if (fromDate && e.date < fromDate) return false;
              if (toDate && e.date > toDate) return false;
              return true;
            });

            return (
              <motion.div
                key={teacher.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Teacher Header */}
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setEditingTeacher(teacher)}
                      className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden hover:ring-2 hover:ring-slate-300 transition-all cursor-pointer"
                    >
                      {teacher.photo ? (
                        <img src={teacher.photo} alt={teacher.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-7 h-7 text-slate-400" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900 truncate">{teacher.name}</h3>
                        <button
                          onClick={() => setEditingTeacher(teacher)}
                          className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                          title="Edit details"
                        >
                          <Pencil className="w-3 h-3 text-slate-500" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-400">{teacher.mobile}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="p-5 space-y-3">
                  {hasFilter && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-700">
                        {fromDate || 'Start'} <span className="text-blue-400">to</span> {toDate || 'End'}
                      </span>
                    </div>
                  )}

                  {/* Total Collected */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <IndianRupee className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">Total Collected</span>
                    </div>
                    <span className="text-lg font-bold text-emerald-700 flex items-center gap-0.5">
                      <IndianRupee className="w-4 h-4" />
                      {collected.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Total Expenses */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                        <Receipt className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">Total Expenses</span>
                    </div>
                    <span className="text-lg font-bold text-red-700 flex items-center gap-0.5">
                      <IndianRupee className="w-4 h-4" />
                      {teacherExpenses.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Remaining Balance */}
                  <div className={`flex items-center justify-between p-3 rounded-xl border ${
                    remaining >= 0 ? 'bg-slate-50 border-slate-200' : 'bg-amber-50 border-amber-100'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        remaining >= 0 ? 'bg-slate-100' : 'bg-amber-100'
                      }`}>
                        <Calculator className={`w-4 h-4 ${remaining >= 0 ? 'text-slate-600' : 'text-amber-600'}`} />
                      </div>
                      <span className="text-sm font-medium text-slate-700">Remaining</span>
                    </div>
                    <span className={`text-lg font-bold flex items-center gap-0.5 ${
                      remaining >= 0 ? 'text-slate-900' : 'text-amber-700'
                    }`}>
                      <IndianRupee className="w-4 h-4" />
                      {remaining.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {hasFilter && (
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                      <div className="px-3 py-2 rounded-lg bg-slate-50">
                        <span className="font-medium">{rangePaidEntries.length}</span> payment entries
                      </div>
                      <div className="px-3 py-2 rounded-lg bg-slate-50">
                        <span className="font-medium">{rangeExpenses.length}</span> expense entries
                      </div>
                    </div>
                  )}

                  {/* View Expenses Tag Link */}
                  <button
                    onClick={() => setViewingTeacherId(teacher.id)}
                    className="w-full text-center py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
                      View Details & Expenses →
                    </span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {editingTeacher && (
          <EditTeacherModal teacher={editingTeacher} onClose={() => setEditingTeacher(null)} />
        )}
        {showAddTeacher && (
          <AddTeacherModal onClose={() => setShowAddTeacher(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
