var app = {
  server:'http://127.0.0.1:3000/classes/messages',
  username: 'anonymous',
  roomname: 'lobby',
  
  init() {
    app.username = window.location.search.substr(10);
    this.rooms = ['lobby'];
    this.friends = [];
  },

  send(message) {
    $.ajax({
      url: app.server,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
      },
      error: function (data) {
        console.error('chatterbox: Failed to send message', data);
      },
    });
  },

  fetch() {
    $.ajax({
      url: app.server,
      type: 'GET',
      // data: {order: '-createdAt'},
      dataType: 'json',
      success: function (data) {
        var dataArr = data['results'];
        var dataSanitized = _.filter(dataArr, function(message) {
          return (message['roomname'] !== undefined || message['username'] !== undefined 
            || !message.hasOwnProperty('username') || message['text'] !== undefined);
        });
        var roomSelected = $('#roomSelect').find(':selected').text();

        var dataRoom = _.filter(dataSanitized, function (message) {
          return (message['roomname'] === roomSelected);
        });

        for (var key in dataRoom) {
          var room = dataRoom[key]['roomname'];
          var username = dataRoom[key]['username'];
          var text = dataRoom[key]['text'];
          app.renderMessage(username, text, room);
        }

        for (var key in dataSanitized) {
          var rooma = dataSanitized[key]['roomname'];
          app.renderRoom(rooma);
        }
      },
      error: function (data) {
        console.log('chatterbox: Failed to fetch messages');
      },
    });
  },

  clearMessages() {
    $('#chats').empty();
  },

  renderMessage(username, text, room) {
    var usernameSpan = $('<span></span>').text(username);
    usernameSpan.addClass('username');
    usernameSpan.addClass(`${username}`);
    var textSpan = $('<span></span>').text(text);
    var div = $(`<div></div>`).addClass('chat').append(usernameSpan).append(textSpan).appendTo($('#chats'));
    if (this.friends.includes(username)) {
      usernameSpan.toggleClass('friend');
    }
  },

  renderRoom(room) {
    if (!this.rooms.includes(room) && room !== undefined && room !== '') {
      this.rooms.push(room);
      $('#roomSelect').append(`<option>${room}</option>`);
    }
  },

  handleUsernameClick(username) {
    if (!this.friends.includes(username)) {
      this.friends.push(username);
    }


    app.clearMessages();
    app.fetch();
  },

  handleSubmit(user, text, room) {
    var message = {
      username: user,
      text: text,
      roomname: room
    };
    app.send(message);
  },
};


$(document).ready(function() {
  app.init();
  app.fetch();

  setInterval( function() {
    app.clearMessages();    
    app.fetch();
  },10000);
    
  $(this).on('click', '.username', function(event) {
    console.log('gotcha ya friend!');
    var myClasses = $(this).attr('class');
    var myClassesString = myClasses.split(' ');
    console.log(myClassesString[1]);
    app.handleUsernameClick(myClassesString[1]);
  });

  $('#send').on('submit', function(event) {
    event.preventDefault();
    var userSearch = window.location.search;
    var userArr = userSearch.split('=');
    var user = userArr[1];
    var text = $('#messageBox').val();
    var room = $('#roomSelect').find(':selected').text();
    app.handleSubmit(user, text, room);
  });

  $('#roomForm').on('submit', function(event) {
    event.preventDefault();
    var text = $('#roomBox').val();
    app.renderRoom(text);
  });

  $('#roomSelect').change(function(event) {
    app.clearMessages();
    app.fetch();
  });
});