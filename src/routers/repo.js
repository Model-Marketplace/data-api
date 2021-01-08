const express = require('express');
const router = new express.Router();
const passport = require('passport');
const Repo = require('../models/repo');
const User = require('../models/user');
const Notification = require('../models/notification');

// create new repo
router.post(
  '/api/repos/create',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { name, description } = req.body;
    if (description.length > 500) {
      return res.status(400).send({
        message: 'Repo description length cannot exceed 280 characters',
      });
    }

    User
      .findById(req.user._id)
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
      .catch(() => res.status(400).send({ message: 'Unable to create new repo' }));
  }
);

// get all repos
router.post(
  '/api/repos',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { skip } = req.body;
    Repo
      .find()
      .populate({ path: 'owners', select: 'username' })
      .populate({ path: 'contributors', select: 'username' })
      .skip(skip)
      .limit(5)
      .sort({ createdAt: -1 })
      .then((repos) => {
        res.status(200).send({ repos });
      })
  }
);

// get repo by id
router.get(
  '/api/repos/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { id } = req.params;
    Repo
      .findById(id)
      .populate({ path: 'owners', select: 'username' })
      .populate({ path: 'pendingOwners', select: 'username' })
      .populate({ path: 'contributors', select: 'username' })
      .then((repo) => {
        if (repo) {
          res.status(200).send(repo);
        } else {
          res
            .status(400)
            .send({ message: `Unable to get repo with id ${id}` });
        }
      })
      .catch(() => res.status(404).send({ message: `Unable to get repo with id ${id}` }));
  }
);

// update repo by id
router.put(
  '/api/repos/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    Repo
      .findById(id).then((repo) => {
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
      })
      .catch(() => res.status(404).send({ message: `Unable to get repo with id ${id}` }));
  });

// invite co-owner to repo by id
router.post(
  '/api/invite/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { id } = req.params;
    const { invitee } = req.body;
    Repo
      .findById(id)
      .populate({ path: 'owners', select: 'username' })
      .populate({ path: 'pendingOwners', select: 'username' })
      .populate({ path: 'contributors', select: 'username' })
      .exec((err, repo) => {
        if (err) {
          res.status(400).send({ message: `Unable to get repo with id ${id}` });
        } else {
          if (repo.owners.map((owner) => owner._id).includes(req.user._id)) {
            // case: user is a repo owner
            User.find({ username: invitee }, (err, users) => {
              if (users.length == 0) {
                // case: invitee is not a user
                res.status(400).send({ message: `Unable to find invitee with username ${invitee}` })
              } else {
                // case: invitee is a user
                const notification = new Notification({
                  title: 'Co-Ownership Invitation',
                  body: `${req.user.username} has invited you to co-own ${repo.name}`,
                  read: false,
                  sender: req.user._id,
                  receiver: users[0]._id
                });
                
                users[0].notifications.push(notification._id);
                users[0].save();

                if (!repo.pendingOwners.includes(users[0]._id)) {
                  // append invitee to pending list if not there yet
                  repo.pendingOwners.push(users[0]._id);
                  repo.save();
                }

                notification.save().then(() => {
                  res.status(200).send({
                    message: `Successfully sent notification to user with username ${users[0].username}`,
                    repo
                  });
                });
              }
            });
          } else {
            // case: user is not a repo owner
            res.status(403).send({ message: 'Unauthorized access invite co-owner for repo' });
          }
        }
    });
  });

module.exports = router;
