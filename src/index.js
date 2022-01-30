const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");
const { request } = require("express");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  // Vamos Conferir se o usuario existe atraves da checagem de CPF, recebido pelo Header
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User does not exist" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  // Cadastrando o usuario por cpf e nome, o cpf sera usado como identificador unico
  const { username, name } = request.body;

  const userAlreadyRegistered = users.some(
    (user) => user.username === username
  );

  if (userAlreadyRegistered) {
    return response
      .status(400)
      .json({ error: "This user already has an account" });
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: [],
  });

  return response.status(201).send();
});

// checar os usuarios existentes
app.get("/users", (request, response) => {
  return response.status(400).json(users);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  // retornando os todos do usuario
  const { user } = request;
  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  // adicionando um todo para a lista de todos do usuario
  const { user } = request;
  const { title, deadline } = request.body;

  const task = {
    id: uuidv4(), // precisa ser um uuid
    title: title,
    done: false,
    deadline: new Date(deadline + " 00:00"),
    created_at: new Date(),
  };

  user.todos.push(task);

  return response.status(201).json(user.todos);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  // Alterando o todo de um usuario pelo id da tarefa
  const { title, deadline } = request.body;
  const { user } = request;
  const tasks = user.todos;

  const checkIfTaskExistsAndReturnsIndex = (id) => {
    let indexOfTask = -1;

    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].id === id) {
        indexOfTask = i;
      }
    }
    return indexOfTask;
  };

  let indexOfTask = checkIfTaskExistsAndReturnsIndex(request.params.id);

  if (indexOfTask === -1) {
    return response.status(401).json({ error: "This task does not exist" });
  } else {
    user.todos[indexOfTask].title = title;
    user.todos[indexOfTask].deadline = new Date(deadline + " 00:00");

    return response.status(200).json(user.todos[indexOfTask]);
  }
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  // Alterando o todo de um usuario pelo id da tarefa
  const { user } = request;
  const tasks = user.todos;

  const checkIfTaskExistsAndReturnsIndex = (id) => {
    let indexOfTask = -1;
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].id === id) {
        indexOfTask = i;
      }
    }
    return indexOfTask;
  };

  let indexOfTask = checkIfTaskExistsAndReturnsIndex(request.params.id);

  if (indexOfTask === -1) {
    return response.status(401).json({ error: "This task does not exist" });
  } else {
    user.todos[indexOfTask].done = true;

    return response.status(200).json(user.todos[indexOfTask]);
  }
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  // Alterando o todo de um usuario pelo id da tarefa
  const { user } = request;
  const tasks = user.todos;

  const checkIfTaskExistsAndReturnsIndex = (id) => {
    let indexOfTask = -1;
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].id === id) {
        indexOfTask = i;
      }
    }
    return indexOfTask;
  };

  let indexOfTask = checkIfTaskExistsAndReturnsIndex(request.params.id);

  if (indexOfTask === -1) {
    return response.status(401).json({ error: "This task does not exist" });
  } else {
    user.todos.splice(user.todos[indexOfTask], 1);

    return response.status(200).json(user.todos);
  }
});

module.exports = app;
