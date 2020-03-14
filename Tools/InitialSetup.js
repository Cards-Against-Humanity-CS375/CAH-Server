const { getDeckFirebase } = require('./Firebase')
const { initializeCardDeck } = require('../redux/actions/game-actions')

function InitialSetup(store) {
    // TODO: I feel like this deck is not yet randomized
    getDeckFirebase().then(deck => {
        const white_cards = deck[0]
        const black_cards = deck[1]

        store.dispatch(initializeCardDeck(white_cards, black_cards))
    })
}

module.exports = { InitialSetup }