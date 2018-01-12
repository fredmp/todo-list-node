const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;

const User = require('../models/user');

module.exports.setup = app => {
  app.post('/users', (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);
    const user = new User(body);

    user.save().then((doc) => {
      res.send(_.omit(doc, ['password']));
    }, (e) => {
      res.status(400).send(e);
    });
  });
}
