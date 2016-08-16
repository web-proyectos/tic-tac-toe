//////////////////////////////////
///
///  code by lhernandezcruz
///  uses socket.io and express
///
//////////////////////////////////


// ids will contain the ids of games being played
// empty will represent an empty/new board
var ids = [];
var empty = {
    0: ""
    , 1: ""
    , 2: ""
    , 3: ""
    , 4: ""
    , 5: ""
    , 6: ""
    , 7: ""
    , 8: ""
};

// set up server
var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.use(express.static(__dirname + '/public'));

var port = (process.env.PORT || 8000);
serv.listen(port);
var io = require('socket.io')(serv, {});

// on socket connection
io.sockets.on('connection', function (socket) {
    // maybe in the future if i have the time
    // I will probs add a random id for each player
    // and implement a way to only allow 2 players per game
    // also tell user when other player disconnects
    // ... also delete gameID on disconnect (save space)
    
    
    // when user creates game give them gameID
    // add gameID to ids 
    // send the id to user and let them join the "room"
    socket.on("create new game", function () {
        // 
        var thisGameId = (Math.random() * 100000) | 0;

        thisGameId = thisGameId.toString();
        ids.push(thisGameId);
        socket.emit('newGameCreated', {
            gameId: thisGameId
        });
        socket.join(thisGameId);
    });

    // when person attempts to join game
    // make sure id exists and respond appropriately
    socket.on('playerJoinGame', function (data) {
        var gameID = data.gameid.toString();
        if (ids.indexOf(gameID) != -1) {
            // send data to both players
            this.join(gameID);
            socket.in(gameID).emit('joined', {
                gameId: gameID
                , board: empty
                , player: "X"
                , turn: true
            });
            socket.emit("joined", {
                gameId: gameID
                , board: empty
                , player: "0"
                , turn: false
            });
        } else {
            socket.emit("failed");
        }
    });
    
    // when someone makes move
    // check if it is a win, tie or loss
    // respond appropriately
    socket.on("moveMade", function (data) {
        // when move made get gameID
        var gameID = data.id;
        var other = "";
        if (data.player === "0") {
            other = "X";
        } else {
            other = "0"
        }

        var status = checkWin(data.board);
        if (status == "win") {
            // emit win and loss
            socket.emit("win", data.board);
            socket.in(gameID).emit("loss", data.board);
        } else if (status == "none") {
            socket.in(gameID).emit('updateGame', {
                id: gameID
                , board: data.board
                , player: other
                , turn: true
            });
            socket.emit("updateGame", {
                id: gameID
                , board: data.board
                , player: data.player
                , turn: false
            });
        } else {
            socket.in(gameID).emit('tie', {
                id: gameID
                , board: data.board
                , player: other
                , turn: false
            });
            socket.emit("tie", {
                id: gameID
                , board: data.board
                , player: data.player
                , turn: false
            });
        }

    });

    // on remake return empty board and data
    socket.on("remake", function (data) {
        data.board = empty;
        data.turn = false;
        data.player = "0";
        socket.emit("restart", data);
        data.player = "X";
        data.turn = true;
        socket.in(data.id).emit("restart", data);
    });

});


// logic to check win
function checkWin(data) {
    // row 1
    if ((data[0] != "") && ((data[0] == data[1]) && (data[1] == data[2]))) {
        return "win";
    }
    // row 2
    if ((data[3] != "") && ((data[3] == data[4]) && (data[4] == data[5]))) {
        return "win";
    }
    // row 3
    if ((data[6] != "") && ((data[6] == data[7]) && (data[7] == data[8]))) {
        return "win";
    }
    // col 1
    if ((data[0] != "") && ((data[0] == data[3]) && (data[3] == data[6]))) {
        return "win";
    }
    // col 2
    if ((data[1] != "") && ((data[1] == data[4]) && (data[4] == data[7]))) {
        return "win";
    }
    // col 3
    if ((data[2] != "") && ((data[2] === data[5]) && (data[5] == data[8]))) {
        return "win";
    }
    // diag 1
    if ((data[0] != "") && ((data[0] === data[4]) && (data[4] == data[8]))) {
        return "win";
    }
    // diag 2
    if ((data[2] != "") && ((data[2] === data[4]) && (data[4] == data[6]))) {
        return "win";
    }

    if ((data[0] != "") && (data[1] != "") && (data[2] != "") && (data[3] != "") &&
        (data[4] != "") && (data[5] != "") && (data[6] != "") && (data[7] != "") && (data[8] != "")) {
        return "tie";
    }
    return "none";
}