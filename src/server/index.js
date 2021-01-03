const express = require('express');
const passport = require('passport');
const cors = require('cors');

const app = express();
const port = 3000 || process.env.PORT;

const user = require('../routers/user');
const profile = require('../routers/profile');
const repo = require('../routers/repo');
const search = require('../routers/search');
const inbox = require('../routers/inbox');

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

require('../config/database');
require('../config/passport');

app.use(user);
app.use(profile);
app.use(repo);
app.use(search);
app.use(inbox);

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
