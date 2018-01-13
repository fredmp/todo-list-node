const assert = require('assert');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const app = require('./../../src/app');
const Todo = require('./../../src/models/todo');
const User = require('./../../src/models/user');
const { todos, users } = require('../seeds');

beforeEach(done => {
  Todo.insertMany(todos).then(() => {
    done()
  });
});

describe('POST /todos', () => {
  it('creates a new todo', done => {
    const text = 'Test todo text';
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({ text })
      .expect(200)
      .expect((res) => {
        assert.equal(res.body.text, text);
      })
      .end((err, res) => {
        if (err) return done(err);
        Todo.find({text}).then((todos) => {
          assert.equal(todos.length, 1);
          assert.equal(todos[0].text, text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('does not create todo with invalid body data', done => {
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);
        Todo.find().then((todos) => {
          assert.equal(todos.length, 2);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('returns all todos', done => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        assert.equal(res.body.todos.length, 1);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('returns todo document', done => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        assert.equal(res.body.todo.text, todos[0].text);
      })
      .end(done);
  });

  it('does not return todo document created by other user', done => {
    request(app)
      .get(`/todos/${todos[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('returns 404 if todo not found', done => {
    request(app)
      .get(`/todos/${new ObjectID().toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('returns 404 for non-object ids', done => {
    request(app)
      .get('/todos/123abc')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('removes a todo', done => {
    const id = todos[0]._id.toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        assert.equal(res.body.todo._id, id);
      })
      .end((err, res) => {
        if (err) return done(err);
        Todo.findById(id).then(todo => {
          assert.equal(todo, null);
          done();
        }).catch((e) => done(e));
      });
  });

  it('returns 404 if todo not found', done => {
    const id = new ObjectID().toHexString();
    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('returns 404 if object id is invalid', done => {
    request(app)
      .delete('/todos/123abc')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('updates the todo document', done => {
    const hexId = todos[0]._id.toHexString();
    const text = 'This should be the new text';

    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({ completed: true, text })
      .expect(200)
      .expect((res) => {
        assert.equal(res.body.todo.text, text);
        assert.equal(res.body.todo.completed, true);
        assert(typeof res.body.todo.completedAt === 'number');
      })
      .end(done);
  });

  it('clears completedAt when todo is not completed', done => {
    const hexId = todos[0]._id.toHexString();
    const text = 'This should be a new text';

    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({ completed: false, text })
      .expect(200)
      .expect((res) => {
        assert.equal(res.body.todo.text, text);
        assert.equal(res.body.todo.completed, false);
        assert.equal(res.body.todo.completedAt, null);
      })
      .end(done);
  });
});
