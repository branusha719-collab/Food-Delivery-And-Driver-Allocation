const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

class AuthController {
  /**
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      // Check whether the email is already registered
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email is already registered'
        });
      }

      // Hash password before storing it
      const passwordHash = await hashPassword(password);

      const user = await User.create({
        name,
        email,
        password: passwordHash,
        role:'customer'
      });

      // Generate JWT
      const token = generateToken(user);

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Explicitly select password because User.password uses select:false
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const passwordMatches = await comparePassword(
        password,
        user.password
      );

      if (!passwordMatches) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const token = generateToken(user);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            ...(user.restaurantId && { restaurantId: user.restaurantId }),
            ...(user.driverId && { driverId: user.driverId }) // Might as well add driverId if it exists
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();