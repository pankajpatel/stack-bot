const Hapi = require('hapi');
var spawn = require('child_process').spawn;

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
  port: process.env.PORT || 8000
});

// Add the route
server.route({
  method: 'GET',
  path:'/',
  handler: function (request, reply) {
    return reply('PhantomBot!');
  }
});
server.route({
  method: 'GET',
  path:'/hello',
  handler: function (request, reply) {
    return reply('hello world');
  }
});

server.route({
  method: 'GET',
  path:'/do',
  handler: function (request, reply) {
    data = [];
    p = spawn('phantomjs', ['phantomTask.js', process.env.LOGIN_EMAIL || process.argv[2], process.env.LOGIN_PASS  || process.argv[3]]);
    function handleOutput(type, output) {
      data.push({
        type: type,
        output: output
      });
      if( type === 'close' ){
        reply(data);
      }
    }
    p.stdout.on('data', function (data) {
      // handleOutput('stdout: ' + data);
      handleOutput('stdout', data);
    });

    p.stderr.on('data', function (data) {
      // handleOutput('stderr: ' + data);
      handleOutput('stderr', data);
    });

    p.on('close', function (code) {
      // handleOutput('child process exited with code ' + code);
      handleOutput('close', code);
    });
  }
});

// Start the server
server.start((err) => {

  if (err) {
      throw err;
  }
  console.log('Server running at:', server.info.uri);
});
