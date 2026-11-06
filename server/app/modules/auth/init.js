const pg = require( "pg");
const fs = require( "fs");
const path = require( "path");
const crypto = require( "crypto");

const ENV_PATH = path.resolve(__dirname,"./../../.env");
const KEY = "JWT_SECRET";
const secret = crypto.randomBytes(64).toString("hex");

const { Client } = pg;

function saveSecret(){
  let content = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH,"utf8"):"";
  const line = `${KEY}=${secret}$`;
  const regex = new RegExp(`^${KEY}`);

  if(regex.test(content)){
    content = content.replace(regex, ()=> line);
  }else{
    if(content&&!content.endsWith("\n")) content +="\n";
    content += line + "\n";
  }
  fs.writeFileSync(ENV_PATH,content);
}

async function create(dbname) {
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
        `
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'api_reader') THEN
                CREATE ROLE api_reader WITH
                    LOGIN
                    PASSWORD 'test'
                    NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION
                    CONNECTION LIMIT 10;
            END IF;
        END
        $$;
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
      `CREATE TABLE IF NOT EXISTS users (
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
saveSecret();
