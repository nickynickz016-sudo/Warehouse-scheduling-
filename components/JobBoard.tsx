
import React, { useState } from 'react';
import { Job, JobStatus, UserProfile, UserRole } from '../types';
import { Plus, Search, Filter, Trash2, MapPin, MoreVertical, Clock } from 'lucide-react';

interface JobBoardProps {
  jobs: Job[];
  onAddJob: (job: Partial<Job>) => void;
  onDeleteJob: (jobId: string) => void;
  currentUser: UserProfile;
}

export const JobBoard: React.FC<JobBoardProps> = ({ jobs, onAddJob, onDeleteJob, currentUser }) => {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('');
  const [newJob, setNewJob] = useState({ title: '', description: '', priority: 'LOW' as any, location: '' });

  const filteredJobs = jobs.filter(j => 
    (j.title.toLowerCase().includes(filter.toLowerCase()) || j.location.toLowerCase().includes(filter.toLowerCase())) &&
    j.status !== JobStatus.REJECTED
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddJob(newJob);
    setShowModal(false);
    setNewJob({ title: '', description: '', priority: 'LOW', location: '' });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Job Board</h2>
          <p className="text-slate-500">Current operations scheduled for today.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Request Job</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex-1 relative min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search jobs or locations..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-50 rounded-xl transition-colors">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <div key={job.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden">
            {job.status === JobStatus.PENDING_ADD && (
              <div className="absolute top-0 right-0 bg-orange-100 text-orange-600 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase">
                Awaiting Approval
              </div>
            )}
            {job.status === JobStatus.PENDING_DELETE && (
              <div className="absolute top-0 right-0 bg-red-100 text-red-600 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase">
                Removal Requested
              </div>
            )}
            
            <div className="flex items-start justify-between mb-4">
              <div className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                job.priority === 'HIGH' ? 'bg-red-50 text-red-600' : 
                job.priority === 'MEDIUM' ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-600'
              }`}>
                {job.priority} Priority
              </div>
              <button 
                onClick={() => onDeleteJob(job.id)}
                className="text-slate-300 hover:text-red-500 transition-colors p-1"
                disabled={job.status === JobStatus.PENDING_DELETE}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <h4 className="font-bold text-slate-800 mb-2">{job.title}</h4>
            <p className="text-sm text-slate-500 mb-6 line-clamp-2">{job.description}</p>

            <div className="space-y-3 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                  {job.assignedTo.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="text-xs font-semibold text-slate-700">{job.assignedTo}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-8 border-b">
              <h3 className="text-xl font-bold text-slate-800">Request New Job</h3>
              <p className="text-sm text-slate-500">Admin approval is required for all new jobs.</p>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Job Title</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Unload Truck #42"
                  value={newJob.title}
                  onChange={e => setNewJob({...newJob, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Location</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Bay 4"
                    value={newJob.location}
                    onChange={e => setNewJob({...newJob, location: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Priority</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newJob.priority}
                    onChange={e => setNewJob({...newJob, priority: e.target.value})}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
                <textarea 
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Additional details..."
                  value={newJob.description}
                  onChange={e => setNewJob({...newJob, description: e.target.value})}
                ></textarea>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 font-semibold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 font-semibold text-white bg-blue-600 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
