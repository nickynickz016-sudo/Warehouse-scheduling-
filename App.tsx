
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ScheduleView } from './components/ScheduleView';
import { ApprovalQueue } from './components/ApprovalQueue';
import { AIPlanner } from './components/AIPlanner';
import { WarehouseActivity } from './components/WarehouseActivity';
import { ImportClearance } from './components/ImportClearance';
import { ResourceManager } from './components/ResourceManager';
import { CapacityManager } from './components/CapacityManager';
import { UserManagement } from './components/UserManagement';
import { UserRole, Job, JobStatus, UserProfile, Personnel, Vehicle, SystemSettings } from './types';
import { Bell, Search, Menu } from 'lucide-react';

const INITIAL_USERS: UserProfile[] = [
  { id: '1', employeeId: 'ADM-001', name: 'Admin Controller', role: UserRole.ADMIN, avatar: 'https://picsum.photos/seed/writer-admin/100', status: 'Active' },
  { id: '2', employeeId: 'USR-001', name: 'Writer User 1', role: UserRole.USER, avatar: 'https://picsum.photos/seed/wu1/100', status: 'Active' },
  { id: '3', employeeId: 'USR-002', name: 'Writer User 2', role: UserRole.USER, avatar: 'https://picsum.photos/seed/wu2/100', status: 'Active' },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'schedule' | 'approvals' | 'ai' | 'warehouse' | 'import-clearance' | 'resources' | 'capacity' | 'users'>('dashboard');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [systemUsers, setSystemUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [personnel, setPersonnel] = useState<Personnel[]>([
    { id: 'p1', employeeId: 'EMP-101', name: 'Ahmed Khan', type: 'Team Leader', emiratesId: '784-1980-1234567-1', status: 'Available' },
    { id: 'p2', employeeId: 'EMP-202', name: 'Suresh Kumar', type: 'Writer Crew', emiratesId: '784-1992-7654321-2', status: 'Available' },
    { id: 'p3', employeeId: 'EMP-203', name: 'John Doe', type: 'Writer Crew', emiratesId: '784-1995-1212121-3', status: 'Available' },
    { id: 'p4', employeeId: 'EMP-104', name: 'Zeeshan Ali', type: 'Team Leader', emiratesId: '784-1988-3333333-4', status: 'Available' },
  ]);
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: 'v1', name: 'Truck 01', plate: 'DXB-10244', status: 'Available' },
    { id: 'v2', name: 'Van 04', plate: 'SHJ-44599', status: 'Maintenance' },
    { id: 'v3', name: 'Lorry 09', plate: 'AUH-99881', status: 'Available' },
  ]);
  
  const [settings, setSettings] = useState<SystemSettings>({
    dailyJobLimits: { [new Date().toISOString().split('T')[0]]: 10 },
    holidays: []
  });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const initialJobs: Job[] = [
      {
        id: 'AE-9001',
        title: 'AE-9001',
        shipperName: 'Writer Relocations HQ',
        location: 'Dubai South',
        shipmentDetails: 'Office Equipment',
        description: 'Internal HQ move',
        priority: 'MEDIUM',
        agentName: 'Internal',
        loadingType: 'Warehouse Removal',
        mainCategory: 'Corporate',
        subCategory: 'Export',
        shuttle: 'No',
        longCarry: 'No',
        specialRequests: { 
          handyman: true, manpower: true, overtime: false,
          documents: true, packingList: true, crateCertificate: false, walkThrough: false 
        },
        volumeCBM: 20,
        jobTime: '08:00',
        jobDate: today,
        status: JobStatus.ACTIVE,
        createdAt: Date.now(),
        requesterId: '2',
        assignedTo: 'Team Alpha',
        teamLeader: 'Ahmed Khan',
        writerCrew: ['Suresh Kumar', 'John Doe'],
        vehicle: 'Truck 01',
        isLocked: false
      }
    ];
    setJobs(initialJobs);
  }, []);

  const handleAddJob = (job: Partial<Job>) => {
    const date = job.jobDate || new Date().toISOString().split('T')[0];
    
    // Check if holiday
    if (settings.holidays.includes(date)) {
      alert("Cannot schedule jobs on a public holiday.");
      return;
    }

    const limit = settings.dailyJobLimits[date] ?? 5;
    const currentOnDate = jobs.filter(j => j.jobDate === date && j.status !== JobStatus.REJECTED);

    if (currentOnDate.length >= limit) {
      alert(`Daily limit of ${limit} reached for ${date}. Contact Admin to increase capacity.`);
      return;
    }

    const newJob: Job = {
      ...job,
      id: job.id || `AE-${Math.floor(1000 + Math.random() * 9000)}`,
      title: job.id || 'N/A',
      status: currentUser.role === UserRole.ADMIN ? JobStatus.ACTIVE : JobStatus.PENDING_ADD,
      createdAt: Date.now(),
      requesterId: currentUser.id,
      assignedTo: job.assignedTo || 'Unassigned',
      priority: job.priority || 'LOW',
      description: job.description || 'N/A',
      shipmentDetails: job.shipmentDetails || 'N/A',
      jobDate: date,
      isLocked: false,
    } as Job;
    setJobs(prev => [newJob, ...prev]);
  };

  const handleUpdateJobAllocation = (jobId: string, allocation: { teamLeader: string, vehicle: string, writerCrew: string[] }) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, ...allocation } : j));
  };

  const handleToggleLock = (jobId: string) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, isLocked: !j.isLocked } : j));
  };

  const handleDeleteJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job?.isLocked && currentUser.role !== UserRole.ADMIN) {
      alert("This job is locked and cannot be removed.");
      return;
    }

    if (currentUser.role === UserRole.ADMIN) {
      setJobs(prev => prev.filter(j => j.id !== jobId));
    } else {
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: JobStatus.PENDING_DELETE } : j));
    }
  };

  const handleApproval = (jobId: string, approved: boolean, allocation?: { teamLeader: string, vehicle: string, writerCrew: string[] }) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        if (j.status === JobStatus.PENDING_ADD) {
          return approved ? { ...j, status: JobStatus.ACTIVE, ...allocation } : { ...j, status: JobStatus.REJECTED };
        }
        if (j.status === JobStatus.PENDING_DELETE) {
          return approved ? null : { ...j, status: JobStatus.ACTIVE };
        }
      }
      return j;
    }).filter((j): j is Job => j !== null));
  };

  const handleSetLimit = (date: string, limit: number) => {
    setSettings(prev => ({
      ...prev,
      dailyJobLimits: { ...prev.dailyJobLimits, [date]: limit }
    }));
  };

  const handleToggleHoliday = (date: string) => {
    setSettings(prev => {
      const isHoliday = prev.holidays.includes(date);
      const newHolidays = isHoliday 
        ? prev.holidays.filter(h => h !== date)
        : [...prev.holidays, date];
      
      const newLimits = { ...prev.dailyJobLimits };
      if (!isHoliday) {
        newLimits[date] = 0; // Set to 0 if marked as holiday
      } else {
        newLimits[date] = 10; // Default back if unmarked
      }

      return {
        ...prev,
        holidays: newHolidays,
        dailyJobLimits: newLimits
      };
    });
  };

  const handleDeletePersonnel = (id: string) => {
    setPersonnel(prev => prev.filter(p => p.id !== id));
  };

  const handleDeleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  const handleUpdateUserStatus = (id: string, status: 'Active' | 'Disabled') => {
    setSystemUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
  };

  const handleAddSystemUser = (newUser: Omit<UserProfile, 'id'>) => {
    const user: UserProfile = { ...newUser, id: `u-${Date.now()}` };
    setSystemUsers(prev => [...prev, user]);
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isAdmin={currentUser.role === UserRole.ADMIN} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 border-b bg-white flex items-center justify-between px-10 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-200"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-8">
              <h1 className="font-bold text-xl text-slate-800 tracking-tight uppercase border-r pr-8 border-slate-200 hidden sm:block">Operations Central</h1>
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none">
                  {currentUser.role} CHANNEL SECURE
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 w-64 group focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500" />
              <input type="text" placeholder="Global job search..." className="bg-transparent border-none outline-none text-xs ml-3 w-full font-medium" />
            </div>

            <div className="relative group cursor-pointer p-2.5 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-200">
              <Bell className="w-5 h-5 text-slate-500" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm"></span>
            </div>

            <div className="flex items-center gap-5 pl-8 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-none mb-1.5">{currentUser.name}</p>
                <select 
                  className="text-[10px] text-blue-600 font-black bg-transparent border-none p-0 cursor-pointer outline-none hover:text-blue-700 transition-colors uppercase tracking-widest"
                  onChange={(e) => {
                    const selected = systemUsers.find(u => u.name === e.target.value);
                    if (selected) {
                      if (selected.status === 'Disabled') {
                        alert("Account is disabled. Contact Admin.");
                        return;
                      }
                      setCurrentUser(selected);
                    }
                  }}
                  value={currentUser.name}
                >
                  {systemUsers.map(u => <option key={u.id} value={u.name} disabled={u.status === 'Disabled'}>{u.name} {u.status === 'Disabled' ? '(Disabled)' : ''}</option>)}
                </select>
              </div>
              <img src={currentUser.avatar} className="w-11 h-11 rounded-2xl border-2 border-slate-100 shadow-md transition-transform hover:scale-105" alt="User" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 lg:p-12 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1600px] mx-auto pb-12">
            {activeTab === 'dashboard' && <Dashboard jobs={jobs} settings={settings} onSetLimit={handleSetLimit} isAdmin={currentUser.role === UserRole.ADMIN} />}
            {activeTab === 'schedule' && (
              <ScheduleView 
                jobs={jobs} 
                onAddJob={handleAddJob} 
                onDeleteJob={handleDeleteJob}
                onUpdateAllocation={handleUpdateJobAllocation}
                onToggleLock={handleToggleLock}
                currentUser={currentUser}
                personnel={personnel}
                vehicles={vehicles}
              />
            )}
            {activeTab === 'warehouse' && (
              <WarehouseActivity 
                jobs={jobs} 
                onAddJob={handleAddJob} 
                onDeleteJob={handleDeleteJob}
                currentUser={currentUser}
              />
            )}
            {activeTab === 'import-clearance' && (
              <ImportClearance 
                jobs={jobs} 
                onAddJob={handleAddJob} 
                onDeleteJob={handleDeleteJob}
                currentUser={currentUser}
              />
            )}
            {activeTab === 'approvals' && (
              <ApprovalQueue 
                jobs={jobs} 
                onApproval={handleApproval}
                isAdmin={currentUser.role === UserRole.ADMIN}
                personnel={personnel}
                vehicles={vehicles}
              />
            )}
            {activeTab === 'resources' && (
              <ResourceManager 
                personnel={personnel}
                setPersonnel={setPersonnel}
                vehicles={vehicles}
                setVehicles={setVehicles}
                isAdmin={currentUser.role === UserRole.ADMIN}
                onDeletePersonnel={handleDeletePersonnel}
                onDeleteVehicle={handleDeleteVehicle}
              />
            )}
            {activeTab === 'capacity' && (
              <CapacityManager 
                settings={settings}
                onSetLimit={handleSetLimit}
                onToggleHoliday={handleToggleHoliday}
                isAdmin={currentUser.role === UserRole.ADMIN}
              />
            )}
            {activeTab === 'users' && (
              <UserManagement 
                users={systemUsers}
                onAddUser={handleAddSystemUser}
                onUpdateStatus={handleUpdateUserStatus}
                isAdmin={currentUser.role === UserRole.ADMIN}
              />
            )}
            {activeTab === 'ai' && <AIPlanner jobs={jobs} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
