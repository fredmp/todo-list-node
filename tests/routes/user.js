const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const app = require('./../../src/app');
const User = require('./../../src/models/user');
const { users } = require('../seeds');

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
      .then(res => {
        expect(res.headers['x-auth']).toBeDefined();
        expect(res.body.email).toBe(email);
        User.find({email}).then((users) => {
          expect(users.length).toBe(1);
          expect(users[0].email).toBe(email);
          expect(users[0].password).not.toBe(password);
          expect(users[0].password.length).toBeGreaterThan(10);
          done();
        }).catch((e) => done(e));
      });
  });

  it('returns validation errors if request is invalid', done => {
    request(app)
      .post('/users')
      .send({})
      .expect(400)
      .then(res => {
        User.find().then((users) => {
          expect(users.length).toBe(2);
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
      .then(res => {
        expect(res.body.errmsg.includes('duplicate key error')).toBeTruthy();
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
      .then(res => {
        expect(res.body._id).toBe(users[0]._id.toString());
        expect(res.body.email).toBe(users[0].email);
        done();
      });
  });

  it('returns 401 if not authenticated', done => {
    request(app)
      .get('/users/me')
      .set('x-auth', 'invalid_token')
      .expect(401)
      .then(res => {
        done();
      });
  });
});

describe('POST /users/login', () => {
  it('logs in the user and returns auth token', done => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .then(res => {
        expect(res.body.email).toBe(users[1].email);
        User.findById(users[1]._id).then(user => {
          expect(res.headers['x-auth']).toBe(user.tokens[0].token);
          done();
        }).catch(e => done(e));
      });
  });

  it('rejects invalid login', done => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: 'invalid_password'
      })
      .expect(400)
      .then(res => {
        User.findById(users[1]._id).then(user => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch(e => done(e));
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('removes auth token', done => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .then(res => {
        User.findById(users[1]._id).then(user => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch(e => done(e));
      });
  })
})
