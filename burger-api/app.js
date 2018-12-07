const http = require('http');
const Jimp = require('Jimp');
const url_lib = require('url');
const fs = require('fs');


let server = http.createServer((req,res)=>{
	console.log(`${req.method} request was made for ${req.url}`);
	if (req.url === '/') {
		let stream = fs.createReadStream('./html/index.html');
		stream.on('error',(err)=>{
			console.log(err);
			res.end(404);
		});
		res.writeHead(200,{'Content-Type':'text/html'});
		stream.pipe(res);
	}
	else if(req.url.includes('/burger')){
		let user_input = url_lib.parse(req.url,true).query;
		if(check_cache(user_input.q,res)){
			console.log("Cache Hit");
			return;
		}
		console.log("Generating New Image");
		open_assets(user_input,res);
	}
	
});
server.listen(3000,'localhost');
console.log("Now Listening On Port 3K");

function check_cache(url,res){
	if (fs.existsSync(`cache/${url}.png`)) {
		let image_stream = fs.createReadStream(`cache/${url}.png`);
		image_stream.on('error', (err)=>{
			console.log(err);
			res.end(404);
		});
		res.writeHead(200,{'Content-Type' : 'image/jpeg'});
		image_stream.pipe(res);
		return true;
	}
	return false;
}


function open_assets (user_input,res){
	Jimp.read('assets/bun.png', (err, bun) => {
		if (err) throw err;
		Jimp.read('assets/cheese.png', (err, cheese) => {
			if (err) throw err;
			Jimp.read('assets/ketchup.png', (err, ketchup) => {
				if (err) throw err;
				Jimp.read('assets/mustard.png', (err, mustard) => {
					if (err) throw err;
					Jimp.read('assets/patty.png', (err, patty) => {
						if (err) throw err;
						parse_order(user_input.q, {bun,cheese,ketchup,mustard,patty}, res)	
					});
				});
			});
		});
	});
}

function parse_order(order,assets,res){
	let {bun,cheese,ketchup,mustard,patty} = assets;
	let burger = [];
	let burger_size = 130;
	
	for(let i = 0 ; i < order.length ; i++){
		let current_item = order.charAt(i);
		switch(current_item){
			case 'b':
				burger.push(bun);
				burger_size += 25;
				break;
			case 'c':
				burger.push(cheese);
				burger_size += 25;
				break;
			case 'k':
				burger.push(ketchup);
				burger_size += 1;
				break;
			case 'm':
				burger.push(mustard);
				burger_size += 1;
				break;
			case 'p':
				burger.push(patty);
				burger_size += 25;
				break;
		}
	}
	draw_burger(assets,res,burger,burger_size,order);
}

function draw_burger(assets,res,burger,burger_size,order){
	let {bun,cheese,ketchup,mustard,patty} = assets;
	
	new Jimp(326, burger_size , (err,canvas)=>{
		let yaxis = 0;
		for(part of burger){
			switch(part){
				case bun:
					canvas.blit(bun , 0 , yaxis);
					yaxis += 25;
					break;
				case cheese:
					canvas.blit(cheese , 0 , yaxis);
					yaxis += 25;
					break;
				case ketchup:
					canvas.blit(ketchup , 0 , yaxis);
					yaxis += 1;
					break;
				case mustard:
					canvas.blit(mustard , 0 , yaxis);
					yaxis += 1;
					break;
				case patty:
					canvas.blit(patty , 0 , yaxis);
					yaxis += 25;
					break;
			}
		}
		canvas.rotate(180).write(`cache/${order}.png`, ()=>{
			let image_stream = fs.createReadStream(`cache/${order}.png`);
			image_stream.on('error', (err)=>{
				console.log(err);
				res.end(404);
			});
			res.writeHead(200,{'Content-Type' : 'image/jpeg'});
			image_stream.pipe(res);
		})
	})
}