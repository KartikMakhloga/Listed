const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;

// Middleware for JWT token verification
exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.header('Authorization').replace('Bearer ', '');

    if (!token) {
      console.error('JWT token not found.');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Verifying the JWT using the secret key stored in environment variables
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decode);
      // Storing the decoded JWT payload in the request object for further use
      req.user = decode;
    } catch (error) {
      // If JWT verification fails, return 401 Unauthorized response
      return res
        .status(401)
        .json({ success: false, message: "token is invalid" });
    }
    next();
  } catch (error) {
    console.error('Error verifying JWT token:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

// Middleware for extracting due_date from JWT token
exports.extractDueDateFromToken = (req, res, next) => {
  try {
    // For demonstration purposes, I'm assuming you have a function to retrieve the token from the environment or request headers
    // Replace this with your actual logic to get the JWT token
    const jwtToken = req.cookies.token || req.body.token || req.header('Authorization').replace('Bearer ', '');

    if (!jwtToken) {
      console.error('JWT token not found.');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decodedToken = jwt.verify(jwtToken, SECRET_KEY);
    req.due_date = new Date(decodedToken.due_date);
    next();
  } catch (error) {
    console.error('Error extracting due_date from JWT token:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};