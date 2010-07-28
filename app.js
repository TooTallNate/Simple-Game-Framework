// "Simple Game Framework" Development Server
// ------------------------------------------
// Meant to be used with 'NodeJS':
//     http://github.com/ry/node
//   and 'spark':
//     http://github.com/senchalabs/spark

var fs = require("fs");
var sys = require("sys");
var spawn = require('child_process').spawn;
var path = require("path");
var connect = require("./vendor/connect/lib/connect");

var server = connect.createServer(
  connect.logger(),
  function(req, res, next) {
    if (req.url == "/src/html/dist/SGF.js") {
      
    } else if (req.url == "/src/html/dist/SGF.debug.js") {
      var code = injectScripts(path.join(__dirname, "src/html/src/Main.js"));
      res.writeHead(200, { 'Content-Type': 'text/javascript' });
      res.end(code);
    } else {
      next();
    }
  },
  connect.staticProvider(__dirname)
);

function injectScripts(main) {
  var currentDir = path.join(main, "..");
  return fs.readFileSync(main, 'utf8').replace(/\/\/{[^{}]+}/g, function(key){
    var val = path.join(currentDir, key.replace(/[{}]+/g, "").substring(2));
    return injectScripts(val);
  });
}

module.exports = server;
