const mongoose = require('mongoose')
// import mongoose from 'mongoose'

const Schema = mongoose.Schema
const textSchema = new Schema({
    author: String,
    text: String,
    date: {type: Date, default: Date.now}
})

// textSchema.pre('save', (next) => {
//     let now = new Date()
//     this.date = now
//     next();
// });

module.exports = mongoose.model('text', textSchema)
