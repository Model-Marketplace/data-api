const express = require('express');
const router = new express.Router();
const passport = require('passport');
const User = require('../models/user');

// get profile by username
router.get(
  '/api/profiles/:username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { username } = req.params;
    User
      .findOne({ username })
      .select('username bio createdAt')
      .populate({
        path: 'repos',
        populate: { path: 'contributors owners', select: 'username' },
      })
      .populate({ path: 'following', select: 'username' })
      .populate({ path: 'followers', select: 'username' })
      .then((user) => {
        if (user) {
          res.status(200).send({ user });
        }
      })
      .catch(() => res.status(400).send({ message: `Unable to get profile with id ${id}` }));
  }
);

// profile actions
router.post(
  '/api/profiles/:id/action',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { action } = req.body;
    switch (action) {
      case 'follow': {
        // check if user is trying to follow himself/herself
        if (req.user.id === req.params.id) {
          res.status(400).send({ message: 'Unable to follow oneself' });
        } else {
          User
            .findById(req.params.id)
            .then((user1) => {
              User.findById(req.user.id).then((user2) => {
                // check if user2 already follows user1
                if (user1.followers.includes(user2.id)) {
                  // case: user2 follows user1
                  res.status(400).send({
                    message: `User ${user1.username} is already being followed`,
                  });
                } else {
                  // case: user2 does not follow user1
                  // add user2 to user1 followers list
                  // add user1 to user2 following list
                  user1.followers.push(user2.id);
                  user2.following.push(user1.id);

                  user1.save();
                  user2.save();

                  res.status(200).send({
                    message: `Successfully followed user ${user1.username}`,
                  });
                }
              });
            })
            .catch((err) => res.status(400).send({ message: `Unable to find user with id ${req.params.id}` }));
        }
        break;
      }
      case 'unfollow': {
        // check if user is trying to unfollow himself/herself
        if (req.user.id === req.params.id) {
          res.status(400).send({ message: 'Unable to unfollow oneself' });
        } else {
          User
            .findById(req.params.id).then((user1) => {
              User.findById(req.user.id).then((user2) => {
                // check if user2 follows user1 in the first place
                if (user1.followers.includes(user2.id)) {
                  // case: user2 follows user 1
                  // remove user2 from user1 followers list
                  // remove user1 from user2 following list
                  const index1 = user1.followers.indexOf(user2.id);
                  const index2 = user2.following.indexOf(user1.id);

                  user1.followers.splice(index1, 1);
                  user2.following.splice(index2, 1);

                  user1.save();
                  user2.save();

                  res.status(200).send({
                    message: `Successfully unfollowed user ${user1.username}`,
                  });
                } else {
                  // case: user2 does not follow user1
                  res.status(400).send({
                    message: `User ${user1.username} is not yet followed`,
                  });
                }
              });
          })
          .catch(() => res.status(400).send({ message: `Unable to find user with id ${req.params.id}` }));
        }
        break;
      }
      default: {
      }
    }
  }
);

module.exports = router;
