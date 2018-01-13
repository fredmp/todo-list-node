const jwt = require('jsonwebtoken');
const { ObjectID } = require('mongodb');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [
  {
    _id: userOneId,
    email: 'user1@domain.com',
    password: 'password1',
    tokens: [
      { access: 'auth', token: jwt.sign({ _id: userOneId, access: 'auth' }, '2244').toString() }
    ]
  },
  {
    _id: userTwoId,
    email: 'user2@domain.com',
    password: 'password2'
  }
];

const todos = [
  {
    _id: new ObjectID(),
    _user: userOneId,
    text: 'First test todo'
  },
  {
    _id: new ObjectID(),
    _user: userTwoId,
    text: 'Second test todo',
    completed: true,
    completedAt: 333
  }
];

module.exports = {
  todos,
  users
}
