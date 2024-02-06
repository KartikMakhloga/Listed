const cron = require('node-cron');
const { Task } = require('../models/Todo.model');
require('dotenv').config();

// Initialize Twilio client with your Twilio account credentials
const twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Flag to track if the previous user attended the call
let previousUserAttendedCall = false;

// Cron job to check for overdue tasks and make voice calls
const checkOverdueTasksAndMakeVoiceCalls = () => {
    cron.schedule('* * * * *', async () => {
        try {
            // Find overdue tasks
            const overdueTasks = await Task.find({ due_date: { $lt: new Date() }, status: 'TODO' }).populate('user');

            // Iterate through overdue tasks
            for (const task of overdueTasks) {
                const user = task.user;

                // Make voice call based on user priority
                switch (user.priority) {
                    case 0:
                        if (!previousUserAttendedCall) {
                            await makeVoiceCall(user.phone_number, 'Dear customer!, You have an overdue task. Please take action.');
                        }
                        break;
                    case 1:
                        if (!previousUserAttendedCall) {
                            await makeVoiceCall(user.phone_number, 'Dear customer!, You have an overdue task. Please take action.');
                        }
                        break;
                    case 2:
                        if (!previousUserAttendedCall) {
                            await makeVoiceCall(user.phone_number, 'Dear customer!, You have an overdue task. Please take action.');
                        }
                        break;
                    default:
                        break;
                }
            }
        } catch (error) {
            console.error('Error making voice calls:', error);
        }
    });
}

// Function to make a voice call using Twilio
async function makeVoiceCall(phoneNumber, message) {
    try {
        const call = await twilioClient.calls.create({
            twiml: `<Response><Say>${message}</Say></Response>`,
            to: phoneNumber,
            from: process.env.PHONE_NUMBER,
        });

        // Wait for the call to complete
        const callStatus = await twilioClient.calls(call.sid).fetch();
        console.log(callStatus.status);

        // Update previousUserAttendedCall based on call status
        previousUserAttendedCall = callStatus.status === 'ringing';

        console.log('Voice call made successfully to', phoneNumber);
    } catch (error) {
        console.error('Error making voice call:', error);
    }
}

module.exports = checkOverdueTasksAndMakeVoiceCalls;