const jwt = require('jsonwebtoken');
const assert = require('assert');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const app = require('./../../src/app');
const User = require('./../../src/models/user');
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
    password: 'password2',
    tokens: [
      { access: 'auth', token: jwt.sign({ _id: userTwoId, access: 'auth' }, '2244').toString() }
    ]
  }
];

beforeEach(done => {
  Promise.all([
    new User(users[0]).save(),
    new User(users[1]).save(),
  ]).then(() => done());
});

describe('POST /users', () => {
  it('creates a user', done => {
    const email = 'user@domain.com';
    const password = 'new-password';

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(200)
      .expect((res) => {
        assert.equal(res.body.email, email);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        assert(!!res.headers['x-auth']);
        assert.equal(res.body.email, email);
        User.find({email}).then((users) => {
          assert.equal(users.length, 1);
          assert.equal(users[0].email, email);
          assert.notEqual(users[0].password, password);
          assert(users[0].password.length > 10);
          done();
        }).catch((e) => done(e));
      });
  });

  it('returns validation errors if request is invalid', done => {
    request(app)
      .post('/users')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.find().then((users) => {
          assert.equal(users.length, 2);
          done();
        }).catch((e) => done(e));
      });
  });

  it('does not create user if email is in use', done => {
    const email = 'user1@domain.com';
    const password = 'password1';

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        assert(res.body.errmsg.includes('duplicate key error'));
        done();
      });
  });
});

describe('GET /users/me', () => {
  it('returns user if authenticated', done => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body._id, users[0]._id.toString());
        assert.equal(res.body.email, users[0].email);
        done();
      });
  });

  it('returns 401 if not authenticated', done => {
    request(app)
      .get('/users/me')
      .set('x-auth', 'invalid_token')
      .expect(401)
      .end((err, res) => {
        done();
      });
  });
});
