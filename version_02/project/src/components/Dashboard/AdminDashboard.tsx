'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { database } from '../../lib/firebase';
import { Issue } from '../../types';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#F97316', '#1F2937', '#10B981', '#EF4444', '#8B5CF6'];

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [pdfUrl, setPdfUrl] = useState('');
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const issuesData = await database.getIssues();
      setIssues(issuesData || []);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignIssue = async (issueId: string, assignedTo: string) => {
    try {
      await database.updateIssue(issueId, {
        assigned_to: assignedTo,
        status: 'assigned',
        updated_at: new Date().toISOString()
      });
      fetchData();
      toast.success('Issue assigned successfully');
    } catch (error) {
      toast.error('Failed to assign issue');
    }
  };

  const handleStatusUpdate = async (issueId: string, newStatus: string) => {
    try {
      await database.updateIssue(issueId, {
        status: newStatus,
        updated_at: new Date().toISOString()
      });
      fetchData();
      toast.success(`Issue marked as ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Statistics
  const stats = {
    totalIssues: issues.length,
    pendingIssues: issues.filter(i => i.status === 'pending').length,
    resolvedIssues: issues.filter(i => i.status === 'resolved').length,
    avgResolutionTime: calculateAvgResolutionTime(issues)
  };

  function calculateAvgResolutionTime(issues: Issue[]): number {
    const resolved = issues.filter(i => i.resolved_at);
    if (!resolved.length) return 0;
    const totalTime = resolved.reduce((sum, i) => {
      const created = new Date(i.created_at).getTime();
      const resolvedAt = new Date(i.resolved_at!).getTime();
      return sum + (resolvedAt - created);
    }, 0);
    return Math.round(totalTime / (resolved.length * 24 * 60 * 60 * 1000));
  }

  // Departments
  const departments = [
    'Computer Science & Engineering',
    'Electrical & Electronic Engineering',
    'Business Administration',
    'Civil Engineering',
    'Economics'
  ];

  const departmentData = departments.map(dept => ({
    name: dept,
    issues: issues.filter(i => i.department === dept).length,
    resolved: issues.filter(i => i.department === dept && i.status === 'resolved').length
  }));

  const statusData = [
    { name: 'Pending', value: issues.filter(i => i.status === 'pending').length },
    { name: 'Assigned', value: issues.filter(i => i.status === 'assigned').length },
    { name: 'In Progress', value: issues.filter(i => i.status === 'in_progress').length },
    { name: 'Resolved', value: issues.filter(i => i.status === 'resolved').length },
    { name: 'Rejected', value: issues.filter(i => i.status === 'rejected').length }
  ].filter(item => item.value > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">DSW Admin Dashboard</h1>
          <p className="text-gray-600">Monitor and manage university issues</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<AlertTriangle className="h-6 w-6 text-blue-600" />} bgColor="bg-blue-100" title="Total Issues" value={stats.totalIssues} />
          <StatCard icon={<Clock className="h-6 w-6 text-yellow-600" />} bgColor="bg-yellow-100" title="Pending" value={stats.pendingIssues} />
          <StatCard icon={<CheckCircle className="h-6 w-6 text-green-600" />} bgColor="bg-green-100" title="Resolved" value={stats.resolvedIssues} />
          <StatCard icon={<TrendingUp className="h-6 w-6 text-orange-600" />} bgColor="bg-orange-100" title="Avg Resolution" value={`${stats.avgResolutionTime}d`} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Department Performance */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="issues" fill="#F97316" name="Total Issues" />
                <Bar dataKey="resolved" fill="#10B981" name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Issues Table */}
        <RecentIssuesTable
          issues={issues}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          handleAssignIssue={handleAssignIssue}
          handleViewPdf={(url, issue) => { setPdfUrl(url); setSelectedIssue(issue); setShowPdfModal(true); }}
          handleStatusUpdate={handleStatusUpdate}
        />

        {/* PDF Modal */}
        {showPdfModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-11/12 md:w-3/4 h-[80vh] flex flex-col">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-semibold text-gray-900">{selectedIssue?.title}</h3>
                <button onClick={() => setShowPdfModal(false)} className="text-red-500 font-bold text-lg">&times;</button>
              </div>
              <iframe src={pdfUrl} className="flex-1 w-full" />
              <div className="p-4 border-t flex space-x-2">
                <button
                  onClick={() => { handleStatusUpdate(selectedIssue!.id, 'resolved'); setShowPdfModal(false); }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Mark Resolved
                </button>
                <button
                  onClick={() => { handleStatusUpdate(selectedIssue!.id, 'rejected'); setShowPdfModal(false); }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Components
const StatCard: React.FC<{ icon: React.ReactNode; bgColor: string; title: string; value: string | number }> = ({ icon, bgColor, title, value }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="flex items-center">
      <div className={`p-3 ${bgColor} rounded-full`}>{icon}</div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const RecentIssuesTable: React.FC<{
  issues: Issue[];
  selectedPeriod: string;
  setSelectedPeriod: (val: string) => void;
  handleAssignIssue: (id: string, assignedTo: string) => void;
  handleViewPdf: (url: string, issue: Issue) => void;
  handleStatusUpdate: (id: string, status: string) => void;
}> = ({ issues, selectedPeriod, setSelectedPeriod, handleAssignIssue, handleViewPdf }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Issues</h3>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Issue', 'Department', 'Priority', 'Status', 'Created', 'PDF', 'Actions'].map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {issues.slice(0, 10).map(issue => (
              <tr key={issue.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{issue.title}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">{issue.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{issue.department}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${issue.priority === 'urgent' ? 'bg-red-100 text-red-800' : issue.priority === 'high' ? 'bg-orange-100 text-orange-800' : issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{issue.priority}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${issue.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : issue.status === 'assigned' ? 'bg-blue-100 text-blue-800' : issue.status === 'in_progress' ? 'bg-purple-100 text-purple-800' : issue.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{issue.status.replace('_', ' ')}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(issue.created_at))}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 underline cursor-pointer" onClick={() => handleViewPdf(issue.pdf_url!, issue)}>View PDF</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {issue.status === 'pending' && (
                    <select onChange={(e) => handleAssignIssue(issue.id, e.target.value)} className="text-orange-600 hover:text-orange-900 border border-orange-300 rounded px-2 py-1" defaultValue="">
                      <option value="" disabled>Assign to...</option>
                      <option value="staff1">John Doe (CSE)</option>
                      <option value="staff2">Jane Smith (EEE)</option>
                      <option value="staff3">Mike Johnson (BBA)</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
