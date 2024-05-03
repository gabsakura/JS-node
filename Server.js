const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

app.use(express.json());

const db = new sqlite3.Database('banco-de-dados.db');

// Lógica para criar a tabela se ela não existir
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS dados_sensores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sensor_id INTEGER,
        temperatura REAL,
        umidade REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

//rota post
app.post('/dados-sensores', (req, res) => {
    const dados = req.body;
    console.log('Dados recebidos dos sensores:', dados);

    // Lógica para inserir os dados na tabela
    db.run(`INSERT INTO dados_sensores (sensor_id, temperatura, umidade) VALUES (?, ?, ?)`, 
           [dados.sensor_id, dados.temperatura, dados.umidade], 
           (err) => {
               if (err) {
                   console.error('Erro ao inserir dados no banco de dados:', err.message);
                   res.status(500).send('Erro ao processar os dados.');
               } else {
                   console.log('Dados inseridos no banco de dados com sucesso.');
                   res.send('Dados recebidos e armazenados com sucesso.');
               }
           });
});

//rota get
app.get('/dados-sensores', (req, res) => {
    // Query para buscar todos os dados cadastrados na tabela
    const query = `SELECT * FROM dados_sensores`;

    // Executando a query no banco de dados
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar dados no banco de dados:', err.message);
            res.status(500).send('Erro ao buscar os dados.');
        } else {
            // Se não houver erros, envie os dados como resposta
            res.json(rows);
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
