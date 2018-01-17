const _ = require('lodash');
const { ObjectID } = require('mongodb');

const authenticate = require('../utils/authenticate');
const User = require('../models/user');

module.exports.setup = app => {
  app.post('/users', async (req, res) => {
    try {
      const body = _.pick(req.body, ['email', 'password']);
      const user = new User(body);

      await user.save();
      const token = user.generateAuthToken();
      res.header('x-auth', token).send(_.omit(user, ['password']));
    } catch (e) {
      res.status(400).send(e);
    }
  });

  app.post('/users/login', async (req, res) => {
    try {
      const { email, password } = _.pick(req.body, ['email', 'password']);
      const user = await User.findByCredentials(email, password);
      const token = await user.generateAuthToken();
      res.header('x-auth', token).send(user);
    } catch (e) {
      res.status(400).end();
    }
  });

  app.delete('/users/me/token', authenticate, async (req, res) => {
    try {
      await req.user.removeToken(req.token);
      res.status(200).end();
    } catch (error) {
      res.status(400).send(error);
    }
  });

  app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
  });
}
