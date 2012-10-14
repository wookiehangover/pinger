var Pinger = require('../pinger');
var http = require('http');

var url = 'http://localhost:1337';

console.log('Starting Pinger:', url);
var pinger = new Pinger(url);

pinger.emit('ping');
