const http = require('http');
const url = require('url');
const querystring = require('querystring');
const fs = require('fs');

function getArgvValue(argv, key) {
  let Value;

  for (const arg of argv) {
    const [argKey, argValue] = arg.split('=');
    if (argKey === key) {
      Value = argValue;
      break;
    }
  }

  return Value;
}

const argv = process.argv.slice(2);
const port = +(getArgvValue(argv, 'port') ?? 3000);
const resStatus = +(getArgvValue(argv, 'status') ?? 200);

http
  .createServer((req, res) => {
    let reqBody = '';

    req
      .on('data', (chunk) => (reqBody += chunk))
      .on('end', () => {
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
        console.log(`path  : ${req.method} ${reqUrl.pathname}`);
        if (reqUrl.query) {
          console.log('query :');
          console.log(JSON.parse(JSON.stringify(querystring.parse(reqUrl.query))));
        }
        if (reqBody) {
          console.log('body  :');
          console.log(JSON.parse(reqBody));
        }
        console.log(`status: ${resStatus}`);
        console.log(`file  : ${resFile}`);
        if (resBody) {
          console.log('chunk:');
          console.log(resBody.toString());
        }
      });
  })
  .listen(port);

console.log(`Server running at http://localhost:${port}/`);
