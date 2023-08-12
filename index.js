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
          // 'Access-Control-Allow-Methods': '*',
          // 'Access-Control-Allow-Credentials': true,
        });
        res.end(resBody);

        console.table({
          reqPoint: `${req.method}:${reqUrl.pathname}`,
          reqQuery: reqUrl.query ?? '',
          reqBody: reqBody ? JSON.parse(reqBody) : '',
          '---': '---',
          resStatus: status,
          resFile: resFile,
          resBody: resBody ? 'output below ...' : '',
        });
        if (resBody) console.log(`${resBody}`);
      });
  })
  .listen(port);
