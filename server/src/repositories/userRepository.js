import { Board } from '../models/Board.js'
import { User } from '../models/User.js'

export const publicUser = ({ id, name, email, createdAt, updatedAt }) => ({ id, name, email, createdAt, updatedAt })

export const userRepository = {
  async findByEmail(email) {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash')
    return user ? { ...user.toJSON(), passwordHash: user.passwordHash } : null
  },
  async findById(id) {
    const user = await User.findById(id)
    return user?.toJSON() ?? null
  },
  async create({ name, email, passwordHash }) {
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash })
    try {
      await Board.create({
        name: `${name}'s board`,
        ownerId: user._id,
        members: [{ userId: user._id, role: 'owner' }],
        columns: [
          { title: 'To do', position: 0 },
          { title: 'In progress', position: 1 },
          { title: 'Completed', position: 2 },
        ],
      })
      return user.toJSON()
    } catch (error) {
      await User.deleteOne({ _id: user._id })
      throw error
    }
  },
}
