var email, password, file;
var system = require('system');
var fs = require('fs');
var page = require('webpage').create();
var config = require('./config');

if (system.args.length === 1) {
  console.log('Try to pass some args when invoking this script!');
} else {
  email = system.args[1]
  password = system.args[2]
  file = system.args[3] || "__op.html";
}

page.open(config.url, function (status) {
  page.includeJs("https://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.4/jquery.min.js", function() {
    page.evaluate(function(e, p) {
      $("#email").val(e);
      $("#password").val(p);
      $("#submit-button").click();
    }, email, password);

    setTimeout(function() {
      var content = page.content;
      try {
        fs.write(file, content, 'w');
      } catch(e) {
        console.log(e);
      }
      console.log('Exiting Now')
      phantom.exit();
    }, 30*1000);
  });
});
