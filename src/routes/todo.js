const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;

const authenticate = require('../utils/authenticate');
const Todo = require('../models/todo');

module.exports.setup = app => {
  app.post('/todos', authenticate, async (req, res) => {
    try {
      const todo = new Todo({
        _user: req.user._id,
        text: req.body.text
      });

      const doc = await todo.save();
      res.send(doc);
    } catch (e) {
      res.status(400).send(e);
    }
  });

  app.get('/todos', authenticate, async (req, res) => {
    try {
      const todos = await Todo.find({ _user: req.user._id });
      res.send({ todos });
    } catch (e) {
      res.status(400).send(e);
    }
  });

  app.get('/todos/:id', authenticate, async (req, res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
      return res.status(404).end();
    }

    try {
      const todo = await Todo.findOne({ _id: id, _user: req.user._id });
      if (!todo) {
        return res.status(404).end();
      }
      res.send({ todo });
    } catch (e) {
      res.status(400).send(e);
    }
  });

  app.delete('/todos/:id', authenticate, async (req, res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
      return res.status(404).end();
    }

    try {
      const todo = await Todo.findOneAndRemove({ _id: id, _user: req.user._id });
      if (!todo) {
        return res.status(404).end();
      }
      res.send({ todo });
    } catch (e) {
      res.status(400).send(e);
    }
  });

  app.patch('/todos/:id', authenticate, async (req, res) => {
    const id = req.params.id;
    const body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)) {
      return res.status(404).end();
    }

    if (_.isBoolean(body.completed) && body.completed) {
      body.completedAt = new Date().getTime();
    } else {
      body.completed = false;
      body.completedAt = null;
    }

    try {
      const todo = await Todo.findOneAndUpdate(
        { _id: id, _user: req.user._id },
        { $set: body },
        { new: true }
      );

      if (!todo) {
        return res.status(404).end();
      }
      res.send({todo});
    } catch (e) {
      res.status(400).send(e);
    }
  });
}
