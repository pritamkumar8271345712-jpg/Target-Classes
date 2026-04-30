import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, User, Phone, Users, IndianRupee, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import AddStudentModal from './AddStudentModal';
import EditStudentModal from './EditStudentModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import type { Student } from '../types';

export default function ClassDetail() {
  const { selectedClass, setSelectedClass, students, setViewingStudentId, deleteStudent, dueEntries, paidEntries } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  if (!selectedClass) return null;

  const classStudents = students.filter((s) => s.classId === selectedClass);

  // Calculate TOTAL FAMILY DUE for a student (including all siblings)
  const getFamilyDue = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return 0;

    const familyIds = [studentId, ...student.siblingIds];

    const familyDue = dueEntries.reduce((sum, de) => {
      return sum + de.amounts
        .filter((a) => familyIds.includes(a.studentId))
        .reduce((s, a) => s + a.amount, 0);
    }, 0);

    const familyPaid = paidEntries.reduce((sum, pe) => sum + pe.amount, 0);

    return Math.max(0, familyDue - familyPaid);
  };

  const handleDeleteConfirm = () => {
    if (deletingStudent) {
      deleteStudent(deletingStudent.id);
      setDeletingStudent(null);
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-6"
      >
        <button
          onClick={() => setSelectedClass(null)}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Class {selectedClass}</h2>
          <p className="text-slate-500 text-sm">
            {classStudents.length} student{classStudents.length !== 1 ? 's' : ''} enrolled
          </p>
        </div>
      </motion.div>

      {classStudents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Users className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No Students Yet</h3>
          <p className="text-slate-500 max-w-sm">
            This class doesn't have any students yet. Click the plus button to add your first student.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {classStudents.map((student, index) => {
              const familyDue = getFamilyDue(student.id);
              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all"
                >
                  {/* Action Buttons - Always Visible */}
                  <div className="flex items-center justify-end gap-2 mb-3">
                    <button
                      onClick={() => setEditingStudent(student)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingStudent(student)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>

                  <button
                    onClick={() => setViewingStudentId(student.id)}
                    className="w-full text-left cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {student.photo ? (
                          <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-7 h-7 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">{student.name}</h3>
                        <div className="text-sm text-slate-500 mt-1 space-y-0.5">
                          <p>Father: {student.fatherName}</p>
                          <p>Mother: {student.motherName}</p>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{student.mobile}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              student.gender === 'Male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                            }`}>
                              {student.gender}
                            </span>
                            {student.siblingIds.length > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                {student.siblingIds.length} sibling{student.siblingIds.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Family Due Amount */}
                  <div className={`mt-4 pt-3 border-t flex items-center justify-between ${
                    familyDue > 0 ? 'border-red-100' : 'border-emerald-100'
                  }`}>
                    <span className={`text-xs font-medium ${familyDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {familyDue > 0 ? 'Family Due' : 'No Due'}
                    </span>
                    <span className={`text-lg font-bold flex items-center gap-0.5 ${
                      familyDue > 0 ? 'text-red-600' : 'text-emerald-600'
                    }`}>
                      <IndianRupee className="w-4 h-4" />
                      {familyDue.toLocaleString('en-IN')}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-20 right-6 w-14 h-14 rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-800 hover:scale-105 transition-all flex items-center justify-center cursor-pointer z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {showAddModal && (
          <AddStudentModal classId={selectedClass} onClose={() => setShowAddModal(false)} />
        )}
        {editingStudent && (
          <EditStudentModal student={editingStudent} onClose={() => setEditingStudent(null)} />
        )}
        {deletingStudent && (
          <DeleteConfirmModal
            title="Delete Student?"
            message={`Are you sure you want to delete ${deletingStudent.name}? This action cannot be undone.`}
            onCancel={() => setDeletingStudent(null)}
            onConfirm={handleDeleteConfirm}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
