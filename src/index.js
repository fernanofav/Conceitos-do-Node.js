const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user){
      return response.status(400).json({ error: "User not found"});
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(
      (user) => user.username === username
  );

  if (userAlreadyExists) {
      return response.status(400).json({ error: "User already exists"});
  }

  const newUser = {
    id: uuidv4(),
    name,
    username, 
    todos: []
  }

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body; 
  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body; 
  const { user } = request;

  user.todos.forEach((todo) => {
    if (todo.id === request.params.id) {
      todo.title = title;
      todo.deadline = deadline;
    }
  });

  return response.status(201).send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body; 
  const { user } = request;

  user.todos.forEach((todo) => {
    if (todo.id === request.params.id) {
      todo.done = true;
    }
  });

  return response.status(201).send();
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body; 
  const { user } = request;

  user.todos.forEach((todo, index) => {
    if (todo.id === request.params.id) {
      user.todos.splice(index, 1);
    }
  });

  return response.status(201).send();

  //customers.splice(customer, 1);
});

module.exports = app;
