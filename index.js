const http = require('http');
const url = require('url');
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
const status = +(getArgvValue(argv, 'status') ?? 200);

http
  .createServer((req, res) => {
    let reqBody = '';

    req
      .on('data', (chunk) => (reqBody += chunk))
      .on('end', () => {
        const reqHost = req.headers.host?.replace(':', '-') || '';
        const reqUrl = url.parse(req.url);
        const resFile = `./${reqHost}/${reqUrl.pathname}/${req.method}/${status}`;
        let resBody;

        if (fs.existsSync(resFile)) resBody = fs.readFileSync(resFile);

        res.writeHead(req.method === 'OPTIONS' ? 200 : status, {
          'Access-Control-Allow-Headers': req.headers.origin || '*',
          'Access-Control-Allow-Origin': '*',
          // 'Access-Control-Allow-Credentials': true,
          // 'Access-Control-Allow-Methods': '*',
        });
        res.end(resBody);

        console.table({
          path: `${req.method}:${reqUrl.pathname}`,
          query: reqUrl.query ?? '',
          body: reqBody ? JSON.parse(reqBody) : '',
          '---': '---',
          status: status,
          file: resFile,
          chunk: resBody ? 'output below ...' : '',
        });
        if (resBody) console.log(`${resBody}`);
      });
  })
  .listen(port);
