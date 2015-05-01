var Hapi = require('hapi');
var Path = require('path');

var server = new Hapi.Server();
server.connection({ port: 80 });


server.route({
	method: '*',
	path: '/',
	handler: function (request, reply) {
		var uaString = request.headers['user-agent'];
		if (/MSIE [6-8]\./.test(request.headers['user-agent'])) {
			return reply.file(Path.join(__dirname, 'static', 'index_ie8.html'));
		}
		reply.file(Path.join(__dirname, 'static', 'index.html'));
	}
});

server.route({
	method: '*',
	path: '/{p*}',
	handler: {
		proxy: {
			host: 'www.library.ucsf.edu',
			port: 80,
			passThrough: true,
			xforward: true
		}
	}
});

server.start(function () {
    console.log('Server running at:', server.info.uri);
});