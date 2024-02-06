const { User } = require('../models/Todo.model');
const jwt = require('jsonwebtoken');

// Create user API
exports.createUser = async (req, res) => {
    try {
        // Implement create user logic with input validation and error handling
        const { phone_number } = req.body;

        // validate
        if (!phone_number) {
            return res.status(400).json({ message: "Phone number is required" });
        }

        const user = new User({
            phone_number
        });

        await user.save();
        res.status(200).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// login user API
exports.login = async (req, res) => {
    try {
        // Get email and password from request body
        const { phone_number } = req.body

        // Check if email or password is missing
        if (!phone_number) {
            // Return 400 Bad Request status code with error message
            return res.status(400).json({
                success: false,
                message: `Please Fill up All the Required Fields`,
            })
        }

        // Find user with provided email
        const user = await User.findOne({ phone_number });

        // If user not found with provided email
        if (!user) {
            // Return 401 Unauthorized status code with error message
            return res.status(401).json({
                success: false,
                message: `User is not Registered with Us Please SignUp to Continue`,
            })
        }

        // Generate JWT token and Compare Password
        const token = jwt.sign(
            { phone_number: user.phone_number, id: user._id, priority: user.priority},
            process.env.JWT_SECRET,
            {
                expiresIn: "3d",
            }
        )

        // Save token to user document in database
        user.token = token
        // Set cookie for token and return success response
        const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        }
        res.cookie("token", token, options).status(200).json({
            success: true,
            token,
            user,
            message: `User Login Success`,
        })
    }
     catch (error) {
    console.error(error)
    // Return 500 Internal Server Error status code with error message
    return res.status(500).json({
        success: false,
        message: `Login Failure Please Try Again`,
    })
}
}

// Update user priority API
exports.updateUserPriority = async (req, res) => {
    try {
        // Implement update user priority logic with input validation and error handling
        const { id, priority } = req.body;
        await User.findByIdAndUpdate(id, { priority });
        res.status(200).json({ message: 'User priority updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};