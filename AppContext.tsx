import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { User } from 'firebase/auth';
import type { Student, Teacher, Tab, DueEntry, PaidEntry, Expense } from '../types';
import { getCurrentAcademicSession } from '../types';
import { onAuthChange, logOut } from '../firebase/auth';
import { dbStudents, dbTeachers, dbDueEntries, dbPaidEntries, dbExpenses } from '../firebase/db';
import type { Unsubscribe } from 'firebase/firestore';

interface AppState {
  user: User | null;
  authLoading: boolean;
  logout: () => Promise<void>;
  currentSession: string;
  setCurrentSession: (session: string) => void;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  selectedClass: number | null;
  setSelectedClass: (cls: number | null) => void;
  viewingStudentId: string | null;
  setViewingStudentId: (id: string | null) => void;
  viewingTeacherId: string | null;
  setViewingTeacherId: (id: string | null) => void;
  students: Student[];
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  teachers: Teacher[];
  addTeacher: (teacher: { name: string; mobile: string; photo: string | null }) => Promise<void>;
  updateTeacher: (id: string, updates: Partial<Teacher>) => Promise<void>;
  dueEntries: DueEntry[];
  addDueEntry: (entry: Omit<DueEntry, 'id'>) => Promise<void>;
  updateDueEntry: (id: string, entry: Partial<DueEntry>) => Promise<void>;
  deleteDueEntry: (id: string) => Promise<void>;
  paidEntries: PaidEntry[];
  addPaidEntry: (entry: Omit<PaidEntry, 'id'>) => Promise<void>;
  updatePaidEntry: (id: string, entry: Partial<PaidEntry>) => Promise<void>;
  deletePaidEntry: (id: string) => Promise<void>;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  dataLoading: boolean;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  firestoreError: string | null;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentSession, setCurrentSessionState] = useState(getCurrentAcademicSession());
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);
  const [viewingTeacherId, setViewingTeacherId] = useState<string | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [dueEntries, setDueEntries] = useState<DueEntry[]>([]);
  const [paidEntries, setPaidEntries] = useState<PaidEntry[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  const unsubsRef = useRef<Unsubscribe[]>([]);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthChange((u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // Subscribe to ALL Firestore collections when user logs in
  useEffect(() => {
    if (!user) {
      setStudents([]);
      setTeachers([]);
      setDueEntries([]);
      setPaidEntries([]);
      setExpenses([]);
      setDataLoading(false);
      setSyncStatus('idle');
      setFirestoreError(null);
      return;
    }

    setDataLoading(true);
    setSyncStatus('syncing');
    setFirestoreError(null);

    // Unsubscribe previous listeners
    unsubsRef.current.forEach((u) => u());
    unsubsRef.current = [];

    const uid = user.uid;
    let loadedCount = 0;
    const totalCollections = 5;

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount >= totalCollections) {
        setDataLoading(false);
        setSyncStatus('synced');
      }
    };

    const unsubs: Unsubscribe[] = [];

    unsubs.push(
      dbStudents.subscribe<Student>(uid, (data) => { setStudents(data); checkAllLoaded(); }, (err) => { console.error('students:', err); setFirestoreError(err); checkAllLoaded(); })
    );

    unsubs.push(
      dbTeachers.subscribe<Teacher>(uid, (data) => {
        setTeachers(data);
        checkAllLoaded();
      }, (err) => { console.error('teachers:', err); setFirestoreError(err); checkAllLoaded(); })
    );

    unsubs.push(
      dbDueEntries.subscribe<DueEntry>(uid, (data) => { setDueEntries(data); checkAllLoaded(); }, (err) => { console.error('due:', err); setFirestoreError(err); checkAllLoaded(); })
    );

    unsubs.push(
      dbPaidEntries.subscribe<PaidEntry>(uid, (data) => { setPaidEntries(data); checkAllLoaded(); }, (err) => { console.error('paid:', err); setFirestoreError(err); checkAllLoaded(); })
    );

    unsubs.push(
      dbExpenses.subscribe<Expense>(uid, (data) => { setExpenses(data); checkAllLoaded(); }, (err) => { console.error('expenses:', err); setFirestoreError(err); checkAllLoaded(); })
    );

    unsubsRef.current = unsubs;

    return () => {
      unsubs.forEach((u) => u());
      unsubsRef.current = [];
    };
  }, [user]);

  const setCurrentSession = useCallback((session: string) => {
    setCurrentSessionState(session);
    setSelectedClass(null);
    setViewingStudentId(null);
    setViewingTeacherId(null);
    setActiveTab('home');
  }, []);

  const logout = useCallback(async () => {
    unsubsRef.current.forEach((u) => u());
    unsubsRef.current = [];
    await logOut();
    setActiveTab('home');
    setSelectedClass(null);
    setViewingStudentId(null);
    setViewingTeacherId(null);
    setStudents([]);
    setTeachers([]);
    setDueEntries([]);
    setPaidEntries([]);
    setExpenses([]);
    setSyncStatus('idle');
    setFirestoreError(null);
  }, []);

  // === STUDENT CRUD ===
  const addStudent = useCallback(async (student: Omit<Student, 'id'>) => {
    if (!user) return;
    try {
      await dbStudents.create(user.uid, student);
    } catch (e: any) {
      console.error('addStudent failed:', e.message);
      setFirestoreError(e.message);
    }
  }, [user]);

  const deleteStudent = useCallback(async (id: string) => {
    if (!user) return;
    try {
      await dbStudents.remove(user.uid, id);
    } catch (e: any) {
      console.error('deleteStudent failed:', e.message);
      setFirestoreError(e.message);
    }
  }, [user]);

  const updateStudentFn = useCallback(async (id: string, updates: Partial<Student>) => {
    if (!user) return;
    try {
      await dbStudents.update(user.uid, id, updates);
    } catch (e: any) {
      console.error('updateStudent failed:', e.message);
      setFirestoreError(e.message);
    }
  }, [user]);

  // === TEACHER CRUD ===
  const addTeacher = useCallback(async (teacher: { name: string; mobile: string; photo: string | null }) => {
    if (!user) return;
    try {
      await dbTeachers.create(user.uid, {
        name: teacher.name,
        mobile: teacher.mobile,
        photo: teacher.photo,
        subject: '',
        email: '',
      });
    } catch (e: any) {
      console.error('addTeacher failed:', e.message);
      setFirestoreError(e.message);
    }
  }, [user]);

  const updateTeacherFn = useCallback(async (id: string, updates: Partial<Teacher>) => {
    if (!user) return;
    try {
      await dbTeachers.update(user.uid, id, updates);
    } catch (e: any) {
      console.error('updateTeacher failed:', e.message);
      setFirestoreError(e.message);
    }
  }, [user]);

  // === DUE ENTRY CRUD ===
  const addDueEntryFn = useCallback(async (entry: Omit<DueEntry, 'id'>) => {
    if (!user) return;
    try {
      await dbDueEntries.create(user.uid, entry);
    } catch (e: any) {
      console.error('addDueEntry failed:', e.message);
      setFirestoreError(e.message);
    }
  }, [user]);

  const updateDueEntryFn = useCallback(async (id: string, updates: Partial<DueEntry>) => {
    if (!user) return;
    try {
      await dbDueEntries.update(user.uid, id, updates);
    } catch (e: any) {
      console.error('updateDueEntry failed:', e.message);
      setFirestoreError(e.message);
    }
  }, [user]);

  const deleteDueEntryFn = useCallback(async (id: string) => {
    if (!user) return;
    try {
      await dbDueEntries.remove(user.uid, id);
    } catch (e: any) {
      console.error('deleteDueEntry failed:', e.message);
      setFirestoreError(e.message);
    }
  }, [user]);

  // === PAID ENTRY CRUD ===
  const addPaidEntryFn = useCallback(async (entry: Omit<PaidEntry, 'id'>) => {
    if (!user) return;
    try {
      await dbPaidEntries.create(user.uid, entry);
    } catch (e: any) {
      console.error('addPaidEntry failed:', e.message);
      setFirestoreError(e.message);
    }
  }, [user]);

  const updatePaidEntryFn = useCallback(async (id: string, updates: Partial<PaidEntry>) => {
    if (!user) return;
    try {
      await dbPaidEntries.update(user.uid, id, updates);
    } catch (e: any) {
      console.error('updatePaidEntry failed:', e.message);
      setFirestoreError(e.message);
    }
  }, [user]);

  const deletePaidEntryFn = useCallback(async (id: string) => {
    if (!user) return;
    try {
      await dbPaidEntries.remove(user.uid, id);
    } catch (e: any) {
      console.error('deletePaidEntry failed:', e.message);
      setFirestoreError(e.message);
    }
  }, [user]);

  // === EXPENSE CRUD ===
  const addExpenseFn = useCallback(async (expense: Omit<Expense, 'id'>) => {
    if (!user) return;
    try {
      await dbExpenses.create(user.uid, expense);
    } catch (e: any) {
      console.error('addExpense failed:', e.message);
      setFirestoreError(e.message);
    }
  }, [user]);

  const updateExpenseFn = useCallback(async (id: string, updates: Partial<Expense>) => {
    if (!user) return;
    try {
      await dbExpenses.update(user.uid, id, updates);
    } catch (e: any) {
      console.error('updateExpense failed:', e.message);
      setFirestoreError(e.message);
    }
  }, [user]);

  const deleteExpenseFn = useCallback(async (id: string) => {
    if (!user) return;
    try {
      await dbExpenses.remove(user.uid, id);
    } catch (e: any) {
      console.error('deleteExpense failed:', e.message);
      setFirestoreError(e.message);
    }
  }, [user]);

  return (
    <AppContext.Provider
      value={{
        user,
        authLoading,
        logout,
        currentSession,
        setCurrentSession,
        activeTab,
        setActiveTab,
        selectedClass,
        setSelectedClass,
        viewingStudentId,
        setViewingStudentId,
        viewingTeacherId,
        setViewingTeacherId,
        students,
        addStudent,
        deleteStudent,
        updateStudent: updateStudentFn,
        teachers,
        addTeacher,
        updateTeacher: updateTeacherFn,
        dueEntries,
        addDueEntry: addDueEntryFn,
        updateDueEntry: updateDueEntryFn,
        deleteDueEntry: deleteDueEntryFn,
        paidEntries,
        addPaidEntry: addPaidEntryFn,
        updatePaidEntry: updatePaidEntryFn,
        deletePaidEntry: deletePaidEntryFn,
        expenses,
        addExpense: addExpenseFn,
        updateExpense: updateExpenseFn,
        deleteExpense: deleteExpenseFn,
        dataLoading,
        syncStatus,
        firestoreError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
