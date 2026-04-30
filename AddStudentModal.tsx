import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Link2, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import DatePicker from './DatePicker';
import SiblingSelectorModal from './SiblingSelectorModal';

interface AddStudentModalProps {
  classId: number;
  onClose: () => void;
}

export default function AddStudentModal({ classId, onClose }: AddStudentModalProps) {
  const { addStudent, students } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    fatherName: '',
    motherName: '',
    mobile: '',
    gender: 'Male' as 'Male' | 'Female',
    photo: null as string | null,
    dob: '',
    selectedClass: classId,
    siblingIds: [] as string[],
  });

  const [showSiblingSelector, setShowSiblingSelector] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-fill parent details from selected siblings
  useEffect(() => {
    if (form.siblingIds.length > 0) {
      const firstSibling = students.find((s) => s.id === form.siblingIds[0]);
      if (firstSibling) {
        setForm((prev) => ({
          ...prev,
          fatherName: prev.fatherName || firstSibling.fatherName,
          motherName: prev.motherName || firstSibling.motherName,
          mobile: prev.mobile || firstSibling.mobile,
        }));
      }
    }
  }, [form.siblingIds, students]);

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSiblingsConfirm = (siblingIds: string[]) => {
    setForm((prev) => ({ ...prev, siblingIds }));
  };

  const selectedSiblings = students.filter((s) => form.siblingIds.includes(s.id));

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.fatherName.trim()) newErrors.fatherName = "Father's name is required";
    if (!form.motherName.trim()) newErrors.motherName = "Mother's name is required";
    if (!form.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(form.mobile.trim())) {
      newErrors.mobile = 'Mobile number must be exactly 10 digits';
    }
    if (!form.dob) newErrors.dob = 'Date of birth is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    addStudent({
      name: form.name.trim(),
      fatherName: form.fatherName.trim(),
      motherName: form.motherName.trim(),
      mobile: form.mobile.trim(),
      gender: form.gender,
      photo: form.photo,
      dob: form.dob,
      classId: form.selectedClass,
      siblingIds: form.siblingIds,
    });

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
            <h2 className="text-xl font-bold text-slate-900">
              Add Student — Class {classId}
            </h2>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Photo */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handlePhotoClick}
                className="relative w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 hover:border-slate-400 flex items-center justify-center transition-colors cursor-pointer overflow-hidden"
              >
                {form.photo ? (
                  <img src={form.photo} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Camera className="w-6 h-6 text-slate-400" />
                    <span className="text-xs text-slate-400">Add Photo</span>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Student Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
                placeholder="Enter student name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Class */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                value={form.selectedClass}
                onChange={(e) => setForm((p) => ({ ...p, selectedClass: parseInt(e.target.value) }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all appearance-none bg-white"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((c) => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </div>

            {/* Father's Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Father's Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.fatherName}
                onChange={(e) => setForm((p) => ({ ...p, fatherName: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
                placeholder="Enter father's name"
              />
              {errors.fatherName && <p className="text-red-500 text-xs mt-1">{errors.fatherName}</p>}
            </div>

            {/* Mother's Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Mother's Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.motherName}
                onChange={(e) => setForm((p) => ({ ...p, motherName: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
                placeholder="Enter mother's name"
              />
              {errors.motherName && <p className="text-red-500 text-xs mt-1">{errors.motherName}</p>}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={form.mobile}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setForm((p) => ({ ...p, mobile: val }));
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
                placeholder="Enter 10 digit mobile number"
                maxLength={10}
              />
              {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
            </div>

            {/* DOB */}
            <div>
            <DatePicker
              label="Date of Birth"
              required
              value={form.dob}
              onChange={(date) => setForm((p) => ({ ...p, dob: date }))}
            />
              {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                {(['Male', 'Female'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, gender: g }))}
                    className={`flex-1 py-2.5 rounded-xl border-2 font-medium text-sm transition-all cursor-pointer ${
                      form.gender === g
                        ? g === 'Male'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-pink-500 bg-pink-50 text-pink-700'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Siblings */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Siblings
              </label>

              {/* Selected siblings preview */}
              {selectedSiblings.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedSiblings.map((s) => (
                    <span
                      key={s.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                    >
                      <Users className="w-3 h-3" />
                      {s.name}
                      <span className="text-slate-400">(Class {s.classId})</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Add Siblings Button */}
              <button
                type="button"
                onClick={() => setShowSiblingSelector(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-800 font-medium transition-all cursor-pointer"
              >
                <Link2 className="w-4 h-4" />
                {selectedSiblings.length > 0 ? 'Edit Siblings' : 'Add Siblings'}
              </button>
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
                Save Student
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>

      {/* Sibling Selector */}
      <AnimatePresence>
        {showSiblingSelector && (
          <SiblingSelectorModal
            currentStudentId={null}
            selectedSiblingIds={form.siblingIds}
            onConfirm={handleSiblingsConfirm}
            onClose={() => setShowSiblingSelector(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
