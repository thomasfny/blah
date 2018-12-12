const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require('url');
const querystring=require('querystring');
const credentials_json=fs.readFileSync('./auth/credentials.json','utf-8');
const credentials=JSON.parse(credentials_json);

const post_data=querystring.stringify(credentials);
let options ={'method' :  "POST" , 'headers' : {  'Content-Type' : 'application/x-www-form-urlencoded' ,  'Content-Length' : post_data.length}}
const server_address = 'localhost';
const port = 3000;

let html_stream = fs.createReadStream('./html/search-form.html','utf8');
let image_stream= fs.readFileSync('./artist/pig.jpeg');

let server = http.createServer((req,res)=>{
	let booler;
	if(req.url==='/'){
		console.log(`A new request was made from ${req.connection.remoteAddress} : ${req.url}`);
		res.writeHead(200,{'Content-Type':'text/html'});
		html_stream.pipe(res);
	}
	else if(req.url==='/favicon.ico'){
		res.writeHead(200,{'Content-Type':'text/html'});		
		}
	else {
		let request_sent_time=Date.now();
		console.log(Date(request_sent_time));
		console.log(`A new request was made from ${req.connection.remoteAddress} : ${req.url}`);
		res.writeHead(200,{'Content-Type':'image/jpeg'});
		let user_input=req.url.substring(15,req.url.length);
		console.log(user_input);
		fs.writeFileSync('./auth/a.json',JSON.stringify(user_input), function(err){
		if(err){return console.log(err);}		
		});
		console.log(post_data);
		const authentication_req_url='https://accounts.spotify.com/api/token';		
		let authentication_req=https.request(authentication_req_url,options,authentication_res=>{
			received_authentication(authentication_res,res,user_input,request_sent_time);
		});
		authentication_req.on('error',(e)=>{
			console.error(e);
		});		 
		//
		let cache_valid=false;
		if(fs.existsSync('./auth/authentication_res.json')){
			let content=fs.readFileSync('./auth/authentication_res.json','utf-8');			
			let cache_auth=JSON.parse(content);
			booler=cache_auth;
			console.log("hello"+new Date(booler.expiration));
			if(new Date(cache_auth.expiration)>Date.now()){
				cache_valid=true;
				console.log(cache_valid);
			}
			else{
				console.log('Token Expired');
			}
		}
		//		
		//authentication_req.write(post_data);
		console.log("Requesting Token");
		console.log(authentication_req);
		authentication_req.end();		
		res.end(image_stream, 'binary');
	}	
});

function create_cache(authentication_res_data,user_input){		
	
	authentication_res_data.user_input=user_input;
	fs.writeFileSync('./auth/authentication_res.json',JSON.stringify(authentication_res_data), function(err){
		if(err){return console.log(err);}		
	});
}

function received_authentication(authentication_res,res,user_input,request_sent_time){
	authentication_res.setEncoding("utf8");
	let body="";
	authentication_res.on("data",data=> {body+=data;});
	authentication_res.on("end", ()=> {
		let authentication_res_data=JSON.parse(body);
		console.log(authentication_res_data);
		//
		console.log(request_sent_time);
		let temp=request_sent_time;
		let tem=new Date(temp);	
		tem.setHours(tem.getHours()+1);
		authentication_res_data.expiration= tem.toString();		
		console.log(authentication_res_data.expiration);	
		//		
		create_cache(authentication_res_data,user_input);
		//create_serch_req(authentication_res_data,res,user_input,request_sent_time);
	});
}

console.log('Now listening on port ' + port);
server.listen(port,server_address);
