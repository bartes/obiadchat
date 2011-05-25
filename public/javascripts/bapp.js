var identifier = parent.window.$("#gbi4m1").text();
var socket = new io.Socket(null, {port: 8081, rememberTransport: false});
var json = JSON.stringify;
function message(obj){
  console.log(obj)
  var el = $("<p>");
  if(obj.announcement){
    el.html('<em>' + obj.announcement + '</em>');
  }
  if(obj.message) {
    el.html('<b>' + obj.message[0] + ':</b> ' + obj.message[1]);
    console.log(obj.message[0], obj.message[1]);
  }
  $('#chat').append(el).scrollTop(1000000);
}

$("form").live("submit", function(){
  var t = $(this).find("input[type=text]");
  var value = t.val();
  if(value.length === 0 ) {
    return;
  }
  socket.send(json({message:value}));
  message({ message: ['you', value] });
  t.val("");
  return false;
});

socket.on('message', function(obj){
  if (obj.buffer){
    $('#chat').html("");
    $.each(obj.buffer, function() {
      message({message: [this.user, this.message]});
    });
  } else {
    message(obj);
  }
});

socket.on('connect', function(){
  socket.send(json({name:identifier}));
  message({ message: ['System', 'Connected']})
});
socket.on('disconnect', function(){ message({ message: ['System', 'Disconnected']})});
//socket.on('reconnect', function(){ message({ message: ['System', 'Reconnected to server']})});
//socket.on('reconnecting', function( nextRetry ){ message({ message: ['System', 'Attempting to re-connect to the server, next attempt in ' + nextRetry + 'ms']})});
//socket.on('reconnect_failed', function(){ message({ message: ['System', 'Reconnected to server FAILED.']})});

socket.connect();

