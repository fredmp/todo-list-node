const _ = require('lodash');
const { ObjectID } = require('mongodb');

const authenticate = require('../utils/authenticate');
const User = require('../models/user');

module.exports.setup = app => {
  app.post('/users', (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);
    const user = new User(body);

    user.save().then(() => {
      return user.generateAuthToken();
    }).then(token => {
      res.header('x-auth', token).send(_.omit(user, ['password']));
    }).catch(e => {
      res.status(400).send(e);
    });
  });

  app.post('/users/login', (req, res) => {
    const { email, password } = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(email, password)
      .then(user => {
        user.generateAuthToken().then(token => {
          res.header('x-auth', token).send(user);
        })
      })
      .catch(error => {
        res.status(400).end();
      });
  });

  app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
  });
}
