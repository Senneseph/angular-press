export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'administrator' | 'editor' | 'author' | 'subscriber';
  capabilities: string[];
  meta: Record<string, any>;
  avatar?: string;
  registeredDate: Date;
  lastLogin?: Date;
  status: 'active' | 'inactive';
}