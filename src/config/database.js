const mongoose = require('mongoose');

mongoose.connect(
  'mongodb+srv://dangtony98:cornellianTony2912!@cluster0.u7t73.mongodb.net/<dbname>?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  }
);
