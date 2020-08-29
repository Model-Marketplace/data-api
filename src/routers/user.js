const express = require('express');
const router = new express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const SALT_ROUNDS = 10;
const SECRET_KEY = 'secretKey';

router.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { username } = req.user;
    res.status(200).send({ message: `Logged in as ${username}` });
  }
);

router.post('/users/register', (req, res) => {
  const { username, password } = req.body;
  try {
    bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
      const user = new User({
        username,
        password: hash
      });

      const token = jwt.sign({ username }, SECRET_KEY, {
        expiresIn: '1h'
      });

      user.save().then(() => {
        res.status(200).send({ token });
      });
    });
  } catch (err) {
    res.status(400).send({ error: 'Unable to create new user' });
  }
});

router.post('/users/login', (req, res) => {
  const { username } = req.body;
  try {
    User.findOne({ username })
      .then(user => {
        bcrypt.compare(req.body.password, user.password).then(result => {
          if (result) {
            const token = jwt.sign({ username }, SECRET_KEY, {
              expiresIn: '1h'
            });
            res.status(200).send({ token });
          } else {
            res.status(400).send({ error: 'Invalid password' });
          }
        });
      })
      .catch(err => res.status(400).send('Invalid username'));
  } catch (err) {
    res.status(400).send({ error: 'Unable to login user' });
  }
});

router.post('/users/logout', (req, res) => {});

module.exports = router;
