var fs = require('fs');	// 用于处理本地文件
var http = require('http');	// Http服务器API
var server = new http.Server();	// 创建新的HTTP服务器

server.listen(8000);	// 监听端口8000

var httpOpt,
	debug = process.argv.splice(2)[0];

fs.readFile('./serverPackage.json', function(err, data) {
	if(err) { 
        throw err; 
	}

	var json = JSON.parse(data);

	httpOpt=json.config;

	start(json);
});

function httpGet(url, callback, jsonData) {
	if(debug){
		callback(jsonData);	

		return;
	}
	console.log(httpOpt.href + url);

	http.get(httpOpt.href + url, function(response) {
		var data = [];

		response.on('data', function(chunk) {
			data.push(chunk); 
		}); 

		response.on('end', function() { 
			data = (Buffer.concat(data)).toString();  
			console.log(data);
			callback(data);
			
		});
	});
}

function httpPost(url, request, callback, jsonData) {
	if(debug){
		callback(jsonData);

		return;
	}

	var postdata = "";

	request.addListener("data", function(postchunk) {
		postdata += postchunk;
	});

	request.addListener("end", function() {
		return postDeal(url,callback,postdata);
	});	
}

function jsonOut(response, data) {
	response.writeHead(200, {'Content-type':'application/json; charset=UTF-8'});
	response.write(data);
	response.end();
}

function getType(endTag) {
    var type=null;

    switch(endTag) {
        case 'html' :
        case 'htm' :
            type = 'text/html; charset=UTF-8';
            break;
        case 'js' :
            type = 'application/javascript; charset="UTF-8"';
            break;
        case 'css' :
            type = 'text/css; charset="UTF-8"';
            break;
        case 'txt' :
            type = 'text/plain; charset="UTF-8"';
            break;
        case 'manifest' :
            type = 'text/cache-manifest; charset="UTF-8"';
            break;
        default :
            type = 'application/octet-stream';
            break;
    }

    return type;
}

function postDeal(url, callback, postdata) { // 服务器代 POST 理请求
	var postData = postdata;

	var opt = {
			host: httpOpt.host,
			port: httpOpt.port,
			path: url,
			method: 'POST',
			headers: {  
	            "Content-Type": 'application/x-www-form-urlencoded',  
	            "Content-Length": postData.length  
	        } 
		},
		data = [],
		req = http.request(opt, function(response) {
			response.on('data', function(chunk) { 
				data.push(chunk); 
			});

			response.on('end', function() { 
				data = (Buffer.concat(data)).toString();     

				callback(data);			
			});
		});

	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});

	req.write(postData);
	req.end();
}

function getUrlObject(url, json) {
	var i,
		r = false,
		object = json.dataList;

	for(i = 0; i < object.length; i++) {
		if(object[i].url == url){
			r = object[i];
			break;	
		}
	}
	return r;
}

function start(json) {
	// 使用on方法注册时间处理
	server.on('request', function(request, response) { 
		var jsonData,
			urlObject,
			url = require('url').parse(request.url);

		console.log('req:\t' + url.path + '\t' + (new Date())); // log request

		if(url.pathname == '' || url.pathname == '/') {
			fs.readFile('./index.html', function(err, content) {
				if(err) {
					response.writeHead(404, { 'Content-Type':'text/plain; charset="UTF-8"' });
					response.write(err.message);
					response.end();
				} else {
					response.writeHead(200, { 'Content-Type':'text/html; charset=UTF-8' });
					response.write(content);
					response.end();
				}
			});

			return;
		}

		urlObject = getUrlObject(url.pathname, json);

		if(urlObject) {
			jsonData = JSON.stringify(urlObject.data);

			if(urlObject.type == "post") {	// post	request
				httpPost(url.path, request, function(data) {			
					jsonOut(response, data);
				}, jsonData);
			} else {	// get request
				httpGet(url.path, function(data) {				
					jsonOut(response,data);
				}, jsonData);
			}

			return;
		}

		var filename = url.pathname.substring(1); // request fileName
		var type = getType( filename.substring(filename.lastIndexOf('.')+1) ); // .fileType

		fs.readFile(filename, function(err, content) {
			if(err) {
				response.writeHead(404, { 'Content-Type':'text/plain; charset="UTF-8"' });
				response.write(err.message);
				response.end();
			} else {
				response.writeHead(200, { 'Content-Type':type });
				response.write(content);
				response.end();
			}
		});
	});
}