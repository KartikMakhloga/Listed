const { Task, SubTask, User } = require('../models/Todo.model');
const jwt = require('jsonwebtoken');

// Create task API
exports.createTask = async (req, res) => {
    try {
        // Implement create task logic with JWT authentication, input validation, and error handling
        const { title, description, dueDate } = req.body;
        const due_date = new Date(dueDate);
        // validate
        if (!title || !description || !due_date) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // check if due_date is valid
        if (due_date < Date.now()) {
            return res.status(400).json({ message: "Due date must be in the future" });
        }

        // set priority based on due_date
        let setPriority;
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(today.getDate() + 2);

        const threeDaysLater = new Date(today);
        threeDaysLater.setDate(today.getDate() + 3);
        const fourDaysLater = new Date(today);
        fourDaysLater.setDate(today.getDate() + 4);

        if (due_date.toDateString() === today.toDateString()) {
            setPriority = 0;
        } else if (due_date.toDateString() === tomorrow.toDateString() || due_date.toDateString() === dayAfterTomorrow.toDateString()) {
            setPriority = 1;
        } else if (due_date.toDateString() === threeDaysLater.toDateString() || due_date.toDateString() === fourDaysLater.toDateString()) {
            setPriority = 2;
        } else {
            setPriority = 3;
        }


        const task = new Task({
            title,
            description,
            due_date,
            priority: setPriority,
            user: req.user.id
        });

        await task.save();



        res.status(201).json({ message: 'Task created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create subtask API
exports.createSubTask = async (req, res) => {
    try {
        // Implement create subtask logic with JWT authentication, input validation, and error handling
        const { task_id } = req.params;
        const subtask = new SubTask({
            task_id
        });
        await subtask.save();

        //save subtask id to task
        const task = await Task.findById(task_id);
        task.SubTask.push(subtask._id);
        await task.save();

        res.status(201).json({ message: 'Subtask created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all user tasks API
exports.getAllUserTasks = async (req, res) => {
    try {
        const { priority, due_date, page = 1, limit = 10 } = req.query;
        const userId = req.user.id;

        // Construct query based on provided filters
        const query = { user: userId , deleted_at: null};
        if (priority) query.priority = priority;
        if (due_date) query.due_date = due_date;

        // Calculate pagination values
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        // Query tasks with pagination
        const tasks = await Task.find(query)
            .skip(startIndex)
            .limit(limit)
            .populate('SubTask')
            .exec();

        // Get total count of tasks matching the query
        const totalCount = await Task.countDocuments(query);

        // Construct response object with tasks and pagination metadata
        const response = {
            tasks,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalTasks: totalCount
            }
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

// Controller function for getting all user subtasks with optional filtering by task_id
exports.getAllUserSubtasks = async (req, res) => {
    try {
        const { task_id } = req.params;

        // Construct query based on provided task_id and user_id
        const query = {deleted_at: null};
        if (task_id) query.task_id = task_id;

        // Query subtasks
        const subtasks = await SubTask.find(query);

        res.status(200).json({ success: true, subtasks });
    } catch (error) {
        console.error('Error fetching subtasks:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

// Controller function for updating a task
exports.updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { due_date, status } = req.body;
        const userId = req.user.id;

        // Validate due_date if provided
        if (due_date && new Date(due_date) < Date.now()) {
            return res.status(400).json({ success: false, message: 'Due date must be in the future' });
        }

        // Check if the task belongs to the user
        const task = await Task.findOne({ _id: taskId, user: userId });

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Update task properties if provided
        if (due_date) {
            task.due_date = due_date;
        }
        if (status) {
            // Validate status
            if (!['TODO', 'DONE'].includes(status)) {
                return res.status(400).json({ success: false, message: 'You have not finised all subTasks' });
            }
            task.status = status;
        }

        // Save the updated task
        await task.save();

        res.status(200).json({ success: true, message: 'Task updated successfully', task });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

// Controller function for updating a subtask
exports.updateSubtask = async (req, res) => {
    try {
        const { subtaskId } = req.params;
        const { status } = req.body;

        // Check if the subtask belongs to the user
        const subtask = await SubTask.findOne({ _id: subtaskId });

        if (!subtask) {
            return res.status(404).json({ success: false, message: 'Subtask not found' });
        }

        // Validate status
        console.log("status", status);
        if (status !== 0 && status !== 1) {
            return res.status(400).json({ success: false, message: 'Invalid status value' });
        }

        // Update subtask status
        subtask.status = status;

        // Save the updated subtask
        await subtask.save();

        // update task status to IN_PROGRESS if subtask status is 1
        const task = await Task.findById(subtask.task_id);
        task.status = status === 1 ? 'IN_PROGRESS' : 'TODO';
        await task.save();

        res.status(200).json({ success: true, message: 'Subtask updated successfully', subtask });
    } catch (error) {
        console.error('Error updating subtask:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

// Controller function for soft deleting a task
exports.softDeleteTask = async (req, res) => {
    try {
        const { task_id } = req.params;
        const userId = req.user.id;
        console.log("userId", userId);
        console.log("taskId", task_id);

        // Find the task to soft delete
        const task = await Task.findOne({ _id: task_id, user: userId, deleted_at: null});

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Soft delete the task by setting the deleted_at field
        task.deleted_at = new Date();
        await task.save();

        res.status(200).json({ success: true, message: 'Task soft deleted successfully' });
    } catch (error) {
        console.error('Error soft deleting task:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

// Controller function for soft deleting a subtask
exports.softDeleteSubtask = async (req, res) => {
    try {
        const { subtaskId } = req.params;

        // Find the subtask to soft delete
        const subtask = await SubTask.findOne({ _id: subtaskId, deleted_at: null});

        if (!subtask) {
            return res.status(404).json({ success: false, message: 'Subtask not found' });
        }

        // delete the subtask id from task
        const task = await Task.findById(subtask.task_id);
        task.SubTask = task.SubTask.filter((id) => id !== subtaskId);
        await task.save();

        // Soft delete the subtask by setting the deleted_at field
        subtask.deleted_at = new Date();
        await subtask.save();

        res.status(200).json({ success: true, message: 'Subtask soft deleted successfully' });
    } catch (error) {
        console.error('Error soft deleting subtask:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};