const Hapi = require('hapi');
var spawn = require('child_process').spawn;
var Boom = require('boom');
var Base64 = require('js-base64').Base64;
var firebase = require("firebase");
var ref, db;

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
  port: process.env.PORT || 8000,
  routes: {
    cors: {
      credentials: true,
      exposedHeaders: ['x-response-time']
    }
  }
});

//Register Plugins
server.register(require('inert'), function(err){
  if (err) {
    throw err;
  }
})

// Add the route
server.route([{
  method: 'GET',
  path:'/',
  handler: function (request, reply) {
    var x = (new Date()).getTime();
    return reply('PhantomBot!').header('x-response-time', (new Date()).getTime() - x);
  }
},{
  method: 'GET',
  path:'/hello',
  handler: function (request, reply) {
    var x = (new Date()).getTime();
    return reply('hello world').header('x-response-time', (new Date()).getTime() - x)
  }
},{
  method: 'GET',
  path:'/op',
  handler: function (request, reply) {
    var x = (new Date()).getTime();
    return reply.file('./__op.html').header('x-response-time', (new Date()).getTime() - x)
  }
},{
  method: 'GET',
  path:'/do',
  handler: function (request, reply) {
    var x = (new Date()).getTime();
    function handleOutput(type, output) {
      data.push({
        type: type,
        output: output
      });
      if( type === 'close' ){
        var y = (new Date()).getTime()
        var timeReq = y - x;
        data.push({
          time: timeReq
        })
        ref.push({data: Base64.encode(data), started: x, cpmpleted: y, precessedIn: timeReq});
        reply(data).header('x-response-time', timeReq)
      }
    }

    if( request.query.timeout && isNaN(parseInt(request.query.timeout) ) ){
      reply(Boom.badRequest('invalid query')).header('x-response-time', (new Date()).getTime() - x)
    } else {
      data = [];
      p = spawn(
        'phantomjs',
        [
          'phantomTask.js',
          process.env.LOGIN_EMAIL || process.argv[2],
          process.env.LOGIN_PASS  || process.argv[3],
          '',
          parseInt(request.query.timeout)
        ]
      );

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
  }
}]);

// Start the server
server.start((err) => {

  if (err) {
      throw err;
  }
  // Initialize the app with a service account, granting admin privileges
  firebase.initializeApp({
    serviceAccount: JSON.parse(process.env.SERVICE_ACCOUNT),
    databaseURL: "https://so-bot.firebaseio.com"
  });

  // As an admin, the app has access to read and write all data, regardless of Security Rules
  db = firebase.database();
  ref = db.ref("operation");

  console.log('Server running at:', server.info.uri);
});
