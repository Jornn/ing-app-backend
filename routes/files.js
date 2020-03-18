import File from '../models/file_model'
import { check, validationResult } from 'express-validator'
import multer from 'multer'
import AWS from 'aws-sdk'
import fs from 'fs'

AWS.config.update({ region: 'eu-west-2' });


var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({ storage: storage })

router.post('/upload', upload.single('file'), async (req, res, next) => {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  });

  // console.log(req)
  // const { userId, file } = req.body
  console.log(req.file)

    fs.readFile(`${req.file.destination}/${req.file.filename}`, "utf8", (err, data) => {
      if (err) {
        console.log(err)
        throw err
      }
      let dataArray = data.split((/\r?\n/))
      // console.log(dataArray)
      const params = {
        Bucket: 'ing-app',
        Key: req.file.originalname,
        Body: JSON.stringify(dataArray, null, 2)
      }

      s3.upload(params, (s3Err, data) => {
        if (s3Err) {
          console.log("S3 ERR")
          console.log(s3Err)
          throw s3Err
        }
        console.log('File uploaded')
      })
    })
    
  const options = {
    Bucket: 'ing-app',
    Key: req.file.originalname,
  }

  s3.getObject(options, (err, data) => {
    if (err) throw err
    console.log("IN FUNC")
    console.log(JSON.parse(data.Body))

    res.send({
      success: true,
      message: 'file uploaded',
      file: JSON.parse(data.Body)
    })
  })

  // res.send({
  //   success: true,
  //   message: 'file uploaded'
  // })
})

async function getObject(options) {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  });

  
}

module.exports = router;