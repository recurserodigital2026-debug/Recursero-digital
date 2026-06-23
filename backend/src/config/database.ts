import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                        // conexiones máx. por instancia del backend
  idleTimeoutMillis: 30000,       // cierra conexiones ociosas tras 30s
  connectionTimeoutMillis: 5000,  // falla rápido si no hay conexión en 5s
});