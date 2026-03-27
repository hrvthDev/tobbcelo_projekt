const mysql = require("mysql2");

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "school_portal",
});

db.getConnection((err, connection) => {
    if (err) {
        console.error("DB csatlakozási hiba:", err);
    } else {
        console.log("Adatbázis csatlakoztatva!");
        connection.release();
    }
});

module.exports = db;
