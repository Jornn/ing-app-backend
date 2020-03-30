import User from '../models/user_model'
import bcrypt from 'bcrypt'
import { check, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
// import Token from '../middleware/token'
var express = require('express')
var router = express.Router()


/* GET users listing. */
router.get('/', function (req, res) {
  res.send('respond with a resource')
})

router.post('/register', [
  check('email').isEmail(),
  check('password').isLength({ min: 8 }),
  check('username').isLength({ min: 4 })
], async (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

  const { email, password, username } = req.body

  const user = await User.findOne({
    $or: [{email},{ username }]
  })
  

  if (user) {
    return res.status(200).send({
      userExists: true,
      message: 'User already exists'
    })
  }
  const hashRounds = 12
  bcrypt.hash(password, hashRounds, (err, hash) => {
    if (err) {
      return res.status(400).send({
        message: 'Something went wrong, contact an admin'
      })
    }
    return User.create({
      email,
      username,
      password: hash
    }).then(() => {
      return res.status(200).send({
        message: 'Account created'
      })
    }).catch((error) => {
      console.log(error)
      return res.status(400).send({
        message: 'Something went wrong, contact an admin'
      })
    })
    // Store hash in your password DB.
  })
})


router.post('/login', [
  check('userData.password').isLength({ min: 8 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

  const { emailOrUsername, password } = req.body.userData
  const JWT_SECRET = process.env.JWT_PRIVATE_KEY

    
  const user = await User.findOne({
    $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
  }).catch(error => {
    console.log(error)
  })
      
  if (user) {
    return bcrypt.compare(password, user.password, (err, result) => {
      if (err) throw err
      if (result) {
        const token = jwt.sign({ user }, JWT_SECRET)

        return res.status(200).send({
          success: true,
          message: 'Login successful',
          type: 'success',
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            token
          }
        })
      } else {
        return res.status(200).send({
          success: false,
          type: 'error',
          message: 'Incorrect credentials. Please try again'
        })
      }
    })
  }
    
  // router.post('/jwt', Token.verifyToken, (req, res) => {
  //   jwt.verify(req.token, JWT_SECRET, err => {
  //     if (err) {
  //       res.sendStatus(401)
  //     } else {
  //       res.json({
  //         success: true,
  //         message: 'Token verified'
  //       })
  //     }
  //   })
  // })
  
  return res.status(200).send({
    success: false,
    type: 'error',
    message: 'Incorrect credentials. Please try again'
  })
})

module.exports = router
