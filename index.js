const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    const header = {};
    header['Access-Control-Allow-Origin'] = req.headers.origin;
    header['Access-Control-Allow-Headers'] = 'Content-Type';
    header['Access-Control-Allow-Credentials'] = true;

    let body;
    const domain = header['Access-Control-Allow-Origin'].replace('http://', '').replace(':', '-');
    const path = `./${domain}/${req.url}/${req.method}`;
    if (fs.existsSync(path)) {
        body = fs.readFileSync(path);
    }

    res.writeHead(200, header);
    res.end(body);
});

server.listen(3000);
