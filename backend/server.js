const express = require('express');
const app = express();
const port = 3000;
const routes = require('./src/routes');
const errorHandler = require('./src/middleware/errorHandler');
const cors = require("cors");

const corsLocal = {
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  origin: [
    'http://localhost:8000',
    "https://www.lojagtsm1.com.br",
    "https://gtsm1.lexartlabs.com.br",
    `http://localhost:${process.env.FRONTEND_PORT}`
  ],
  allowedHeaders: ['Content-Type', 'Authorization', 'Custom-Header', 'format'],
}
const corsProd = {
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  origin: [
    "https://www.lojagtsm1.com.br",
    "https://gtsm1.lexartlabs.com.br"
  ],
  allowedHeaders: ['Content-Type', 'Authorization', 'Custom-Header', 'format'],
  credentials: true,
  optionsSuccessStatus: 204
}
let corsOptions;

if (process.env.NODE_ENV != "production") {
  app.use(cors(corsLocal));
  corsOptions = corsLocal;
} else {
  app.use(cors(corsProd));
  corsOptions = corsProd;
}

app.options('*', cors(corsOptions));
app.use(routes);

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`GTSM1 - Shipping Info listening on port ${process.env.BACKEND_PORT || 3000}`);
});