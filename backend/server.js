const express = require('express');
const app = express();
const port = 3000;
const routes = require('./src/routes');
const errorHandler = require('./src/middleware/errorHandler');

// app.use(express.json());
app.use(routes);

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`GTSM1 - Shipping Info listening on port ${process.env.BACKEND_PORT || 3000}`);
});