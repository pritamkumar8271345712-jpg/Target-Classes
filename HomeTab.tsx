import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Users, BookOpen, IndianRupee, Settings, PlusCircle, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getAcademicSessions, getCurrentAcademicSession } from '../types';
import BulkDueModal from './BulkDueModal';

export default function HomeTab() {
  const {
    students, teachers, dueEntries, paidEntries,
    currentSession, setCurrentSession,
    setActiveTab,
  } = useApp();

  const [showBulkDue, setShowBulkDue] = useState(false);
  const [showSessionDropdown, setShowSessionDropdown] = useState(false);

  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalClasses = 12;

  const totalDueAmount = dueEntries.reduce((sum, de) => {
    return sum + de.amounts.reduce((s, a) => s + a.amount, 0);
  }, 0);
  const totalPaidAmount = paidEntries.reduce((sum, pe) => sum + pe.amount, 0);
  const totalDue = Math.max(0, totalDueAmount - totalPaidAmount);

  const sessions = getAcademicSessions();
  const isCurrentSession = currentSession === getCurrentAcademicSession();

  const stats = [
    {
      label: 'Total Students',
      value: totalStudents,
      icon: Users,
      color: 'bg-blue-500',
      onClick: () => setActiveTab('classes'),
    },
    {
      label: 'Total Teachers',
      value: totalTeachers,
      icon: GraduationCap,
      color: 'bg-emerald-500',
      onClick: () => setActiveTab('teachers'),
    },
    {
      label: 'Total Classes',
      value: totalClasses,
      icon: BookOpen,
      color: 'bg-violet-500',
      onClick: () => setActiveTab('classes'),
    },
    {
      label: 'Total Due',
      value: `₹${totalDue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'bg-red-500',
      onClick: () => setActiveTab('classes'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Academic Session Selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-slate-500 mb-0.5">Academic Session</div>
            <button
              onClick={() => setShowSessionDropdown(!showSessionDropdown)}
              className="flex items-center gap-2 text-lg font-bold text-slate-900 cursor-pointer"
            >
              {currentSession}
              {!isCurrentSession && (
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  Archived
                </span>
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showSessionDropdown && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-slate-100 max-h-48 overflow-y-auto space-y-1">
                {sessions.map((session) => {
                  const isActive = session === currentSession;
                  const isCurrent = session === getCurrentAcademicSession();
                  return (
                    <button
                      key={session}
                      onClick={() => {
                        setCurrentSession(session);
                        setShowSessionDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-colors cursor-pointer text-left ${
                        isActive
                          ? 'bg-slate-900 text-white'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="font-medium">{session}</span>
                      {isCurrent && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          Current
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.button
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={stat.onClick}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 text-left hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className={`${stat.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
          </motion.button>
        ))}
      </div>

      {/* Bulk Add Due Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={() => setShowBulkDue(true)}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors cursor-pointer shadow-sm"
        >
          <PlusCircle className="w-5 h-5" />
          Bulk Add Due Fees
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
      >
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setActiveTab('classes')}
            className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-slate-900">View Classes</div>
              <div className="text-sm text-slate-500">Browse all classes</div>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('teachers')}
            className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="font-medium text-slate-900">Manage Teachers</div>
              <div className="text-sm text-slate-500">View expenses & collections</div>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
              <Settings className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <div className="font-medium text-slate-900">Settings</div>
              <div className="text-sm text-slate-500">App preferences</div>
            </div>
          </button>
        </div>
      </motion.div>

      {/* Bulk Due Modal */}
      <AnimatePresence>
        {showBulkDue && <BulkDueModal onClose={() => setShowBulkDue(false)} />}
      </AnimatePresence>
    </div>
  );
}
