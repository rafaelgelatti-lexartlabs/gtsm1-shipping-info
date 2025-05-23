const express = require('express');
const router = require('express').Router();
const localVariations = require('../../output/variacoes.json')

router.get('/', express.json(), async (req, res, next) => {
  try {
    const variations = localVariations.map(item => String(item).toLowerCase());
    return res.json(variations);
  } catch (error) {
    return next(error)
  }
});

module.exports = router;