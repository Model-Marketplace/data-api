const express = require('express');
const router = new express.Router();
const passport = require('passport');
const Repo = require('../models/repo');
const User = require('../models/user');

// create new repo
router.post(
  '/repos/create',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { name, description } = req.body;
    try {
      User.findById(req.user._id)
        .then(user => {
          const repo = new Repo({
            name,
            owner: req.user._id,
            description
          });

          user.repos.push(repo._id);
          user.save();

          repo.save().then(() => {
            res.status(200).send({
              message: `Successfully created new repo with name ${name} and owner ${req.user._id}`
            });
          });
        })
        .catch(() =>
          res.status(400).send({ error: 'Unable to create new repo' })
        );
    } catch (err) {
      res.status(400).send({ error: 'Unable to create new repo' });
    }
  }
);

// get all repos
router.get(
  '/repos',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    try {
      Repo.find({})
        .populate({ path: 'owner', select: 'username' })
        .limit(10)
        .sort({ createdAt: -1 })
        .then(data => {
          res.status(200).send({ data });
        });
    } catch (err) {
      res.status(400).send({ error: 'Unable to get repos' });
    }
  }
);

// get repo by id
router.get(
  '/repos/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { id } = req.params;
    try {
      Repo.findById(id)
        .populate({ path: 'owner', select: 'username' })
        .then(repo => {
          if (repo) {
            res.status(200).send({ data: repo });
          } else {
            res.status(400).send({ error: `Unable to get repo with id ${id}` });
          }
        });
    } catch (err) {
      res.status(400).send({ error: `Unable to get repo with id ${id}` });
    }
  }
);

module.exports = router;
