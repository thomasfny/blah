//BQAl8Pd70Y48HByOR4KQQ-QFI4-oa65cGmHZY31oaCoHyR-InEZNaLV_FyTabK7lmm1iz7jZIOyttVzhejI

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
	let booler;
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
		
		let request_sent_time=Date.now();
		console.log(`A new request was made from ${req.connection.remoteAddress} : ${req.url}`);
		res.writeHead(200,{'Content-Type':'image/jpeg'});
		let user_input=req.url.substring(15,req.url.length);
		console.log(user_input);
		fs.writeFileSync('./auth/a.json',JSON.stringify(user_input), function(err){
		if(err){return console.log(err);}
		//console.log("The authentication_res_data is saved");
	});
		//post_data.append("&grant_type=client_credentials");
		console.log(post_data);
		let cache_valid=false;		
		if(fs.existsSync('./auth/authentication_res.json')){
			let content=fs.readFileSync('./auth/authentication_res.json','utf-8');
			let cache_auth=JSON.parse(content);
			booler=cache_auth;
			if(new Date(cache_auth.expiration)>Date.now()){
				cache_valid=true;
				console.log(cache_valid);
			}
			else{
				console.log('Token Expired');
			}
			//create_serch_req(cache_auth,res,user_input);	
		}
		if(cache_valid){
			let content=fs.readFileSync('./auth/authentication_res.json','utf-8');
			let cache_auth=JSON.parse(content);
			setTimeout(() => { create_serch_req(cache_auth,user_input,request_sent_time)},10);			
		}
		else{			
		
		const authentication_req_url='https://accounts.spotify.com/api/token';
		
		let authentication_req=https.request(authentication_req_url,options,authentication_res=>{
			received_authentication(authentication_res,res,user_input,request_sent_time);
		});
		authentication_req.on('error',(e)=>{
			console.error(e);
		});
		authentication_req.write(post_data);
		console.log("Requesting Token");
		authentication_req.end();
		let content=fs.readFileSync('./auth/authentication_res.json','utf-8');
		let cache_auth=JSON.parse(content);
		setTimeout(() => { create_serch_req(cache_auth,user_input,request_sent_time)},10);
				
		}
		
		//create_serch_req(booler;,res,user_input);	
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

function create_cache(authentication_res_data,user_input){		
	
	authentication_res_data.user_input=user_input;
	fs.writeFileSync('./auth/authentication_res.json',JSON.stringify(authentication_res_data), function(err){
		if(err){return console.log(err);}
		console.log("The authentication_res_data is saved");
	});
}
function create_serch_req(authentication_res_data,user_input,request_sent_time){
	const user_search=fs.readFileSync('./auth/a.json','utf-8');
	const user_search_j=JSON.parse(user_search);
	const user_token=fs.readFileSync('./auth/authentication_res.json','utf-8');
	const user_credential=JSON.parse(user_token);   //from Json to obj
	const user_token_q=querystring.stringify(user_credential);   //from obj to queryString
	console.log(user_token_q);
	let user_options ={'method' :  "GET" , 'headers' : { 'Authorization' : 'Bearer '+user_credential.access_token   }}
	//let user_options ={'method' :  "GET", ' };
	let user_req_url='https://api.spotify.com/v1/search?';
	console.log(user_credential.user_input);
	user_req_url+=querystring.stringify({ q: user_search_j, type: 'artist' });
	console.log(user_req_url);
	user_result=https.request(user_req_url,user_options,res=>{
		res.setEncoding("utf8");
		let body="";
		res.on("data",data=> {body+=data;});
		res.on("end", ()=> {
		
		console.log(body);
		let img_path='./artist/'+user_search_j+'.jpeg';
		let artists=body["items"];
		console.log(artists);
		let items=artists["items"];
		let image_s=items[0].images;
		let image_req=https.get(image_s[0].url,image_res => {
		let new_img=fs.createWriteStream(img_path,{ 'encoding':null});
		image_res.pipe(new_img);
		new_img.on('finish',function(){
			//console.log(body.artists.images[0].url);
		});
	});
		image_req.on('error',function(err){console.log(err);});
	
		//create_cache(authentication_res_data);
	
		
		
	});
	});
	user_result.on('error',(e)=>{
			console.error(e);
	});
	//user_result.write(user_token_q);
	console.log("User Request");
	user_result.end();
	//console.log(user_result);
}


function received_authentication(authentication_res,res,user_input,request_sent_time){
	authentication_res.setEncoding("utf8");
	let body="";
	authentication_res.on("data",data=> {body+=data;});
	authentication_res.on("end", ()=> {
		let authentication_res_data=JSON.parse(body);
		console.log(authentication_res_data);
		console.log(request_sent_time);
		let temp=request_sent_time;
		let tem=new Date(temp);	
		tem.setHours(tem.getHours()+1);
		authentication_res_data.expiration= tem;		
		console.log(authentication_res_data.expiration);			
		
		create_cache(authentication_res_data,user_input);
		
	});
	
}




console.log('Now listening on port ' + port);
server.listen(port,server_address);



