const express = require('express');
const router = express.Router();
const receive = require('./receive');
const variations = require('./variations');
const login = require('./login');

router.use('/receive', receive);
router.use('/test-variations', variations);
router.use('/login', login);

module.exports = router;