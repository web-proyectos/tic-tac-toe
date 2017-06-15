$(document).ready(function () {
    /// Game will contain data about the gameboard, player, and turn 
    var game = {};

    // Hide the board and the remake button
    $("#board").hide();
    $("#remake").hide();

    // Create Socket
    var socket = io();

    // Called when create button is clicked
    $("#create").on("click", function () {
        // Emit 'create' game and hide things that are not necessary
        socket.emit("create");
        $(".item").hide();
    });

    // Called when remake button is clicked
    $("#remake").on("click", function () {
        // Emit to restart the game
        socket.emit("restart", { id: game.id });
    });

    // Called when game has been created
    socket.on('created', function (data) {
        // Show the GameID
        $("#status").html("Send this GameID to other player: " + data.id);
    });

    // Called when join has a key entered
    $("#join").keypress(function (e) {
        // Get the  id
        let id = $("#join").val();

        // Make sure we are submitting a nonempty GameID
        if (e.which == 13 && id != null) {
            // emit the gameID
            socket.emit('join', { gameID: id });
        }
    });

    // Called when game is starting
    socket.on("start", function (data) {
        // hide remake and other items
        $("#remake").hide();
        $(".item").hide();

        // Update game object
        game.id = data.id;
        game.board = data.gameboard;
        game.player = data.player;

        // Show and update gameboard
        $("#board").show();
        updateGameboard();
    });

    // Called when GameID does not exist
    socket.on("failed", function () {
        // Update status to let user know GameID wasn't found
        $("#status").html("GameID not found. Please Try again");
        $(".title").hide();
        $("#create").hide();

        // Allow user to enter GameID again.
        $("#join").show();
    });

    // Called when an invalid move is made
    socket.on("invalid", function () {
        $("#status").html("Not a valid move.");
    });

    // Called when board is clicked
    $("table").on("click", function (e) {
        // Get the cell that was clicked
        let cellClicked = e.toElement.id;

        // When player clicks make sure it is their turn
        if (game.player.turn === true) {
            // Make sure that cell is empty
            if (game.board[cellClicked] === "") {
                // Send the data for the move
                let data = { id: game.id, cell: cellClicked, player: game.player };
                socket.emit("move", data);
            } else {
                // Tell user to click empty cell
                $("#status").html("Please click an empty cell.");
            }
        } else {
            // Tell user to wait for their turn
            $("#status").html("Please wait for other player.");
        }
    });

    // Called when game is updated
    socket.on("updateGame", function (data) {
        // Update game and call updateGameboard()
        game.player.turn = !game.player.turn;
        game.board = data.gameboard;

        updateGameboard();
    });

    // Called when player has won
    socket.on("win", function (data) {
        // Update game and call updateBoard()
        game.board = data;
        updateGameboard();

        // Tell user they won and show remake button
        $("#status").html("YOU WON!!!!");
        $("#remake").show();
    });

    // Called when player has lost
    socket.on("loss", function (data) {
        // Update game and call updateBoard()
        game.board = data;
        updateGameboard();

        // Tell user they lost and show remake button
        $("#status").html("YOU LOST. GG.");
        $("#remake").show();
    });

    // Called when game has ended in a tie
    socket.on("tie", function (data) {
        // Update game and call updateBoard()
        game.board = data.gameboard;
        updateGameboard();

        // Tell user they tied and show remake button
        $("#status").html("Tie.");
        $("#remake").show();
    });

    // Called when a player has quit
    socket.on("quit", function () {
        $("#status").html("Connection Lost. Please Create a New Game.");
        $("#board").hide();
        $(".item").show();
        $("#join").hide();
        $("#remake").hide();
    });

    // Called to update the gameboard
    function updateGameboard() {
        // Set value of each cell in the board
        $.each(game.board, function (key, value) {
            $("#" + key).html(value);
        });

        // Check if it is users turn 
        if (game.player.turn) {
            // Tell user it is their turn
            $("#status").html("Your turn.");
        } else {
            // Tell user it is not their turn
            $("#status").html("Other player's turn.");
        }
    }
});
