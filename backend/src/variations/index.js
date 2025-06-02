const express = require('express');
const path = require('path');
const { update } = require('../receive/controller');
const router = require('express').Router();
const fs = require('fs').promises;

router.get('/', express.json(), async (req, res, next) => {
  try {
    const filePath = path.join(__dirname, '..', 'output', 'variacoes.json');
    const fileData = await fs.readFile(filePath, 'utf8');
    const localVariations = JSON.parse(fileData);
    const variations = localVariations.map(item => String(item).toLowerCase());
    console.log(variations, "variations");
    return res.json(variations);
  } catch (error) {
    if (error.message.includes('no such file or directory')) {
      console.error('File not found:', error.message);
      return res.status(404).json({ message: 'File not found' });
    }
    return next(error)
  }
});


router.put('/update', express.json(), async (req, res, next) => {
  try {
    const file = req.body;

    if (!file) {
      return res.status(400).json({ error: 'Update não encontrado.' });
    }

    const result = await update(file);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return next(error)
  }
});

module.exports = router;