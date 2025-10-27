import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';

// Generate JWT Token
export const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Verify JWT Token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Generate Verification Token
export const generateVerificationToken = () => {
  return jwt.sign(
    { purpose: 'verification' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Generate Password Reset Token
export const generateResetToken = () => {
  return jwt.sign(
    { purpose: 'password-reset' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};
