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
export async function createDatabaseWithReadonly(dbname) {
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
    await admin.query(
      `GRANT CONNECT ON DATABASE "${databaseName}" TO readonly_user`
    );
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
    await target.query(`
      GRANT USAGE ON SCHEMA public TO readonly_user;

      GRANT SELECT
        ON ALL TABLES IN SCHEMA public
        TO readonly_user;

      GRANT SELECT
        ON ALL SEQUENCES IN SCHEMA public
        TO readonly_user;

      ALTER DEFAULT PRIVILEGES
        IN SCHEMA public
        GRANT SELECT ON TABLES TO readonly_user;

      ALTER DEFAULT PRIVILEGES
        IN SCHEMA public
        GRANT SELECT ON SEQUENCES TO readonly_user;
    `);
  } finally {
    await target.end();
  }

  console.log(
    `Database "${databaseName}" is configured for readonly_user`
  );
}
