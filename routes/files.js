import File from '../models/file_model'
import multer from 'multer'
import AWS from 'aws-sdk'
import fs from 'fs'

AWS.config.update({ region: 'eu-west-2' })


var express = require('express')
var router = express.Router()

/* GET users listing. */
router.get('/', (req, res) => {
  res.send('respond with a resource')
})

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({ storage: storage })

router.post('/upload', upload.single('file'), async (req, res) => {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  })

  // console.log(req)
  // const { userId, file } = req.body
  console.log(req.file)

  fs.readFile(`${req.file.destination}/${req.file.filename}`, 'utf8', (err, data) => {
    if (err) {
      console.log(err)
      throw err
    }
    let dataArray = data.split((/\r?\n/))

    const params = {
      Bucket: 'ing-app',
      Key: req.file.originalname
    }

    s3.headObject(params, (err, metadata) => {
      if (err && err.code === 'NotFound') {
        console.log('NOT FOUND')
        params.Body = JSON.stringify(dataArray, null, 2)
        s3.upload(params, (s3Err, data) => {
          if (s3Err) {
            console.log('S3 ERR')
            console.log(s3Err)
            throw s3Err
          }
          fs.unlink(`${req.file.destination}/${req.file.filename}`, (err) => {
            if (err) throw err
          })
          res.send({
            success: true,
            message: 'file uploaded'
          })
        })
      } else if (err) { 
        throw err
      } else {
        res.send({
          success: false,
          message: 'File already exists'
        })
      }
    })
  })
})

router.post('/update-user-info', async (req, res, next) => {
  const { userId, fileName } = req.body
  File.create({
    userId,
    fileName
  }).then((res) => {
    console.log(res)
  })
})

router.get('/get-uploaded-files', async (req, res, next) => {
  const { userId } = req.query
  File.find({
    userId
  }).then((result) => {
    let fileNames = []
    result.forEach(entry => {
      console.log(entry)
      fileNames.push(entry.fileName)
    })
    console.log('FILES:')
    console.log(fileNames)
    res.send({
      uploadedFiles: fileNames
    })
  })
})
module.exports = router