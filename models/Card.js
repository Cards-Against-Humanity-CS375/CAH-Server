class BlackCard {
    /**
     * Instantiating a black card object
     * @param {String} prompt 
     * @param {int} pick 
     */
    constructor(prompt, pick) {
        this.prompt = prompt
        this.pick = pick
    }
}

class WhiteCard {
    /**
     * Instantiating a black card object
     * @param {String} response for the black card 
     */
    constructor(response) {
        this.response = response
        this.pick = 1
    }
}

module.exports = { WhiteCard, BlackCard }