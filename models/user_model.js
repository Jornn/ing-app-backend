const mongoose = require('mongoose')
// import mongoose from 'mongoose'

const Schema = mongoose.Schema
const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  }
})

// textSchema.pre('save', (next) => {
//     let now = new Date()
//     this.date = now
//     next();
// });

module.exports = mongoose.model('user', userSchema)
