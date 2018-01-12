const assert = require('assert');
const request = require('supertest');
const ObjectID = require('mongodb').ObjectID;

const app = require('./../../src/app');
const User = require('./../../src/models/user');

describe('POST /users', () => {
  it('should create a new user', done => {
    const email = 'user@domain.com';

    request(app)
      .post('/users')
      .send({email})
      .expect(200)
      .expect((res) => {
        assert.equal(res.body.email, email);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.find({email}).then((users) => {
          assert.equal(users.length, 1);
          assert.equal(users[0].email, email);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create user with invalid body data', done => {
    request(app)
      .post('/users')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.find().then((users) => {
          assert.equal(users.length, 0);
          done();
        }).catch((e) => done(e));
      });
  });
});
