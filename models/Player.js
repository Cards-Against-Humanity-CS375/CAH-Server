

class Player
{
  constructor(name, id, socket)
  {
    this.name = name
    this.id = id
    this.is_judge = false
    // this.ip_address = ip_address
    this.score = 0
    this.hand = []
    this.black_cards_won = []
    this.socket = socket
  }
}

module.exports = { Player }