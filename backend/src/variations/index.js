const express = require('express');
const router = require('express').Router();

router.get('/', express.json(), async (req, res, next) => {
  try {
    const localVariations = require('../../output/variacoes.json')
    const variations = localVariations.map(item => String(item).toLowerCase());
    return res.json(variations);
  } catch (error) {
    return next(error)
  }
});

module.exports = router;