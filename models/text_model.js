const mongoose = require('mongoose')
// import mongoose from 'mongoose'

const Schema = mongoose.Schema
const textSchema = new Schema({
    author: String,
    text: String
})

module.exports = mongoose.model('text', textSchema)
