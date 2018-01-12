const assert = require('assert');
const request = require('supertest');
const ObjectID = require('mongodb').ObjectID;

const app = require('./../../src/app');
const Todo = require('./../../src/models/todo');

const todos = [{
  _id: new ObjectID(),
  text: 'First test todo'
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 333
}];

beforeEach(done => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
});

describe('POST /todos', () => {
  it('should create a new todo', done => {
    const text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        assert.equal(res.body.text, text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({text}).then((todos) => {
          assert.equal(todos.length, 1);
          assert.equal(todos[0].text, text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create todo with invalid body data', done => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find().then((todos) => {
          assert.equal(todos.length, 2);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', done => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        assert.equal(res.body.todos.length, 2);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo document', done => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        assert.equal(res.body.todo.text, todos[0].text);
      })
      .end(done);
  });

  it('should return 404 if todo not found', done => {
    request(app)
      .get(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', done => {
    request(app)
      .get('/todos/123abc')
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', done => {
    const id = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .expect(200)
      .expect((res) => {
        assert.equal(res.body.todo._id, id);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(id).then(todo => {
          assert.equal(todo, null);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return 404 if todo not found', done => {
    const id = new ObjectID().toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', done => {
    request(app)
      .delete('/todos/123abc')
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo document', done => {
    const hexId = todos[0]._id.toHexString();
    const text = 'This should be the new text';

    request(app)
      .patch(`/todos/${hexId}`)
      .send({ completed: true, text })
      .expect(200)
      .expect((res) => {
        assert.equal(res.body.todo.text, text);
        assert.equal(res.body.todo.completed, true);
        assert(typeof res.body.todo.completedAt === 'number');
      })
      .end(done);
  });

  it('should clear completedAt when todo is not completed', done => {
    const hexId = todos[1]._id.toHexString();
    const text = 'This should be a new text';

    request(app)
      .patch(`/todos/${hexId}`)
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
