const http = require('http');
const createError = require('http-errors');
const logger = require('morgan');
const express = require('express');
const debug = require('debug')('examples');
const cors = require('cors');
const routes = require('./routes');

const whitelist = ['http://localhost:3000'];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) {
            return callback(null, true);
        }

        if (whitelist.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}

const app = express();
const port = 3001;

app.use(cors(corsOptions));
app.use(logger('dev'));
app.use('/', routes);

app.use(function(req, res, next) {
	next(createError(404));
});

/* eslint-disable-next-line no-unused-vars */
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.send(err.message);
});
app.set('port', port);

const server = http.createServer(app);
server.listen(port);
server.on('error', error => {
	if (error.syscall !== 'listen') {
		throw error;
	}

	const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

	if (error.code === 'EACCES') {
		console.error(bind + ' requires elevated privileges');
	} else if (error.code === 'EADDRINUSE') {
		console.error(bind + ' is already in use');
	}

	throw error;
});
server.on('listening', () => {
	const addr = server.address();
	const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
	debug('Listening on ' + bind);
});

module.exports = {app, server};
