const mongoose = require('mongoose');

mongoose.connect(
  'mongodb+srv://dangtony98:cornell@cluster0.u7t73.mongodb.net/<dbname>?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  }
);
