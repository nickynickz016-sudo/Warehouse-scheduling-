
import React, { useState } from 'react';
import { Job, JobStatus, LoadingType, UserProfile, MainCategory, SubCategory, Personnel, Vehicle, UserRole } from '../types';
import { Plus, Search, MapPin, Package, Clock, User, X, Layers, Calendar as CalendarIcon, List, CheckCircle2, Truck, Settings2, Edit3, Lock, Unlock, Trash2, Users } from 'lucide-react';

interface ScheduleViewProps {
  jobs: Job[];
  onAddJob: (job: Partial<Job>) => void;
  onDeleteJob: (jobId: string) => void;
  onUpdateAllocation: (jobId: string, allocation: { teamLeader: string, vehicle: string, writerCrew: string[] }) => void;
  onToggleLock: (jobId: string) => void;
  currentUser: UserProfile;
  personnel: Personnel[];
  vehicles: Vehicle[];
}

const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
const CATEGORIES: MainCategory[] = ['Commercial', 'Agent', 'Private', 'Corporate'];

export const ScheduleView: React.FC<ScheduleViewProps> = ({ 
  jobs, onAddJob, onDeleteJob, onUpdateAllocation, onToggleLock, currentUser, personnel, vehicles 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState<Job | null>(null);
  const [filter, setFilter] = useState('');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [editAllocation, setEditAllocation] = useState<{ teamLeader: string, vehicle: string, writerCrew: string[] }>({
    teamLeader: '',
    vehicle: '',
    writerCrew: []
  });

  const today = new Date().toISOString().split('T')[0];
  
  const [newJob, setNewJob] = useState<Partial<Job>>({
    id: '', 
    shipperName: '',
    location: '',
    shipmentDetails: '',
    description: '',
    priority: 'LOW',
    agentName: '',
    loadingType: 'Warehouse Removal',
    mainCategory: 'Commercial',
    subCategory: 'Export',
    shuttle: 'No',
    longCarry: 'No',
    specialRequests: { 
      handyman: false, manpower: false, overtime: false,
      documents: false, packingList: false, crateCertificate: false, walkThrough: false 
    },
    volumeCBM: 0,
    jobTime: '08:00',
    jobDate: today,
    assignedTo: 'Unassigned'
  });

  const getSubCategories = (main: MainCategory): SubCategory[] => {
    if (main === 'Commercial') return ['Fine arts Installation', 'Export', 'Import'];
    return ['Export', 'Import'];
  };

  const filteredJobs = jobs.filter(j => 
    !j.isWarehouseActivity &&
    j.jobDate === selectedDate &&
    (j.id.toLowerCase().includes(filter.toLowerCase()) || 
     j.shipperName.toLowerCase().includes(filter.toLowerCase())) &&
    j.status !== JobStatus.REJECTED
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.id || !newJob.shipperName || !newJob.mainCategory) {
      alert("Job No., Shipper Name, and Type of Job are mandatory.");
      return;
    }
    onAddJob({ ...newJob, title: newJob.id });
    setShowModal(false);
  };

  const openAllocationEditor = (job: Job) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setShowAllocationModal(job);
    setEditAllocation({ 
      teamLeader: job.teamLeader || '', 
      vehicle: job.vehicle || '',
      writerCrew: job.writerCrew || []
    });
  };

  const handleUpdateAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (showAllocationModal) {
      onUpdateAllocation(showAllocationModal.id, editAllocation);
      setShowAllocationModal(null);
    }
  };

  const toggleCrewMember = (name: string) => {
    setEditAllocation(prev => {
      const exists = prev.writerCrew.includes(name);
      if (exists) {
        return { ...prev, writerCrew: prev.writerCrew.filter(n => n !== name) };
      } else {
        return { ...prev, writerCrew: [...prev.writerCrew, name] };
      }
    });
  };

  const availableTLs = personnel.filter(p => p.type === 'Team Leader');
  const availableCrews = personnel.filter(p => p.type === 'Writer Crew');

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <Truck className="w-8 h-8 text-blue-600" />
            Job Allocation Board
          </h2>
          <div className="flex flex-wrap items-center gap-4 mt-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
              <CalendarIcon className="w-4 h-4 text-slate-400" />
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent border-none outline-none cursor-pointer"
              />
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button onClick={() => setViewMode('calendar')} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Calendar</button>
              <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>List View</button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search ID or Shipper..."
              className="pl-11 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none w-64"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-xl hover:bg-slate-800 transition-all font-bold uppercase text-[11px] tracking-widest shadow-md"
          >
            <Plus className="w-5 h-5" />
            Submit Request
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {viewMode === 'calendar' ? (
          <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
             <div className="grid grid-cols-[120px_1fr] border-b bg-slate-50 text-slate-400 sticky top-0 z-10">
                <div className="p-4 text-[10px] font-bold uppercase tracking-widest text-center">Timing</div>
                <div className="p-4 text-[10px] font-bold uppercase tracking-widest px-8">Dispatch Operations</div>
             </div>
             {HOURS.map((hour) => {
               const hourJobs = filteredJobs.filter(j => j.jobTime === hour);
               return (
                 <div key={hour} className="grid grid-cols-[120px_1fr] border-b last:border-0 group min-h-[160px]">
                    <div className="p-6 text-sm font-bold text-slate-300 text-center bg-slate-50/20 border-r border-slate-100">
                      {hour}
                    </div>
                    <div className="p-6 flex flex-wrap gap-6 items-start">
                       {hourJobs.length === 0 && (
                         <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-slate-300 text-[10px] font-bold uppercase py-6">
                            Available Slot
                         </div>
                       )}
                       {hourJobs.map((job) => (
                         <div key={job.id} className={`min-w-[340px] max-w-sm rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all bg-white relative group/job ${job.isLocked ? 'border-amber-200 bg-amber-50/10' : 'border-slate-200'}`}>
                            <div className="flex justify-between items-start mb-4">
                               <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">ID: {job.id}</p>
                                    {job.isLocked && <Lock className="w-3 h-3 text-amber-500" />}
                                  </div>
                                  <h4 className="font-bold text-base text-slate-800 leading-tight truncate">{job.shipperName}</h4>
                               </div>
                               <div className="flex gap-2">
                                  {currentUser.role === UserRole.ADMIN && (
                                    <>
                                      <button 
                                        onClick={() => onToggleLock(job.id)}
                                        className={`p-1.5 rounded-lg transition-all ${job.isLocked ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:bg-slate-100'}`}
                                      >
                                        {job.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                      </button>
                                      <button 
                                        onClick={() => openAllocationEditor(job)}
                                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all"
                                      >
                                        <Settings2 className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                  <button 
                                    onClick={() => onDeleteJob(job.id)} 
                                    className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover/job:opacity-100"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                               </div>
                            </div>
                            <div className="space-y-3 mb-4">
                               <div className="flex flex-col gap-1">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <Users className="w-3 h-3" /> Crew Allocation
                                  </span>
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-bold text-slate-700">
                                      {job.teamLeader ? `TL: ${job.teamLeader}` : 'No TL assigned'}
                                    </span>
                                    {job.writerCrew && job.writerCrew.length > 0 && (
                                      <span className="text-[10px] text-slate-500 font-medium">
                                        Crew: {job.writerCrew.join(', ')}
                                      </span>
                                    )}
                                  </div>
                               </div>
                               <div className="flex flex-col gap-1">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <Truck className="w-3 h-3" /> Vehicle Details
                                  </span>
                                  <span className="text-xs font-bold text-slate-700">{job.vehicle || 'No vehicle dispatched'}</span>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               );
             })}
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
               <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                     <th className="p-6">Job No.</th>
                     <th className="p-6">Shipper / Location</th>
                     <th className="p-6">Type / Time</th>
                     <th className="p-6">Allocation Details</th>
                     <th className="p-6">Status</th>
                     <th className="p-6 text-center">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {filteredJobs.map(job => (
                    <tr key={job.id} className={`hover:bg-slate-50/50 transition-colors group ${job.isLocked ? 'bg-amber-50/5' : ''}`}>
                       <td className="p-6 text-sm font-bold text-blue-600">
                          <div className="flex items-center gap-2">
                            {job.id}
                            {job.isLocked && <Lock className="w-3 h-3 text-amber-500" />}
                          </div>
                       </td>
                       <td className="p-6">
                         <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800">{job.shipperName}</span>
                            <span className="text-[10px] text-slate-400 font-medium uppercase truncate max-w-[200px]">{job.location}</span>
                         </div>
                       </td>
                       <td className="p-6">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase text-slate-500">{job.mainCategory}</span>
                            <span className="text-[10px] font-bold text-slate-400">{job.jobTime}</span>
                          </div>
                       </td>
                       <td className="p-6">
                         <div className="flex flex-col gap-2">
                            <div className="flex items-start gap-1.5">
                              <User className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-700">
                                  {job.teamLeader ? `Leader: ${job.teamLeader}` : 'Unassigned'}
                                </span>
                                {job.writerCrew && job.writerCrew.length > 0 && (
                                  <span className="text-[10px] text-slate-500 font-medium leading-tight">
                                    Crew: {job.writerCrew.join(', ')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 border-t border-slate-50 pt-1 mt-1">
                              <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="text-[10px] text-slate-500 font-bold">{job.vehicle || 'No vehicle'}</span>
                            </div>
                         </div>
                       </td>
                       <td className="p-6">
                         <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase ${
                           job.status === JobStatus.ACTIVE ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                         }`}>
                           {job.status}
                         </span>
                       </td>
                       <td className="p-6">
                         <div className="flex items-center justify-center gap-2">
                           {currentUser.role === UserRole.ADMIN && (
                             <>
                               <button 
                                 onClick={() => onToggleLock(job.id)}
                                 className={`p-2 rounded-xl transition-all ${job.isLocked ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}
                               >
                                 {job.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                               </button>
                               <button 
                                 onClick={() => openAllocationEditor(job)}
                                 className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all shadow-sm"
                               >
                                  <Settings2 className="w-4 h-4" />
                               </button>
                             </>
                           )}
                           <button 
                             onClick={() => onDeleteJob(job.id)}
                             disabled={job.isLocked && currentUser.role !== UserRole.ADMIN}
                             className={`p-2 rounded-xl transition-all ${job.isLocked && currentUser.role !== UserRole.ADMIN ? 'opacity-20 cursor-not-allowed' : 'bg-rose-50 text-rose-300 hover:text-rose-600 hover:bg-rose-100'}`}
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Allocation Edit Modal */}
      {showAllocationModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-8 border-b bg-slate-900 flex justify-between items-center text-white shrink-0">
                 <div>
                   <h3 className="text-lg font-bold uppercase tracking-widest">Dispatch Allocation</h3>
                   <p className="text-[10px] font-medium opacity-70 uppercase tracking-tighter">Job No: {showAllocationModal.id}</p>
                 </div>
                 <button onClick={() => setShowAllocationModal(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleUpdateAllocation} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Team Leader Assignment</label>
                    <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-1 focus:ring-blue-500 outline-none" value={editAllocation.teamLeader} onChange={e => setEditAllocation({...editAllocation, teamLeader: e.target.value})}>
                       <option value="">Choose Leader...</option>
                       {personnel.filter(p => p.type === 'Team Leader').map(tl => <option key={tl.id} value={tl.name}>{tl.name}</option>)}
                    </select>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Crew Members</label>
                    <div className="grid grid-cols-2 gap-2">
                      {personnel.filter(p => p.type === 'Writer Crew').map(crew => (
                        <button
                          key={crew.id}
                          type="button"
                          onClick={() => toggleCrewMember(crew.name)}
                          className={`px-4 py-3 rounded-xl border text-[11px] font-bold transition-all text-left flex justify-between items-center ${
                            editAllocation.writerCrew.includes(crew.name)
                              ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span>{crew.name}</span>
                            <span className={`text-[8px] uppercase tracking-tighter ${editAllocation.writerCrew.includes(crew.name) ? 'text-blue-100' : 'text-slate-400'}`}>ID: {crew.employeeId}</span>
                          </div>
                          {editAllocation.writerCrew.includes(crew.name) && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fleet Assignment</label>
                    <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-1 focus:ring-blue-500 outline-none" value={editAllocation.vehicle} onChange={e => setEditAllocation({...editAllocation, vehicle: e.target.value})}>
                       <option value="">Choose Vehicle...</option>
                       {vehicles.map(v => <option key={v.id} value={v.name}>{v.name} ({v.plate})</option>)}
                    </select>
                 </div>
                 
                 <div className="pt-6 flex gap-4 shrink-0 mt-auto">
                   <button type="button" onClick={() => setShowAllocationModal(null)} className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 text-[11px] uppercase tracking-widest">Discard</button>
                   <button type="submit" className="flex-1 py-4 font-bold bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all text-[11px] uppercase tracking-widest">Finalize Allocation</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* New Job Modal (unchanged styling) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-3xl shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh] border border-slate-200 overflow-hidden">
            <div className="p-8 border-b flex justify-between items-center bg-white shrink-0">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center rotate-45 transform">
                    <span className="text-white font-black text-lg -rotate-45">W</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight uppercase">Submit Allocation Request</h3>
               </div>
               <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Job No. *</label>
                  <input required type="text" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-1 focus:ring-blue-500 outline-none" value={newJob.id} onChange={e => setNewJob({...newJob, id: e.target.value})} placeholder="AE-XXXX" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Shipper Name *</label>
                  <input required type="text" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-1 focus:ring-blue-500 outline-none" value={newJob.shipperName} onChange={e => setNewJob({...newJob, shipperName: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Type of Job *</label>
                   <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-1 focus:ring-blue-500 outline-none" value={newJob.mainCategory} onChange={e => setNewJob({...newJob, mainCategory: e.target.value as MainCategory, subCategory: getSubCategories(e.target.value as MainCategory)[0]})}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Specific Service</label>
                   <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-1 focus:ring-blue-500 outline-none" value={newJob.subCategory} onChange={e => setNewJob({...newJob, subCategory: e.target.value as SubCategory})}>
                    {getSubCategories(newJob.mainCategory as MainCategory).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Allocation Date</label>
                   <input required type="date" min={today} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-1 focus:ring-blue-500 outline-none" value={newJob.jobDate} onChange={e => setNewJob({...newJob, jobDate: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Timing</label>
                   <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-1 focus:ring-blue-500 outline-none" value={newJob.jobTime} onChange={e => setNewJob({...newJob, jobTime: e.target.value})}>
                    {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Location</label>
                  <input required type="text" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-1 focus:ring-blue-500 outline-none" value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Resource Requests</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { label: 'Handyman Service', key: 'handyman' },
                        { label: 'Extra Manpower', key: 'manpower' },
                        { label: 'Overtime Policy', key: 'overtime' },
                      ].map(({ label, key }) => (
                        <label key={key} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-white border border-transparent hover:border-slate-200 transition-all">
                          <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" checked={(newJob.specialRequests as any)?.[key]} onChange={e => setNewJob({...newJob, specialRequests: { ...newJob.specialRequests!, [key]: e.target.checked }})} />
                          <span className="text-[11px] font-bold text-slate-700">{label}</span>
                        </label>
                      ))}
                    </div>
                 </div>
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Documents Required</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { label: 'Main Documentation', key: 'documents' },
                        { label: 'Inventory / Packing List', key: 'packingList' },
                        { label: 'Export Crate Certificate', key: 'crateCertificate' },
                        { label: 'Walk-through Review', key: 'walkThrough' },
                      ].map(({ label, key }) => (
                        <label key={key} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-white border border-transparent hover:border-slate-200 transition-all">
                          <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" checked={(newJob.specialRequests as any)?.[key]} onChange={e => setNewJob({...newJob, specialRequests: { ...newJob.specialRequests!, [key]: e.target.checked }})} />
                          <span className="text-[11px] font-bold text-slate-700">{label}</span>
                        </label>
                      ))}
                    </div>
                 </div>
              </div>

              <div className="pt-6 flex gap-4 shrink-0">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all uppercase text-[10px] tracking-widest">Discard</button>
                <button type="submit" className="flex-1 py-4 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 uppercase text-[10px] tracking-widest">Authorize Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
