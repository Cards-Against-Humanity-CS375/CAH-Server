const { WhiteCard, BlackCard } = require("../models/Card")
const firebaseAdmin = require("firebase-admin");
const serviceAccount = require("../Credentials/cah-375-firebase-adminsdk-ma1fd-4b13e736a9.json");

// * Initilize the connection to Firebase
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: "https://cah-375.firebaseio.com",
});

const db = firebaseAdmin.database();

function getDeckFirebase() {
    return new Promise(async (resolve, reject) => {
        const black_cards = await db.ref('blackCards').once('value')
            .then((snapshot) => {
                return snapshot.val()
            })
            .then(function (black_cards_json) {
                let black_cards = black_cards_json.filter((black_card_obj) => black_card_obj.pick == 1).map((black_card_obj) => new BlackCard(black_card_obj.text, black_card_obj.pick))
                return black_cards
            })

        const white_cards = await db.ref('whiteCards').once('value')
            .then((snapshot) => {
                return snapshot.val()
            })
            .then(function (white_cards_json) {
                const white_cards = white_cards_json.map((response_string) => new WhiteCard(response_string))
                return white_cards
            })

        resolve([white_cards, black_cards])
    })
}

module.exports = { getDeckFirebase }