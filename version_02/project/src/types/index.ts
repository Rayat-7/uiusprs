export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'dsw_admin' | 'dept_staff';
  department?: string;
  student_id?: string;
  phone?: string;
  created_at: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  department: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'rejected';
  student_id: string;
  assigned_to?: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  feedback?: string;
  rating?: number;
}

export interface Comment {
  id: string;
  issue_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: User;
}

export interface Department {
  id: string;
  name: string;
  head: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role: 'student' | 'dsw_admin' | 'dept_staff';
  department?: string;
  student_id?: string;
  phone?: string;
}