'use strict';
const express = require('express');
const hana = require('@sap/hana-client');

const app = express();
app.use(express.json()); 

const connections = {
    serverNode: 'dd8a1e01-c61c-403a-8232-3def8877f548.hana.trial-us10.hanacloud.ondemand.com:443',
    UID: 'DBADMIN',
    PWD: 'Akshayakash@123',
    sslValidationCertificate: 'false',
};

app.post('/insert', async (req, res) => {
    const {id, name, city} = req.body; 

    const connection = hana.createConnection();

    try {
        connection.connect(connections);

        const sql = `INSERT INTO DEMO (ID, NAME, CITY) VALUES (?, ?, ?)`;
        console.log(sql);
        const statement = connection.prepare(sql);

        statement.exec([id, name, city]);

        connection.disconnect();

        res.json({ message: 'Data inserted successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/fetch', (req, res) => {
    const connection = hana.createConnection();
    connection.connect(connections, (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        const sql = 'SELECT * FROM DEMO';
        console.log(sql);

        connection.exec(sql, (execErr, result) => {
            if (execErr) {
                res.status(500).json({ error: execErr.message });
                return;
            }
            console.log(result);

            connection.disconnect();
            res.json({ message: 'data fetched successfully!', data: result });
        });
    });
});

app.patch('/update/:id', (req, res) => {
    const { id } = req.params;
    const { name, city } = req.body;
    const connection = hana.createConnection();

    connection.connect(connections, (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (!name && !city) {
            res.status(400).json({ error: 'Name or city must be provided for update.' });
            return;
        }

        let sql = 'UPDATE DEMO SET ';
        const params = [];

        if (name) {
            sql += 'NAME = ?, ';
            params.push(name);
        } 
        if (city) {
            sql += 'CITY = ?, ';
            params.push(city);
        }

      
        sql = sql.slice(0, -2);

        sql += ' WHERE ID = ?';
        params.push(id);

        connection.exec(sql, params, (execErr, result) => {
            if (execErr) {
                res.status(500).json({ error: execErr.message });
                return;
            }

            connection.disconnect();
            res.json({ message: 'Data updated successfully' });
        });
    });
});


app.delete('/delete/:id', (req, res) => {
    const {id} = req.params;
    const connection = hana.createConnection();
    try
    {
        connection.connect(connections);
        const sql = 'DELETE FROM DEMO WHERE ID= ?';
        console.log(sql);
        const statement = connection.prepare(sql);
        statement.exec([id]);
        connection.disconnect();
        res.json({message: 'Data deleted successfully'});
    }
    catch (error)
    {
        res.status(500).json({error: error.message});
    }

})


const PORT = 3000;
app.listen(PORT, () => {
    console.log('Listening on port ' + PORT);
});
