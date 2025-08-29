import { RowDataPacket } from 'mysql2';

export interface Status extends RowDataPacket {
  id: number;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface DocumentType extends RowDataPacket {
  id: number;
  code: string;
  name: string;
  description?: string;
  is_electronic: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TaxRate extends RowDataPacket {
  id: number;
  name: string;
  rate: number;
  description?: string;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Company extends RowDataPacket {
  id: number;
  name: string;
  tax_id: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CompanyUser extends RowDataPacket {
  id: number;
  company_id: number;
  user_id: string;
  is_admin: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PaymentType extends RowDataPacket {
  id: number;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Client extends RowDataPacket {
  id: number;
  name: string;
  tax_id?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  industry?: string;
  notes?: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Vendor extends RowDataPacket {
  id: number;
  name: string;
  tax_id?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  industry?: string;
  notes?: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Category extends RowDataPacket {
  id: number;
  name: string;
  description?: string;
  type: 'income' | 'expense';
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Transaction extends RowDataPacket {
  id: string;
  document_number: number;
  document_type_id: number;
  transaction_date: Date;
  description: string;
  amount_net: number;
  tax_amount: number;
  tax_rate_id?: number;
  amount_total: number;
  category_id: number;
  vendor_id: number;
  status_id: number;
  user_id: string;
  company_id?: number;
  type: 'income' | 'expense';
  created_at: Date;
  updated_at: Date;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: number;
  vendorId?: number;
  statusId?: number;
  documentTypeId?: number;
  taxRateId?: number;
  companyId?: number;
  type?: 'income' | 'expense';
  documentNumber?: string;
}
