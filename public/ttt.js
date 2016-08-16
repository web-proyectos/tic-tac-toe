// game will contain data about the gameboard, player, and turn 
var game = {};
$(document).ready(function () {
    // hide stuff that isnt needed at first
    $("#full").hide();
    $("#GAMEBOARD").hide();
    $("#joinGame").hide();
    $("#remake").hide();

    // create socket variable
    var socket = io();

    // when newGame is clicked
    $("#newGame").on("click", function () {
        // emit to create new game
        socket.emit("create new game");
        // hide halfs
        $("#newGame").hide();
        $("#joinGame1").hide();
    });

    // when joinGame1 is clicked
    $("#joinGame1").on("click", function () {
        // hide newGame and joinGame1
        // show input form
        $("#newGame").hide();
        $("#joinGame1").hide();
        $("#joinGame").show();

        // show full and change status
        $("#full").show();
        $("#status").html("Enter Game ID");

    });

    // when remake is clicked
    $("#remake").on("click", function () {
        // emit to remake and send game data
        socket.emit("remake", game);
    });

    // on 'newGameCreated'
    socket.on('newGameCreated', function (data) {
        // update game object and player object
        game.id = data.gameId;

        // show the gameid so that other player can join
        $("#full").show();
        $("#status").html("Waiting on other player... join code is " + game.id);
    });

    // when joinGame form is submitted
    $("#joinGame").on("submit", function (e) {
        // prevent from page reload
        e.preventDefault();

        // emit the gameID
        var data = {};
        data.gameid = $("#gameID").val();
        socket.emit('playerJoinGame', data);
    });

    // on 'joined'
    socket.on("joined", function (data) {
        // hide my shameless plug and form
        $("#me").hide();
        $("#joinGame").hide();

        // update game object
        game.id = data.gameId;
        game.board = data.board;
        game.player = data.player;
        game.turn = data.turn;

        // show and update gameBoard
        $("#GAMEBOARD").show();
        updateGameBoard();
    });

    // on 'failed'
    socket.on("failed", function () {
        // update status to let user know id wasnt found
        $("#status").html("Id not found... rip");
    });

    // actual game logic :)

    // when board is clicked
    $("table").on("click", function (e) {
        // get the cell that was clicked
        var cellClicked = e.toElement.id;

        // when player clicks make sure it is their turn
        if (game.turn === true) {

            // make sure valid cell is clicked
            if (game.board[cellClicked] === "") {
                // if it was proper cell update own board
                // and emit data to socket
                $("#" + cellClicked).html(game.player);
                game.board[cellClicked] = game.player;
                var data = game;
                socket.emit("moveMade", data);
            } else {
                // tell user to click proper cell
                $("#status").html("Not a valid move... Select Different Cell");
            }
        } else {
            // tell user to wait for their turn
            $("#status").html("Not Your Turn, Wait for Other Player");
        }
    });

    // on 'updateGame'
    socket.on("updateGame", function (data) {
        // get data and call updateGameBoard()
        game = data;
        updateGameBoard();
    });

    // on 'win'
    socket.on("win", function (data) {
        // get data, updateBoard()
        game.board = data;
        updateGameBoard();
        
        // tell user they won and show remake button
        $("#status").html("Win");
        $("#remake").show();
    });

    // on 'loss'
    socket.on("loss", function (data) {
        // get data, updateBoard()
        game.board = data;
        updateGameBoard();
        
        // tell user they lost and show remake button
        $("#status").html("Loss");
        $("#remake").show();
    });

    // on 'restart'
    socket.on("restart", function (data) {
        // hide ramke button and updateBoard()
        $("#remake").hide();
        game = data;
        updateGameBoard();
    });

    // on 'tie'
    socket.on("tie", function (data) {
        // updateBoard()
        game = data;
        updateGameBoard();
        
        // tell user they tied and show remake button
        $("#status").html("Tie");
        $("#remake").show();
    });

});

function updateGameBoard() {
    // set value of each cell in the board
    $.each(game.board, function (key, value) {
        $("#" + key).html(value);
    });
    // check if it is users turn 
    if (game.turn) {
        // tell user it is their turn
        $("#status").html("You turn");
    } else {
        // tell user it is not their turn
        $("#status").html("Waiting for other player");
    }
}