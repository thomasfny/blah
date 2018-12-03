const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require('url');
const querystring=require('querystring');
//const JSON = require('json');
const credentials_json=fs.readFileSync('./auth/credentials.json','utf-8');
const credentials=JSON.parse(credentials_json);

const post_data=querystring.stringify(credentials);
//post_data.concat("&grant_type=client_credentials");
let options ={'method' :  "POST" , 'headers' : {  'Content-Type' : 'application/x-www-form-urlencoded' ,  'Content-Length' : post_data.length}}
const server_address = 'localhost';
const port = 3000;

let html_stream = fs.createReadStream('./html/search-form.html','utf8');
let image_stream= fs.readFileSync('./artist/pig.jpeg');

let server = http.createServer((req,res)=>{
	if(req.url==='/'){
		console.log(`A new request was made from ${req.connection.remoteAddress} : ${req.url}`);
		res.writeHead(200,{'Content-Type':'text/html'});
		html_stream.pipe(res);
	}
	else if(req.url==='/favicon.ico'){
		//console.log(`A new request was made from ${req.connection.remoteAddress} : ${req.url}`);
		res.writeHead(200,{'Content-Type':'text/html'});		
		}
	else {
		console.log(`A new request was made from ${req.connection.remoteAddress} : ${req.url}`);
		res.writeHead(200,{'Content-Type':'image/jpeg'});
		let user_input=req.url.substring(15,req.url.length);
		console.log(user_input);
		//post_data.append("&grant_type=client_credentials");
		console.log(post_data);
		const authentication_req_url='https://accounts.spotify.com/api/token';
		let request_sent_time=new Date();
		let authentication_req=https.request(authentication_req_url,options,authentication_res=>{
			received_authentication(authentication_res,res,user_input,request_sent_time);
		});
		authentication_req.on('error',(e)=>{
			console.error(e);
		});
		authentication_req.write(post_data);
		console.log("Requesting Token");
		authentication_req.end();
		
		
		//POST https://accounts.spotify.com/api/token
		//image_stream.on('error',function(err){
		//	console.log(err);
		//	res.writeHead(404);
		//	return res.end();
		//});
		res.end(image_stream, 'binary');
	}
	
	//else {
//		console.log(`A new request was made from ${req.connection.remoteAddress} : ${req.url}`);
	//	res.writeHead(200,{'Content-Type':'text/html'});
	//}
	
	
	//html_stream.pipe(res);

	
});

function received_authentication(authentication_res,res,user_input,request_sent_time){
	authentication_res.setEncoding("utf8");
	let body="";
	authentication_res.on("data",data=> {body+=data;});
	authentication_res.on("end", ()=> {
		let authentication_res_data=JSON.parse(body);
		console.log(authentication_res_data);
		//create_cache(authentication_res_data);
		//create_serch_req(authentication_res_data,res,user_input,request_sent_time);
	});
}



console.log('Now listening on port ' + port);
server.listen(port,server_address);



