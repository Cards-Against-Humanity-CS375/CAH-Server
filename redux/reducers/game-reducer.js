const { INITIALIZE_CARD_DECK, ADD_PLAYER_TO_GAME, DELETE_PLAYER_FROM_GAME, REMOVE_CARDS_FROM_WHITE, REMOVE_CARDS_FROM_BLACK, UPDATE_CURRENT_JUDGE_INDEX, RESET_GAME, UPDATE_SCORE_FOR_PLAYER } = require('../actions/game-actions')
const { Player } = require('../../models/Player')
const { shuffle } = require('../../Tools/shuffle')

const initialState = {
    online_players: [],
    white_deck: [],
    black_deck: [],
    current_judge_index: 0,
    time_for_one_round: 45000, // 45 seconds,
    time_for_deciding: 60000,
    time_for_announce_win_round: 10000
}

function gameReducer(state = initialState, action) {
    switch (action.type) {
        case RESET_GAME: {
            return {
                ...state,
                online_players: [],
                current_judge_index: 0,
                time_for_one_round: 45000, // 45 seconds,
                time_for_deciding: 60000
            }
        }
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

        case UPDATE_SCORE_FOR_PLAYER: {
            const clone_online_players = [...state.online_players]
            const update_players = clone_online_players.map((player, index) => {
                if (action.payload.all_submissions[index] == action.payload.chosenCardText) {
                    player.score += 1
                }
                return player
            })
            return {
                ...state,
                online_players: update_players
            }
        }

        default:
            return state;
    }
}

module.exports = { gameReducer }