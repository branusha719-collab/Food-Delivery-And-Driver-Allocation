const User = require('../models/User');
const { sendSuccess } = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

class DriverController {
  async getProfile(req, res, next) {
    try {
      const driver = await User.findById(req.user.id).select(
        'name email role isOnline vehicleType rating currentWorkload'
      );

      if (!driver || driver.role !== 'driver') {
        throw new ApiError(404, 'Driver not found');
      }

      return sendSuccess(
        res,
        200,
        'Driver profile retrieved successfully',
        driver
      );
    } catch (error) {
      next(error);
    }
  }

  async updateAvailability(req, res, next) {
    try {
      const { isOnline } = req.body;

      if (typeof isOnline !== 'boolean') {
        throw new ApiError(400, 'isOnline must be a boolean');
      }

      const driver = await User.findOneAndUpdate(
        {
          _id: req.user.id,
          role: 'driver'
        },
        {
          isOnline
        },
        {
          new: true,
          runValidators: true
        }
      ).select(
        'name email role isOnline vehicleType rating currentWorkload'
      );

      if (!driver) {
        throw new ApiError(404, 'Driver not found');
      }

      return sendSuccess(
        res,
        200,
        isOnline
          ? 'Driver is now online'
          : 'Driver is now offline',
        driver
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DriverController();