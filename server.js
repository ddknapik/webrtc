var http    = require('http'),
    fs      = require('fs'),
    path    = require('path'),
    mime    = require('mime'),
    sockets = require('./sockets'),
    cache   = {};

var notFound, sendAsset, serveAsset, server;


notFound = function (res) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.write('There is no such resource');
    res.end();
};

sendAsset = function (res, assetPath, contents) {
    res.writeHead(200, {
        'Content-Type': mime.lookup(path.basename(assetPath))
    });
    res.end(contents);
};

serveAsset = function (res, cache, absPath) {
    // if (cache[absPath]) {
    //     return sendAsset(res, absPath, cache[absPath]);
    // }
    fs.exists(absPath, function (exists) {
        if (!exists) { notFound(res); }
        fs.readFile(absPath, function (err, data) {
            if (err) { return notFound(res); }
            cache[absPath] = data;
            sendAsset(res, absPath, data);
        });
    });
};

server = http.createServer(function (req, res) {
    var filePath, absPath;
    filePath = false;

    filePath = (req.url == '/' ? 'dist/index.html' :'dist' + req.url);
    absPath = './' + filePath;
    serveAsset(res, cache, absPath);
});

server.listen(3000, function () {
    console.log('Server is up!');
});

sockets.listen(server);
