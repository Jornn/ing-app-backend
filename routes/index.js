var express = require('express')
var router = express.Router()

/* GET home page. */
router.get('/', function (req, res) {
  res.json({
    message: 'test'
  }).catch((error) => {
    res.status(500)
    res.json(error)
  })
})

module.exports = router
