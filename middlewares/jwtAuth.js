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