/**
 * Represent a card with blanks so players can fill the blank in a funny way
 */
class BlackCard
{
  /**
   * Instantiating a black card object
   * @param {String} prompt 
   * @param {int} pick 
   */
  constructor(prompt, pick)
  {
    this.prompt = prompt
    this.pick = pick
  }


}

module.exports = { BlackCard }