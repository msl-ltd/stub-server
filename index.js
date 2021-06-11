const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    const header = {
        'Access-Control-Allow-Origin': req.headers.origin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': true,
    };

    let body;
    const origin = header['Access-Control-Allow-Origin'].replace('http://', '').replace(':', '-');
    const url = req.url.split('?').shift();
    const path = `./${origin}/${url}/${req.method}`;
    if (fs.existsSync(path)) {
        body = fs.readFileSync(path);
    }

    res.writeHead(200, header);
    res.end(body);
});

server.listen(3000);
