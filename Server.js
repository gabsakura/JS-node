const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const mqtt = require('mqtt');

const app = express();
const PORT = 3000;
const client  = mqtt.connect('mqtt://localhost');
app.use(express.json());
const db = new sqlite3.Database('banco-de-dados.db');
client.on('connect', function () {
    // Substitua por seus tópicos
    client.subscribe('temperatura', function (err) {
      if (!err) {
        console.log('Subscrito com sucesso ao tópico temperatura');
      }
    });
  
    client.subscribe('vibracao', function (err) {
      if (!err) {
        console.log('Subscrito com sucesso ao tópico vibracao');
      }
    });
  
    client.subscribe('tensao', function (err) {
      if (!err) {
        console.log('Subscrito com sucesso ao tópico tensao');
      }
    });
  });
// Lógica para criar a tabela se ela não existir
db.serialize(() => {
    db.run(`CREATE TABLE temperatura (
              sensor_id INTEGER,
              valor REAL,
              timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
  
    db.run(`CREATE TABLE vibracao (
              sensor_id INTEGER,
              valor REAL,
              timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
  
    db.run(`CREATE TABLE tensao (
              sensor_id INTEGER,
              valor REAL,
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

client.on('connect', function () {
    // Substitua por seus tópicos
    client.subscribe('temperatura', function (err) {
      if (!err) {
        console.log('Subscrito com sucesso ao tópico temperatura');
      }
    });
  
    client.subscribe('vibracao', function (err) {
      if (!err) {
        console.log('Subscrito com sucesso ao tópico vibracao');
      }
    });
  
    client.subscribe('tensao', function (err) {
      if (!err) {
        console.log('Subscrito com sucesso ao tópico tensao');
      }
    });
  });
  
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

client.on('message', function (topic, message) {
    // message é um Buffer
    let data = JSON.parse(message.toString());
    let stmt = db.prepare(`INSERT INTO ${topic} (sensor_id, valor) VALUES (?, ?)`);
    stmt.run(data.sensor_id, data.valor);
    stmt.finalize();
  });
  
  process.on('exit', (code) => {
    client.end();
    db.close();
  });
