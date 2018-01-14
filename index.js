const mongoose = require('mongoose');
const app = require('./src/app');
const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  const config = (require('./config.json') || {})[env];
  Object.keys(config).forEach(key => {
    process.env[key] = config[key];
  });
}

const uri = process.env.MONGODB_URI;
const port = process.env.PORT;

mongoose.Promise = global.Promise;

mongoose.connect(uri, { useMongoClient: true }).then(() => {
  app.listen(port, () => {
    console.log(`Started up at port ${port}`);
  });
}).catch(err => console.log(err));
