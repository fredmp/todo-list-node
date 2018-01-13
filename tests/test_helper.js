const request = require('supertest');
const mongoose = require('mongoose');

before(done => {
  mongoose.Promise = global.Promise;

  mongoose.connect('mongodb://localhost:27017/todo-test', { useMongoClient: true });
  mongoose.connection
    .once('open', () => done())
    .on('error', error => {
      console.log('Error', error);
      done();
    });
});

after(done => {
  mongoose.disconnect();
  done();
});

afterEach(done => {
  const { todos, users } = mongoose.connection.collections;
  Promise.all([
    todos.drop(),
    users.drop()
  ])
  .then(() => users.ensureIndex({ 'email': 1 }, { unique: true }))
  .then(() => done())
  .catch(error => {
    if (error.codeName !== 'NamespaceNotFound') {
      console.log('Error', error);
    }
    done();
  });
});
