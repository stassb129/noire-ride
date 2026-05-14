export interface PostgresConn {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

/**
 * Parse DATABASE_URL (postgresql://user:pass@host:5432/db) when set;
 * otherwise use DB_* env vars (matches docker-compose service `db`).
 */
export function getPostgresConnectionOptions(): PostgresConn {
  const urlStr = process.env.DATABASE_URL?.trim();
  if (urlStr) {
    try {
      const u = new URL(urlStr);
      const database = u.pathname.replace(/^\//, '').split('?')[0];
      if (!database) throw new Error('missing database in DATABASE_URL');
      return {
        host: u.hostname,
        port: parseInt(u.port || '5432', 10),
        username: decodeURIComponent(u.username),
        password: decodeURIComponent(u.password),
        database,
      };
    } catch {
      // fall through to discrete vars
    }
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'noir_admin',
    password: process.env.DB_PASSWORD || 'noir_password_2026',
    database: process.env.DB_DATABASE || 'noir_ride',
  };
}
