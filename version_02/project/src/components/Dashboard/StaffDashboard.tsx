'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { database } from '../../lib/firebase';
import { Issue, Comment } from '../../types';
import { MessageSquare, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchIssues();
  }, []);

  useEffect(() => {
    if (selectedIssue) {
      fetchComments(selectedIssue.id);
    }
  }, [selectedIssue]);

  const fetchIssues = async () => {
    try {
      if (!user) return;
      const data = await database.getIssues({
        department: user.department || 'Computer Science & Engineering',
      });
      setIssues(data || []);
    } catch (error) {
      toast.error('Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (issueId: string) => {
    try {
      const data = await database.getComments(issueId);
      setComments(data || []);
    } catch (error) {
      toast.error('Failed to fetch comments');
    }
  };

  const handleStatusUpdate = async (issueId: string, newStatus: string) => {
    if (!user) return;

    try {
      setUpdatingStatus(true);

      // Optimistically update UI
      setIssues((prevIssues) =>
        prevIssues.map((issue) =>
          issue.id === issueId ? { ...issue, status: newStatus, updated_at: new Date().toISOString() } : issue
        )
      );

      const updates: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === 'resolved') {
        updates.resolved_at = new Date().toISOString();
      }

      await database.updateIssue(issueId, updates);

      toast.success(`Issue ${newStatus.replace('_', ' ')} successfully`);

      if (selectedIssue?.id === issueId) {
        setSelectedIssue({ ...selectedIssue, status: newStatus });
      }
    } catch (error) {
      // Rollback UI on error
      fetchIssues();
      toast.error('Failed to update issue status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedIssue || !user) return;

    try {
      const commentData = {
        id: crypto.randomUUID(),
        issue_id: selectedIssue.id,
        user_id: user.id,
        content: newComment,
        created_at: new Date().toISOString(),
      };

      await database.createComment(commentData);
      setNewComment('');
      fetchComments(selectedIssue.id);
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'in_progress':
        return <AlertTriangle className="h-5 w-5 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const stats = {
    assigned: issues.filter((i) => i.assigned_to === user?.id).length,
    inProgress: issues.filter((i) => i.status === 'in_progress' && i.assigned_to === user?.id).length,
    resolved: issues.filter((i) => i.status === 'resolved' && i.assigned_to === user?.id).length,
    pending: issues.filter((i) => i.status === 'pending').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading staff dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Department Staff Dashboard</h1>
          <p className="text-gray-600">Manage and resolve assigned issues</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Assigned to Me</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.assigned}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.resolved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Issues List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Department Issues</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {issues.length === 0 ? (
                  <div className="p-12 text-center">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
                    <p className="text-gray-600">No issues are currently assigned to your department.</p>
                  </div>
                ) : (
                  issues.map((issue) => (
                     <div
    key={issue.id}
    className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
      selectedIssue?.id === issue.id ? 'bg-orange-50 border-l-4 border-orange-500' : ''
    }`}
    onClick={() => setSelectedIssue(issue)}
  >
                      <div className="flex items-start space-x-4">
                        <div className={`w-1 h-16 rounded-full ${getPriorityColor(issue.priority)}`}></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusIcon(issue.status)}
                            <h4 className="text-lg font-medium text-gray-900 truncate">{issue.title}</h4>
                          </div>
                          <p className="text-gray-600 mb-2 line-clamp-2">{issue.description}</p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>Priority: {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}</span>
                            <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Issue Details */}
          <div className="lg:col-span-1">
            {selectedIssue ? (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Issue Details</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{selectedIssue.title}</h4>
                    <p className="text-gray-600 text-sm mb-4">{selectedIssue.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Priority:</span>
                        <span className="ml-2 font-medium capitalize">{selectedIssue.priority}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className="ml-2 font-medium capitalize">{selectedIssue.status.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Category:</span>
                        <span className="ml-2 font-medium">{selectedIssue.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <span className="ml-2 font-medium">{new Date(selectedIssue.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Update Actions */}
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-900 mb-3">Update Status</h5>
                    <div className="space-y-2">
                      {selectedIssue.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(selectedIssue.id, 'in_progress')}
                          disabled={updatingStatus}
                          className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingStatus ? 'Updating...' : 'Start Working'}
                        </button>
                      )}
                      {selectedIssue.status === 'in_progress' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(selectedIssue.id, 'resolved')}
                            disabled={updatingStatus}
                            className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingStatus ? 'Updating...' : 'Mark as Resolved'}
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(selectedIssue.id, 'rejected')}
                            disabled={updatingStatus}
                            className="w-full px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingStatus ? 'Updating...' : 'Reject Issue'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-900 mb-3">Communications</h5>

                    {/* Add Comment */}
                    <div className="mb-4">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment or update..."
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                        rows={3}
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="mt-2 px-4 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Comment
                      </button>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 p-3 rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              {comment.user?.full_name || 'Unknown User'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      ))}
                      {comments.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">No comments yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Issue</h3>
                <p className="text-gray-600">Choose an issue from the list to view details and manage it.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
