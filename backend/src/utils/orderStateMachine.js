const { ORDER_STATUS } = require('./orderStatus');

/**
 * Centralized Order State Transition Matrix
 *
 * Primary flow:
 * PLACED -> RESTAURANT_ACCEPTED -> PREPARING -> READY -> DRIVER_ASSIGNED -> PICKED_UP -> DELIVERED
 *
 * Alternate flow:
 * PLACED -> REJECTED
 *
 * Terminal states:
 * DELIVERED, REJECTED
 */
const ALLOWED_TRANSITIONS = Object.freeze({
  [ORDER_STATUS.PLACED]: Object.freeze([
    ORDER_STATUS.RESTAURANT_ACCEPTED,
    ORDER_STATUS.REJECTED
  ]),
  [ORDER_STATUS.RESTAURANT_ACCEPTED]: Object.freeze([
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.REJECTED
  ]),
  [ORDER_STATUS.PREPARING]: Object.freeze([
    ORDER_STATUS.READY,
    ORDER_STATUS.REJECTED
  ]),
  [ORDER_STATUS.READY]: Object.freeze([
    ORDER_STATUS.DRIVER_ASSIGNED,
    ORDER_STATUS.REJECTED
  ]),
  [ORDER_STATUS.DRIVER_ASSIGNED]: Object.freeze([
    ORDER_STATUS.PICKED_UP
  ]),
  [ORDER_STATUS.PICKED_UP]: Object.freeze([
    ORDER_STATUS.DELIVERED
  ]),
  [ORDER_STATUS.DELIVERED]: Object.freeze([]),
  [ORDER_STATUS.REJECTED]: Object.freeze([])
});

/**
 * Validates whether transition from currentStatus to nextStatus is permitted
 * @param {string} currentStatus
 * @param {string} nextStatus
 * @returns {boolean}
 */
const isValidOrderTransition = (currentStatus, nextStatus) => {
  if (!currentStatus || !nextStatus) return false;
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  return allowed.includes(nextStatus);
};

/**
 * Returns list of allowed next statuses for a given status
 * @param {string} currentStatus
 * @returns {string[]}
 */
const getAllowedTransitions = (currentStatus) => {
  return ALLOWED_TRANSITIONS[currentStatus] || [];
};

/**
 * Checks if status is a terminal state (cannot transition any further)
 * @param {string} status
 * @returns {boolean}
 */
const isTerminalStatus = (status) => {
  return [ORDER_STATUS.DELIVERED, ORDER_STATUS.REJECTED].includes(status);
};

module.exports = {
  ALLOWED_TRANSITIONS,
  isValidOrderTransition,
  getAllowedTransitions,
  isTerminalStatus
};
