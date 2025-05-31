'use strict';

const http = require('node:http');
const url = require('node:url');
const querystring = require('node:querystring');
const fs = require('node:fs');

function sleep(ms) {
  for (const start = Date.now(); Date.now() - start < ms; );
}

function getArgvValue(argv, key) {
  let value;

  for (const arg of argv) {
    const [argKey, argValue] = arg.split('=');
    if (argKey === key) {
      value = argValue;
      break;
    }
  }

  return value;
}

const argv = process.argv.slice(2);
const port = +(getArgvValue(argv, 'port') ?? 3000);
const resStatus = +(getArgvValue(argv, 'status') ?? 200);
const resSleep = +(getArgvValue(argv, 'sleep') ?? 0);

http
  .createServer((req, res) => {
    let reqBody = '';

    req
      .on('data', (chunk) => (reqBody += chunk))
      .on('end', () => {
        if (req.method !== 'OPTIONS') {
          sleep(resSleep);
        }

        const cookies = Object.fromEntries(
          req.headers.cookie?.split(';').map((keyValue) => keyValue.trim().split('=')) || ''
        );
        const reqOrigin = req.headers.origin?.replace('http://', '').replace(':', '-') || '';
        const reqUrl = url.parse(req.url);
        const resFile = `./${reqOrigin}/${reqUrl.pathname}/${req.method}/${resStatus}`;
        let resBody;

        if (fs.existsSync(resFile)) resBody = fs.readFileSync(resFile);

        res.writeHead(req.method === 'OPTIONS' ? 200 : resStatus, {
          'Access-Control-Allow-Origin': req.headers.origin || '*',
          'Access-Control-Allow-Headers': req.headers['access-control-request-headers'] || '*',
          // 'Access-Control-Allow-Credentials': true,
        });
        res.end(resBody);

        console.log('---');
        console.log('cookie:', cookies);
        console.log('path  :', req.method, reqUrl.pathname);
        if (reqUrl.query) {
          console.log('query :', JSON.parse(JSON.stringify(querystring.parse(reqUrl.query))));
        }
        if (reqBody) {
          console.log('body  :', reqBody);
        }
        console.log('status:', resStatus);
        console.log('file  :', resFile);
        if (resBody) {
          console.log('chunk:', resBody.toString());
        }
      });
  })
  .listen(port);

console.log(`Server running at http://localhost:${port}/`);
