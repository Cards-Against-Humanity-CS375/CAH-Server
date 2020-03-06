
const server = require('http').createServer();
const { getDeckFirebase } = require("./modules/Firebase")
const { Player } = require("./models/Player.js")
const { logMessage } = require("./modules/Logger")

// * We can change the path to anything for websocket to capture the connection
const io = require('socket.io')(server, {
    path: "/"
});

// * Storing all player objects
let current_players = []
let currentJudgeIndex = 0

// ! variables start with 'is' should be Boolean, not an array
// const isAllsubmitted = []
let submissions

// * Storing a game's deck of cards
let white_cards = []
let black_cards = []

// * round timer object
let timer_for_one_round;
const time_for_one_round = 45000 // 45 seconds

// * Gets all black and white cards from firebase server.
// TODO: I feel like this deck is not yet randomized
getDeckFirebase().then(deck => {
    white_cards = deck[0]
    black_cards = deck[1]
})

// * Listens on all new connection
io.on('connection', socket => {
    logMessage(true, (new Date()) + ' Recieved a new connection from origin ' + socket.id + '.')
    socket.on('message', (msg) => {
        logMessage(true, msg)

        resolveIncomingMessage(msg, socket, current_players)
    })

    socket.on('disconnect', () => {
        logMessage(false, "User with ID: " + socket.id + " is disconnected.")

        // * Filter out the player that is disconnected
        current_players = current_players.filter(player => player.id != socket.id)

        // * Do update to clients
        updatePlayersToAllClients()
    });
});

function resolveIncomingMessage(msg, socket) {
    switch (msg.type) {
        case "NEW_CONNECTION":
            resolve_new_connection_from_client(msg, socket)
            break
        case "GAME_START":
            resolve_start_game_from_client()
            break
        case "CARD_CHOSEN":
            resolve_card_chosen_from_client(msg)
            break
        case "JUDGE_CHOSEN_CARD":
            break
        default:
            logMessage(false, msg)
            break
    }
}

//#region NEW_CONNECTION
// * Construct a newly joined player, put it into the current_players list, and update players to all clients
function resolve_new_connection_from_client(msg, socket) {
    const name = msg.content
    const id = socket.id
    const newPlayer = new Player(name, id, socket)
    current_players.push(newPlayer)

    // ! I believe we should do this false initilization upon game start, not here
    // isAllsubmitted.push(false)

    // * Do update to clients
    updatePlayersToAllClients(current_players)
}
//#endregion

//#region GAME_START
// * Sending 2 signals to all clients, constructing a false arrays for submissions
function resolve_start_game_from_client() {
    // * Checks if game does not have enough players.
    if (current_players.length < 3) {
        // TODO: Raise an alert to the person who starting the game.
        console.log("Not enough players.")
        return
    }
    start_game()
    new_round()
}

// * Upon receive connection to start game, call start_game.
function start_game() {
    current_players.forEach(current_player => {
        const whiteCards = get5RandomWhiteCards()
        current_player.socket.emit('message', {
            type: 'GAME_START',
            content: {
                cards: whiteCards,
            }
        })
    })

    // * Set current judge to 0, which should be the first player who joined
    currentJudgeIndex = 0

    // * Initialize the submissions array
    submissions = Array(current_players.length).fill(false)
}

function new_round() {
    // * Choose who is judge, get id of that judge, change that Player.is_judge to True
    let judgeId = current_players[currentJudgeIndex].id;
    let chosenCard = getARandomBlackCard(); // chosenCard is object type BlackCard (Has prompt and pick)
    current_players.forEach(current_player => {
        current_player.socket.emit('message', {
            type: 'NEW_ROUND',
            content: {
                newJudgeID: judgeId,
                blackCard: chosenCard,
            }
        })
    })
    timer_for_one_round = setTimeout(finishing_a_round, time_for_one_round)
}  

// * Returns 5 random white cards.
function get5RandomWhiteCards() {
    const hand = []
    for (i = 0; i < 5; i++) {
        let x = Math.floor((Math.random() * white_cards.length) + 1);
        hand.push(white_cards.splice(x, 1)[0])
    }
    return hand
}

function getARandomBlackCard() {
    const x = Math.floor((Math.random() * black_cards.length) + 1);
    const chosenCard = black_cards.splice(x, 1)[0];
    return chosenCard
}
//#endregion

//#region CARD_CHOSEN
function resolve_card_chosen_from_client(msg) {
    const player_id = msg.content.player_id
    const cardText = msg.content.cardText
    current_players.forEach((current_player, index) => {
        if (current_player.id == player_id) {
            submissions[index] = cardText
            return
        }
    })

    if (did_all_players_chose_card()) {
        clearTimeout(timer_for_one_round)
        finishing_a_round()
    }
}

function did_all_players_chose_card() {
    console.log("all_players_chose_card called")

    const result = submissions.reduce((accumulator, currentValue) => accumulator && currentValue)

    return result
}


function finishing_a_round() {
    // * Updating the new judge index
    currentJudgeIndex = (currentJudgeIndex + 1) % current_players.length

    // list_of_chosen_cards = get_list_of_chosen_cards()
    list_of_chosen_cards = submissions

    // * Send to all clients saying the round has ended
    current_players.forEach(current_player => {
        current_player.socket.emit('message', {
            type: 'ROUND_TIMEOUT',
            content: {
                played_cards: list_of_chosen_cards,
            }
        })
    })

    // * Start a new round!!!
    new_round()
}
//#endregion

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

// * Run the websocket at 3001
const port = 3001
server.listen(port);
logMessage(true, `CAH server started at port: ${port}`)