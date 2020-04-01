// import File from '../models/file_model'
import multer from 'multer'
import AWS from 'aws-sdk'
import fs from 'fs'
import jsonWebToken from '../middleware/jsonWebToken'
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

router.post('/upload-file', [upload.single('file'), jsonWebToken.getToken, jsonWebToken.verifyToken], async (req, res) => {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  })
  const { userId, file: { originalname, destination, filename } } = req

  fs.readFile(`${destination}/${filename}`, 'utf8', (err, data) => {
    if (err) {
      console.log(err)
      res.sendStatus(422)
    }
    
    let dataArray = data.split((/\r?\n/))
    const params = {
      Bucket: 'ing-app',
      Key: `${userId}/${originalname}`
    }

    s3.headObject(params, (err, metadata) => {
      if (err && err.code === 'NotFound') {
        params.Body = JSON.stringify(dataArray, null, 2)
        s3.upload(params, (s3Err, data) => {
          if (s3Err) {
            console.log(s3Err)
            return res.sendStatus(422)
          }
        })
        removeLocalFiler(destination, filename)

        return res.send({
          success: true,
          message: 'File upload successful',
          type: 'success'
        })
      } else if (err) { 
        console.log(err)
        return res.sendStatus(422)
      } else {
        res.send({
          success: false,
          message: 'File already exists',
          type: 'error'
        })
      }
    })
  })
})

function removeLocalFiler(destination, filename) {
  fs.unlink(`${destination}/${filename}`, (err) => {
    if(err) throw err
  })
}

router.get('/get-uploaded-files', [jsonWebToken.getToken, jsonWebToken.verifyToken], async (req, res) => {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  })
  const { userId } = req

  let params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Prefix: userId
  }

  s3.listObjectsV2(params, (err, data) => {
    if (err) {
      res.sendStatus(422)
    }
    let files = []
    data.Contents.forEach(entry => {
      files.push(entry.Key.replace(`${userId}/`, ''))
    })
    res.send({
      files
    })
  })
})


//, [jsonWebToken.getToken, jsonWebToken.verifyToken]
router.get('/fetch/:fileName', async (req, res) => {
  const { fileName } = req.params
  const pathFile = `./downloads/${fileName}`
  const fs = require('fs')

  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  })

  //replace userId
  let userId = '5e3811256e1eac8ab4b7f93f'
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${userId}/${fileName}`
  }
  
  console.log(params)
  
  s3.getObject(params, (err, data) => {
    console.log(JSON.parse(data.Body.toString()))
    fs.writeFileSync(pathFile, data.Body, 'utf8')
    // res.download(pathFile)
    // res.sendFile(pathFile)
    res.setHeader('Content-Type', 'text/csv')
    res.send({
      form: formData
    })
  })
})
module.exports = router