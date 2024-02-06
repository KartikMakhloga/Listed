const cron = require('node-cron');
const { Task } = require('../models/Todo.model');

// Cron job to update task priority based on due_date

const taskCron = () => {
    cron.schedule('0 0 * * *', async () => {
        try {
            // Define the priority thresholds based on due_date
            const priorityThresholds = [
                { threshold: 0, days: 0 },
                { threshold: 1, days: 1 },
                { threshold: 1, days: 2 },
                { threshold: 2, days: 3 },
                { threshold: 2, days: 4 },
            ];

            // Get the current date
            const currentDate = new Date();

            // Find tasks that need priority update
            const tasksToUpdate = await Task.find({ due_date: { $lte: currentDate } });

            // Iterate through tasks and update priority based on due_date
            for (const task of tasksToUpdate) {
                let updatedPriority = 3; // Default priority if no threshold is met
                for (const threshold of priorityThresholds) {
                    if (calculateDaysDifference(currentDate, task.due_date) <= threshold.days) {
                        updatedPriority = threshold.threshold;
                        break;
                    }
                }
                // Update the priority of the task
                task.priority = updatedPriority;
                await task.save();
            }

            console.log('Task priorities updated successfully based on due_date.');
        } catch (error) {
            console.error('Error updating task priorities:', error);
        }
    });
}

// Function to calculate the difference in days between two dates
function calculateDaysDifference(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const diffDays = Math.round(Math.abs((date1 - date2) / oneDay));
    return diffDays;
}

module.exports = taskCron;
