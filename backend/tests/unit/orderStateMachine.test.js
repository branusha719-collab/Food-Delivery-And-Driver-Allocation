const { ORDER_STATUS } = require('../../src/utils/orderStatus');
const {
  isValidOrderTransition,
  getAllowedTransitions,
  isTerminalStatus
} = require('../../src/utils/orderStateMachine');

describe('Order State Machine (Unit Tests)', () => {
  describe('Valid Order Transitions', () => {
    test('PLACED -> RESTAURANT_ACCEPTED is valid', () => {
      expect(isValidOrderTransition(ORDER_STATUS.PLACED, ORDER_STATUS.RESTAURANT_ACCEPTED)).toBe(true);
    });

    test('PLACED -> REJECTED is valid', () => {
      expect(isValidOrderTransition(ORDER_STATUS.PLACED, ORDER_STATUS.REJECTED)).toBe(true);
    });

    test('RESTAURANT_ACCEPTED -> PREPARING is valid', () => {
      expect(isValidOrderTransition(ORDER_STATUS.RESTAURANT_ACCEPTED, ORDER_STATUS.PREPARING)).toBe(true);
    });

    test('PREPARING -> READY is valid', () => {
      expect(isValidOrderTransition(ORDER_STATUS.PREPARING, ORDER_STATUS.READY)).toBe(true);
    });

    test('READY -> DRIVER_ASSIGNED is valid', () => {
      expect(isValidOrderTransition(ORDER_STATUS.READY, ORDER_STATUS.DRIVER_ASSIGNED)).toBe(true);
    });

    test('DRIVER_ASSIGNED -> PICKED_UP is valid', () => {
      expect(isValidOrderTransition(ORDER_STATUS.DRIVER_ASSIGNED, ORDER_STATUS.PICKED_UP)).toBe(true);
    });

    test('PICKED_UP -> DELIVERED is valid', () => {
      expect(isValidOrderTransition(ORDER_STATUS.PICKED_UP, ORDER_STATUS.DELIVERED)).toBe(true);
    });
  });

  describe('Invalid Order Transitions', () => {
    test('PLACED -> DELIVERED must be rejected', () => {
      expect(isValidOrderTransition(ORDER_STATUS.PLACED, ORDER_STATUS.DELIVERED)).toBe(false);
    });

    test('PLACED -> PREPARING must be rejected', () => {
      expect(isValidOrderTransition(ORDER_STATUS.PLACED, ORDER_STATUS.PREPARING)).toBe(false);
    });

    test('PREPARING -> DELIVERED must be rejected', () => {
      expect(isValidOrderTransition(ORDER_STATUS.PREPARING, ORDER_STATUS.DELIVERED)).toBe(false);
    });

    test('READY -> DELIVERED must be rejected', () => {
      expect(isValidOrderTransition(ORDER_STATUS.READY, ORDER_STATUS.DELIVERED)).toBe(false);
    });

    test('DELIVERED -> PREPARING must be rejected', () => {
      expect(isValidOrderTransition(ORDER_STATUS.DELIVERED, ORDER_STATUS.PREPARING)).toBe(false);
    });

    test('REJECTED -> PREPARING must be rejected', () => {
      expect(isValidOrderTransition(ORDER_STATUS.REJECTED, ORDER_STATUS.PREPARING)).toBe(false);
    });

    test('Null or undefined statuses return false', () => {
      expect(isValidOrderTransition(null, ORDER_STATUS.READY)).toBe(false);
      expect(isValidOrderTransition(ORDER_STATUS.READY, undefined)).toBe(false);
    });

    test('Unknown arbitrary statuses return false', () => {
      expect(isValidOrderTransition('UNKNOWN_STATUS', ORDER_STATUS.DELIVERED)).toBe(false);
    });
  });

  describe('Terminal Statuses', () => {
    test('DELIVERED cannot transition to any status', () => {
      const allowed = getAllowedTransitions(ORDER_STATUS.DELIVERED);
      expect(allowed).toEqual([]);
      expect(isTerminalStatus(ORDER_STATUS.DELIVERED)).toBe(true);
    });

    test('REJECTED cannot transition to any status', () => {
      const allowed = getAllowedTransitions(ORDER_STATUS.REJECTED);
      expect(allowed).toEqual([]);
      expect(isTerminalStatus(ORDER_STATUS.REJECTED)).toBe(true);
    });

    test('Non-terminal statuses return false for isTerminalStatus', () => {
      expect(isTerminalStatus(ORDER_STATUS.PLACED)).toBe(false);
      expect(isTerminalStatus(ORDER_STATUS.PREPARING)).toBe(false);
      expect(isTerminalStatus(ORDER_STATUS.READY)).toBe(false);
    });
  });
});
