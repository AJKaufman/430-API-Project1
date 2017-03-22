// Code taken from Aidan Kaufman Http-Api-Assignment-2
const fs = require('fs');
const crypto = require('crypto');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const css = fs.readFileSync(`${__dirname}/../client/style.css`);

const quotes = {};

let etag = crypto.createHash('sha1').update(JSON.stringify(quotes));
let digest = etag.digest('hex');

const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const getCss = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(css);
  response.end();
};

// with a JSON body (GET)
const respond = (request, response, status, content) => {
  const header = {
    'Content-Type': 'application/json',
    etag: digest,
  };
  response.writeHead(status, header);
  response.write(JSON.stringify(content));
  response.end();
};

// no JSON body (HEAD)
const respondJSONMeta = (request, response, status) => {
  const header = {
    'Content-Type': 'application/json',
    etag: digest,
  };
  response.writeHead(status, header);
  response.end();
};

// GET, retrieves the desired quote
const getQuote = (request, response, params) => {
    
  if(!quotes[params.name]){
    const responseJSON = {
      getQuoteError: 'This person has no quotes',
    };
    return respond(request, response, 404, responseJSON);
  }
    
  console.log('getting quote');
  const responseJSON = {
    getQuote: quotes[params.name],
  };
  console.dir(responseJSON.getQuote);
      
    

    // check the client's if-none-match header to see the
    // number the client is returning from etag
    // If the version number (originally set by the server in
    // etag) is the same as our current one, then send a 304
    // 304 cannot have a body in it
  if (request.headers['if-none-match'] === digest) {
        // return 304 response without message
        // 304 is not modified and cannot have a body field
        // 304 will tell the browser to pull from cache instead
    return respondJSONMeta(request, response, 304);
  }

    // return 200 with message
  return respond(request, response, 200, responseJSON);
};


// HEAD Sends back whether there is a quote from the stated name
const getQuoteMeta = (request, response, params) => {

  if(!quotes[params.name]){
    return respondJSONMeta(request, response, 404);
  }

  console.log(quotes[params.name]);
    
  if (request.headers['if-none-match'] === digest) {
    return respondJSONMeta(request, response, 304);
  }

  return respondJSONMeta(request, response, 200);
};

// adds a quote to the repo
const addQuote = (request, response, body) => {
  const responseJSON = {
    message: 'Name and quote are both required.',
  };

  if (!body.name || !body.quote) {
    responseJSON.id = 'missingParams';
    return respond(request, response, 400, responseJSON);
  }

    // the default is 201
  let responseCode = 201;

    //
  if (quotes[body.name]) {
    responseCode = 204;
  } else {
    quotes[body.name] = {};
  }

    // throw the new quotes into the object
  quotes[body.name].name = body.name;
  quotes[body.name].quote = body.quote;

    // creating a new hash object
  etag = crypto.createHash('sha1').update(JSON.stringify(quotes));
    // recalculating the hash digest for etag
  digest = etag.digest('hex');

  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    responseJSON.name = quotes[body.name].name;
    responseJSON.quote = quotes[body.name].quote;
    return respond(request, response, responseCode, responseJSON);
  }

  return respondJSONMeta(request, response, responseCode);
};

// function for 404 not found requests with message
const notFound = (request, response) => {
  // create error message for response
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  // return a 404 with an error message
  respond(request, response, 404, responseJSON);
};

// function for 404 not found without message
const notFoundMeta = (request, response) => {
  // return a 404 without an error message
  respondJSONMeta(request, response, 404);
};

// exports to set functions to public
module.exports = {
  getIndex,
  getCss,
  getQuote,
  getQuoteMeta,
  addQuote,
  notFound,
  notFoundMeta,
};

