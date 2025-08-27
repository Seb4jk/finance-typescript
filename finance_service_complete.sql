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

-- Tabla de empresas (para soporte multi-empresa)
CREATE TABLE IF NOT EXISTS companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  tax_id VARCHAR(20) NOT NULL,
  address VARCHAR(255),
  city VARCHAR(50),
  country VARCHAR(50),
  phone VARCHAR(20),
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_company_tax_id (tax_id)
);

-- Tabla de asignación de compañías a usuarios
CREATE TABLE IF NOT EXISTS company_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  UNIQUE KEY unique_company_user (company_id, user_id)
);

-- Tabla de tipos de documentos
CREATE TABLE IF NOT EXISTS document_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(10) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  is_electronic BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_document_type_code (code)
);

-- Tabla de tasas de impuestos
CREATE TABLE IF NOT EXISTS tax_rates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  rate DECIMAL(5,2) NOT NULL,
  description VARCHAR(255),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_tax_rate_name (name)
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
  document_type_id INT NOT NULL,
  transaction_date DATE NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount_net DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL,
  tax_rate_id INT,
  amount_total DECIMAL(10,2) NOT NULL,
  category_id INT NOT NULL,
  vendor_id INT NOT NULL,
  payment_type_id INT NOT NULL,
  status_id INT NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  company_id INT,
  type ENUM('income', 'expense') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE RESTRICT,
  FOREIGN KEY (payment_type_id) REFERENCES payment_types(id) ON DELETE RESTRICT,
  FOREIGN KEY (status_id) REFERENCES status(id) ON DELETE RESTRICT,
  FOREIGN KEY (document_type_id) REFERENCES document_types(id) ON DELETE RESTRICT,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT,
  FOREIGN KEY (tax_rate_id) REFERENCES tax_rates(id) ON DELETE RESTRICT,
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

-- Insertar tipos de documentos predeterminados para Chile
INSERT INTO document_types (code, name, description, is_electronic) VALUES
('33', 'Factura Electrónica', 'Documento tributario electrónico para ventas con IVA', true),
('34', 'Factura Exenta Electrónica', 'Documento tributario electrónico para ventas sin IVA', true),
('39', 'Boleta Electrónica', 'Boleta para consumidor final electrónica', true),
('56', 'Nota de Débito Electrónica', 'Documento para aumentar el valor de una factura', true),
('61', 'Nota de Crédito Electrónica', 'Documento para reducir el valor de una factura', true),
('30', 'Factura', 'Factura tradicional en papel', false),
('35', 'Boleta', 'Boleta tradicional en papel', false),
('71', 'Boleta de Honorarios', 'Documento para servicios profesionales', false),
('73', 'Boleta de Honorarios Electrónica', 'Documento electrónico para servicios profesionales', true);

-- Insertar tasas de impuestos predeterminadas
INSERT INTO tax_rates (name, rate, description, is_default) VALUES
('IVA 19%', 19.00, 'Impuesto al valor agregado estándar de Chile', true),
('Exento', 0.00, 'Productos o servicios exentos de IVA', false),
('IVA Reducido', 10.00, 'Tasa reducida para ciertos productos o servicios', false),
('Retención 10%', 10.00, 'Retención para boletas de honorarios', false);

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
