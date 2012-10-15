/*global describe, it, after, before, beforeEach, afterEach*/
var
  Pinger = require('../pinger'),
  http = require('http'),
  assert = require('assert');

describe('Pinger', function(){
  var server, pinger;
  var url = 'http://localhost:9001';

  before(function(done){
    server = http.createServer(function(req, res){
      res.writeHead(200);
      res.end('Hello World');
    });

    server.listen(9001, done);
  });

  after(function(){
   try { server.close(); } catch(e){ }
  });

  beforeEach(function(){
    pinger = new Pinger(url, 1);
  });

  afterEach(function(){
    pinger.emit('kill');
  });

  it('should ping a server', function(done){
    pinger.emit('ping');

    pinger.on('success', function(timestamp, res){
      assert.equal(res.statusCode, 200);
      done();
    });
  });

  it('should respond to downtime', function(done){
    pinger.emit('ping');
    server.close();

    pinger.on('alert', function(error, res, errors){
      assert.equal(error, 'Unable to connect to host');
      server.listen(9001, done);
    });
  });

});
