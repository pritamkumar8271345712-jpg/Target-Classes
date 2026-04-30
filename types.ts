export interface Student {
  id: string;
  name: string;
  fatherName: string;
  motherName: string;
  mobile: string;
  gender: 'Male' | 'Female';
  photo: string | null;
  dob: string;
  classId: number;
  siblingIds: string[];
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  mobile: string;
  email: string;
  photo: string | null;
}

export interface Expense {
  id: string;
  teacherId: string;
  amount: number;
  date: string;
  item: string;
  createdAt: string;
}

export interface DueEntry {
  id: string;
  month: string;
  year: number;
  amounts: { studentId: string; amount: number }[];
  createdAt: string;
}

export interface PaidEntry {
  id: string;
  amount: number;
  date: string;
  receiptNumber: string;
  collectedByTeacherId: string | null;
  paymentMethod: 'Bank' | 'Cash';
  createdAt: string;
}

export type Tab = 'home' | 'classes' | 'teachers' | 'settings';

export interface AppData {
  students: Student[];
  teachers: Teacher[];
  dueEntries: DueEntry[];
  paidEntries: PaidEntry[];
  expenses: Expense[];
}

export const defaultTeachers: Teacher[] = [
  { id: 'teacher-1', name: 'Rajesh Kumar', subject: 'Mathematics', mobile: '9876543210', email: 'rajesh@targetclasses.com', photo: null },
  { id: 'teacher-2', name: 'Priya Sharma', subject: 'Science', mobile: '9876543211', email: 'priya@targetclasses.com', photo: null },
];

export const defaultData: AppData = {
  students: [],
  teachers: [...defaultTeachers],
  dueEntries: [],
  paidEntries: [],
  expenses: [],
};

export function getAcademicSessions(): string[] {
  const sessions: string[] = [];
  for (let start = 2025; start <= 2099; start++) {
    sessions.push(`${start}-${start + 1}`);
  }
  return sessions;
}

export function getCurrentAcademicSession(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month >= 3) {
    return `${year}-${year + 1}`;
  }
  return `${year - 1}-${year}`;
}
