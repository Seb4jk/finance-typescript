import { Request, Response } from 'express';
import { ClientModel } from '../models/Client';
import { TokenPayload } from '../types/auth';
import { validateAndFormatRut } from '../utils/rutValidator';

export class ClientController {
  async createClient(req: Request, res: Response) {
    try {
      // Verificar autenticación
      const userId = (req.user as TokenPayload)?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { name, tax_id, contact_name, email, phone, address, city, country, industry, notes } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: 'El nombre del cliente es requerido' });
      }

      // Validar RUT chileno (obligatorio)
      if (!tax_id) {
        return res.status(400).json({ message: 'El RUT del cliente es obligatorio' });
      }
      
      // Validar y formatear el RUT
      const formattedTaxId = validateAndFormatRut(tax_id);
      
      if (!formattedTaxId) {
        return res.status(400).json({ message: 'El RUT proporcionado no es válido' });
      }
      
      // Verificar si ya existe un cliente con este RUT
      const existingClient = await ClientModel.findByTaxId(formattedTaxId);
      if (existingClient) {
        return res.status(409).json({ 
          message: 'Ya existe un cliente con este RUT', 
          existingClient 
        });
      }

      const clientId = await ClientModel.create({
        name,
        tax_id: formattedTaxId,
        contact_name,
        email,
        phone,
        address,
        city,
        country,
        industry,
        notes,
        user_id: userId
      });

      const client = await ClientModel.findById(clientId);
      
      return res.status(201).json(client);
    } catch (error: any) {
      console.error('Error creating client:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Ya existe un cliente con este RUT' });
      }
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async getClients(req: Request, res: Response) {
    try {
      // Verificar autenticación
      const userId = (req.user as TokenPayload)?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { name, industry, country, tax_id } = req.query;
      
      const clients = await ClientModel.findAll(userId, {
        name: name as string,
        industry: industry as string,
        country: country as string,
        tax_id: tax_id as string
      });
      
      return res.json(clients);
    } catch (error) {
      console.error('Error getting clients:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async getClientById(req: Request, res: Response) {
    try {
      // Verificar autenticación
      const userId = (req.user as TokenPayload)?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { id } = req.params;
      
      const client = await ClientModel.findById(Number(id));
      
      if (!client) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
      }
      
      if (client.user_id !== userId) {
        return res.status(403).json({ message: 'No tienes permiso para ver este cliente' });
      }
      
      return res.json(client);
    } catch (error) {
      console.error('Error getting client:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async updateClient(req: Request, res: Response) {
    try {
      // Verificar autenticación
      const userId = (req.user as TokenPayload)?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { id } = req.params;
      const { name, tax_id, contact_name, email, phone, address, city, country, industry, notes } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: 'El nombre del cliente es requerido' });
      }

      // Validar RUT chileno (obligatorio)
      if (!tax_id) {
        return res.status(400).json({ message: 'El RUT del cliente es obligatorio' });
      }
      
      // Validar y formatear el RUT
      const formattedTaxId = validateAndFormatRut(tax_id);
      
      if (!formattedTaxId) {
        return res.status(400).json({ message: 'El RUT proporcionado no es válido' });
      }
      
      const client = await ClientModel.findById(Number(id));
      
      if (!client) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
      }
      
      if (client.user_id !== userId) {
        return res.status(403).json({ message: 'No tienes permiso para editar este cliente' });
      }

      const updated = await ClientModel.update(Number(id), userId, {
        name,
        tax_id: formattedTaxId,
        contact_name,
        email,
        phone,
        address,
        city,
        country,
        industry,
        notes
      });
      
      if (!updated) {
        return res.status(400).json({ message: 'Error al actualizar el cliente' });
      }

      const updatedClient = await ClientModel.findById(Number(id));
      return res.json(updatedClient);
    } catch (error) {
      console.error('Error updating client:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async deleteClient(req: Request, res: Response) {
    try {
      // Verificar autenticación
      const userId = (req.user as TokenPayload)?.id;
      if (!userId) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { id } = req.params;
      
      const client = await ClientModel.findById(Number(id));
      
      if (!client) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
      }
      
      if (client.user_id !== userId) {
        return res.status(403).json({ message: 'No tienes permiso para eliminar este cliente' });
      }

      const deleted = await ClientModel.delete(Number(id), userId);
      
      if (!deleted) {
        return res.status(400).json({ message: 'Error al eliminar el cliente' });
      }

      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting client:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}
