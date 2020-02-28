const server = require('http').createServer();

// TODO: Change name please! Please be consistent on the name
const deck_json_parser = require("./parse_deck_json")
const { Player } = require("./models/Player.js")

// * We can change the path to anything for websocket to capture the connection
const io = require('socket.io')(server, {
    path: "/"
});

// * Storing all player objects
let current_players = []

// * Storing all console.log messages
const logs = []

// *: Parse the json value in the deck's json file
// TODO: Need some improvements on the name and return
deck_json_parser.parse_deck()

// * Listens on all new connection
io.on('connection', socket => {
    logMessage(true, (new Date()) + ' Recieved a new connection from origin ' + socket.id + '.')

    socket.on('message', (msg) => {
        logMessage(true, msg)

        switch (msg.type) {
            case "NEW_CONNECTION":
                // * Construct a newly joined player and put it into the list
                const name = msg.content
                const id = socket.id
                const newPlayer = new Player(name, id, socket)
                current_players.push(newPlayer)

                // * Do update to clients
                updatePlayersToAllClients()
                break
            case "GAME_START":
                // TODO: Dealing all the cards to players
                console.log(msg.content)
                break
            case "CARD_CHOSEN":
                break
            case "JUDGE_CHOSEN_CARD":
                break
            default:
                logMessage(false, msg)
                break
        }
    })

    socket.on('disconnect', () => {
        logMessage(false, "User with ID: " + socket.id + " is disconnected.")

        // * Filter out the player that is disconnected
        current_players = current_players.filter(player => player.id != socket.id)

        // * Do update to clients
        updatePlayersToAllClients()
    });
});

/**
 * Run everytime there's a new connection or lose a connection
 * Basically updates to all clients the remaining players in the server (room)
 */
function updatePlayersToAllClients() {
    // * Construct an array of players that will be sent to clients (name and id for each user)

    const namesAndIds = current_players.map(current_player => ({
        name: current_player.name,
        id: current_player.id
    }))

    // * Send to all clients with type: 'PLAYERS_UPDATED'
    current_players.forEach(current_player => {
        current_player.socket.emit('message', {
            type: 'PLAYERS_UPDATED',
            content: {
                players: namesAndIds
            }
        })
    })

    // * If there's only one person in the room now, that person will be able to determine when the game start
    if (current_players.length == 1) {
        current_players[0].socket.emit('message', {
            type: "FRIST_PLAYER_RIGHT",
            content: {
                "first_player": true
            }
        })
    }
}

/**
 * 
 * @param {Boolean} isSuccess true will give a green text output, red for false, meant to be a much better console.log
 * @param {String} content Body of the message you want to be printed out
 */
function logMessage(isSuccess, content) {
    if (isSuccess) {
        const message = `\x1b[32m${content}\x1b[0m`
        logs.push(message)
        console.log(message)
    }
    else {
        const message = `\x1b[31m${content}\x1b[0m`
        logs.push(message)
        console.log(message)
    }
}


// * Run the websocket at 3001
server.listen(3001);