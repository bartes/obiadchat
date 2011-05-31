var socket = new io.Socket(null, {port: 8081, rememberTransport: false});
var json = JSON.stringify;
function message(obj){
  var el = $("<p>");
  el.html('<b>' + obj.message[0] + ':</b> ' + obj.message[1]);
  $('#chat').append(el).scrollTop(1000000);
}
function announcement(obj){
  var el = $("<p>");
  el.html('<em>' + obj.announcement + '</em>');
  $('#chat').append(el).scrollTop(1000000);
}
function refreshOrder(data){
  $('#orders').html("").append($("<h3>Order:</h3>"))
  var el;
  $.each(data, function() {
    el = $("<p>");
    el.html('<b>' + this.user + '</b>:' + this.text + " - " + this.price);
    $('#orders').append(el);
  });
}
function refreshMembers(data){
  $('#members').html("").append($("<h3>Members:</h3>"))
  var el;
  $.each(data, function() {
    el = $("<p>");
    el.html('<b>' + this + '</b>');
    $('#members').append(el);
  });
}
$("form").live("submit", function(){
  var t = $(this).find("input[type=text]");
  var value = t.val();
  var obj, subelements;
  if(value.length === 0 ) {
    return;
  }

  if(!$(this).prop("emailconfirmed")){
    socket.connect();
    $(this).prop("email", value);
    obj = { name : value };
  } else {
    var order_data = value.match(/^\+\+([^;]+)[;]*([^;]*)/);
    var disorder_data = value.match(/^\-\-/);
    if(order_data) {
      obj = { order : {text: order_data[1], price: order_data[2]}};
    } else if(disorder_data){
      obj = { disorder : true};
    } else {
      obj = { message: value };
      message({ message: ['you', value] });
    }
  }
  socket.send(json(obj));
  t.val("");
  return false;
});

var bufferIterator = function() {
  message({message: [this.user, this.message]});
}

var parseInput = function(obj) {
  if (obj.buffer){
    $("form").prop("emailconfirmed", $("form").prop("email"));
    $('#chat').html("");
    $.each(obj.buffer, bufferIterator);
  } else if (obj.members){
    refreshMembers(obj.members);
  } else if (obj.orders) {
    refreshOrder(obj.orders);
  } else if (obj.disconnect){
    socket.disconnect();
  } else if (obj.message){
    message(obj);
  } else if (obj.announcement){
    announcement(obj);
  }
}
var onBuffer = function(buffer) {
  $("form").prop("emailconfirmed", $("form").prop("email"));
  $('#chat').html("");
  $.each(buffer, bufferIterator);
}
var parseInput = function(obj){
  _.each(_.keys(obj), function(i){
    switch(i){
      case "buffer": onBuffer(obj.buffer); break;
      case "members": refreshMembers(obj.members); break;
      case "orders": refreshOrder(obj.orders); break;
      case "message": message(obj.message); break;
      case "announcement": announcement(obj.announcement); break;
      case "disconnect": socket.disconnect(); break;
    }
  });
}

socket.on('message', parseInput);
socket.on('connect', function(){
  message({ message: ['System', 'Connected']})
});
socket.on('disconnect', function(){
  $(this).prop("emailconfirmed",null);
  message({ message: ['System', 'Disconnected']})
});

//socket.on('reconnect', function(){ message({ message: ['System', 'Reconnected to server']})});
//socket.on('reconnecting', function( nextRetry ){ message({ message: ['System', 'Attempting to re-connect to the server, next attempt in ' + nextRetry + 'ms']})});
//socket.on('reconnect_failed', function(){ message({ message: ['System', 'Reconnected to server FAILED.']})});

