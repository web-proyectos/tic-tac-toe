// Game will contain data about the gameboard, player, and turn 
var game = {};
$(document).ready(function () {
    // Hide stuff that isnt needed at first
    $("#full").hide();
    $("#GAMEBOARD").hide();
    $("#joinGame").hide();
    $("#remake").hide();

    // create socket variable
    var socket = io();

    // when newGame is clicked
    $("#newGame").on("click", function () {
        // emit to create new game
        socket.emit("create");
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
        socket.emit("restart", {id: game.id});
    });

    // on 'newGameCreated'
    socket.on('created', function (data) {
        // show the gameid so that other player can join
        $("#full").show();
        $("#status").html("Waiting on other player... join code is " + data.id);
    });

    // when joinGame form is submitted
    $("#joinGame").on("submit", function (e) {
        // prevent from page reload
        e.preventDefault();

        // emit the gameID
        let data = {};
        data.gameID = $("#gameID").val();
        socket.emit('join', data);
    });

    // on 'joined'
    socket.on("start", function (data) {
        // hide my shameless plug and form
        $("#me").hide();
        $("#joinGame").hide();
        $("#remake").hide();

        // update game object
        game.id = data.id;
        game.board = data.gameboard;
        game.player = data.player;
        
        // show and update gameBoard
        $("#GAMEBOARD").show();
        updateGameBoard();
    });

    // on 'failed'
    socket.on("failed", function () {
        // update status to let user know id wasnt found
        $("#status").html("Id not found. Please Try again");
    });

    socket.on("invalid", function() {
        $("#status").html("Not a valid move.");
    });
    // actual game logic :)

    // when board is clicked
    $("table").on("click", function (e) {
        // get the cell that was clicked
        let cellClicked = e.toElement.id;

        // when player clicks make sure it is their turn
        if (game.player.turn === true) {
            // make sure valid cell is clicked
            if (game.board[cellClicked] === "") {
                $("#" + cellClicked).html(game.player.type);

                // send move made
                let data = {id: game.id, cell: cellClicked, player: game.player};
                socket.emit("move", data);
            } else {
                // tell user to click proper cell
                $("#status").html("Not a valid move.");
            }
        } else {
            // tell user to wait for their turn
            $("#status").html("Not Your Turn, Wait for Other Player");
        }
    });

    // on 'updateGame'
    socket.on("updateGame", function (data) {
        // get data and call updateGameBoard()
        game.player.turn = !game.player.turn;
        game.board = data.gameboard;

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

    // on 'tie'
    socket.on("tie", function (data) {
        // updateBoard()
        game.board = data.gameboard;
        updateGameBoard();
        
        // tell user they tied and show remake button
        $("#status").html("Tie");
        $("#remake").show();
    });

    // on 'quit'
    socket.on("quit", function() {
        $("#status").html("Connection Lost. Please Create a New Game");
    });
});

function updateGameBoard(player) {
    // set value of each cell in the board
    $.each(game.board, function (key, value) {
        $("#" + key).html(value);
    });
    // check if it is users turn 
    if (game.player.turn) {
        // tell user it is their turn
        $("#status").html("Your turn");
    } else {
        // tell user it is not their turn
        $("#status").html("Waiting for other player");
    }
}