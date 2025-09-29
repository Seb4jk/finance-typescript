import { Request, Response } from 'express';
import { DocumentTypeModel } from '../models/DocumentType';

export class DocumentTypeController {
  // Get all document types
  static async getDocumentTypes(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const documentTypes = await DocumentTypeModel.findAll();
      
      res.status(200).json({
        success: true,
        data: documentTypes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los tipos de documento'
      });
    }
  }

  // Get document type by ID
  static async getDocumentTypeById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        res.status(400).json({
          success: false,
          message: 'ID de tipo de documento inválido'
        });
        return;
      }
      
      const documentType = await DocumentTypeModel.findById(Number(id));
      
      if (!documentType) {
        res.status(404).json({
          success: false,
          message: 'Tipo de documento no encontrado'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: documentType
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener el tipo de documento'
      });
    }
  }

  // Create document type
  static async createDocumentType(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const { code, name, description, is_electronic } = req.body;
      
      if (!code || !name) {
        res.status(400).json({
          success: false,
          message: 'Código y nombre son obligatorios'
        });
        return;
      }

      // Verificar si ya existe un tipo de documento con el mismo código
      const existingDocumentType = await DocumentTypeModel.findByCode(code);
      if (existingDocumentType) {
        res.status(409).json({
          success: false,
          message: 'Ya existe un tipo de documento con este código'
        });
        return;
      }
      
      const documentTypeId = await DocumentTypeModel.create({
        code,
        name,
        description: description || null,
        is_electronic: is_electronic || false
      });
      
      res.status(201).json({
        success: true,
        data: { id: documentTypeId }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear el tipo de documento'
      });
    }
  }

  // Update document type
  static async updateDocumentType(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const { id } = req.params;
      const { code, name, description, is_electronic } = req.body;
      
      if (isNaN(Number(id))) {
        res.status(400).json({
          success: false,
          message: 'ID de tipo de documento inválido'
        });
        return;
      }

      // Verificar que el tipo de documento existe
      const existingDocumentType = await DocumentTypeModel.findById(Number(id));
      if (!existingDocumentType) {
        res.status(404).json({
          success: false,
          message: 'Tipo de documento no encontrado'
        });
        return;
      }

      // Si se modifica el código, verificar que no exista otro con el mismo código
      if (code && code !== existingDocumentType.code) {
        const duplicateDocumentType = await DocumentTypeModel.findByCode(code);
        if (duplicateDocumentType) {
          res.status(409).json({
            success: false,
            message: 'Ya existe un tipo de documento con este código'
          });
          return;
        }
      }
      
      const updated = await DocumentTypeModel.update(Number(id), {
        code,
        name,
        description,
        is_electronic
      });
      
      if (!updated) {
        res.status(400).json({
          success: false,
          message: 'No se pudo actualizar el tipo de documento'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Tipo de documento actualizado exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el tipo de documento'
      });
    }
  }

  // Delete document type
  static async deleteDocumentType(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        res.status(400).json({
          success: false,
          message: 'ID de tipo de documento inválido'
        });
        return;
      }

      // Verificar que el tipo de documento existe
      const existingDocumentType = await DocumentTypeModel.findById(Number(id));
      if (!existingDocumentType) {
        res.status(404).json({
          success: false,
          message: 'Tipo de documento no encontrado'
        });
        return;
      }
      
      const deleted = await DocumentTypeModel.delete(Number(id));
      
      if (!deleted) {
        res.status(400).json({
          success: false,
          message: 'No se pudo eliminar el tipo de documento'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Tipo de documento eliminado exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el tipo de documento'
      });
    }
  }
}
