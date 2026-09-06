import mongoose from 'mongoose'

const memberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'editor', 'viewer'], required: true },
}, { _id: false })

const columnSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 60 },
  position: { type: Number, required: true, min: 0 },
}, { _id: true })

const boardSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: { type: [memberSchema], default: [] },
  columns: { type: [columnSchema], default: [] },
}, { timestamps: true, versionKey: false })

boardSchema.index({ 'members.userId': 1 })
boardSchema.set('toJSON', {
  transform(_document, value) {
    value.id = value._id.toString()
    delete value._id
    return value
  },
})

export const Board = mongoose.model('Board', boardSchema)
