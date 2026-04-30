import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft, GraduationCap, IndianRupee, Receipt, Plus, ShoppingBag, Calendar, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import AddExpenseModal from './AddExpenseModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import type { Expense } from '../types';

export default function TeacherExpenses() {
  const {
    viewingTeacherId, setViewingTeacherId,
    teachers, paidEntries, expenses,
    deleteExpense,
  } = useApp();

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  const teacher = teachers.find((t) => t.id === viewingTeacherId);
  if (!teacher) return null;

  const teacherExpenses = expenses.filter((e) => e.teacherId === teacher.id);
  const sortedExpenses = [...teacherExpenses].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const recentExpenses = sortedExpenses.slice(0, 2);
  const olderExpenses = sortedExpenses.slice(2);

  const totalCollected = paidEntries
    .filter((pe) => pe.collectedByTeacherId === teacher.id)
    .reduce((sum, pe) => sum + pe.amount, 0);

  const totalExpenses = teacherExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBalance = totalCollected - totalExpenses;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleDeleteConfirm = () => {
    if (deletingExpense) {
      deleteExpense(deletingExpense.id);
      setDeletingExpense(null);
    }
  };

  return (
    <div className="pb-24">
      {/* Fixed Header */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-sm -mx-4 px-4 py-3 mb-4">
        <button
          onClick={() => setViewingTeacherId(null)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Teachers</span>
        </button>
      </div>

      {/* Teacher Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{teacher.name}</h1>
              <p className="text-sm text-slate-500">{teacher.subject}</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
              <div className="text-xs text-emerald-600 font-medium mb-1">Collected</div>
              <div className="text-lg font-bold text-emerald-700 flex items-center justify-center gap-0.5">
                <IndianRupee className="w-3.5 h-3.5" />
                {totalCollected.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-center">
              <div className="text-xs text-red-600 font-medium mb-1">Expenses</div>
              <div className="text-lg font-bold text-red-700 flex items-center justify-center gap-0.5">
                <IndianRupee className="w-3.5 h-3.5" />
                {totalExpenses.toLocaleString('en-IN')}
              </div>
            </div>
            <div className={`p-3 rounded-xl border text-center ${
              remainingBalance >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-100'
            }`}>
              <div className={`text-xs font-medium mb-1 ${remainingBalance >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>Balance</div>
              <div className={`text-lg font-bold flex items-center justify-center gap-0.5 ${remainingBalance >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>
                <IndianRupee className="w-3.5 h-3.5" />
                {remainingBalance.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-bold text-slate-900">Expenses</h2>
          <span className="ml-auto text-xs text-slate-400">{sortedExpenses.length} entries</span>
        </div>

        {sortedExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <Receipt className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">No Expenses Yet</h3>
            <p className="text-sm text-slate-500 max-w-xs">
              Click the plus button to add your first expense for this teacher.
            </p>
          </div>
        ) : (
          <>
            {/* Recent 2 entries - fixed */}
            <div className="space-y-3">
              {recentExpenses.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 rounded-xl bg-red-50 border border-red-100 relative group">
                  {/* Edit/Delete buttons */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {}}
                      className="w-7 h-7 rounded-lg bg-white/80 hover:bg-white flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                    <button
                      onClick={() => setDeletingExpense(entry)}
                      className="w-7 h-7 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0 pr-16">
                    <div className="font-medium text-slate-900 flex items-center gap-1">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {entry.amount.toLocaleString('en-IN')}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(entry.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <ShoppingBag className="w-3 h-3 text-red-400" />
                      <span className="text-xs text-slate-600">{entry.item}</span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 ml-3">
                    <Receipt className="w-4 h-4 text-red-600" />
                  </div>
                </div>
              ))}
            </div>

            {/* Older entries - scrollable boxed container */}
            {olderExpenses.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wide whitespace-nowrap">
                    Older Entries — Scroll to view
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-3">
                  {olderExpenses.map((entry) => (
                    <div key={entry.id} className="bg-white flex items-center justify-between p-4 rounded-xl border border-red-100 relative group">
                      {/* Edit/Delete buttons */}
                      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {}}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                        <button
                          onClick={() => setDeletingExpense(entry)}
                          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>

                      <div className="flex-1 min-w-0 pr-16">
                        <div className="font-medium text-slate-900 flex items-center gap-1">
                          <IndianRupee className="w-3.5 h-3.5" />
                          {entry.amount.toLocaleString('en-IN')}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(entry.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <ShoppingBag className="w-3 h-3 text-red-400" />
                          <span className="text-xs text-slate-600">{entry.item}</span>
                        </div>
                      </div>
                      <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 ml-3">
                        <Receipt className="w-4 h-4 text-red-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddExpense(true)}
        className="fixed bottom-20 right-6 w-14 h-14 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 hover:scale-105 transition-all flex items-center justify-center cursor-pointer z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modals */}
      <AnimatePresence>
        {showAddExpense && (
          <AddExpenseModal teacherId={teacher.id} onClose={() => setShowAddExpense(false)} />
        )}
        {deletingExpense && (
          <DeleteConfirmModal
            title="Delete Expense?"
            message={`Are you sure you want to delete this expense of ₹${deletingExpense.amount.toLocaleString('en-IN')} for "${deletingExpense.item}"? This action cannot be undone.`}
            onCancel={() => setDeletingExpense(null)}
            onConfirm={handleDeleteConfirm}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
