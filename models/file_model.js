const mongoose = require('mongoose')
// import mongoose from 'mongoose'

const Schema = mongoose.Schema
const fileSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  file: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('file', fileSchema)
