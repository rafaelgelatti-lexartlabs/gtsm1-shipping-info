const express = require('express');
const router = require('express').Router();
const localVariations = require('../../output/variacoes.json')

router.get('/', express.json(), async (req, res, next) => {
  try {
    return res.json(localVariations);
  } catch (error) {
    return next(error)
  }
});

module.exports = router;