import User from '../models/user_model'
import bcrypt from 'bcrypt'
import { check, validationResult } from 'express-validator'
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', [
  check('email').isEmail(),
  check('password').isLength({ min: 8 }),
  check('username').isLength({ min: 4 })
], async (req, res, next) => {
  const errors = validationResult(req)
  console.log(req.body)
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
  console.log(password)
  bcrypt.hash(password, hashRounds, (err, hash) => {
    if (err) {
      console.log(err)
      return res.status(400).send({
        message: 'Something went wrong, contact an admin'
      })
    }
    console.log(hash)
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
  check('password').isLength({ min: 8 })
], async (req, res, next) => {
  const errors = validationResult(req)
  console.log(req.body)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

    const { emailOrUsername, password } = req.body

    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    })
    
    console.log(user)
    if (user) {
      return bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
          return res.status(200).send({
            success: true,
            message: 'Login successful',
            data: {
              username: user.username,
              user_id: user._id
            }
          })
        } else {
          return res.status(200).send({
            success: false,
            message: 'Login failed'
          })
        }
      })
    } else {
      return res.status(200).send({
        success: false,
        message: 'Login failed'
      })
    }
    
})

module.exports = router;
