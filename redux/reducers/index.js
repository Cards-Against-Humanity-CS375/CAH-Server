const { combineReducers } = require('redux')
const { gameReducer } = require('./game-reducer')

const allReducers = {
    game: gameReducer,
}

const rootReducer = combineReducers(allReducers);

module.exports = { rootReducer }