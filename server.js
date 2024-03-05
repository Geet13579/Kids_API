
const http = require('http');
const express = require('express');
const { SIGTERM } = require("constants");
const authenticate = require('./middleware');


var cors = require('cors');
const Api = express();
const HTTP = http.Server(Api);

Api.use(cors());

const sqlite3 = require('sqlite3');

Api.use(express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
Api.use(express.json({ limit: "50mb", extended: true, parameterLimit: 50000 }));

Api.use((req, res, next) => {
    
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Headers', "*");
    res.header('Access-Control-Allow-Credentials', true);
    next();
});

const HTTP_PORT = 8000;
Api.listen(HTTP_PORT, () => {
    console.log("Server is listening on port " + HTTP_PORT);
});

const db = new sqlite3.Database('./KidData.db', (err) => {
    if (err) {
        console.error("Error opening database " + err.message);
    } else {
        console.log("Connection successfully");
    }
});

Api.post('/request-time-extension',authenticate, (req, res) => {

    const { additionalTime, reason } = req.body;

    console.log(req.body);

    var d = new Date();
    var date = d.toISOString();

    db.run('CREATE TABLE IF NOT EXISTS kid_table( \
        kidId INTEGER PRIMARY KEY AUTOINCREMENT,\
        additionalTime NVARCHAR(50),\
        reason NVARCHAR(50),\
        status NVARCHAR(50),\
        date NVARCHAR(50)\
        )', (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).send({ msg: "error" });
            return;
        }
        
        let insert = 'INSERT INTO kid_table (kidId, additionalTime, reason, status, date) VALUES (NULL,?,?,?,?)';
        db.run(insert, [additionalTime, reason, "pending", date], (err) => {
            if (err) {
                console.error(err.message);
                res.status(500).send({ msg: "error" });
                return;
            }
            else{
                res.send({msg:"Record inserted successfully"});
            }
          
        
        });
    });
});

Api.post('/approve-reject-request', authenticate, (req, res) => {
    const { kidId, status } = req.body;

    let update = 'UPDATE kid_table SET status = ? WHERE kidId = ?';

    
    db.run(update, [status, kidId], (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).send({ msg: "error" });
            return;
        }

        let select = 'SELECT * FROM kid_table WHERE kidId = ?';
        db.get(select, [kidId], (err, row) => {
            if (err) {
                console.error(err.message);
                res.status(500).send({ msg: "error" });
                return;
            }

            res.send({ msg: "Request updated successfully", data: row });
        });
    });
});


Api.get('/request-time-extension/all', authenticate, (req, res) => {

    db.all('SELECT * FROM kid_table', (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send({ msg: "error" });
            return;
        }

        res.send(rows);
    });
});


Api.get('/', (req, res) => {

    res.send("welcome")
})