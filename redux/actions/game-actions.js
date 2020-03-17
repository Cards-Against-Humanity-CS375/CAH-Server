const INITIALIZE_CARD_DECK = 'INITIALIZE_CARD_DECK'
const ADD_PLAYER_TO_GAME = 'ADD_PLAYER_TO_GAME';
const DELETE_PLAYER_FROM_GAME = 'DELETE_PLAYER_FROM_GAME';
const REMOVE_CARDS_FROM_WHITE = 'GET_AND_REMOVE_CARDS_FROM_WHITE'
const REMOVE_CARDS_FROM_BLACK = 'GET_AND_REMOVE_CARDS_FROM_BLACK'
const UPDATE_CURRENT_JUDGE_INDEX = 'UPDATE_CURRENT_JUDGE_INDEX'
const RESET_GAME = 'RESET_GAME'
const UPDATE_SCORE_FOR_PLAYER = 'UPDATE_SCORE_FOR_PLAYER'
const RESET_INSTANCE = 'RESET_INSTANCE'

function updateScoreForPlayer(chosenCardText, all_submissions) {
    return {
        type: UPDATE_SCORE_FOR_PLAYER,
        payload: {
            chosenCardText,
            all_submissions
        }
    }
}

function resetInstance() {
    return {
        type: RESET_INSTANCE,
        payload: true
    }
}

function resetGame() {
    return {
        type: RESET_GAME,
        payload: true
    }
}

function initializeCardDeck(whiteCards, blackCards) {
    return {
        type: INITIALIZE_CARD_DECK,
        payload: {
            whiteCards,
            blackCards
        }
    }
}

function addPlayerToGame(player_name, player_id, player_socket) {
    return {
        type: ADD_PLAYER_TO_GAME,
        payload: {
            player_name,
            player_id,
            player_socket
        }
    }
}

function deletePlayerFromGame(player_id) {
    return {
        type: DELETE_PLAYER_FROM_GAME,
        payload: {
            player_id
        }
    }
}

function removeCardsFromWhite(numberOfCardsToRemove) {
    return {
        type: REMOVE_CARDS_FROM_WHITE,
        payload: {
            numberOfCardsToRemove
        }
    }
}

function removeCardsFromBlack(numberOfCardsToRemove) {
    return {
        type: REMOVE_CARDS_FROM_BLACK,
        payload: {
            numberOfCardsToRemove
        }
    }
}

function updateCurrentJudgeIndex(newIndex) {
    return {
        type: UPDATE_CURRENT_JUDGE_INDEX,
        payload: {
            newIndex
        }
    }
}

module.exports = { ADD_PLAYER_TO_GAME, DELETE_PLAYER_FROM_GAME, REMOVE_CARDS_FROM_WHITE, REMOVE_CARDS_FROM_BLACK, INITIALIZE_CARD_DECK, UPDATE_CURRENT_JUDGE_INDEX, RESET_GAME, RESET_INSTANCE,UPDATE_SCORE_FOR_PLAYER, initializeCardDeck, addPlayerToGame, deletePlayerFromGame, removeCardsFromWhite, removeCardsFromBlack, updateCurrentJudgeIndex, resetInstance, resetGame, updateScoreForPlayer }