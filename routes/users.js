import User from '../models/user_model'
import bcrypt from 'bcrypt'
import { check, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'

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
  console.log(emailOrUsername)
  console.log(password)
    
  await User.findOne({
    $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
  }).then(response => {
    console.log(response)
  }).catch(error => {
    console.log(error)
  })

  console.log('User?')
  console.log(user)
      
  if (user) {
    return bcrypt.compare(password, user.password, (err, result) => {
      if (err) throw err
      if (result) {
        console.log(user)
        console.log(process.env.JWT_PRIVATE_KEY)
        const token = jwt.sign({ user }, process.env.JWT_PRIVATE_KEY)

        return res.status(200).send({
          success: true,
          message: 'Login successful',
          type: 'success',
          user,
          token
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
  
  return res.status(200).send({
    success: false,
    type: 'error',
    message: 'Incorrect credentials. Please try again'
  })
})

module.exports = router
