import File from '../models/file_model'
import { check, validationResult } from 'express-validator'
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

router.post('/upload', (req, res, next) => {
  console.log("UPLOAD")
  console.log(req)
  const { userId, file } = req.body

  File.create({
    userId,
    file
  })
})

module.exports = router;