const { createStore } = require("redux")
const { composeWithDevTools } = require('redux-devtools-extension')
const { rootReducer } = require('./reducers')

const store = createStore(rootReducer, composeWithDevTools());

module.exports = { store }