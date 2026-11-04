const { Pool } = require("pg");

async function findUser(user){
const pool = new Pool({ 
    host: "db",
    port: 5432,
    user: "api_reader",
    password: "test",
    database: "persistant",});
    try{
        await pool.connect();
        const {rows} = await pool.query('SELECT id, pass_hash, role, active FROM users WHERE username = $1',[user]);
        return rows[0];
    }catch(err){
        console.log(err);
    }finally{
        pool.end();
    }
}

module.exports.findUser = findUser;