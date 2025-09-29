import { Request, Response } from 'express';
import { CompanyModel } from '../models/Company';
import { validateRut } from '../utils/rutValidator';

export class CompanyController {
  // Get companies assigned to current user
  static async getUserAssignedCompanies(req: Request, res: Response): Promise<void> {
    try {
      // Verificar si el usuario está autenticado
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const companies = await CompanyModel.findAll(userId);
      
      res.status(200).json({
        success: true,
        data: companies
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener las compañías asignadas'
      });
    }
  }
  // Get all companies for the logged in user
  static async getCompanies(req: Request, res: Response): Promise<void> {
    try {
      // Verificar si el usuario está autenticado
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const companies = await CompanyModel.findAll(userId);
      
      res.status(200).json({
        success: true,
        data: companies
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener las compañías'
      });
    }
  }

  // Get company by ID
  static async getCompanyById(req: Request, res: Response): Promise<void> {
    try {
      // Verificar si el usuario está autenticado
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const { id } = req.params;
      
      // Validar que el ID sea un número
      if (isNaN(Number(id))) {
        res.status(400).json({
          success: false,
          message: 'ID de compañía inválido'
        });
        return;
      }
      
      const company = await CompanyModel.findById(Number(id));
      
      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Compañía no encontrada'
        });
        return;
      }
      
      // Verificar que el usuario tiene acceso a esta compañía
      const hasAccess = await CompanyModel.isUserAssigned(Number(id), userId);
      if (!hasAccess) {
        res.status(403).json({
          success: false,
          message: 'No tienes permiso para acceder a esta compañía'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: company
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener la compañía'
      });
    }
  }

  // Create new company
  static async createCompany(req: Request, res: Response): Promise<void> {
    try {
      // Verificar si el usuario está autenticado
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const { name, tax_id, address, city, country, phone, email } = req.body;
      
      // Validaciones básicas
      if (!name || !tax_id) {
        res.status(400).json({
          success: false,
          message: 'El nombre y el RUT son obligatorios'
        });
        return;
      }
      
      // Validar el RUT (si es de Chile)
      if (country === 'Chile' && !validateRut(tax_id)) {
        res.status(400).json({
          success: false,
          message: 'El RUT ingresado no es válido'
        });
        return;
      }
      
      // Verificar si ya existe una compañía con ese RUT
      const existingCompany = await CompanyModel.findByTaxId(tax_id);
      if (existingCompany) {
        res.status(400).json({
          success: false,
          message: 'Ya existe una compañía con ese RUT'
        });
        return;
      }
      
      // Crear la compañía
      const companyId = await CompanyModel.create({
        name,
        tax_id,
        address,
        city,
        country,
        phone,
        email
      });
      
      // Asignar la compañía al usuario como administrador
      await CompanyModel.addUser(companyId, userId, true);
      
      res.status(201).json({
        success: true,
        data: { id: companyId }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear la compañía'
      });
    }
  }

  // Update company
  static async updateCompany(req: Request, res: Response): Promise<void> {
    try {
      // Verificar si el usuario está autenticado
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const { id } = req.params;
      const { name, tax_id, address, city, country, phone, email } = req.body;
      
      // Validar que el ID sea un número
      if (isNaN(Number(id))) {
        res.status(400).json({
          success: false,
          message: 'ID de compañía inválido'
        });
        return;
      }
      
      // Verificar que la compañía existe
      const company = await CompanyModel.findById(Number(id));
      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Compañía no encontrada'
        });
        return;
      }
      
      // Verificar que el usuario es administrador de esta compañía
      const isAdmin = await CompanyModel.isUserAdmin(Number(id), userId);
      if (!isAdmin) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para actualizar esta compañía'
        });
        return;
      }
      
      // Si se modifica el RUT, validar el nuevo RUT
      if (tax_id && tax_id !== company.tax_id) {
        // Validar el RUT (si es de Chile)
        if (country === 'Chile' && !validateRut(tax_id)) {
          res.status(400).json({
            success: false,
            message: 'El RUT ingresado no es válido'
          });
          return;
        }
        
        // Verificar que no exista otra compañía con ese RUT
        const existingCompany = await CompanyModel.findByTaxId(tax_id);
        if (existingCompany && existingCompany.id !== Number(id)) {
          res.status(400).json({
            success: false,
            message: 'Ya existe otra compañía con ese RUT'
          });
          return;
        }
      }
      
      // Actualizar la compañía
      await CompanyModel.update(Number(id), {
        name,
        tax_id,
        address,
        city,
        country,
        phone,
        email
      });
      
      res.status(200).json({
        success: true,
        message: 'Compañía actualizada correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la compañía'
      });
    }
  }

  // Add user to company
  static async addUserToCompany(req: Request, res: Response): Promise<void> {
    try {
      // Verificar si el usuario está autenticado
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const { id } = req.params;
      const { user_id, is_admin } = req.body;
      
      // Validar que el ID sea un número
      if (isNaN(Number(id))) {
        res.status(400).json({
          success: false,
          message: 'ID de compañía inválido'
        });
        return;
      }
      
      // Verificar que la compañía existe
      const company = await CompanyModel.findById(Number(id));
      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Compañía no encontrada'
        });
        return;
      }
      
      // Verificar que el usuario es administrador de esta compañía
      const isAdmin = await CompanyModel.isUserAdmin(Number(id), userId);
      if (!isAdmin) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para agregar usuarios a esta compañía'
        });
        return;
      }
      
      // Verificar que se proporcionó un user_id válido
      if (!user_id) {
        res.status(400).json({
          success: false,
          message: 'El ID de usuario es obligatorio'
        });
        return;
      }
      
      // Verificar si el usuario ya está asignado a esta compañía
      const isAssigned = await CompanyModel.isUserAssigned(Number(id), user_id);
      if (isAssigned) {
        res.status(400).json({
          success: false,
          message: 'El usuario ya está asignado a esta compañía'
        });
        return;
      }
      
      // Agregar el usuario a la compañía
      await CompanyModel.addUser(Number(id), user_id, !!is_admin);
      
      res.status(200).json({
        success: true,
        message: 'Usuario agregado a la compañía correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al agregar usuario a la compañía'
      });
    }
  }

  // Remove user from company
  static async removeUserFromCompany(req: Request, res: Response): Promise<void> {
    try {
      // Verificar si el usuario está autenticado
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuario no autenticado' });
        return;
      }

      const { id, user_id } = req.params;
      
      // Validar que el ID sea un número
      if (isNaN(Number(id))) {
        res.status(400).json({
          success: false,
          message: 'ID de compañía inválido'
        });
        return;
      }
      
      // Verificar que la compañía existe
      const company = await CompanyModel.findById(Number(id));
      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Compañía no encontrada'
        });
        return;
      }
      
      // Verificar que el usuario es administrador de esta compañía
      const isAdmin = await CompanyModel.isUserAdmin(Number(id), userId);
      if (!isAdmin) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar usuarios de esta compañía'
        });
        return;
      }
      
      // No permitir eliminar al propio usuario si es el único administrador
      if (user_id === userId) {
        // Verificar si hay otros administradores
        // Esta verificación requeriría una consulta adicional en el modelo
        // Por simplificación, no se implementa aquí
      }
      
      // Eliminar al usuario de la compañía
      const result = await CompanyModel.removeUser(Number(id), user_id);
      
      if (!result) {
        res.status(404).json({
          success: false,
          message: 'El usuario no está asignado a esta compañía'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Usuario eliminado de la compañía correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar usuario de la compañía'
      });
    }
  }
}
