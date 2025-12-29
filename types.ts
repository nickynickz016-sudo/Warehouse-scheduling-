
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum JobStatus {
  PENDING_ADD = 'PENDING_ADD',
  PENDING_DELETE = 'PENDING_DELETE',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

export type LoadingType = 'Warehouse Removal' | 'Storage' | 'Local Storage' | 'Direct Loading' | 'Delivery';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export type MainCategory = 'Commercial' | 'Agent' | 'Private' | 'Corporate';
export type SubCategory = 'Export' | 'Import' | 'Fine arts Installation';

export interface SpecialRequests {
  handyman: boolean;
  manpower: boolean;
  overtime: boolean;
  documents: boolean;
  packingList: boolean;
  crateCertificate: boolean;
  walkThrough: boolean;
}

export interface UserProfile {
  id: string;
  employeeId: string; // Mandatory
  name: string;
  role: UserRole;
  avatar: string;
  status: 'Active' | 'Disabled';
}

export interface Personnel {
  id: string;
  employeeId: string; // Mandatory
  name: string;
  type: 'Team Leader' | 'Writer Crew';
  status: 'Available' | 'Annual Leave' | 'Sick Leave' | 'Personal Leave';
  emiratesId: string; // Mandatory
}

export interface Vehicle {
  id: string;
  name: string;
  plate: string; // Mandatory
  status: 'Available' | 'Out of Service' | 'Maintenance';
}

export interface Job {
  id: string; // Job No.
  title: string;
  shipperName: string;
  location: string;
  shipmentDetails: string;
  description: string;
  priority: Priority;
  agentName: string;
  loadingType: LoadingType;
  mainCategory: MainCategory;
  subCategory: SubCategory;
  shuttle: 'Yes' | 'No';
  longCarry: 'Yes' | 'No';
  specialRequests: SpecialRequests;
  volumeCBM: number;
  jobTime: string;
  jobDate: string;
  status: JobStatus;
  createdAt: number;
  requesterId: string;
  assignedTo: string;
  isWarehouseActivity?: boolean;
  isImportClearance?: boolean;
  isLocked?: boolean;
  
  // Admin allocations
  teamLeader?: string;
  writerCrew?: string[];
  vehicle?: string;
}

export interface SystemSettings {
  dailyJobLimits: Record<string, number>; // date -> max jobs
  holidays: string[]; // array of ISO date strings (YYYY-MM-DD)
}
