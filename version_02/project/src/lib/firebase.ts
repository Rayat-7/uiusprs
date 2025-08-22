import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { User, Issue, Comment, RegisterData } from '../types';

const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "uiu-sprs.firebaseapp.com",
  projectId: "uiu-sprs",
  storageBucket: "uiu-sprs.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Demo users data
const demoUsers: User[] = [
  {
    id: '1',
    email: 'student@uiu.ac.bd',
    password: 'student123',
    full_name: 'John Smith',
    role: 'student',
    department: 'Computer Science & Engineering',
    student_id: '011191001',
    phone: '+8801712345678',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    email: 'admin@uiu.ac.bd',
    password: 'admin123',
    full_name: 'Dr. Ahmed Rahman',
    role: 'dsw_admin',
    department: 'Student Affairs',
    phone: '+8801987654321',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    email: 'staff@uiu.ac.bd',
    password: 'staff123',
    full_name: 'Ms. Fatima Khan',
    role: 'dept_staff',
    department: 'Computer Science & Engineering',
    phone: '+8801555666777',
    created_at: new Date().toISOString()
  }
];

// In-memory dynamic issues array
let issues: Issue[] = [];

// In-memory notifications
let demoNotifications: any[] = [];

export const database = {
  // Authentication
  async loginUser(email: string, password: string) {
    const user = demoUsers.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid credentials');
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async registerUser(userData: RegisterData) {
    const existingUser = demoUsers.find(u => u.email === userData.email);
    if (existingUser) throw new Error('User already exists with this email');
    const newUser = { id: Date.now().toString(), ...userData, created_at: new Date().toISOString() };
    demoUsers.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  // Issues
  async createIssue(issueData: any) {
    const newIssue: Issue = {
      id: Date.now().toString(),
      ...issueData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'pending',
      priority: issueData.priority || 'medium'
    };
    issues.push(newIssue);
    return newIssue;
  },

  async getIssues(filters: any = {}) {
    let filteredIssues = [...issues];
    if (filters.student_id) filteredIssues = filteredIssues.filter(i => i.student_id === filters.student_id);
    if (filters.department) filteredIssues = filteredIssues.filter(i => i.department === filters.department);
    if (filters.status) filteredIssues = filteredIssues.filter(i => i.status === filters.status);
    if (filters.assigned_to) filteredIssues = filteredIssues.filter(i => i.assigned_to === filters.assigned_to);

    return filteredIssues.map(issue => ({
      ...issue,
      student: demoUsers.find(u => u.id === issue.student_id),
      assigned_user: issue.assigned_to ? demoUsers.find(u => u.id === issue.assigned_to) : null
    }));
  },

  async updateIssue(id: string, updates: any) {
    const idx = issues.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Issue not found');
    issues[idx] = { ...issues[idx], ...updates, updated_at: new Date().toISOString() };
    return issues[idx];
  },

  // Comments
  async getComments(issueId: string) {
    return []; // Can add dynamic comments array later if needed
  },

  async createComment(commentData: any) {
    return { id: Date.now().toString(), ...commentData, created_at: new Date().toISOString() };
  },

  // Notifications
  async getNotifications(userId: string) {
    return demoNotifications.filter(n => n.user_id === userId).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  async markNotificationAsRead(notificationId: string) {
    const n = demoNotifications.find(n => n.id === notificationId);
    if (n) n.read = true;
  },

  async markAllNotificationsAsRead(userId: string) {
    demoNotifications.forEach(n => { if (n.user_id === userId) n.read = true; });
  }
};
