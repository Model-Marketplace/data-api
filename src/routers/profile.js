const express = require('express');
const router = new express.Router();
const passport = require('passport');
const User = require('../models/user');

// get profile by id
router.get(
  '/profiles/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { id } = req.params;
    try {
      User.findById(id)
        .select('username')
        .then(user => {
          if (user) {
            res.status(200).send({ user });
          }
        })
        .catch(() =>
          res.status(400).send({ error: `Unable to get profile with id ${id}` })
        );
    } catch (err) {
      res.status(400).send({ error: `Unable to get profile with id ${id}` });
    }
  }
);

module.exports = router;
