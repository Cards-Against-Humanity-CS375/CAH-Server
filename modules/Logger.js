// * Storing all console.log messages
const logs = []

/**
 * 
 * @param {Boolean} isSuccess true will give a green text output, red for false, meant to be a much better console.log
 * @param {String} content Body of the message you want to be printed out
 */
function logMessage(isSuccess, content) {
    if (isSuccess) {
        const message = `\x1b[32m${content}\x1b[0m`
        logs.push(message)
        console.log(message)
    }
    else {
        const message = `\x1b[31m${content}\x1b[0m`
        logs.push(message)
        console.log(message)
    }
}

module.exports = { logMessage }