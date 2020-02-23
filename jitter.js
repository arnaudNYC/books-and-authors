function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max))
}

module.exports = function throttle(req, res, next) {
  setTimeout(next, getRandomInt(250))
}
