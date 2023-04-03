const FormData = require("form-data");
const fs = require("fs");
const https = require('https');

var form = new FormData();
form.append('image', fs.createReadStream('pasta.jpg'));

var headers = form.getHeaders();
headers['Authorization'] = 'Bearer dd5e0ea7e5d892464cce19c83609f2d1b341720a';

const options = {
    hostname: 'api.logmeal.es',
    path: '/v2/recognition/dish',
    method: 'POST',
    headers: headers,
};

const req = https.request(options, (res) => {
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

form.pipe(req);