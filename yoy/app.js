const http= require ('http');
const fs=require('fs');
const url_lib=require('url');


let server=http.createServer((req,res)=>{
	console.log(`${req.method} request was made for ${req.url}`);
	//to seperate traffic
	if(req.url==='/'){               
		let html_stream=fs.createReadStream('html/index.html');
			html_stream.on('error',(err)=>{
				console.log(err);
				res.end(404);
			});
			res.writeHead(200,{'Content-Type':'text/html'});
			html_stream.pipe(res);
	}
	else if(req.url.includes('/burger')){
		let user_input=url_lib.parse(req.url,true).query;
		console.log(user_input);
		req_burger=http.get('http://localhost:3000/burger?q=' + user_input.q,res_burger=>{
			//res_burger.setEncoding("utf-8");
			console.og(res_burger);
			let body ="";
			res_burger.on('data',(data)=>{body+=data});
			res_burger.on('end',()=>{
				console.log(body);
				//fs.writeSync('burger.png',body);
			});			
		});
	}
});

server.listen(2000,'localhost');
console.log("Now listening on port 2K");