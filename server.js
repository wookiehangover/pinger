var Pinger = require('./pinger');
var http = require('http');
var ramrod = require('ramrod');
var ecstatic = require('ecstatic');
var engine = require('engine.io');
var urlParse = require('url').parse;

var nodemailer = require('nodemailer');

var config = require('./config');
var mailer = nodemailer.createTransport(config.mailTransportType, config.mailTransportSettings);

var socket;

// Routes

var ec = ecstatic( __dirname );
var router = ramrod();

router.add('assets/*path', ec);

// TODO: put some templates up in here
router.on('*', function(req,res){
  req.url = '/index.html';
  ec(req,res);
});

// Pinger(s)

var urls = ['http://wookiehangover.com', 'http://b.gif.ly'];

urls.forEach(function(url){

console.log('Starting Pinger:', url);
  var pinger = new Pinger(url, 30e3);

  var hostname = urlParse(url).hostname;

  pinger.emit('ping', 2e3);

  pinger.on('alert', function( err, headers, errors ){

    if( errors === 1 ){
      var alert = {
        to: config.to,
        from: 'pinger@'+ hostname,
        subject: 'Alert: Downtime for '+ hostname,
        text: 'Uh oh, looks like there\'s downtime for '+ hostname +'.\r\n\r\n'+
          err + '\r\n\r\n'+
          (headers ? JSON.stringify(headers, '', '  ') : '')
      };

      mailer.sendMail(alert, function(){
        console.log('Downtime alert sent');
      });
    }

    // TODO more emailz for extended downtime

    if( socket ){
      socket.send(JSON.stringify({
        error: err,
        headers: headers,
        hostname: hostname,
        timestamp: +new Date()
      }));
    }
  });

  pinger.on('success', function( timestamp, headers ){
    if( socket ){
      socket.send(JSON.stringify({
        timestamp: timestamp,
        headers: headers,
        hostname: hostname,
        success: true
      }));
    }
  });

});

// Server

var server = http.createServer(function(req,res){
  router.dispatch(req,res);
});

server.listen(3000, function(){
  console.log('Listening on port 3000');
});

var io = engine.attach( server );

io.on('connection', function( s ){
  socket = s;
});
