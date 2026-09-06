import mongoose from 'mongoose'
import { Task } from '../models/Task.js'

const serialize = (task) => task?.toJSON() ?? null

export const taskRepository = {
  async listByBoardIds(boardIds, query) {
    const filter = { boardId: { $in: boardIds } }
    if (query.status) filter.status = query.status
    if (query.assignee) filter.assignee = query.assignee
    const direction = query.sort?.startsWith('-') ? -1 : 1
    const sortField = query.sort?.replace(/^-/, '') || 'dueDate'
    const skip = (query.page - 1) * query.limit
    const [tasks, total] = await Promise.all([
      Task.find(filter).sort({ [sortField]: direction, _id: 1 }).skip(skip).limit(query.limit),
      Task.countDocuments(filter),
    ])
    return { tasks: tasks.map(serialize), total }
  },
  async findById(id) { return serialize(await Task.findById(id)) },
  async create(input) { return serialize(await Task.create(input)) },
  async updateVersioned(id, baseVersion, changes) {
    return serialize(await Task.findOneAndUpdate(
      { _id: id, version: baseVersion },
      { $set: changes, $inc: { version: 1 } },
      { new: true, runValidators: true },
    ))
  },
  async delete(id) { return Boolean(await Task.findByIdAndDelete(id)) },
  async overdueSummary(boardIds) {
    const objectIds = boardIds.map((id) => new mongoose.Types.ObjectId(id))
    return Task.aggregate([
      { $match: { boardId: { $in: objectIds }, dueDate: { $lt: new Date() }, status: { $ne: 'done' } } },
      { $group: { _id: '$assignee', count: { $sum: 1 }, earliestDueDate: { $min: '$dueDate' } } },
      { $project: { _id: 0, assignee: '$_id', count: 1, earliestDueDate: 1 } },
      { $sort: { count: -1, assignee: 1 } },
    ])
  },
}
