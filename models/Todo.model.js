const mongoose = require('mongoose');

const SubTaskSchema = new mongoose.Schema({
  task_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  status: { type: Number, enum: [0, 1], default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null },
});

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  due_date: { type: Date, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  SubTask: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubTask' }],
  priority: { type: Number, enum: [0, 1, 2, 3], default: 0 },
  status: { type: String, enum: ['TODO', 'IN_PROGRESS', 'DONE'], default: 'TODO' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null },
});

const UserSchema = new mongoose.Schema({
  phone_number: { type: String, required: true },
  priority: { type: Number, enum: [0, 1, 2], default: 0 }
});

const SubTask = mongoose.model('SubTask', SubTaskSchema);
const Task = mongoose.model('Task', TaskSchema);
const User = mongoose.model('User', UserSchema);

module.exports = { SubTask, Task, User };
