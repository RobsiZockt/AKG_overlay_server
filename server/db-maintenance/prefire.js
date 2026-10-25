const {execFile} = require("child_process");
const {promisify} = require("util");
const {join} = require("path");
const {tmpdir} = require("os");
const {randomUUID} = require("crypto");
const {unlink} = require("fs/promises");

const execFileAsync = promisify(execFile);

async function cloneDB() {

    const prod_db = "wise_26";
    const target_db = "prefire_clone";
    const dumpFile = join(tmpdir(), `pg-${randomUUID()}.dump`);

    const env={
        ...process.env,
        PGHOST: "db",
        PGPORT: "5432",
        PGUSER: "admin",
        PGPASSWORD: "secretpassword",
    };

    try{
        console.log("Starting Dump...");
        await execFileAsync("pg_dump",[
            "--format=custom",
            "--no-owner",
            "--no-privileges",
            "--dbname", prod_db,
            "--file", dumpFile,
        ], {env});

        console.log("Removing old clone, if exists...");

        await execFileAsync("dropdb",[
            "--if-exists",
            "--force",
            target_db,
        ],{env});

        console.log("Create Clone...");

        await execFileAsync("createdb",[target_db],{env});

        console.log("Restoring DB...");

        await execFileAsync("pg_restore",[
            "--no-owner",
            "--no-privileges",
            "--dbname", target_db,
            dumpFile,
        ],{env});

        console.log("DB clone complete");
    }catch(err){
     console.error("DB clone failed: ", err.message)   
    }finally{
        await unlink(dumpFile).catch(()=>{});
    }

await execFileAsync("psql", [
  "--dbname", target_db,
  "-v", "ON_ERROR_STOP=1",
  "-c", `
    GRANT CONNECT ON DATABASE prefire_clone TO readonly_user;
    GRANT USAGE ON SCHEMA public TO readonly_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
    GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO readonly_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON SEQUENCES TO readonly_user;
  `,
], { env });

}

cloneDB();