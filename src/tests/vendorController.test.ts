import { VendorController } from '../controllers/VendorController';
import { VendorModel } from '../models/Vendor';
import { validateAndFormatRut } from '../utils/rutValidator';

// Mock de las dependencias
jest.mock('../models/Vendor');
jest.mock('../utils/rutValidator');

describe('VendorController', () => {
  let vendorController: VendorController;
  let mockRequest: any;
  let mockResponse: any;
  
  beforeEach(() => {
    vendorController = new VendorController();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock para request y response
    mockRequest = {
      user: { id: 'test-user-id' },
      body: {
        name: 'Proveedor Test',
        tax_id: '12345678-9',
        contact_name: 'Contacto Test',
        email: 'test@example.com',
        phone: '123456789',
        address: 'Dirección Test',
        city: 'Ciudad Test',
        country: 'Chile',
        industry: 'Tecnología'
      },
      params: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
  });
  
  describe('createVendor', () => {
    test('debería crear un vendor con un RUT válido', async () => {
      // Configurar mocks
      (validateAndFormatRut as jest.Mock).mockReturnValue('12.345.678-9');
      (VendorModel.findByTaxId as jest.Mock).mockResolvedValue(null);
      (VendorModel.create as jest.Mock).mockResolvedValue(1);
      (VendorModel.findById as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Proveedor Test',
        tax_id: '12.345.678-9',
        user_id: 'test-user-id'
      });
      
      // Ejecutar el método
      await vendorController.createVendor(mockRequest, mockResponse);
      
      // Verificaciones
      expect(validateAndFormatRut).toHaveBeenCalledWith('12345678-9');
      expect(VendorModel.findByTaxId).toHaveBeenCalledWith('12.345.678-9');
      expect(VendorModel.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Proveedor Test',
        tax_id: '12.345.678-9',
        user_id: 'test-user-id'
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        name: 'Proveedor Test',
        tax_id: '12.345.678-9'
      }));
    });
    
    test('debería rechazar un vendor con RUT duplicado', async () => {
      // Configurar mocks para RUT duplicado
      (validateAndFormatRut as jest.Mock).mockReturnValue('12.345.678-9');
      (VendorModel.findByTaxId as jest.Mock).mockResolvedValue({
        id: 2,
        name: 'Proveedor Existente',
        tax_id: '12.345.678-9',
        user_id: 'test-user-id'
      });
      
      // Ejecutar el método
      await vendorController.createVendor(mockRequest, mockResponse);
      
      // Verificaciones
      expect(validateAndFormatRut).toHaveBeenCalledWith('12345678-9');
      expect(VendorModel.findByTaxId).toHaveBeenCalledWith('12.345.678-9');
      expect(VendorModel.create).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Ya existe un proveedor con este RUT'
      }));
    });
    
    test('debería rechazar un vendor con un RUT inválido', async () => {
      // Configurar mocks para RUT inválido
      mockRequest.body.tax_id = '99999999-9';
      (validateAndFormatRut as jest.Mock).mockReturnValue(null);
      
      // Ejecutar el método
      await vendorController.createVendor(mockRequest, mockResponse);
      
      // Verificaciones
      expect(validateAndFormatRut).toHaveBeenCalledWith('99999999-9');
      expect(VendorModel.create).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'El RUT proporcionado no es válido'
      });
    });
    
    test('debería rechazar un vendor sin RUT', async () => {
      // Configurar mock sin RUT
      mockRequest.body.tax_id = undefined;
      
      // Ejecutar el método
      await vendorController.createVendor(mockRequest, mockResponse);
      
      // Verificaciones
      expect(validateAndFormatRut).not.toHaveBeenCalled();
      expect(VendorModel.create).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'El RUT del proveedor es obligatorio'
      });
    });
  });
  
  describe('updateVendor', () => {
    test('debería actualizar un vendor con un RUT válido', async () => {
      // Configurar mocks para actualización
      mockRequest.params.id = '1';
      (validateAndFormatRut as jest.Mock).mockReturnValue('12.345.678-9');
      (VendorModel.findById as jest.Mock).mockResolvedValue({
        id: 1,
        user_id: 'test-user-id'
      });
      (VendorModel.update as jest.Mock).mockResolvedValue(true);
      (VendorModel.findById as jest.Mock).mockResolvedValueOnce({
        id: 1,
        user_id: 'test-user-id'
      }).mockResolvedValueOnce({
        id: 1,
        name: 'Proveedor Test',
        tax_id: '12.345.678-9',
        user_id: 'test-user-id'
      });
      
      // Ejecutar el método
      await vendorController.updateVendor(mockRequest, mockResponse);
      
      // Verificaciones
      expect(validateAndFormatRut).toHaveBeenCalledWith('12345678-9');
      expect(VendorModel.update).toHaveBeenCalledWith(1, 'test-user-id', expect.objectContaining({
        name: 'Proveedor Test',
        tax_id: '12.345.678-9'
      }));
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        name: 'Proveedor Test',
        tax_id: '12.345.678-9'
      }));
    });
    
    test('debería rechazar actualización con RUT inválido', async () => {
      // Configurar mocks para RUT inválido
      mockRequest.params.id = '1';
      mockRequest.body.tax_id = '99999999-9';
      (validateAndFormatRut as jest.Mock).mockReturnValue(null);
      
      // Ejecutar el método
      await vendorController.updateVendor(mockRequest, mockResponse);
      
      // Verificaciones
      expect(validateAndFormatRut).toHaveBeenCalledWith('99999999-9');
      expect(VendorModel.update).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'El RUT proporcionado no es válido'
      });
    });
  });
});
