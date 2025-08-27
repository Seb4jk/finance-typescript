-- Script completo para base de datos finance_service
-- Creación de la base de datos
CREATE DATABASE IF NOT EXISTS finance_service;
USE finance_service;

-- Status Table (Estados)
CREATE TABLE IF NOT EXISTS status (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_status_name (name)
);

-- Payment Types Table (Tipos de Pago)
CREATE TABLE IF NOT EXISTS payment_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_payment_type_name (name)
);

-- Clients Table (Clientes)
CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  tax_id VARCHAR(20) NOT NULL,
  contact_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(50) NOT NULL,
  country VARCHAR(50) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  notes TEXT NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_client_tax_id (tax_id)
);

-- Vendors Table (Proveedores)
CREATE TABLE IF NOT EXISTS vendors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  tax_id VARCHAR(20) NOT NULL,
  contact_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(50) NOT NULL,
  country VARCHAR(50) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  notes TEXT NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_vendor_tax_id (tax_id)
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_category_name_per_type (name, type)
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(36) PRIMARY KEY,
  document_number INT NOT NULL,
  transaction_date DATE NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount_net DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL,
  amount_total DECIMAL(10,2) NOT NULL,
  category_id INT NOT NULL,
  vendor_id INT NOT NULL,
  payment_type_id INT NOT NULL,
  status_id INT NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE RESTRICT,
  FOREIGN KEY (payment_type_id) REFERENCES payment_types(id) ON DELETE RESTRICT,
  FOREIGN KEY (status_id) REFERENCES status(id) ON DELETE RESTRICT,
  UNIQUE KEY unique_document_number (document_number)
);

-- Insert default status
INSERT INTO status (name, description) VALUES
('Pendiente', 'Transacción pendiente de procesamiento'),
('Aprobado', 'Transacción aprobada'),
('Rechazado', 'Transacción rechazada'),
('Pagado', 'Pago completado'),
('Anulado', 'Transacción anulada');

-- Insert default payment types
INSERT INTO payment_types (name, description) VALUES
('Efectivo', 'Pago en efectivo'),
('Tarjeta de Crédito', 'Pago con tarjeta de crédito'),
('Tarjeta de Débito', 'Pago con tarjeta de débito'),
('Transferencia', 'Transferencia bancaria'),
('Cheque', 'Pago con cheque');

-- Insert default categories
INSERT INTO categories (name, description, type, is_default) VALUES
('Inversiones', 'Ingresos por inversiones', 'income', true),
('Regalos', 'Dinero recibido como obsequios', 'income', true),
('Ventas', 'Ingresos por ventas de productos o servicios', 'income', true),
('Otros Ingresos', 'Otras fuentes de ingresos', 'income', true),
('Vivienda', 'Alquiler, hipoteca, reparaciones, etc.', 'expense', true),
('Alimentación', 'Comestibles y salidas a restaurantes', 'expense', true),
('Transporte', 'Pagos de coche, gasolina, transporte público', 'expense', true),
('Entretenimiento', 'Películas, juegos, hobbies', 'expense', true),
('Salud', 'Facturas médicas y seguros', 'expense', true),
('Educación', 'Matrícula, libros, cursos', 'expense', true),
('Servicios', 'Electricidad, agua, internet', 'expense', true),
('Compras', 'Ropa, electrónica, etc.', 'expense', true),
('Suministros', 'Material de oficina y suministros', 'expense', true),
('Impuestos', 'Pagos de impuestos', 'expense', true),
('Otros Gastos', 'Gastos diversos', 'expense', true);
