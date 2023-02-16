const http = require('http');
const fs = require('fs');

function getCommandLineValue(argv, argKey) {
    let argValue;    

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        const [key, value] = arg.split('=');
        if (key === argKey) {
            argValue = value;
            break;
        }
    }

    return argValue;
}

const status = +(getCommandLineValue(process.argv.slice(2), 'status') ?? 200);

const server = http.createServer((req, res) => {
    const header = {
        'Access-Control-Allow-Origin': req.headers.origin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': true,
    };

    let body;
    const origin = header['Access-Control-Allow-Origin'].replace('http://', '').replace(':', '-');
    const url = req.url.split('?').shift();
    const path = `./${origin}/${url}/${req.method}/${status}`;
    if (fs.existsSync(path)) {
        body = fs.readFileSync(path);
    }

    res.writeHead(req.method === 'OPTION' ? 200 : status, header);
    res.end(body);
});

server.listen(3000);
