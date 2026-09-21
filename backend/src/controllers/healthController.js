const { sendSuccess } = require('../utils/apiResponse');

/**
 * Controller for health status check
 */
class HealthController {
  /**
   * GET /api/health
   */
  getHealth(req, res) {
    return sendSuccess(res, 200, 'Food Delivery Backend is running', null);
  }
}

module.exports = new HealthController();
