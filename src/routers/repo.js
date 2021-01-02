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
    if (description.length > 500) {
      return res.status(400).send({
        message: 'Repo description length cannot exceed 280 characters',
      });
    }

    try {
      User.findById(req.user._id)
        .then((user) => {
          const repo = new Repo({
            name,
            owners: [req.user._id],
            contributors: [req.user._id],
            description,
            usage: 0
          });

          user.repos.push(repo._id);
          user.save();

          repo.save().then(() => {
            res.status(200).send({
              message: `Successfully created new repo with name ${name} and owner ${req.user._id}`,
            });
          });
        })
        .catch(() =>
          res.status(400).send({ message: 'Unable to create new repo' })
        );
    } catch (err) {
      res
        .status(400)
        .send({ message: 'Unable to create new repo' });
    }
  }
);

// get all repos
router.post(
  '/repos',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { skip } = req.body;
    try {
      Repo.find()
        .populate({ path: 'owners', select: 'username' })
        .populate({ path: 'contributors', select: 'username' })
        .skip(skip)
        .limit(5)
        .sort({ createdAt: -1 })
        .then((repos) => {
          res.status(200).send({ repos });
        });
    } catch (err) {
      res
        .status(400)
        .send({ message: 'Unable to get repos' });
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
        .populate({ path: 'owners', select: 'username' })
        .populate({ path: 'contributors', select: 'username' })
        .then((repo) => {
          if (repo) {
            res.status(200).send(repo);
          } else {
            res
              .status(400)
              .send({ message: `Unable to get repo with id ${id}` });
          }
        });
    } catch (err) {
      res
        .status(400)
        .send({ message: `Unable to get repo with id ${id}` });
    }
  }
);

// update repo by id
router.put(
  '/repos/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
      Repo.findById(id, (err, repo) => {
        if (err) {
          res.status(400).send({ message: `Unable to get repo with id ${id}` });
        } else {
          if (repo.owners.includes(req.user._id)) {
            // case: user is a repo owner
            repo.name = name;
            repo.description = description;
            repo.save().then((repo) => {
              res.status(200).send(repo);
            });
          } else {
            // case: user is not a repo owner
            res.status(403).send({ message: 'Unauthorized access to update repo' });
          }
        }
      });
    } catch (err) {
      res
        .status(400)
        .send({ message: `Unable to get repo with id ${id}` });
    }
  });

module.exports = router;
