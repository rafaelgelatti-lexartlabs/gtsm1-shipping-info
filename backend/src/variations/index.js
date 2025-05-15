const express = require('express');
const router = require('express').Router();
const localVariations = require('../../output/variacoes.json')

router.post('/', express.json(), async (req, res, next) => {
  try {
    const variations = req.body;

    let test = {};
    for (let i = 0; i < variations.length; i++) {
      const variation = variations[i];
      if (localVariations.includes(variation)) {
        test[variation] = true;
      } else {
        test[variation] = false;
      }
    }
    return res.json({ data: test });
  } catch (error) {
    return next(error)
  }
});

module.exports = router;