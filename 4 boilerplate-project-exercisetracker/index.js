require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser'); // Para processar o corpo da requisição
const app = express();

// Usando o bodyParser para obter os dados do formulário como objetos
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// Armazenando usuários e exercícios em memória (em um banco seria melhor)
const users = [];
const exercises = [];

// Basic Configuration
const port = process.env.PORT || 3000;

// Serve os arquivos estáticos
app.use(express.static('public'));

// Rota para a página inicial
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Criando um novo usuário
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  if (!username) {
    return res.json({ error: 'Username is required' });
  }

  const user = {
    username,
    _id: new Date().getTime().toString(), // ID único com base no timestamp
  };

  users.push(user);
  res.json(user);
});

// Adicionando um exercício para um usuário
app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;
  
  // Encontrando o usuário correspondente
  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.json({ error: 'User not found' });
  }
  
  // Criando o exercício com data formatada corretamente
  const exercise = {
    description,
    duration: parseInt(duration), // Convertemos `duration` para número
    date: date ? new Date(date).toDateString() : new Date().toDateString(),
  };

  // Salvando no array de exercícios
  exercises.push({ userId, ...exercise });

  res.json({
    username: user.username,
    _id: user._id,
    ...exercise
  });
});


// Obtendo o log de exercícios de um usuário
app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;
  
  // Encontrando o usuário
  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.json({ error: 'User not found' });
  }

  // Filtrando os exercícios
  let userExercises = exercises.filter(e => e.userId === userId);
  
  if (from) {
    userExercises = userExercises.filter(e => new Date(e.date) >= new Date(from));
  }
  if (to) {
    userExercises = userExercises.filter(e => new Date(e.date) <= new Date(to));
  }
  
  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    count: userExercises.length,
    _id: userId,
    log: userExercises.map(e => ({
      description: e.description,
      duration: Number(e.duration), // Certificando que `duration` seja um número
      date: e.date
    })),
  });
});


app.get('/api/users', (req, res) => {
  res.json(users);
});



// Iniciando o servidor
const listener = app.listen(port, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
