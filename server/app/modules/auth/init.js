import pg from "pg";

const { Client } = pg;

/**
 * Creates a PostgreSQL database and configures readonly_user
 * with read-only access.
 *
 * @param {Object} config
 * @param {string} config.host
 * @param {number} config.port
 * @param {string} config.user
 * @param {string} config.password
 * @param {string} config.database - Admin database to connect to
 * @param {string} config.databaseName - Database to create/configure
 */
export async function create(dbname) {
  const databaseName= dbname;


  if (!databaseName) {
    throw new Error("databaseName is required");
  }

  // PostgreSQL identifiers cannot be parameterized with $1,
  // so validate the database name before putting it into SQL.
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(databaseName)) {
    throw new Error(`Invalid database name: ${databaseName}`);
  }

  const admin = new Client({
    host: "db",
    port: 5432,
    user: "admin",
    password: "secretpassword",
    database: "empty_db",
  });

  await admin.connect();

  try {
    // Check whether the database already exists.
    const result = await admin.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [databaseName]
    );

    if (result.rowCount === 0) {
      await admin.query(`CREATE DATABASE "${databaseName}"`);
    }

    // CONNECT permission is granted from the admin database.
   
    //Replace Password on prod server
    await admin.query(
        `DROP ROLE api_reader;
        CREATE ROLE api_reader WITH
        LOGIN
        PASSWORD 'test'
        NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION
        CONNECTION LIMIT 10;
        ALTER ROLE api_reader SET default_transaction_read_only = on;
        GRANT CONNECT ON DATABASE ${databaseName} TO api_reader;
        `
    )
  } finally {
    await admin.end();
  }

  // Connect directly to the target database.
  const target = new Client({
    host: "db",
    port: 5432,
    user: "admin",
    password: "secretpassword",
    database: databaseName,
  });

  await target.connect();

  try {
     await target.query(
      `CREATE TABLE users (
      id            SERIAL PRIMARY KEY,
      username      TEXT UNIQUE NOT NULL,
      pass_hash     TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'user',
      active        BOOLEAN NOT NULL DEFAULT true,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now());`
    );

    await target.query(`
      GRANT USAGE ON SCHEMA public TO api_reader;
      GRANT SELECT ON TABLE public.users TO api_reader;
      REVOKE CONNECT ON DATABASE ${databaseName} FROM PUBLIC;
      GRANT CONNECT ON DATABASE ${databaseName} TO api_reader;
    `);
  } finally {
    await target.end();
  }

  console.log(
    `Database "${databaseName}" is configured for readonly_user`
  );
}

create("persistant");
