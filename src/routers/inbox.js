const express = require('express');
const router = new express.Router();
const passport = require('passport');
const Notification = require('../models/notification');

// TO-DO: modify get inbox notifications for pagination
// get all inbox notifications
router.post(
  '/api/inbox',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // const { skip } = req.body;
    Notification
      .find({ receiver: req.user._id })
      .populate({ path: 'sender', select: 'username' })
      .sort({ createdAt: -1 })
      .then((notifications) => {
        res.status(200).send({ notifications });
      })
      .catch(() => res.status(404).send({ message: `Unabe to get inbox for user with id ${req.user._id}`}))
  }
);

module.exports = router;