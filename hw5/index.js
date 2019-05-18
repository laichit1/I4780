var shelljs = require('shelljs');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var onlinecount = 0;
var msglist = new Array();
var namelist = new Array();
var seeyou = null;
app.use(express.static('public'));
// note: app.listen(3000) will NOT work here...
server.listen (1337, function() {
   console.log ('listening on port ' + 1337);
});

// express ...
app.get('/', function(req, res){
  console.log("連結成功");
  res.sendFile(__dirname + '/index.html');
});

app.get ('/change', function (req, res) {
	let name = req.query.name;
	console.log (name + ' is on ...')
	res.sendFile(__dirname + '/index-chat.html');
});

server.on('close', function(){
  console.log('Server is now closed');
  socket.emit('disconnect');
});

io.on('connection', function(socket){  // connection is same as connect
  onlinecount=0;
      var i=0;
    while(i<=namelist.length){
      if(namelist[i]!=null){
      onlinecount++;
      }
      i++;
    }
  socket.on('chat message', function(name,msg){
    var namemsg = name+"  :  "+msg;
    msglist.push(namemsg);
    io.emit('chat message', namemsg);
    io.emit("online", onlinecount);
  });

  socket.on('delmsg', function(lastmsg){
    var i=msglist.length;
    var errmsg;
    while(i > 0){
      if(lastmsg==msglist[i-1]){
        msglist[i-1]='***訊息已被刪除***';
        errmsg = 'done';
        break;
      }
      i--;
    }
    if(errmsg=='done'){
    io.emit('delmsg',errmsg);
  }
  });

  socket.on('loadmsg',function(){
    io.emit('loadmsg',msglist);
  });

  socket.on('getuser',function(){
    io.emit('getuser',namelist);
  });

  socket.on('inbox',function(myname,name,msg){
    var i=0;
    var nameid='';
    while(i<namelist.length){
      var namename = namelist[i].split(":");
      if(name == namename[0]){
        nameid = namename[1];
        break;
      }
      i++;
    }
    console.log(nameid);
    if(nameid != ''){
    io.to(nameid).emit('inbox',"~~~~  來自  "+myname+"  的私訊:  "+msg+"  ~~~~","fine");
      }else{
        i=0;
        while(i<namelist.length){
          var namename = namelist[i].split(":");
          if(myname == namename[0]){
            nameid = namename[1];
            break;
          }
          i++;
         }
        io.to(nameid).emit('inbox',"~~~~  你輸入的  "+name+"  名字有誤  ~~~~","fail");
      }
  });

  socket.on('disconnect', function() {
          
         var i=0;
         while(i<namelist.length){
          if(namelist[i]!=null){
          var outname = namelist[i].split(":")
          if(outname[1]==socket.id){
            seeyou = outname[0];
            namelist[i] = null;
            break;
          }
         }
         i++;
       }
       console.log("seeyou:"+seeyou);
       if(seeyou!=null){
        onlinecount--;
       io.emit("offmsg", seeyou+"離開了我們~!!");
     }
       io.emit("online", onlinecount);
    });

  socket.on('onmsg', function(name){
    var i=0;
    var msg;
    if(namelist.length>0){
      while(i<namelist.length){
        if(namelist[i]!= null){
        var cheakname = namelist[i].split(":")
        if(cheakname[0]==name){
          msg=404;
          break;
        }
      }
        i++;
      }
    }


    if(msg==404){
      io.to(socket.id).emit('cheakname',404);
    }else{
      io.to(socket.id).emit('cheakname',777);
      i=0,j=0;
    while(i <= namelist.length){
      if(namelist[i] == null ){
        j=i;
        break;
      }
      i++;
    }
    if(j >= 0){
      namelist[j] = name+":"+socket.id;
    }else{
      namelist.push(name+":"+socket.id);
    }
    onlinecount++;
    console.log("userlist:"+namelist);
    var namemsg = name +"上線啦~!!";
    io.emit('loadmsg',msglist);
    io.emit("online", onlinecount);
    io.emit('onmsg', namemsg);
    }
    io.emit("online", onlinecount);
  });

    io.emit("online", onlinecount);
});