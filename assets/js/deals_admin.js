jQuery(function($){

  var fields = $('form .control-group:not(.no-validation)');

  $('form').on('submit',function(e){
    var valid = true;

    fields.each(function(i,field){
      $(field).find('input, select, textarea').each(function(i,elem){
        var value = $(elem).val();
        if( value == "" || value == null ){
          valid = false;
          $(field).addClass('error');
        } else {
          $(field).removeClass('error');
        }
      });
    });

    return valid;
  });

});
