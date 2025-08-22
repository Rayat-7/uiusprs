'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { database } from '../../lib/firebase';
import { Issue } from '../../types';
import { Plus, Clock, CheckCircle, XCircle, AlertCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const STATUS_ORDER = ['pending', 'in_progress', 'resolved', 'rejected'];

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      if (!user) return;
      const data = await database.getIssues({ student_id: user.id });
      setIssues(data || []);
    } catch (error) {
      toast.error('Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'in_progress': return <AlertTriangle className="h-5 w-5 text-blue-500" />;
      case 'resolved': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredIssues = issues
    .filter(issue => filter === 'all' || issue.status === filter)
    .filter(issue =>
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-12 w-12 text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.full_name}</h1>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <Link
            to="/report-issue"
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" /> Report New Issue
          </Link>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-3 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Issues */}
        <div className="space-y-4">
          {filteredIssues.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-lg text-gray-500">
              {issues.length === 0
                ? "You haven't reported any issues yet."
                : "No issues match your filters."}
            </div>
          ) : (
            filteredIssues.map(issue => (
              <div key={issue.id} className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{issue.title}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(issue.priority)} text-white`}>
                    {issue.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2">{issue.description}</p>

                {/* Foodpanda-style Tracker */}
                <div className="flex items-center justify-between mt-4 relative">
                  {STATUS_ORDER.map((status, idx) => {
                    const active = STATUS_ORDER.indexOf(status) <= STATUS_ORDER.indexOf(issue.status);
                    return (
                      <div key={status} className="flex-1 flex flex-col items-center relative">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                            active ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-gray-300 text-gray-300'
                          }`}
                        >
                          {getStatusIcon(status)}
                        </div>
                        {idx !== STATUS_ORDER.length - 1 && (
                          <div
                            className={`absolute top-1/2 left-1/2 w-full h-1 -translate-x-1/2 -translate-y-1/2 ${
                              active ? 'bg-orange-500' : 'bg-gray-300'
                            }`}
                          />
                        )}
                        <span className="mt-2 text-xs capitalize">{status.replace('_', ' ')}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
