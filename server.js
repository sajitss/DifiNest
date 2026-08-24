import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'difinest_secure_stateless_secret_key_2026';

// Global Rate Limiter: General DOS prevention (max 120 requests per minute per IP)
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please wait a minute before trying again (Rate Limit Protected).'
  }
});

// Stricter Auth Rate Limiter: Brute Force attack prevention (max 5 login attempts per 10 minutes per IP)
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many admin login attempts from this IP. Account locked for 10 minutes for security.'
  }
});

app.use(cors());
app.use(express.json());
app.use(globalLimiter);

/**
 * Helper: Computes expected password using dynamic ASCII sum algorithm
 * Formula: username + ASCII_SUM(username)
 * Example: saji@difinative.com -> username = "saji"
 * 's'(115) + 'a'(97) + 'j'(106) + 'i'(105) = 423 -> password = "saji423"
 */
function computeExpectedPassword(email) {
  if (!email || typeof email !== 'string') return null;
  const trimmed = email.trim().toLowerCase();
  const parts = trimmed.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;

  const username = parts[0];
  const asciiSum = username.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return `${username}${asciiSum}`;
}

// Health check & status endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Admin Login Endpoint with backend password verification
app.post('/api/admin/login', authLimiter, (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide both admin email and password.'
    });
  }

  const expectedPassword = computeExpectedPassword(email);

  if (!expectedPassword) {
    return res.status(400).json({
      success: false,
      error: 'Invalid admin username format. Username must be a valid email address.'
    });
  }

  // Verify password matches the algorithmic rule
  if (password.trim() !== expectedPassword) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials. Password verification failed.'
    });
  }

  // Issue stateless JWT token (valid for 8 hours)
  const token = jwt.sign(
    {
      email: email.trim().toLowerCase(),
      role: 'admin',
      iss: 'DifiNest'
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  return res.json({
    success: true,
    message: 'Admin authentication successful.',
    token,
    user: {
      email: email.trim().toLowerCase(),
      role: 'admin'
    }
  });
});

// Admin Token Verification Endpoint (Stateless)
app.post('/api/admin/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false, error: 'No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ valid: true, user: decoded });
  } catch (err) {
    return res.status(401).json({ valid: false, error: 'Invalid or expired token.' });
  }
});

app.listen(PORT, () => {
  console.log(`[DifiNest Backend] API server running on port ${PORT}`);
});
