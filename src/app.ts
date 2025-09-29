import dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno ANTES de cualquier otro import
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import { pool } from './config/database';
import routes from './routes';

// Crear aplicación Express
const app = express();

const allowedOrigins = [
  'https://gestion.digiplot.cl'
];

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Conexión a base de datos
pool.getConnection()
  .then((connection) => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });

// Rutas
app.use('/', routes);

// Middleware de manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});