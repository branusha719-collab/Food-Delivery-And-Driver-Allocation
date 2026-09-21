const driverRepository = require('../repositories/driverRepository');
const orderService = require('./orderService');
const orderRepository = require('../repositories/orderRepository');
const ApiError = require('../utils/apiError');
const { ERROR_CODES } = require('../utils/errorCodes');
const { ORDER_STATUS } = require('../utils/orderStatus');

/**
 * Convert degrees to radians.
 */
function toRadians(value) {
  return (value * Math.PI) / 180;
}

/**
 * Calculate distance between two coordinates using
 * the Haversine formula.
 *
 * Returns distance in kilometres.
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Convert distance into a score.
 *
 * Closer drivers receive a higher score.
 *
 * 0 km  -> 100
 * 10 km -> 0
 */
function calculateDistanceScore(distanceKm) {
  const MAX_DISTANCE = 10;

  return Math.max(
    0,
    100 - (distanceKm / MAX_DISTANCE) * 100
  );
}

/**
 * Fewer active orders = higher workload score.
 *
 * 0 orders -> 100
 * 5 orders -> 0
 */
function calculateWorkloadScore(activeOrders) {
  const MAX_WORKLOAD = 5;

  return Math.max(
    0,
    100 - (activeOrders / MAX_WORKLOAD) * 100
  );
}

/**
 * Convert 0-5 rating into 0-100.
 */
function calculateRatingScore(rating) {
  return (rating / 5) * 100;
}

/**
 * Vehicle compatibility score.
 */
function calculateVehicleScore(
  driverVehicleType,
  requiredVehicleType
) {
  // If the order has no vehicle requirement,
  // don't penalize any vehicle.
  if (!requiredVehicleType) {
    return 100;
  }

  return driverVehicleType === requiredVehicleType ? 100 : 0;
}

/**
 * Calculate the final weighted score.
 *
 * Distance   = 40%
 * Workload   = 25%
 * Rating     = 20%
 * Vehicle    = 15%
 */
function calculateDriverScore({
  distanceKm,
  activeOrders,
  rating,
  vehicleType,
  requiredVehicleType
}) {
  const distanceScore =
    calculateDistanceScore(distanceKm);

  const workloadScore =
    calculateWorkloadScore(activeOrders);

  const ratingScore =
    calculateRatingScore(rating);

  const vehicleScore =
    calculateVehicleScore(
      vehicleType,
      requiredVehicleType
    );

  const totalScore =
    distanceScore * 0.40 +
    workloadScore * 0.25 +
    ratingScore * 0.20 +
    vehicleScore * 0.15;

  return {
    distanceScore,
    workloadScore,
    ratingScore,
    vehicleScore,
    totalScore
  };
}

/**
 * Select the best driver for an order.
 *
 * @param {string} orderId
 * @param {string|null} requiredVehicleType
 */
async function selectBestDriver(
  orderId,
  requiredVehicleType = null
) {
  const order = await orderRepository.findById(orderId);

  if (!order) {
    throw new ApiError(
      404,
      `Order with ID ${orderId} not found`,
      ERROR_CODES.ORDER_NOT_FOUND
    );
  }

  // Relaxed for demonstration: allow Customer App to trigger on PLACED
  if (order.status !== ORDER_STATUS.READY && order.status !== ORDER_STATUS.PLACED) {
    throw new ApiError(
      409,
      `Cannot allocate driver: Order status must be READY or PLACED, but is currently ${order.status}`,
      ERROR_CODES.DRIVER_ASSIGNMENT_INVALID
    );
  }

  const restaurant = order.restaurantId;

  if (
    !restaurant ||
    typeof restaurant.latitude !== 'number' ||
    typeof restaurant.longitude !== 'number'
  ) {
    throw new ApiError(
      400,
      'Restaurant location is required for driver allocation',
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  const drivers =
    await driverRepository.findAvailableDrivers();

  if (!drivers.length) {
    throw new ApiError(
      409,
      'No available drivers found',
      ERROR_CODES.DRIVER_ASSIGNMENT_INVALID
    );
  }

  const scoredDrivers = drivers
    .map((driver) => {
      const distanceKm = calculateDistance(
        driver.location.latitude,
        driver.location.longitude,
        restaurant.latitude,
        restaurant.longitude
      );

      const scores = calculateDriverScore({
        distanceKm,
        activeOrders: driver.activeOrders,
        rating: driver.rating,
        vehicleType: driver.vehicleType,
        requiredVehicleType
      });

      return {
        driver,
        distanceKm,
        ...scores
      };
    })
    .filter((candidate) => {
      // If a vehicle type is explicitly required,
      // incompatible vehicles are excluded.
      if (!requiredVehicleType) {
        return true;
      }

      return (
        candidate.driver.vehicleType ===
        requiredVehicleType
      );
    })
    .sort((a, b) => {
      // Highest score first.
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }

      // If scores are equal, prefer the closer driver.
      if (a.distanceKm !== b.distanceKm) {
        return a.distanceKm - b.distanceKm;
      }

      // Final tie-breaker: lower workload.
      return (
        a.driver.activeOrders -
        b.driver.activeOrders
      );
    });

  if (!scoredDrivers.length) {
    throw new ApiError(
      409,
      'No available driver matches the required vehicle type',
      ERROR_CODES.DRIVER_ASSIGNMENT_INVALID
    );
  }

  return {
    selected: scoredDrivers[0],
    candidates: scoredDrivers
  };
}

/**
 * Automatically select and assign the best driver.
 *
 * This uses the existing OrderService to perform
 * the actual atomic assignment/status transition.
 */
async function allocateDriver(
  orderId,
  requiredVehicleType = null
) {
  const result = await selectBestDriver(
    orderId,
    requiredVehicleType
  );

  const selectedDriver = result.selected.driver;

  const updatedOrder =
    await orderService.assignDriver(
      orderId,
      selectedDriver.driverId
    );

  return {
    order: updatedOrder,
    selectedDriver: {
      driverId: selectedDriver.driverId,
      name: selectedDriver.name,
      vehicleType: selectedDriver.vehicleType,
      rating: selectedDriver.rating,
      activeOrders: selectedDriver.activeOrders,
      distanceKm: Number(
        result.selected.distanceKm.toFixed(2)
      ),
      score: Number(
        result.selected.totalScore.toFixed(2)
      )
    },
    ranking: result.candidates.map((candidate) => ({
      driverId: candidate.driver.driverId,
      name: candidate.driver.name,
      distanceKm: Number(
        candidate.distanceKm.toFixed(2)
      ),
      rating: candidate.driver.rating,
      activeOrders: candidate.driver.activeOrders,
      vehicleType: candidate.driver.vehicleType,
      score: Number(
        candidate.totalScore.toFixed(2)
      )
    }))
  };
}

module.exports = {
  calculateDistance,
  calculateDistanceScore,
  calculateWorkloadScore,
  calculateRatingScore,
  calculateVehicleScore,
  calculateDriverScore,
  selectBestDriver,
  allocateDriver
};