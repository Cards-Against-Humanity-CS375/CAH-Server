const deck = require('./temp_deck.json')
const { WhiteCard } = require("./models/WhiteCard")
const { BlackCard } = require("./models/BlackCard")
function parse_deck()
{
  let black_cards_json = deck["blackCards"]
  let white_cards_string = deck["whiteCards"]
  const white_cards = parse_white(white_cards_string)
  const black_cards = parse_black(black_cards_json)
  console.log("black_cards_length:" + black_cards.length)
  console.log("white_cards_length:" + white_cards.length)
  return [white_cards, black_cards]
}

function parse_white(white_card_string_list)
{
  let white_card_list = []
  white_card_string_list.forEach(response_string =>
  {
    temp_white_card = new WhiteCard(response_string)
    white_card_list.push(temp_white_card)
  });

  return white_card_list
}



function parse_black(black_cards_json)
{
  let black_card_list = []
  black_cards_json.forEach(black_card_obj =>
  {
    temp_black_card = new BlackCard(prompt = black_card_obj.text, pick = black_card_obj.pick)
    if (temp_black_card.pick == 1) {
      black_card_list.push(temp_black_card)
    }

  });

  return black_card_list
}

module.exports = { parse_deck }