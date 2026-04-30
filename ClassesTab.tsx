import { motion } from 'framer-motion';
import { BookOpen, Users, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const classColors = [
  'bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500',
  'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 'bg-blue-500',
  'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500',
];

export default function ClassesTab() {
  const { students, setSelectedClass, setActiveTab } = useApp();

  const getStudentCount = (classId: number) =>
    students.filter((s) => s.classId === classId).length;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold text-slate-900">Classes</h2>
        <p className="text-slate-500 mt-1">Select a class to view and manage students</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((classNum, index) => {
          const count = getStudentCount(classNum);
          return (
            <motion.button
              key={classNum}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => {
                setSelectedClass(classNum);
                setActiveTab('classes');
              }}
              className="group relative bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer text-left"
            >
              <div className={`${classColors[index]} w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="text-lg font-bold text-slate-900">Class {classNum}</div>
              <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                <Users className="w-3.5 h-3.5" />
                <span>{count} student{count !== 1 ? 's' : ''}</span>
              </div>
              <ChevronRight className="absolute top-4 right-4 w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
