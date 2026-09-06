import mongoose from 'mongoose'
import { config } from '../config.js'

export async function connectDb() {
  mongoose.set('strictQuery', true)
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 })
  console.log(`MongoDB connected: ${mongoose.connection.name}`)
}

export async function disconnectDb() {
  await mongoose.disconnect()
}
