var env = exports.env = process.env.NODE_ENV || process.env.APPLICATION_MODE;
var config;

console.log('Starting app in ' + env + ' mode');

if(env === 'production'){
  config = require('./config.prod');
}
else try{
  config = require('./config.dev');
}
catch(err){
  console.error('Warning: No valid configurations found.');
  config = {};
}

Object.keys(config).forEach(function(k){
  exports[k] = config[k];
})
