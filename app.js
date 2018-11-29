const http = require('http');
const fs = require('fs');

const server_address = 'localhost';
const port = 3000;

let html_stream = fs.createReadStream('./assign3/test.html','utf8');

let server = http.createServer((req,res)=>{
	console.log(`A new request was made from ${req.connection.remoteAddress} for ${req.url}`);
	res.writeHead(200,{'Content-Type':'text/html'});
	html_stream.pipe(res);
});

console.log('Now listening on port ' + port);
server.listen(port,server_address);