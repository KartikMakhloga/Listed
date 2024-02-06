const express = require('express');
const router = express.Router();
const { createTask,createSubTask, getAllUserTasks, getAllUserSubtasks, updateTask, updateSubtask, softDeleteTask, softDeleteSubtask } = require('../controllers/Todo.controller');
const { createUser,login } = require('../controllers/Auth.controller');
const { verifyToken } = require('../middlewares/jwtAuth');

// create user API
router.post('/signup', createUser);

// login user API
router.post('/login', login);


router.post('/create-task',verifyToken, createTask);
router.post('/create-subtask/:task_id',verifyToken, createSubTask);
router.get('/tasks', verifyToken, getAllUserTasks);
router.get('/subtasks/:task_id', verifyToken, getAllUserSubtasks);
router.put('/tasks/:taskId', verifyToken, updateTask);
router.put('/subtasks/:subtaskId', verifyToken, updateSubtask);
router.delete('/tasks/:task_id', verifyToken, softDeleteTask);
router.delete('/subtasks/:subtaskId', verifyToken, softDeleteSubtask);
module.exports = router;