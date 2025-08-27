import { CategoryController } from '../controllers/CategoryController';
import { CategoryModel } from '../models/Category';

// Mock de las dependencias
jest.mock('../models/Category');

describe('CategoryController', () => {
  let categoryController: CategoryController;
  let mockRequest: any;
  let mockResponse: any;
  
  beforeEach(() => {
    categoryController = new CategoryController();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock para request y response
    mockRequest = {
      user: { id: 'test-user-id' },
      body: {
        name: 'Categoría Test',
        description: 'Descripción de prueba',
        type: 'expense'
      },
      params: {},
      query: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
  });
  
  describe('createCategory', () => {
    test('debería crear una categoría con datos válidos', async () => {
      // Configurar mocks
      (CategoryModel.findByName as jest.Mock).mockResolvedValue(null);
      (CategoryModel.create as jest.Mock).mockResolvedValue(1);
      (CategoryModel.findById as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Categoría Test',
        description: 'Descripción de prueba',
        type: 'expense',
        is_default: false
      });
      
      // Ejecutar el método
      await categoryController.createCategory(mockRequest, mockResponse);
      
      // Verificaciones
      expect(CategoryModel.findByName).toHaveBeenCalledWith('Categoría Test', 'expense');
      expect(CategoryModel.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Categoría Test',
        description: 'Descripción de prueba',
        type: 'expense',
        is_default: false
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        name: 'Categoría Test',
        type: 'expense'
      }));
    });
    
    test('debería rechazar una categoría con nombre duplicado', async () => {
      // Configurar mocks para nombre duplicado
      (CategoryModel.findByName as jest.Mock).mockResolvedValue({
        id: 2,
        name: 'Categoría Test',
        description: 'Otra descripción',
        type: 'expense',
        is_default: false
      });
      
      // Ejecutar el método
      await categoryController.createCategory(mockRequest, mockResponse);
      
      // Verificaciones
      expect(CategoryModel.findByName).toHaveBeenCalledWith('Categoría Test', 'expense');
      expect(CategoryModel.create).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Ya existe una categoría con ese nombre para este tipo'
      }));
    });
    
    test('debería rechazar una categoría sin nombre', async () => {
      // Configurar mock sin nombre
      mockRequest.body.name = undefined;
      
      // Ejecutar el método
      await categoryController.createCategory(mockRequest, mockResponse);
      
      // Verificaciones
      expect(CategoryModel.findByName).not.toHaveBeenCalled();
      expect(CategoryModel.create).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Nombre y tipo son requeridos')
      }));
    });
    
    test('debería rechazar una categoría sin tipo', async () => {
      // Configurar mock sin tipo
      mockRequest.body.type = undefined;
      
      // Ejecutar el método
      await categoryController.createCategory(mockRequest, mockResponse);
      
      // Verificaciones
      expect(CategoryModel.findByName).not.toHaveBeenCalled();
      expect(CategoryModel.create).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Nombre y tipo son requeridos')
      }));
    });
    
    test('debería rechazar una categoría con tipo inválido', async () => {
      // Configurar mock con tipo inválido
      mockRequest.body.type = 'invalid';
      
      // Ejecutar el método
      await categoryController.createCategory(mockRequest, mockResponse);
      
      // Verificaciones
      expect(CategoryModel.findByName).not.toHaveBeenCalled();
      expect(CategoryModel.create).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Nombre y tipo son requeridos')
      }));
    });
  });
  
  describe('updateCategory', () => {
    test('debería actualizar una categoría con datos válidos', async () => {
      // Configurar mocks para actualización
      mockRequest.params.id = '1';
      (CategoryModel.findById as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Categoría Original',
        type: 'expense',
        is_default: false
      });
      (CategoryModel.update as jest.Mock).mockResolvedValue(true);
      (CategoryModel.findById as jest.Mock).mockResolvedValueOnce({
        id: 1,
        name: 'Categoría Original',
        type: 'expense',
        is_default: false
      }).mockResolvedValueOnce({
        id: 1,
        name: 'Categoría Test',
        description: 'Descripción de prueba',
        type: 'expense',
        is_default: false
      });
      
      // Ejecutar el método
      await categoryController.updateCategory(mockRequest, mockResponse);
      
      // Verificaciones
      expect(CategoryModel.update).toHaveBeenCalledWith(1, expect.objectContaining({
        name: 'Categoría Test',
        description: 'Descripción de prueba'
      }));
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        name: 'Categoría Test',
        description: 'Descripción de prueba'
      }));
    });
    
    test('debería rechazar la actualización de una categoría predeterminada', async () => {
      // Configurar mocks para categoría predeterminada
      mockRequest.params.id = '1';
      (CategoryModel.findById as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Categoría Predeterminada',
        type: 'expense',
        is_default: true
      });
      
      // Ejecutar el método
      await categoryController.updateCategory(mockRequest, mockResponse);
      
      // Verificaciones
      expect(CategoryModel.update).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'No puedes modificar categorías predeterminadas'
      });
    });
  });
});
