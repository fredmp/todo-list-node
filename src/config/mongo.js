const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/todo-development';
  process.env.PORT = 3000;
} else if (env === 'test') {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/todo-test';
  process.env.PORT = 3000;
}
