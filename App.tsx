import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  BookOpen,
  GraduationCap,
  Settings,
  LogOut,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import LoginScreen from './components/LoginScreen';
import HomeTab from './components/HomeTab';
import ClassesTab from './components/ClassesTab';
import ClassDetail from './components/ClassDetail';
import StudentProfile from './components/StudentProfile';
import TeachersTab from './components/TeachersTab';
import TeacherExpenses from './components/TeacherExpenses';
import SettingsTab from './components/SettingsTab';
import type { Tab } from './types';

const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'classes', label: 'Classes', icon: BookOpen },
  { id: 'teachers', label: 'Teachers', icon: GraduationCap },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function AppContent() {
  const {
    user,
    authLoading,
    logout,
    activeTab, setActiveTab,
    selectedClass, setSelectedClass,
    viewingStudentId, setViewingStudentId,
    viewingTeacherId, setViewingTeacherId,
    dataLoading,
    syncStatus,
    firestoreError,
  } = useApp();

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab !== 'classes') {
      setSelectedClass(null);
      setViewingStudentId(null);
    }
    if (tab !== 'teachers') {
      setViewingTeacherId(null);
    }
  };

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const backdrops = document.querySelectorAll('[class*="backdrop-blur-sm"][class*="bg-black/50"]');
      if (backdrops.length > 0) {
        e.preventDefault();
        (backdrops[backdrops.length - 1] as HTMLElement).click();
        return;
      }
      if (viewingStudentId) { e.preventDefault(); setViewingStudentId(null); return; }
      if (selectedClass) { e.preventDefault(); setSelectedClass(null); return; }
      if (viewingTeacherId) { e.preventDefault(); setViewingTeacherId(null); return; }
      if (activeTab !== 'home') { e.preventDefault(); setActiveTab('home'); return; }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab, selectedClass, viewingStudentId, viewingTeacherId, setActiveTab, setSelectedClass, setViewingStudentId, setViewingTeacherId]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-900 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">Target Classes</h1>
              <p className="text-[10px] text-slate-500">A Way To Success</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {firestoreError && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-600 text-xs max-w-[200px] truncate" title={firestoreError}>
                <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{firestoreError}</span>
              </div>
            )}
            {dataLoading && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
            {!dataLoading && syncStatus === 'synced' && (
              <span className="text-xs text-emerald-600 font-medium hidden sm:inline">Synced</span>
            )}
            <button
              onClick={logout}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Firestore Error Banner */}
      {firestoreError && (
        <div className="bg-red-50 border-b border-red-100 px-4 py-2">
          <div className="max-w-5xl mx-auto flex items-center gap-2 text-red-700 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">Firestore Error:</span>
            <span>{firestoreError}</span>
            <span className="text-red-500 text-xs ml-2">(Check browser console for details)</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + (selectedClass ? `-class-${selectedClass}` : '') + (viewingStudentId ? `-student-${viewingStudentId}` : '') + (viewingTeacherId ? `-teacher-${viewingTeacherId}` : '')}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'home' && <HomeTab />}
            {activeTab === 'classes' && !selectedClass && <ClassesTab />}
            {activeTab === 'classes' && selectedClass && !viewingStudentId && <ClassDetail />}
            {activeTab === 'classes' && selectedClass && viewingStudentId && <StudentProfile />}
            {activeTab === 'teachers' && !viewingTeacherId && <TeachersTab />}
            {activeTab === 'teachers' && viewingTeacherId && <TeacherExpenses />}
            {activeTab === 'settings' && <SettingsTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-slate-200 sticky bottom-0 z-30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-around">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative flex flex-col items-center gap-1 py-3 px-4 transition-colors cursor-pointer ${
                    isActive ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-slate-900 rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
