const http= require ('http');
const Jimp=require('Jimp');
const url_lib=require('url');
const fs=require('fs');

let server=http.createServer((req,res)=>{
	console.log(`${req.method} request was made for ${req.url}`);
	//to seperate traffic
	if(req.url==='/'){               
		res.end(404);
	}
	else if(req.url.includes('/burger')){
		//get url and break it up to different components
		//will get {q.bcpcpb} object
		//from req.url to get the obj and put it in query.
		let user_input=url_lib.parse(req.url,true).query;
		
		//to check caching for more than 1 user
		if(cach_check(user_input.q)){	
			
			return;
		}
		
		//can't put code under open_assets() cuz it is asyn 
		//everything is in callback
		open_assets(user_input,res);
	}
	
});
server.listen(80,'localhost');
console.log("Now listening on port 80");


function cach_check(url){
if(fs.existsSync(`cache/${url}.png`)){
	let image_stream=fs.createReadStream(`cache/${url}.png`);
			image_stream.on('error',(err)=>{
				console.log(err);
				res.end(404);
			});
			res.writeHead(200,{'Content-Type':'image/jpeg'});
			image_stream.pipe(res);
			return ture;
	}
}

///////////////////////////////////////////input= "http://localhost/burger?q=bckmb"

//asyncronized function 
function open_assets(user_input,res){
	
	Jimp.read('assets/bun.png', (err,bun)=>{
		if(err) throw err;
		Jimp.read('assets/cheese.png', (err,cheese)=>{
			if(err)throw err;
			Jimp.read('assets/ketchup.png', (err,ketchup)=>{
				if(err)throw err;
				Jimp.read('assets/mustard.png', (err,mustard)=>{
					if(err)throw err;
					Jimp.read('assets/patty.png', (err,patty)=>{
						if(err)throw err;
						parse_order(user_input.q,{bun,cheese,ketchup,mustard,patty},res)
					});		
				});
			});
		});		
	});	
}

//to take order from user
//assets= patty, cheese,.... 
function parse_order(order,assets,res){
	//destruction technique
	// let bun=assets.bun;
	let {bun,cheese,ketchup,mustard,patty} =assets;
	let burger=[];
	//the image pixel size of burger since cheese.png has 326x130
	let burger_size=130;
	
	for(let i=0;i<order.length;i++){
		let current_item=order.charAt(i);
		switch(current_item){
			case 'b':
				burger.push(bun);
				//shift 25 pix up 
				burger_size+=25;
				break;
			case 'c':
				burger.push(cheese);
				burger_size+=25;
				break;
			case 'k':
				burger.push(ketchup);
				//cuz it is thin
				burger_size+=1;
				break;
			case 'm':
				burger.push(mustard);
				burger_size+=1;
				break;
			case 'p':
				burger.push(patty);
				burger_size+=25;
				break;
		}
	}
	draw_burger(assets,res,burger,burger_size,order);
}

//to draw from top down
//since the images are going to be reverse, it has to be flipped back
function draw_burger(assets,res,burger,burger_size,order){
	let {bun,cheese,ketchup,mustard,patty} =assets;
	//to create a blank image with cheese's actual x cor 
	new Jimp(326,burger_size,(err,canvas)=>{
		let yaxis=0;
		for(part of burger){
			switch(part){
				//blit allow to draw on top of the image or balnk space
				case bun:				
					canvas.blit(bun, 0, yaxis);
					yaxis+=25;
					break;
				case cheese:				
					canvas.blit(cheese, 0, yaxis);
					yaxis+=25;
					break;
				case ketchup:				
					canvas.blit(ketchup, 0, yaxis);
					yaxis+=1;
					break;
				case mustard:				
					canvas.blit(mustard, 0, yaxis);
					yaxis+=1;
					break;
				case patty:				
					canvas.blit(patty, 0, yaxis);
					yaxis+=25;
					break;
			}
		}	
		//canvas.flip(vertical,horizontal)
		//write allows to save image
		//()+>  call back
		canvas.flip(false,true).write(`cache/${order}.png`, ()=>{
			//as soon as image is saved, open back up
			let image_stream=fs.createReadStream(`cache/${order}.png`);
			image_stream.on('error',(err)=>{
				console.log(err);
				res.end(404);
			});
			res.writeHead(200,{'Content-Type':'image/jpeg'});
			image_stream.pipe(res);
		})
	})
}












































