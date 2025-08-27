import { RowDataPacket } from 'mysql2';

export interface Status extends RowDataPacket {
  id: number;
  name: string;
  description?: string;
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
  transaction_date: Date;
  description: string;
  amount_net: number;
  tax_amount: number;
  amount_total: number;
  category_id: number;
  vendor_id: number;
  payment_type_id: number;
  status_id: number;
  user_id: string;
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
  paymentTypeId?: number;
  type?: 'income' | 'expense';
  documentNumber?: string;
}
