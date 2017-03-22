// Code taken from Aidan Kaufman Http-Api-Assignment-2
const http = require('http');
const url = require('url');
const handler = require('./responses.js');
const query = require('querystring');

const port = process.env.PORT || process.env.NODE_PORT || 3000;


const onRequest = (request, response) => {
  console.log(request.url);

  const parsedUrl = url.parse(request.url);
  const params = query.parse(parsedUrl.query);


  console.log(`onRequest ${parsedUrl.pathname}`);
  // check the request method (get, head, post, etc)
  switch (request.method) {
    case 'GET':
      if (parsedUrl.pathname === '/') {
        // if homepage, send index
        handler.getIndex(request, response);
      } else if (parsedUrl.pathname === '/style.css') {
        // if stylesheet, send stylesheet
        handler.getCss(request, response);
      } else if (parsedUrl.pathname === '/getQuote') {
        // if get Quote, send Quote object back
        handler.getQuote(request, response, params);
      } else {
        // if not found, send 404 message
        handler.notFound(request, response);
      }
      break;
    case 'HEAD':
      if (parsedUrl.pathname === '/getQuote') {
        // if get Quote, send meta data back with etag
        handler.getQuoteMeta(request, response, params);
      } else {
        // if not found send 404 without body
        handler.notFoundMeta(request, response);
      }
      break;
    case 'POST':
      if (parsedUrl.pathname === '/addQuote') {
        const res = response;

        const body = [];

        request.on('error', () => {
          res.statusCode = 400;
          res.end();
        });

        request.on('data', (chunk) => {
          body.push(chunk);
        });

        request.on('end', () => {
          const bodyString = Buffer.concat(body).toString();

          const bodyParams = query.parse(bodyString);

          handler.addQuote(request, res, bodyParams);
        });
      }
      break;
    default:
      // send 404 in any other case
      handler.notFound(request, response);
  }
};

http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);

