import mongoose from 'mongoose'

export async function connectDb(mongoUri) {
  if (!mongoUri) {
    throw new Error('Missing MONGO_URI')
  }

  mongoose.set('strictQuery', true)
  await mongoose.connect(mongoUri)
  return mongoose.connection
}