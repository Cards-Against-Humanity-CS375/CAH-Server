const deck = require('./temp_deck.json')
const { WhiteCard } = require("./models/WhiteCard")
const { BlackCard } = require("./models/BlackCard")
const firebaseAdmin = require("firebase-admin");
const serviceAccount = require("./cah-375-firebase-adminsdk-ma1fd-4b13e736a9.json");
// Read from Firebase.
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: "https://cah-375.firebaseio.com",
});
var firebaseDb = firebaseAdmin.database();
async function parse_deck() {
  let black_cards = await firebaseDb.ref('blackCards').once('value').then((snapshot) => {
    return snapshot.val()
  }).then(function (black_cards_json) {
    return parse_black(black_cards_json)
  });

  let white_cards = await firebaseDb.ref('whiteCards').once('value').then((snapshot) => {
    return snapshot.val()
  }).then(function (white_cards_json) {
    return parse_white(white_cards_json)
  });
  return [white_cards, black_cards]
}

function parse_white(white_card_string_list) {
  console.log("Bueno")
  let white_card_list = []
  white_card_string_list.forEach(response_string => {
    temp_white_card = new WhiteCard(response_string)
    white_card_list.push(temp_white_card)
  });
  console.log("Noches")
  return white_card_list
}



function parse_black(black_cards_json) {
  let black_card_list = []
  black_cards_json.forEach(black_card_obj => {
    temp_black_card = new BlackCard(prompt = black_card_obj.text, pick = black_card_obj.pick)
    if (temp_black_card.pick === 1){
      black_card_list.push(temp_black_card)
    }
  });

  return black_card_list
}

module.exports = { parse_deck }