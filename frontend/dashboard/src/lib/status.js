// Mirrors backend/src/utils/orderStatus.js. Change here only if the backend enum changes.
export const STATUS = {
  PLACED: "PLACED",
  ACCEPTED: "RESTAURANT_ACCEPTED",
  REJECTED: "REJECTED",
  PREPARING: "PREPARING",
  READY: "READY",
  DRIVER_ASSIGNED: "DRIVER_ASSIGNED",
  PICKED_UP: "PICKED_UP",
  DELIVERED: "DELIVERED",
};

export const STATUS_LABEL = {
  [STATUS.PLACED]: "New",
  [STATUS.ACCEPTED]: "Accepted",
  [STATUS.REJECTED]: "Rejected",
  [STATUS.PREPARING]: "Preparing",
  [STATUS.READY]: "Ready for pickup",
  [STATUS.DRIVER_ASSIGNED]: "Driver assigned",
  [STATUS.PICKED_UP]: "Picked up",
  [STATUS.DELIVERED]: "Delivered",
};

// The restaurant role owns only these transitions (the backend state machine enforces them too).
export const RESTAURANT_ACTIONS = {
  [STATUS.PLACED]: [
    { label: "Accept order", to: STATUS.ACCEPTED, tone: "primary" },
    { label: "Reject", to: STATUS.REJECTED, tone: "danger", confirm: true },
  ],
  [STATUS.ACCEPTED]: [
    { label: "Start preparing", to: STATUS.PREPARING, tone: "primary" },
    { label: "Cancel", to: STATUS.REJECTED, tone: "danger", confirm: true }
  ],
  [STATUS.PREPARING]: [
    { label: "Mark ready", to: STATUS.READY, tone: "primary" },
    { label: "Cancel", to: STATUS.REJECTED, tone: "danger", confirm: true }
  ],
  [STATUS.READY]: [
    { label: "Cancel", to: STATUS.REJECTED, tone: "danger", confirm: true }
  ],
};

export const ALL_STATUSES = Object.values(STATUS);
export const IN_PROGRESS = [STATUS.PLACED, STATUS.ACCEPTED, STATUS.PREPARING, STATUS.READY, STATUS.DRIVER_ASSIGNED, STATUS.PICKED_UP];
