const express = require('express');
const dbConnect = require('./config/database');
const routes = require('./routes/Todo.routes');
const checkOverdueTasksAndMakeVoiceCalls  = require('./cron/twilioCron');
const taskCron = require('./cron/taskCron');
const cookieParser = require('cookie-parser');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 4000;
require('dotenv').config();

app.use(express.json());
app.use(cookieParser());
dbConnect();

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to Listed - By OpeninAPP"
    });
});

// mounting
app.use('/api/v1', routes);

// Cron job to check for overdue tasks and make voice calls
checkOverdueTasksAndMakeVoiceCalls();

// cron job to update task priority based on due_date
taskCron();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
