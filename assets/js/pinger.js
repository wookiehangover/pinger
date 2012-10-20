jQuery(function($){

  $('[data-key="timestamp"]').each(function(i, el){
    var time = moment( parseInt($(el).text(),10) ).format('MMMM Do YYYY, h:mm:ss a');
    $(el).text(time);
  });

  var socket = new eio.Socket({
    host: location.hostname,
    port: location.port
  });

  var s = [
    'Everything is kosher up in here.',
    'This battlestation is <i>fully</i> armed and <i>fully</i> operational.',
    'Situation Normal.',
    'Still alive and pinging.',
    'Seriously, it\'s still up.',
    'Outcome uncertain, try again later... j/k it\'s still up.',
    'Really. It\'s still up.',
    'How many times do you need to check?',
    'Alive and kicking.',
    'Internet tubes are working.'
  ];

  socket.on('message', function(data){
    data = JSON.parse(data);
    var host = $('[data-url="'+ data.hostname +'"]');
    var alert = host.find('.alert');

    if( data.error ){
      alert.slideUp(function(){
        alert
          .removeClass('alert-success')
          .addClass('alert-error')
          .html('<strong>Oh Noes!</strong> '+ data.error)
          .slideDown();
      });
    } else if( data.success ){
      alert.slideUp(function(){
        if( alert.hasClass('alert-error') ){
          alert
            .removeClass('alert-error')
            .addClass('alert-success');
        }

        alert
          .html('<strong>All Good.</strong> '+ s[Math.round(Math.random() * (s.length - 1))])
          .slideDown();
      });
    }

    var keys = ['timestamp', 'timer', 'statusCode', 'headers'];
    var key, value;

    if( data.timestamp ){
      data.timestamp = moment(data.timestamp).format('MMMM Do YYYY, h:mm:ss a');
    }

    if( data.headers ){
      data.headers = JSON.stringify(data.headers, '', '  ');
    }

    if( data.timer ){
      data.timer = data.timer.toFixed(4);
    }

    for(var i = 0; i < keys.length; i++){
      key = keys[i];
      if(value = data[key]){
        host.find('[data-key="'+ key +'"]').text(value);
      }
    }
  });
});
