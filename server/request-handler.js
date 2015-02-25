/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var url = require('url');
var qs = require('querystring');
var fs = require('fs');
var messages = {results:[]};
var data = '';

var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

var headers = defaultCorsHeaders;
headers['Content-Type'] = "application/json";

var sendResponse = function(response, data, statusCode) {
  response.writeHead(statusCode, headers);
  response.end(JSON.stringify(data));
};

var collectData = function(response, request) {
  var requestBody = '';
  request.on('data', function(data) {
    requestBody += data;
  });

  request.on('end', function() {
    var formData = qs.parse(requestBody);
    messages.results.push(JSON.parse(requestBody));
    sendResponse(response, messages, 201);
  });
};

var routes = {'/': true, '/classes/messages': true, '/classes/room1': true};

var actions = {
  'GET': function(response, request) {
    sendResponse(response, messages, 200);
  },
  'POST': function(response, request) {
    collectData(response, request);
  },
  'OPTIONS': function(response, request) {
    headers['Allow'] = 'GET, POST, PUT, HEAD, DELETE, OPTIONS';
    sendResponse(response, null, 200);
  }
};


exports.requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log("Serving request type " + request.method + " for url " + request.url);


  var path = url.parse(request.url).pathname;
  // The outgoing status.
  var statusCode = 201;
  var resourceCompletedCode = 201;

  var route = routes[path];
  if (route) {
    fs.readFile('../client/index.html', function(error, content) {
      console.log('entered file reading');
      if (error) {
          //console.log('error triggered!');
          response.writeHead(500);
          response.end();
      }
      else {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(content, 'utf-8');
      }
    });
    var action = actions[request.method];
    if ( action ) {
      action(response, request);
    } else {
      sendResponse(response, 'Not Found', 404);
    }
  } else {
     sendResponse(response, 'Not Found', 404);
  }

  console.log(url.parse(request.url));

  // actions[request.method]


  // if (request.method === 'OPTIONS') {
  //   headers['Allow'] = 'GET, POST, PUT, HEAD, DELETE, OPTIONS';
  //   sendResponse(response, null, 200);
  // }

  // if (path === '/classes/messages' || path === '/classes/room1'){
  //   if (request.method === 'GET') {
  //     sendResponse(response, messages, 200);
  //   } else if (request.method === 'POST') {
  //     var requestBody = '';
  //     request.on('data', function(data) {
  //       requestBody += data;
  //     });

  //     request.on('end', function() {
  //       var formData = qs.parse(requestBody);
  //       messages.results.push(JSON.parse(requestBody));
  //       sendResponse(response, messages, 201);
  //     });
  //   }
  // } else {
  //   response.writeHead(404, headers);
  //   response.end();
  // }

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
