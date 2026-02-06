// src/types/index.ts

export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'CUSTOMER';

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName?: string;
  lastName?: string;
}

export interface Customer {
  id: string;
  companyName?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  addresses: Address[];
  isActive: boolean;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  zipCode: string;
  type: 'BILLING' | 'service';
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  priceNet: number;
  unit: string;
  billingType: 'FIXED' | 'HOURLY' | 'QM'; // NEU
  checklist: string[];
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  personnelNumber: string;
  role: string; // Job Titel (z.B. "Reinigungskraft")
  hourlyWage: number;
  userId?: string;
}

// WICHTIG: Das neue Job-Modell für das Dashboard
export interface Job {
  id: string;
  scheduledDate: string; // ISO Date String
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  customer: Customer;
  address: Address;
  service: Service;
  
  // Frontend-Helper für Mitarbeiter-Ansicht
  assignmentId?: string; // Die ID meiner Zuweisung
  myStatus?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  startedAt?: string;
  finishedAt?: string;
  actualDurationMinutes?: number; 
  
  proofs?: JobProof[];
}

export interface JobProof {
  id: string;
  url: string;
  type: 'PHOTO' | 'SIGNATURE';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'REMINDER_1' | 'REMINDER_2' | 'CANCELLED';
  totalNet: number;
  totalGross: number;
  customer: Customer;
  isLocked: boolean; // GoBD Lock
  filePath?: string;
}

export interface Contract {
  isSigned: any;
  address: any;
  id: string;
  interval: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'ONCE';
  startDate: string;
  nextExecutionDate: string;
  isActive: boolean;
  service: Service;
  customer: Customer;
}