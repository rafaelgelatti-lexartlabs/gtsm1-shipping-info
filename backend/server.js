const express = require('express');
const app = express();
const port = 3000;
const routes = require('./src/routes');
const errorHandler = require('./src/middleware/errorHandler');
const cors = require("cors");

if (process.env.NODE_ENV != "production") {
  app.use(cors({
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    origin: ['http://localhost:8000', "https://www.lojagtsm1.com.br/", `http://localhost:${process.env.FRONTEND_PORT}`],
    allowedHeaders: ['Content-Type', 'Authorization', 'Custom-Header', 'format'],
  }));
} else {
  app.use(cors({
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    origin: ["https://www.lojagtsm1.com.br/", `http://localhost:${process.env.FRONTEND_PORT}`],
    allowedHeaders: ['Content-Type', 'Authorization', 'Custom-Header', 'format'],
  }));
}

// app.use(express.json());
app.use(routes);

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`GTSM1 - Shipping Info listening on port ${process.env.BACKEND_PORT || 3000}`);
});