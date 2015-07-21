var Hapi = require('hapi');
var Path = require('path');
var Fs = require('fs');

const proxyDefaultOptions = {
    host: process.env.HOST,
    port: process.env.PORT,
    redirects: 3,
    passThrough: false,
    xforward: true
};

const proxyPassThroughOptions = {
    host: process.env.HOST,
    port: process.env.PORT,
    redirects: 3,
    passThrough: true,
    xforward: true
}

var server = new Hapi.Server();
server.connection({ port: 80 });


server.route({
    method: '*',
    path: '/',
    handler: function (request, reply) {
        var uaString = request.headers['user-agent'];
        if (/MSIE [6-8]\./.test(request.headers['user-agent'])) {
            return reply.file(Path.join(__dirname, 'static/ie8.html'));
        }
        reply.file(Path.join(__dirname, 'static/index.html'));
    },
    config: {
        payload: {
            parse: false
        }
    }
});

server.route({
    method: '*',
    path: '/images/{file}',
    handler: function (request, reply) {
        // This is safe because {file} is only one path element, so it could be
        // .. but not ../.. or ../etc, and we check isFile()
        const fullPath = Path.join(__dirname, '/static/images/', request.params.file);
        Fs.stat(fullPath, function (err, data) {
            if (err || ! data.isFile()) {
                return reply.proxy(proxyDefaultOptions);
            }
            return reply.file(fullPath);
        });
    },
    config: {
        payload: {
            parse: false
        }
    }
});

server.route({
    method: '*',
    path: '/{p*}',
    handler: function (request, reply) {
        // Recent versions of Windows need the Content-type header to render CSS
        if (request.params.p.slice(-4) === '.css') {
            return reply.proxy(proxyPassThroughOptions);
        }
        return reply.proxy(proxyDefaultOptions);
    },
    config: {
        payload: {
            parse: false
        }
    }
});

server.start(function () {
    console.log('Server running at:', server.info.uri);
});