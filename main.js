
const server = require('http').createServer();

const { store } = require('./redux/store');
const { addPlayerToGame, deletePlayerFromGame, removeCardsFromWhite, removeCardsFromBlack, updateCurrentJudgeIndex, resetGame, resetInstance, updateScoreForPlayer } = require('./redux/actions/game-actions')
const { InitialSetup } = require('./Tools/InitialSetup')

console.log("Initial state: ", store.getState());
let score_needed_to_win = 4
let unsubscribe = store.subscribe(() => {
    // console.log(store.getState())
});

InitialSetup(store)

// const { getDeckFirebase } = require("./modules/Firebase")
const { Player } = require("./models/Player.js")
const { logMessage } = require("./Tools/Logger")

// * We can change the path to anything for websocket to capture the connection
const io = require('socket.io')(server, {
    path: "/"
});

// ! variables start with 'is' should be Boolean, not an array
// const isAllsubmitted = []
let submissions = []
// // * round timer object
let timer_for_one_round;
let timer_for_judge_pick
let timer_for_announce_win_round

let isGameOn = false

// * Listens on all new connection
io.on('connection', socket => {
    logMessage(true, (new Date()) + ' Recieved a new connection from origin ' + socket.id + '.')
    socket.on('message', (msg) => {
        logMessage(true, msg)

        resolveIncomingMessage(msg, socket)
    })

    socket.on('disconnect', () => {
        logMessage(false, "User with ID: " + socket.id + " is disconnected.")

        store.dispatch(deletePlayerFromGame(socket.id))

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
            resolve_start_game_from_client(socket)
            break
        case "CARD_CHOSEN":
            resolve_card_chosen_from_client(msg)
            break
        case "JUDGE_CHOSEN_CARD":
            resolve_card_chosen_by_judge(msg)
            break
        case "RESET_GAME":
            resolve_reset_game_from_client()
            break
            
        default:
            logMessage(false, msg)
            break
    }
}

function resolve_reset_game_from_client() {
    const online_players = store.getState()['game']['online_players']
    
    online_players.forEach(player => {
        player.socket.emit('message', {
            type: 'RESET_GAME',
        })
    })
    prepareResetInstance()
}
//#region NEW_CONNECTION
// * Construct a newly joined player, put it into the current_players list, and update players to all clients
function resolve_new_connection_from_client(msg, socket) {
    const name = msg.content
    const id = socket.id

    if (isGameOn) {
        socket.emit('message', {
            type: 'CANT_JOIN',
            content: "Game is going on!"
        })
        return
    }

    store.dispatch(addPlayerToGame(name, id, socket))

    // const newPlayer = new Player(name, id, socket)
    // current_players.push(newPlayer)

    // ! I believe we should do this false initilization upon game start, not here
    // isAllsubmitted.push(false)

    // * Do update to clients
    updatePlayersToAllClients()
}
//#endregion

//#region GAME_START
// * Sending 2 signals to all clients, constructing a false arrays for submissions
function resolve_start_game_from_client(socket) {
    const online_players = store.getState()['game']['online_players']
    // * Checks if game does not have enough players.
    if (online_players.length < 3) {
        // TODO: Raise an alert to the person who starting the game.
        socket.emit('message', {
            type: 'MISSING_PLAYERS',
            content: "You need more than 3 players to start the game!"
        })
        return
    }
    start_game()
    isGameOn = true
    new_round()

    clearTimeout(timer_for_judge_pick)
    clearTimeout(timer_for_one_round)
}

// * Upon receive connection to start game, call start_game.
function start_game() {
    const online_players = store.getState()['game']['online_players']
    online_players.forEach(player => {
        const whiteCards = drawWhiteCards(4)
        player.socket.emit('message', {
            type: 'GAME_START',
            content: {
                cards: whiteCards,
            }
        })
    })

    // * Set current judge to 0, which should be the first player who joined
    currentJudgeIndex = 0
    store.dispatch(updateCurrentJudgeIndex(0))


}
function new_round() {
    // * Choose who is judge, get id of that judge, change that Player.is_judge to True
    const online_players = store.getState()['game']['online_players']
    const currentJudgeIndex = store.getState()['game']['current_judge_index']

    // * Initialize the submissions array
    submissions = Array(online_players.length).fill(false)

    let judgeId;

    try {
        judgeId = online_players[currentJudgeIndex].id;
    }
    catch {
        prepareResetGame()
    }

    let chosenCard = drawBlackCards(1)[0]; // chosenCard is object type BlackCard (Has prompt and pick)

    const time_for_one_round = store.getState()['game']['time_for_one_round']

    online_players.forEach(player => {
        const newWhiteCard = drawWhiteCards(1)[0]
        player.socket.emit('message', {
            type: 'NEW_ROUND',
            content: {
                newJudgeID: judgeId,
                blackCard: chosenCard,
                timeout: time_for_one_round,
                newWhiteCard: newWhiteCard
            }
        })
    })

    // * Reset submissions
    clearTimeout(timer_for_one_round)
    timer_for_one_round = setTimeout(finishing_a_round, time_for_one_round)
}

// * Returns specified number of random white cards.
function drawWhiteCards(number_of_cards) {
    const whiteCards = store.getState()['game']['white_deck']
    store.dispatch(removeCardsFromWhite(number_of_cards))
    return whiteCards.splice(0, number_of_cards)
}

function drawBlackCards(number_of_cards) {
    const blackCards = store.getState()['game']['black_deck']
    store.dispatch(removeCardsFromBlack(number_of_cards))
    return blackCards.splice(0, number_of_cards)
}
//#endregion

//#region CARD_CHOSEN
function resolve_card_chosen_from_client(msg) {
    const chosenCard = msg.content.chosen_card
    const player_id = msg.content.player_id
    // const cardText = msg.content.cardText

    const online_players = store.getState()['game']['online_players']

    online_players.forEach((player, index) => {
        if (player.id == player_id) {
            submissions[index] = chosenCard.response
            return
        }
    })

    if (did_all_players_chose_card()) {
        clearTimeout(timer_for_one_round)
        finishing_a_round()
    }
}

// Emits a SCORE UPDATED message to all clients.
function updateScoresToAllClients(cardText) {
    const online_players = store.getState()['game']['online_players']
    const time_for_announce_win_round = store.getState()['game']['time_for_announce_win_round']

    const msg_content = online_players.map((player, index) => {
        let won = false
        if (submissions[index] == cardText) {
            won = true
        }
        console.log(index, won)
        return {
            player_id: player.id,
            player_score: player.score,
            player_won: won
        }
    })

    online_players.forEach(player => {
        player.socket.emit('message', {
            type: "SCORE_UPDATED",
            content: {
                playerIdAndScores: msg_content,
                timeout: time_for_announce_win_round,
                cardText: cardText,
            }
        })
    })

    if (checkIfGameEnd()) {
        // * Stop everything
        clearTimeout(timer_for_one_round)
        clearTimeout(timer_for_announce_win_round)
        clearTimeout(timer_for_judge_pick)

        online_players.forEach(player => {
            let won = false
            if (player.score >= score_needed_to_win) {
                won = true
            }
            player.socket.emit('message', {
                type: "GAME_OVER",
                content: {
                    didWon: won
                }
            })
        })
    }
}

function checkIfGameEnd() {
    const online_players = store.getState()['game']['online_players']
    for (let i = 0; i < online_players.length; i++) {
        if (online_players[i].score >= score_needed_to_win) {
            return true
        }
    }
    return false
}


// Allocates 1 point to the player that had the card the judge chose.
function resolve_card_chosen_by_judge(msg) {
    // console.log(msg.content)
    // const online_players = store.getState()['game']['online_players']
    const time_for_announce_win_round = store.getState()['game']['time_for_announce_win_round']
    const cardText = msg.content.cardText // Get card text from card judge chose.
    clearTimeout(timer_for_judge_pick)

    store.dispatch(updateScoreForPlayer(cardText, submissions))

    updateScoresToAllClients(cardText)

    timer_for_announce_win_round = setTimeout(() => new_round(), time_for_announce_win_round)
}

function did_all_players_chose_card() {
    const online_players = store.getState()['game']['online_players']
    const currentJudgeIndex = store.getState()['game']['current_judge_index']

    console.log("all_players_chose_card called")
    for (i = 0; i < online_players.length; i++) {
        // console.log("Current Players: ", current_players)
        console.log("Submissions: ", submissions)
        if (i != currentJudgeIndex) {
            // console.log("isJudge", online_players[i].isJudge)
            if (submissions[i] == false) {
                console.log("returning false")
                return false
            }
        }
    }
    // const result = submissions.reduce((accumulator, currentValue) => accumulator && currentValue)
    console.log("returning true")
    return true
}


function finishing_a_round() {
    console.log("finishing_a_round")
    // * Updating the new judge index
    const previousCurrentJudgeIndex = store.getState()['game']['current_judge_index']
    const online_players = store.getState()['game']['online_players']
    const time_for_deciding = store.getState()['game']['time_for_deciding']
    store.dispatch(updateCurrentJudgeIndex((previousCurrentJudgeIndex + 1) % online_players.length))

    // list_of_chosen_cards = get_list_of_chosen_cards()
    const playerAndPlayedCard = []
    online_players.forEach((player, index) => {
        playerAndPlayedCard.push({
            player_id: player.id,
            played_card: submissions[index]
        })
    })

    // * Send to all clients saying the round has ended
    online_players.forEach(player => {
        player.socket.emit('message', {
            type: 'ROUND_TIMEOUT',
            content: {
                // playedCards: list_of_chosen_cards, // The cards have attributes .cardText
                isJudgePicking: true,
                submissions: playerAndPlayedCard,
                timeout: time_for_deciding
            }
        })
    })
    clearTimeout(timer_for_judge_pick)
    timer_for_judge_pick = setTimeout(new_round, time_for_deciding)

    // * Start a new round!!!
}
//#endregion

/**
 * Run everytime there's a new connection or lose a connection
 * Basically updates to all clients the remaining players in the server (room)
 */
function updatePlayersToAllClients() {
    // * Construct an array of players that will be sent to clients (name and id for each user)
    const online_players = store.getState()['game']['online_players']
    const namesAndIds = online_players.map(current_player => ({
        name: current_player.name,
        id: current_player.id
    }))

    // * Send to all clients with type: 'PLAYERS_UPDATED'
    online_players.forEach(player => {
        player.socket.emit('message', {
            type: 'PLAYERS_UPDATED',
            content: {
                players: namesAndIds
            }
        })
    })

    // * If there's only one person in the room now, that person will be able to determine when the game start
    if (online_players.length == 1) {
        online_players[0].socket.emit('message', {
            type: "FIRST_PLAYER_RIGHTS",
            content: {
                first_player: true
            }
        })
    }

    // * Stop timer if noone's in the room
    if (online_players.length <= 0) {
        prepareResetGame()
    }
}

function prepareResetInstance(){
    clearTimeout(timer_for_one_round)
    clearTimeout(timer_for_judge_pick)
    clearTimeout(timer_for_announce_win_round)
    submissions = []
    store.dispatch(resetInstance())
    isGameOn = false
}

function prepareResetGame() {
    clearTimeout(timer_for_one_round)
    clearTimeout(timer_for_judge_pick)
    clearTimeout(timer_for_announce_win_round)
    submissions = []
    store.dispatch(resetGame())
    isGameOn = false
    

}

// * Run the websocket at 3001
const port = process.env.PORT || 3002;
server.listen(port);
logMessage(true, `CAH server started at port: ${port}`)