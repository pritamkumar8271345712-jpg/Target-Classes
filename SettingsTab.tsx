import { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Bell, Info, Check, LogOut, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

type Theme = 'light' | 'dark' | 'system';

export default function SettingsTab() {
  const { user, logout, currentSession } = useApp();
  const [theme, setTheme] = useState<Theme>('light');
  const [notifications, setNotifications] = useState(true);

  const themes: { value: Theme; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
      </motion.div>

      <div className="space-y-6">
        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-slate-900">Account</h3>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Email</span>
              <span className="text-sm font-medium text-slate-900">{user?.email || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Current Session</span>
              <span className="text-sm font-medium text-slate-900">{currentSession}</span>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors cursor-pointer mt-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
              <Palette className="w-5 h-5 text-violet-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Appearance</h3>
          </div>
          <div className="p-2">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span className="font-medium text-slate-900">{t.label}</span>
                {theme === t.value && (
                  <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Notifications</h3>
          </div>
          <div className="p-2">
            <button
              onClick={() => setNotifications(!notifications)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <span className="font-medium text-slate-900">Enable Notifications</span>
              <div
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  notifications ? 'bg-slate-900' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </div>
            </button>
          </div>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Info className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-900">About</h3>
          </div>
          <div className="p-2">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="font-medium text-slate-900">Version</span>
              <span className="text-slate-500">1.0.0</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="font-medium text-slate-900">Built with</span>
              <span className="text-slate-500">React + Tailwind + Firebase</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
