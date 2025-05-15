const express = require('express');
const router = express.Router();
const receive = require('./receive');
const variations = require('./variations');

router.use('/receive', receive);
router.use('/test-variations', variations);

module.exports = router;