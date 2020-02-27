//can be implemented if we need multiple decks
class Deck {
  /**
   * Instantiate a deck of card
   * @param {String} deck_name 
   * @param {*} black_cards 
   * @param {*} white_cards 
   */
  constructor(deck_name, deck_id, black_cards, white_cards) {
    this.deck_name = deck_name
    this.deck_id = deck_id
    this.black_cards = black_cards
    this.white_cards = white_cards
  };
}

module.exports = { Deck }