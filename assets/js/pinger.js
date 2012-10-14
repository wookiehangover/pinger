jQuery(function($){

  $('.timestamp').each(function(i, el){
    var time = moment( parseInt($(el).text(),10) ).format('MMMM Do YYYY, h:mm:ss a');
    $(el).text(time);
  });

  var socket = new eio.Socket({
    host: location.hostname,
    port: location.port
  });

  socket.on('message', function(data){
    data = JSON.parse(data);
    var host = $('[data-url="'+ data.hostname +'"]');

    if( data.timestamp ){
      var time = moment(data.timestamp).format('MMMM Do YYYY, h:mm:ss a');
      host.find('.timestamp').text(time);
    }

    if( data.statusCode ){
      host.find('code').text(data.statusCode);
    }

    if( data.headers ){
      host.find('.headers').text(JSON.stringify(data.headers, '', '  ') );
    }

    var alert = host.find('.alert');

    if( data.error ){
      alert
        .removeClass('alert-success')
        .addClass('alert-error')
        .html('<strong>Oh Noes!</strong> '+ data.error);
    } else if( alert.hasClass('alert-error') && data.success ){
      alert
        .removeClass('alert-error')
        .addClass('alert-success')
        .html('<strong>All Good.</strong> Everything is kosher up in here.');
    }

  });
});
