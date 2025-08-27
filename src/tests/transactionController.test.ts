import { TransactionController } from '../controllers/TransactionController';
import { TransactionModel } from '../models/Transaction';
import { CategoryModel } from '../models/Category';

// Mock de módulos
jest.mock('../models/Transaction');
jest.mock('../models/Category');

describe('TransactionController', () => {
  let transactionController: TransactionController;
  let mockRequest: any;
  let mockResponse: any;
  
  beforeEach(() => {
    transactionController = new TransactionController();
    
    // Configurar los mocks de request y response
    mockRequest = {
      user: { id: 'test-user-id' },
      body: {
        document_number: '12345',
        transaction_date: '2023-01-01',
        description: 'Test transaction',
        amount_net: 100,
        tax_amount: 19,
        amount_total: 119,
        category_id: 1,
        vendor_id: 1,
        payment_type_id: 1,
        status_id: 1,
        type: 'expense'
      },
      params: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Mock del modelo de categoría
    (CategoryModel.findById as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Test Category',
      type: 'expense'
    });
    
    // Mock de la creación de transacción
    (TransactionModel.create as jest.Mock).mockResolvedValue('test-transaction-id');
    
    // Mock de la búsqueda de transacción
    (TransactionModel.findById as jest.Mock).mockResolvedValue({
      id: 'test-transaction-id',
      ...mockRequest.body
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('createTransaction', () => {
    it('debería crear una transacción sin client_id', async () => {
      await transactionController.createTransaction(mockRequest, mockResponse);
      
      // Verificar que se llamó a status con 201
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      
      // Verificar que se llamó a TransactionModel.create con los datos correctos
      expect(TransactionModel.create).toHaveBeenCalledWith({
        document_number: Number(mockRequest.body.document_number),
        description: mockRequest.body.description,
        transaction_date: expect.any(Date),
        amount_net: Number(mockRequest.body.amount_net),
        tax_amount: Number(mockRequest.body.tax_amount),
        amount_total: Number(mockRequest.body.amount_total),
        category_id: Number(mockRequest.body.category_id),
        vendor_id: Number(mockRequest.body.vendor_id),
        payment_type_id: Number(mockRequest.body.payment_type_id),
        status_id: Number(mockRequest.body.status_id),
        user_id: mockRequest.user.id,
        type: mockRequest.body.type
      });
      
      // Verificar que client_id no está presente en los argumentos
      const createArgs = (TransactionModel.create as jest.Mock).mock.calls[0][0];
      expect(createArgs).not.toHaveProperty('client_id');
    });
    
    it('debería rechazar una transacción si faltan campos requeridos', async () => {
      // Eliminar un campo requerido
      mockRequest.body.document_number = undefined;
      
      await transactionController.createTransaction(mockRequest, mockResponse);
      
      // Verificar que se llamó a status con 400 (bad request)
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      
      // Verificar que no se llamó a TransactionModel.create
      expect(TransactionModel.create).not.toHaveBeenCalled();
    });
  });
  
  describe('updateTransaction', () => {
    beforeEach(() => {
      mockRequest.params.id = 'test-transaction-id';
      mockRequest.body = {
        description: 'Updated description',
        amount: 200,
        transaction_date: '2023-02-01'
      };
      
      (TransactionModel.update as jest.Mock).mockResolvedValue(true);
    });
    
    it('debería actualizar una transacción sin necesidad de client_id', async () => {
      await transactionController.updateTransaction(mockRequest, mockResponse);
      
      // Verificar que se llamó a TransactionModel.update
      expect(TransactionModel.update).toHaveBeenCalled();
      
      // Verificar que los datos de actualización no incluyen client_id
      const updateData = (TransactionModel.update as jest.Mock).mock.calls[0][2];
      expect(updateData).not.toHaveProperty('client_id');
      
      // Verificar que se devolvió la transacción actualizada
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });
});
