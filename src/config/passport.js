const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');

const SECRET_KEY = 'secretKey';

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'secretKey'
};

const strategy = (payload, done) => {
  const { username } = payload;
  User.findOne({ username })
    .then(user => {
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    })
    .catch(err => console.log(err));
};

passport.use(new JwtStrategy(options, strategy));
