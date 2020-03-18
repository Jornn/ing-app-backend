import File from '../models/file_model'
import { check, validationResult } from 'express-validator'
import multer from 'multer'
import AWS from 'aws-sdk'

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

const upload = multer({
  dest: './uploads',
  // storage: multer.memoryStorage()
})

router.post('/upload', upload.single('file'), (req, res, next) => {
  console.log("UPLOAD")
  console.log(req)
  // const { userId, file } = req.body



  res.send({
    success: true,
    message: 'file uploaded'
  })
})

module.exports = router;