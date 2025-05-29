const express = require('express');
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
    return next(error)
  }
});

module.exports = router;