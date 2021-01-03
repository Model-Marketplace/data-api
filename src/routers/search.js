const express = require('express');
const router = new express.Router();
const passport = require('passport');
const Repo = require('../models/repo');

router.post(
  '/api/search',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { term } = req.body;
    const reg = new RegExp(term, 'i');
    Repo.find({
      $or: [{ name: { $regex: reg } }, { description: { $regex: reg } }],
    })
      .limit(5)
      .then((repos) => {
        res.status(200).send({ repos });
      });
    try {
    } catch (err) {
      res.status(400).send({ message: 'Unable to get search results' });
    }
  }
);

module.exports = router;
