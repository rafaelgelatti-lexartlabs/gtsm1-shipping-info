const router = require('express').Router();
const crypto = require('crypto');
const express = require('express');

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

function verifyPassword(password, hashed) {
  return new Promise((resolve, reject) => {
    const [salt, key] = hashed.split(':');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(derivedKey.toString('hex') === key);
    });
  });
}


router.post('/', express.json(), async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (username === process.env.USER && password === process.env.PASS) {
      return res.json({
        success: true,
        token: await hashPassword(password),
        user: username,
      });
    } else {
      return res.json({
        success: false,
        message: 'Invalid username or password',
      });
    }

  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;