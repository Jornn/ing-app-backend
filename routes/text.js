var express = require('express');
var router = express.Router();
const mongoose = require('mongoose')
const config = require('../config')
// const Text = require('../models/text_model')

import Text from '../models/text_model'

try {
    mongoose.connect(config.mongodb, { useNewUrlParser: true, useUnifiedTopology: true })
} catch(err){
    console.log(err)
}

/* GET users listing. */
router.get('/test', function (req, res, next) {
    console.log("JOEJOE")
    res.send('respond with a resource');
});

router.post('/add-text', async (req, res, next) => {
    console.log(req.body)
    const { author, text } = req.body
    console.log(author)
    console.log(text)
    return await Text.create({
        author,
        text
    }).then((result) => {
        console.log(result)
        res.send(result)
    })
});

module.exports = router;
