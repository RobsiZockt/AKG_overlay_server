// DO NOT EXPOSE THIS FILE OR FUNCTION TO ANY OTHER APPLICATIONS


const {Pool} = require("pg");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const readline = require("readline");

const pool = new Pool( {  
    host: "db",
    port: 5432,
    user: "admin",
    password: "secretpassword",
    database: "persistant",
    });

function ask(question, {hidden=false}={}){
    const rl= readline.createInterface({input: process.stdin, output:process.stdout});
    return new Promise((reslove)=>{
        if(hidden){
            rl._writeToOutput = (str) =>{
                if(str.includes(question)) rl.output.write(str);
                else if(str.includes('\n')||str.includes('\r')) rl.output.write('\n');
            }
        }
        rl.question(question, (answer)=>{
            rl.close();
            reslove(answer.trim());
        })
    })
}

function genPW(length=12){
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*-_';
    const bytes = crypto.randomBytes(length);
    return Array.from(bytes, (b)=>chars[b%chars.length]).join('');
}

(async ()=>{
    const [username,passwordArg, role = "user"] = process.argv.slice(2);
console.log(username, passwordArg);
    if(!username) {console.error("Usage: node create-user.js <username> [password|--generate] [role]");
        process.exit(1);}
    let password;
    let generated = false;

    if(passwordArg === "--generate"){
        password = genPW();
        generated=true;
    } else if (passwordArg){
        password = passwordArg;
    } else{
        const choise = (await ask ("Set password [m]anually or [g]enerate? [m/g]"));
        if(choise === 'g') {
        password = genPW();
            generated=true; 
        } else if (choise === 'm'){
            password = await ask("Password: ", {hidden:true});
            const confirm = await ask("Confirm password: ", {hidden:true});
            if (password!==confirm){
                console.error("Passwords do not match");
                process.exit(1);
            }
            if (!password) {
                console.error('Password must not be empty.');
                process.exit(1);
            }
        } else{
            console.error('Not a Valid argument');
            process.exit(1);
        }
    }
    const hash = await bcrypt.hash(password,12);
    await pool.connect();
    await pool.query(`INSERT INTO users (username, pass_hash, role) VALUES ($1, $2, $3)`, [username,hash,role]);

    console.log('created ', username, role);
    if(generated) console.log("genereated password: ",password);

    await pool.end();
    process.exit(1);
})();