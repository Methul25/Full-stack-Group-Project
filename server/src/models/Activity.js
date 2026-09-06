import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema({
  boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['created', 'updated', 'deleted'], required: true },
  changes: { type: mongoose.Schema.Types.Mixed, default: {} },
  at: { type: Date, default: Date.now },
}, { versionKey: false })

activitySchema.index({ boardId: 1, at: -1 })

export const Activity = mongoose.model('Activity', activitySchema)
