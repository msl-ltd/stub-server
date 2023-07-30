const http = require('http');
const url = require('url');
const fs = require('fs');

function getCommandLineValue(argv, argKey) {
  let argValue;

  for (const arg of argv) {
    const [key, value] = arg.split('=');
    if (key === argKey) {
      argValue = value;
      break;
    }
  }

  return argValue;
}

const argv = process.argv.slice(2);
const port = +(getCommandLineValue(argv, 'port') ?? 3000);
const status = +(getCommandLineValue(argv, 'status') ?? 200);

const server = http.createServer((req, res) => {
  const header = {
    'Access-Control-Allow-Origin': req.headers.origin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': true,
  };

  let resBody;
  const origin = header['Access-Control-Allow-Origin'].replace('http://', '').replace(':', '-');
  const endPoint = req.url.split('?').shift();
  const path = `./${origin}/${endPoint}/${req.method}/${status}`;
  if (fs.existsSync(path)) {
      resBody = fs.readFileSync(path);
  }

  res.writeHead(req.method === 'OPTIONS' ? 200 : status, header);
  res.end(resBody);

  let reqBody = '';
  req
    .on('data', (chunk) => (reqBody += chunk))
    .on('end', () => {
      if (req.method !== 'OPTIONS') {
        console.log(`${req.method}:${endPoint}`);
        console.log(url.parse(req.url).search);
        console.log(reqBody ? JSON.parse(reqBody) : '');
        console.log(`${status}`);
        console.log(`${(resBody ?? '').toString()}`);
      }
    });
});

server.listen(port);
