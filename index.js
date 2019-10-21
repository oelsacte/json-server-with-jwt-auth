const yargs = require('yargs');
yargs.options({
  port: {
    alias: 'p',
    description: 'Set port',
    default: 3000
  },
  file: {
    alias: 'f',
    description: 'Set JSON File',
    default: './json-samples/default.json'
  },
  authentication: {
    alias: 'a',
    description: 'Enable authenticaded routes',
    default: 'true'
  },
  delay: {
    alias: 'd',
    description: 'Miliseconds delay before response',
    default: '1500'
  }
});

console.log(yargs.argv);

const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router(yargs.argv.file);
const middlewares = jsonServer.defaults();

server.use(jsonServer.bodyParser)

server.use(middlewares);

const userStorage = require('./security/users-storage')({
  email: 'user@example.com',
  password: '1234'
});
userStorage.logUsers();

const login = require('./routes/login-route')(userStorage);
server.post('/login', login);

const register = require('./routes/sign-in-route')(userStorage);
server.post('/sign-in', register);

if (yargs.argv.authentication === 'true') {
  const authMiddleware = require('./middleware/auth-middleware');
  server.use(authMiddleware);
}

const delayMiddleware = require('./middleware/delay-middleware')(yargs.argv.delay);
server.use(delayMiddleware);

const verify = require('./routes/verify-route');
server.get('/verify', verify);

server.use(router);
server.listen(yargs.argv.port, () => {
  console.log(`
JSON Server is running on port ${yargs.argv.port}
http://localhost:${yargs.argv.port}
`)
});