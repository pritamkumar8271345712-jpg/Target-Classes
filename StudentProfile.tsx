import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Phone, Calendar, Users, IndianRupee, Plus, Receipt, AlertCircle, UserCheck, Landmark, Banknote, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import AddDueModal from './AddDueModal';
import AddPaidModal from './AddPaidModal';
import EditDueModal from './EditDueModal';
import EditPaidModal from './EditPaidModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import type { DueEntry, PaidEntry } from '../types';

export default function StudentProfile() {
  const { viewingStudentId, setViewingStudentId, students, dueEntries, paidEntries, teachers, selectedClass, deleteDueEntry, deletePaidEntry } = useApp();
  const [showAddDue, setShowAddDue] = useState(false);
  const [showAddPaid, setShowAddPaid] = useState(false);
  const [editingDue, setEditingDue] = useState<DueEntry | null>(null);
  const [editingPaid, setEditingPaid] = useState<PaidEntry | null>(null);
  const [deletingDue, setDeletingDue] = useState<DueEntry | null>(null);
  const [deletingPaid, setDeletingPaid] = useState<PaidEntry | null>(null);

  const student = students.find((s) => s.id === viewingStudentId);
  if (!student) return null;

  const siblings = students.filter((s) => student.siblingIds.includes(s.id));
  const allFamilyMembers = [student, ...siblings];

  const familyDueEntries = dueEntries.filter((de) =>
    de.amounts.some((a) => allFamilyMembers.some((fm) => fm.id === a.studentId))
  );

  const sortedDueEntries = [...familyDueEntries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const recentDueEntries = sortedDueEntries.slice(0, 2);
  const olderDueEntries = sortedDueEntries.slice(2);

  const sortedPaidEntries = [...paidEntries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const recentPaidEntries = sortedPaidEntries.slice(0, 2);
  const olderPaidEntries = sortedPaidEntries.slice(2);

  const totalFamilyDue = familyDueEntries.reduce((sum, de) => {
    return sum + de.amounts
      .filter((a) => allFamilyMembers.some((fm) => fm.id === a.studentId))
      .reduce((s, a) => s + a.amount, 0);
  }, 0);

  const totalFamilyPaid = paidEntries.reduce((sum, pe) => sum + pe.amount, 0);
  const totalFamilyBalance = totalFamilyDue - totalFamilyPaid;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const getTeacherName = (teacherId: string | null) => {
    if (!teacherId) return 'Unknown';
    const t = teachers.find((te) => te.id === teacherId);
    return t ? t.name : 'Unknown';
  };

  const handleDeleteDue = () => {
    if (deletingDue) {
      deleteDueEntry(deletingDue.id);
      setDeletingDue(null);
    }
  };

  const handleDeletePaid = () => {
    if (deletingPaid) {
      deletePaidEntry(deletingPaid.id);
      setDeletingPaid(null);
    }
  };

  // Compact Due Entry Card
  const DueEntryCard = ({ entry, isOlder = false }: { entry: DueEntry; isOlder?: boolean }) => {
    const entryTotal = entry.amounts
      .filter((a) => allFamilyMembers.some((fm) => fm.id === a.studentId))
      .reduce((sum, a) => sum + a.amount, 0);

    return (
      <div className={`border rounded-xl p-4 relative group ${isOlder ? 'bg-white border-slate-100' : 'border-slate-100'}`}>
        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setEditingDue(entry)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer" title="Edit">
            <Pencil className="w-3.5 h-3.5 text-slate-600" />
          </button>
          <button onClick={() => setDeletingDue(entry)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer" title="Delete">
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </button>
        </div>

        <div className="flex items-center justify-between mb-3 pr-16">
          <span className="font-semibold text-slate-900">{entry.month} {entry.year}</span>
          <span className="text-sm font-bold text-red-600 flex items-center gap-0.5">
            <IndianRupee className="w-3.5 h-3.5" />
            {entryTotal.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="space-y-1.5">
          {entry.amounts
            .filter((a) => allFamilyMembers.some((fm) => fm.id === a.studentId))
            .map((a) => {
              const s = allFamilyMembers.find((fm) => fm.id === a.studentId);
              return (
                <div key={a.studentId} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{s?.name} <span className="text-slate-400">(Class {s?.classId})</span></span>
                  <span className="font-medium text-slate-900 flex items-center gap-0.5">
                    <IndianRupee className="w-3 h-3" />
                    {a.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              );
            })}
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">Total Family Due</span>
          <span className="text-sm font-bold text-red-600 flex items-center gap-0.5">
            <IndianRupee className="w-3.5 h-3.5" />
            {entryTotal.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    );
  };

  // Compact Paid Entry Card
  const PaidEntryCard = ({ entry, isOlder = false }: { entry: PaidEntry; isOlder?: boolean }) => {
    const collectorName = getTeacherName(entry.collectedByTeacherId);
    const isBank = entry.paymentMethod === 'Bank';

    return (
      <div className={`flex items-center justify-between p-4 rounded-xl border relative group ${isOlder ? 'bg-white border-emerald-100' : 'bg-emerald-50 border-emerald-100'}`}>
        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setEditingPaid(entry)} className="w-7 h-7 rounded-lg bg-white/80 hover:bg-white flex items-center justify-center transition-colors cursor-pointer shadow-sm" title="Edit">
            <Pencil className="w-3.5 h-3.5 text-slate-600" />
          </button>
          <button onClick={() => setDeletingPaid(entry)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer shadow-sm" title="Delete">
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </button>
        </div>

        <div className="flex-1 min-w-0 pr-16">
          <div className="flex items-center gap-2">
            <div className="font-medium text-slate-900 flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5" />
              {entry.amount.toLocaleString('en-IN')}
            </div>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              isBank ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {isBank ? <Landmark className="w-3 h-3" /> : <Banknote className="w-3 h-3" />}
              {entry.paymentMethod}
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {formatDate(entry.date)} · Receipt: {entry.receiptNumber}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <UserCheck className="w-3 h-3 text-emerald-500" />
            <span className="text-xs text-emerald-600 font-medium">{collectorName}</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 ml-3">
          <Receipt className="w-4 h-4 text-emerald-600" />
        </div>
      </div>
    );
  };

  return (
    <div className="pb-24">
      {/* Fixed Header */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-sm -mx-4 px-4 py-3 mb-4">
        <button onClick={() => setViewingStudentId(null)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Class {selectedClass}</span>
        </button>
      </div>

      {/* Compact Fixed Student Details Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="p-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-100">
              {student.photo ? (
                <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-7 h-7 text-slate-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-slate-900 truncate">{student.name}</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  student.gender === 'Male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                }`}>{student.gender}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">Class {student.classId}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-xs text-slate-500">Father: </span>
                <span className="text-xs font-medium text-slate-900 truncate">{student.fatherName}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-xs text-slate-500">Mother: </span>
                <span className="text-xs font-medium text-slate-900 truncate">{student.motherName}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-xs font-medium text-slate-900">{student.mobile}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-xs font-medium text-slate-900">{student.dob ? formatDate(student.dob) : '—'}</span>
            </div>
          </div>
        </div>

        <div className={`px-4 py-3 flex items-center justify-between ${
          totalFamilyBalance > 0 ? 'bg-red-50 border-t border-red-100' : 'bg-emerald-50 border-t border-emerald-100'
        }`}>
          <div className="flex items-center gap-2">
            <AlertCircle className={`w-4 h-4 ${totalFamilyBalance > 0 ? 'text-red-500' : 'text-emerald-500'}`} />
            <span className={`text-sm font-semibold ${totalFamilyBalance > 0 ? 'text-red-700' : 'text-emerald-700'}`}>Total Family Due</span>
          </div>
          <span className={`text-lg font-bold flex items-center gap-0.5 ${totalFamilyBalance > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
            <IndianRupee className="w-4 h-4" />
            {totalFamilyBalance.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="space-y-6">
        {siblings.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-bold text-slate-900">Siblings</h2>
            </div>
            <div className="space-y-3">
              {siblings.map((sibling) => (
                <div key={sibling.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {sibling.photo ? (
                      <img src={sibling.photo} alt={sibling.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-slate-400">{getInitials(sibling.name)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-slate-900">{sibling.name}</div>
                    <div className="text-xs text-slate-500">Class {sibling.classId}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sibling.gender === 'Male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>{sibling.gender}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setShowAddDue(true)}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors cursor-pointer">
            <Plus className="w-4 h-4" />Add Due
          </button>
          <button onClick={() => setShowAddPaid(true)}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors cursor-pointer">
            <Receipt className="w-4 h-4" />Add Paid
          </button>
        </div>

        {/* Due History */}
        {sortedDueEntries.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <IndianRupee className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-slate-900">Due History</h2>
              <span className="ml-auto text-xs text-slate-400">{sortedDueEntries.length} entries</span>
            </div>
            <div className="space-y-3">
              {recentDueEntries.map((entry) => <DueEntryCard key={entry.id} entry={entry} />)}
            </div>
            {olderDueEntries.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wide whitespace-nowrap">Older Entries — Scroll to view</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-3">
                  {olderDueEntries.map((entry) => <DueEntryCard key={entry.id} entry={entry} isOlder />)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Paid History */}
        {sortedPaidEntries.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-bold text-slate-900">Payment History</h2>
              <span className="ml-auto text-xs text-slate-400">{sortedPaidEntries.length} entries</span>
            </div>
            <div className="space-y-3">
              {recentPaidEntries.map((entry) => <PaidEntryCard key={entry.id} entry={entry} />)}
            </div>
            {olderPaidEntries.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wide whitespace-nowrap">Older Entries — Scroll to view</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-3">
                  {olderPaidEntries.map((entry) => <PaidEntryCard key={entry.id} entry={entry} isOlder />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddDue && <AddDueModal studentId={student.id} onClose={() => setShowAddDue(false)} />}
        {showAddPaid && <AddPaidModal studentId={student.id} onClose={() => setShowAddPaid(false)} />}
        {editingDue && <EditDueModal entry={editingDue} onClose={() => setEditingDue(null)} />}
        {editingPaid && <EditPaidModal entry={editingPaid} onClose={() => setEditingPaid(null)} />}
        {deletingDue && (
          <DeleteConfirmModal
            title="Delete Due Entry?"
            message={`Are you sure you want to delete the due entry for ${deletingDue.month} ${deletingDue.year}? This action cannot be undone.`}
            onCancel={() => setDeletingDue(null)}
            onConfirm={handleDeleteDue}
          />
        )}
        {deletingPaid && (
          <DeleteConfirmModal
            title="Delete Payment Entry?"
            message={`Are you sure you want to delete this payment of ₹${deletingPaid.amount.toLocaleString('en-IN')}? This action cannot be undone.`}
            onCancel={() => setDeletingPaid(null)}
            onConfirm={handleDeletePaid}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
