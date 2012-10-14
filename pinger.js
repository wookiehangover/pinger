module.exports = Pinger;
var request = require('request');
var nodemailer = require('nodemailer');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var mailer = nodemailer.createTransport('SMTP', {
  service: "SendGrid",
  auth: {
    user: process.env.SG_USER,
    pass: process.env.SG_PASS
  }
});

function Pinger( url, interval, statusCode ){
  var self = this;

  if( !url ){
    throw new Error('You must provide a url');
  }
  this.url = url;
  this.start = +new Date();
  this.interval = interval || 60e3;
  this.errors = 0;
  this.ticks  = 0;
  this.statusCode = statusCode || 200;

  this.on('ping', function( interval ){
    setTimeout(function(){
      self.ping( self.handleRequest );
    }, interval || this.interval);
  });

  this.on('kill', function(){
    self.removeAllListeners('ping');
  });

  this.on('alert', this.alert);
}

util.inherits(Pinger, EventEmitter);

Pinger.prototype.alert = function(){
  console.log('oh no, downtime');
};

Pinger.prototype.handleRequest = function(err, res){
  if(err){
    this.errors += 1;
    console.log(err);
    this.emit('alert', err, res, this.errors);
  }

  if( res ){
    // console.log(res.headers);
    // console.log(res.statusCode);

    if( res.statusCode !== this.statusCode ){
      this.errors += 1;
      this.emit('alert', 'Status Code:'+ res.statusCode, res);
    } else {
      this.emit('success', +new Date(), res);
      this.errors = 0;
    }
  } else {
    this.errors += 1;
    this.emit('alert', 'Unable to connect to host', res, this.errors);
  }

  this.emit('ping');
};

Pinger.prototype.ping = function( cb ){
  // console.log('\nSending Request:');
  this.tick += 1;
  var self = this;
  // var time = process.hrtime();
  request.head(this.url, function(err, res){

    // var diff = process.hrtime(time);
    // console.log('benchmark took %d seconds and %d nanoseconds',
    //           diff[0], diff[1]);

    cb.call(self, null, res);
  });
};

