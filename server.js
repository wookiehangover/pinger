var Pinger = require('./pinger');
var http = require('http');
var ramrod = require('ramrod');
var ecstatic = require('ecstatic');
var engine = require('engine.io');
var urlParse = require('url').parse;
var templar = require('templar');
var ejs = require('ejs');

var nodemailer = require('nodemailer');

var config = require('./config');
var mailer = nodemailer.createTransport(config.mailTransportType, config.mailTransportSettings);

var socket;
// Pinger(s)

var urls = [
  'http://wookiehangover.com',
  'http://b.gif.ly',
  'http://quickleft.com',
  'http://jifasnif.jit.su'
];

var last_response = {};

urls.forEach(function(url){
  console.log('Starting Pinger:', url);
  var pinger = new Pinger(url, 30e3);

  var hostname = urlParse(url).hostname;

  pinger.emit('ping', 2e3);

  pinger.on('alert', function( err, res, errors ){

    if( errors === 1 ){
      var alert = {
        to: config.to,
        from: 'pinger@'+ hostname,
        subject: 'Alert: Downtime for '+ hostname,
        text: 'Uh oh, looks like there\'s downtime for '+ hostname +'.\r\n\r\n'+
          err + '\r\n\r\n'+
          (res.headers ? JSON.stringify(res.headers, '', '  ') : '')
      };

      mailer.sendMail(alert, function(){
        console.log('Downtime alert sent');
      });
    }

    // TODO more emailz for extended downtime

    var resp = last_response[hostname] = {
      error: err,
      headers: res.headers,
      statusCode: res.statusCode,
      hostname: hostname,
      timestamp: +new Date()
    };

    if( socket ){
      socket.send(JSON.stringify(resp));
    }
  });

  pinger.on('success', function( timestamp, res ){

    var resp = last_response[hostname] = {
      timestamp: timestamp,
      headers: res.headers,
      statusCode: res.statusCode,
      hostname: hostname,
      success: true
    };

    if( socket ){
      socket.send(JSON.stringify(resp));
    }
  });

});


// Routes

var ec = ecstatic( __dirname );
var router = ramrod();

router.add('assets/*path', ec);

var presented_urls = urls.map(function(url){
  return urlParse(url);
});

// TODO: put some templates up in here
router.on('*', function(req,res){
  res.template('index.ejs', {
    urls: presented_urls,
    responses: last_response
  });
});

// Server

var templateOptions = {
  engine: ejs,
  folder: './templates',
  cache: (process.env.NODE_ENV === 'production'),
  debug: (process.env.NODE_ENV !== 'production')
};

var server = http.createServer(function(req,res){
  res.template = templar(req, res, templateOptions);
  router.dispatch(req,res);
});

server.listen(3000, function(){
  console.log('Listening on port 3000');
});

var io = engine.attach( server );

io.on('connection', function( s ){
  socket = s;
});
