const express = require('express');
const app = express();
const port = 3000;
const routes = require('./src/routes');
const errorHandler = require('./src/middleware/errorHandler');
const cors = require("cors");

const allowedOrigins = [
  'https://www.lojagtsm1.com.br',
  'https://gtsm1.lexartlabs.com.br',
];

process.env.NODE_ENV !== "production" ? allowedOrigins.push(`http://localhost:${process.env.FRONTEND_PORT}`) : null;

app.use((req, res, next) => {
  console.log(req.headers.referer);
  console.log(req.headers.origin);
  console.log(req.headers);

  if (!req.headers.origin && req.headers.referer) {
    const refererOrigin = new URL(req.headers.referer).origin;
    req.headers.origin = refererOrigin;
  }
  next();
});

const corsOptions = {
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  origin: function (origin, callback) {
    if (!origin && process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }

    console.log(origin, "ORIGIN");

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origin não permitida pelo CORS'));
    }
  },
  allowedHeaders: ['Content-Type', 'Authorization', 'Custom-Header', 'format'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.use(routes);

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`GTSM1 - Shipping Info listening on port ${process.env.BACKEND_PORT || 3000}`);
});