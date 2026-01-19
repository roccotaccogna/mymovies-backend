const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    // host: process.env.DB_HOST,
    // user: process.env.DB_USER,
    // password: process.env.DB_PASSWORD,
    // database: process.env.DB_NAME,
    // port: process.env.DB_PORT,
    host: process.env.MYSQLHOST, 
    user: process.env.MYSQLUSER, 
    password: process.env.MYSQLPASSWORD, 
    database: process.env.MYSQLDATABASE, 
    port: process.env.MYSQLPORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection((err,connection)=> {
    if(err){
        console.error('Errore di connessione al database: ', err);
    } else {
        console.log('Connesso a MySQL');
        connection.release(); 
    }
});

module.exports = pool.promise();