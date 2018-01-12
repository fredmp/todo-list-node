const mongoose = require('mongoose');
const app = require('./src/app');
const env = process.env.NODE_ENV || 'development';
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-development';
const port = process.env.PORT || 3000;

mongoose.Promise = global.Promise;

mongoose.connect(uri, { useMongoClient: true }).then(() => {
  app.listen(port, () => {
    console.log(`Started up at port ${port}`);
  });
}).catch(err => console.log(err));
