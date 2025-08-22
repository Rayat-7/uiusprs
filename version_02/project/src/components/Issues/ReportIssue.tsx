import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { database } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Camera, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const reportSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.string().min(1, 'Please select a category'),
  department: z.string().min(1, 'Please select a department'),
  priority: z.enum(['low', 'medium', 'high', 'urgent'])
});

type ReportFormData = z.infer<typeof reportSchema>;

const categories = [
  'Academic Issue',
  'Admission & Registration',
  'Facilities & Infrastructure',
  'IT & Technology',
  'Library Services',
  'Student Services',
  'Transportation',
  'Hostel/Accommodation',
  'Financial Services',
  'Health & Safety',
  'Other'
];

const departments = [
  'Computer Science & Engineering',
  'Electrical & Electronic Engineering',
  'Civil Engineering',
  'Business Administration',
  'Economics',
  'English',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Pharmacy',
  'Student Affairs',
  'Admissions Office',
  'IT Department',
  'Finance Office',
  'Library',
  'Registrar Office',
  'Other'
];

const ReportIssue: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      priority: 'medium'
    }
  });

  const selectedPriority = watch('priority');

  const onSubmit = async (data: ReportFormData) => {
    if (!user) {
      toast.error('Please login to report an issue');
      return;
    }

    try {
      setUploading(true);

      const issueData = {
        id: crypto.randomUUID(),
        ...data,
        student_id: user.id,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        attachments: attachments.map(f => f.name) // In production, upload files to storage
      };

      await database.createIssue(issueData);
      
      toast.success('Issue reported successfully!');
      navigate('/student-dashboard');
    } catch (error) {
      toast.error('Failed to report issue. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + attachments.length > 5) {
      toast.error('Maximum 5 files allowed');
      return;
    }
    
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
    const validFiles = files.filter(file => {
      if (!validTypes.includes(file.type)) {
        toast.error(`File type ${file.type} not supported`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Report an Issue</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Help us improve UIU by reporting any problems you encounter. Provide detailed information 
              to help our staff resolve issues quickly and efficiently.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Title *
                </label>
                <input
                  {...register('title')}
                  type="text"
                  placeholder="Brief, descriptive title of the issue"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
              </div>

              {/* Category and Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    {...register('category')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                    Responsible Department *
                  </label>
                  <select
                    {...register('department')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select a department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Priority Level *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(['low', 'medium', 'high', 'urgent'] as const).map((priority) => (
                    <label
                      key={priority}
                      className={`relative flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedPriority === priority
                          ? getPriorityColor(priority)
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        {...register('priority')}
                        type="radio"
                        value={priority}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium capitalize">{priority}</span>
                    </label>
                  ))}
                </div>
                {errors.priority && <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  {...register('description')}
                  rows={6}
                  placeholder="Please provide a detailed description of the issue, including when it occurred, what you expected to happen, and any steps you've already taken..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
                <p className="mt-2 text-sm text-gray-500">
                  The more details you provide, the faster we can resolve your issue.
                </p>
              </div>

              {/* File Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Attachments (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF, PDF or TXT (max 5MB each, 5 files max)
                    </p>
                  </label>
                </div>

                {/* Attachment List */}
                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {file.type.startsWith('image/') ? (
                            <Camera className="h-5 w-5 text-gray-400" />
                          ) : (
                            <FileText className="h-5 w-5 text-gray-400" />
                          )}
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({Math.round(file.size / 1024)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <p>* Required fields</p>
                  <p className="mt-1">You'll receive email updates on the status of your report.</p>
                </div>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-8 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;