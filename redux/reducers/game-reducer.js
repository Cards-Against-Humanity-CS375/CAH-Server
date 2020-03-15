const { INITIALIZE_CARD_DECK, ADD_PLAYER_TO_GAME, DELETE_PLAYER_FROM_GAME, REMOVE_CARDS_FROM_WHITE, REMOVE_CARDS_FROM_BLACK, UPDATE_CURRENT_JUDGE_INDEX } = require('../actions/game-actions')
const { Player } = require('../../models/Player')
const { shuffle } = require('../../Tools/shuffle')

const initialState = {
    online_players: [],
    white_deck: [],
    black_deck: [],
    current_judge_index: 0,
    time_for_one_round: 45000, // 45 seconds,
    time_for_deciding: 60000
}

function gameReducer(state = initialState, action) {
    switch (action.type) {
        case INITIALIZE_CARD_DECK: {
            const whiteCards = shuffle(action.payload.whiteCards)
            const blackCards = shuffle(action.payload.blackCards)
            return {
                ...state,
                white_deck: whiteCards,
                black_deck: blackCards
            }
        }
        case ADD_PLAYER_TO_GAME: {
            return {
                ...state,
                online_players: [...state.online_players, new Player(action.payload.player_name, action.payload.player_id, action.payload.player_socket)]
            }
        }

        case DELETE_PLAYER_FROM_GAME: {
            return {
                ...state,
                online_players: state.online_players.filter(player => player.id !== action.payload.player_id)
            }
        }

        case REMOVE_CARDS_FROM_WHITE: {
            const remainingWhiteCards = [...state.white_deck]
            remainingWhiteCards.splice(0, action.payload.numberOfCardsToRemove)
            return {
                ...state,
                white_deck: remainingWhiteCards
            }
        }

        case REMOVE_CARDS_FROM_BLACK: {
            const remainingBlackCards = [...state.black_deck]
            remainingBlackCards.splice(0, action.payload.numberOfCardsToRemove)
            return {
                ...state,
                black_deck: remainingBlackCards
            }
        }

        case UPDATE_CURRENT_JUDGE_INDEX: {
            return {
                ...state,
                current_judge_index: action.payload.newIndex
            }
        }

        default:
            return state;
    }
}

module.exports = { gameReducer }