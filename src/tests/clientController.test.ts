import { ClientController } from '../controllers/ClientController';
import { ClientModel } from '../models/Client';
import { validateAndFormatRut } from '../utils/rutValidator';

// Mock de las dependencias
jest.mock('../models/Client');
jest.mock('../utils/rutValidator');

describe('ClientController', () => {
  let clientController: ClientController;
  let mockRequest: any;
  let mockResponse: any;
  
  beforeEach(() => {
    clientController = new ClientController();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock para request y response
    mockRequest = {
      user: { id: 'test-user-id' },
      body: {
        name: 'Cliente Test',
        tax_id: '12345678-9',
        contact_name: 'Contacto Test',
        email: 'test@example.com',
        phone: '123456789',
        address: 'Dirección Test',
        city: 'Ciudad Test',
        country: 'Chile',
        industry: 'Tecnología',
        notes: 'Notas de prueba'
      },
      params: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
  });
  
  describe('createClient', () => {
    test('debería crear un cliente con un RUT válido', async () => {
      // Configurar mocks
      (validateAndFormatRut as jest.Mock).mockReturnValue('12.345.678-9');
      (ClientModel.findByTaxId as jest.Mock).mockResolvedValue(null);
      (ClientModel.create as jest.Mock).mockResolvedValue(1);
      (ClientModel.findById as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Cliente Test',
        tax_id: '12.345.678-9',
        user_id: 'test-user-id'
      });
      
      // Ejecutar el método
      await clientController.createClient(mockRequest, mockResponse);
      
      // Verificaciones
      expect(validateAndFormatRut).toHaveBeenCalledWith('12345678-9');
      expect(ClientModel.findByTaxId).toHaveBeenCalledWith('12.345.678-9');
      expect(ClientModel.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Cliente Test',
        tax_id: '12.345.678-9',
        user_id: 'test-user-id'
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        name: 'Cliente Test',
        tax_id: '12.345.678-9'
      }));
    });
    
    test('debería rechazar un cliente con RUT duplicado', async () => {
      // Configurar mocks para RUT duplicado
      (validateAndFormatRut as jest.Mock).mockReturnValue('12.345.678-9');
      (ClientModel.findByTaxId as jest.Mock).mockResolvedValue({
        id: 2,
        name: 'Cliente Existente',
        tax_id: '12.345.678-9',
        user_id: 'test-user-id'
      });
      
      // Ejecutar el método
      await clientController.createClient(mockRequest, mockResponse);
      
      // Verificaciones
      expect(validateAndFormatRut).toHaveBeenCalledWith('12345678-9');
      expect(ClientModel.findByTaxId).toHaveBeenCalledWith('12.345.678-9');
      expect(ClientModel.create).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Ya existe un cliente con este RUT'
      }));
    });
    
    test('debería rechazar un cliente con un RUT inválido', async () => {
      // Configurar mocks para RUT inválido
      mockRequest.body.tax_id = '99999999-9';
      (validateAndFormatRut as jest.Mock).mockReturnValue(null);
      
      // Ejecutar el método
      await clientController.createClient(mockRequest, mockResponse);
      
      // Verificaciones
      expect(validateAndFormatRut).toHaveBeenCalledWith('99999999-9');
      expect(ClientModel.create).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'El RUT proporcionado no es válido'
      });
    });
    
    test('debería rechazar un cliente sin RUT', async () => {
      // Configurar mock sin RUT
      mockRequest.body.tax_id = undefined;
      
      // Ejecutar el método
      await clientController.createClient(mockRequest, mockResponse);
      
      // Verificaciones
      expect(validateAndFormatRut).not.toHaveBeenCalled();
      expect(ClientModel.create).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'El RUT del cliente es obligatorio'
      });
    });
  });
  
  describe('updateClient', () => {
    test('debería actualizar un cliente con un RUT válido', async () => {
      // Configurar mocks para actualización
      mockRequest.params.id = '1';
      (validateAndFormatRut as jest.Mock).mockReturnValue('12.345.678-9');
      (ClientModel.findById as jest.Mock).mockResolvedValue({
        id: 1,
        user_id: 'test-user-id'
      });
      (ClientModel.update as jest.Mock).mockResolvedValue(true);
      (ClientModel.findById as jest.Mock).mockResolvedValueOnce({
        id: 1,
        user_id: 'test-user-id'
      }).mockResolvedValueOnce({
        id: 1,
        name: 'Cliente Test',
        tax_id: '12.345.678-9',
        user_id: 'test-user-id'
      });
      
      // Ejecutar el método
      await clientController.updateClient(mockRequest, mockResponse);
      
      // Verificaciones
      expect(validateAndFormatRut).toHaveBeenCalledWith('12345678-9');
      expect(ClientModel.update).toHaveBeenCalledWith(1, 'test-user-id', expect.objectContaining({
        name: 'Cliente Test',
        tax_id: '12.345.678-9'
      }));
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        name: 'Cliente Test',
        tax_id: '12.345.678-9'
      }));
    });
    
    test('debería rechazar actualización con RUT inválido', async () => {
      // Configurar mocks para RUT inválido
      mockRequest.params.id = '1';
      mockRequest.body.tax_id = '99999999-9';
      (validateAndFormatRut as jest.Mock).mockReturnValue(null);
      
      // Ejecutar el método
      await clientController.updateClient(mockRequest, mockResponse);
      
      // Verificaciones
      expect(validateAndFormatRut).toHaveBeenCalledWith('99999999-9');
      expect(ClientModel.update).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'El RUT proporcionado no es válido'
      });
    });
  });
});
