const express = require('express');
const router = new express.Router();
const passport = require('passport');
const Notification = require('../models/notification');

// get all inbox notifications
router.post(
  '/api/inbox',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // const { skip } = req.body;
    console.log('Inside POST /inbox');
    console.log(req.user._id);
    try {
      // Repo.find()
      //   .populate({ path: 'owners', select: 'username' })
      //   .populate({ path: 'contributors', select: 'username' })
      //   .skip(skip)
      //   .limit(5)
      //   .sort({ createdAt: -1 })
      //   .then((repos) => {
      //     res.status(200).send({ repos });
      //   });
      Notification
        .find({ receiver: req.user._id })
        .populate({ path: 'sender', select: 'username' })
        .sort({ createdAt: -1 })
        .then((notifications) => {
          res.status(200).send({ notifications });
        });
    } catch (err) {
      res
        .status(400)
        .send({ message: 'Unable to get inbox' });
    }
  }
);

module.exports = router;