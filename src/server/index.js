const express = require('express');
const passport = require('passport');
const cors = require('cors');

const app = express();
const port = 3000 || process.env.PORT;

const auth = require('../middleware/auth');

const user = require('../routers/user');

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

require('../config/database');
require('../config/passport');

app.use(user);

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(port, () => {
  console.log('App is listening on port: ' + port);
});