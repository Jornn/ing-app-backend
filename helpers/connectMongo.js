import mongoose from 'mongoose'

export default {
  connect() {
    try {
      mongoose.connect(process.env.MONGO_DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
    } catch (err) {
      console.log(err)
    }
  }
}