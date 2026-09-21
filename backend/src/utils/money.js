/**
 * Safe monetary calculations using integer paise (1 Rupee = 100 Paise)
 * Prevents IEEE 754 floating-point rounding errors in financial transactions.
 */

/**
 * Converts rupees (number or numeric string) safely to integer paise
 * Example: 250.50 -> 25050
 * @param {number|string} amountRupees
 * @returns {number} Integer paise
 */
const toPaise = (amountRupees) => {
  if (amountRupees === undefined || amountRupees === null || isNaN(amountRupees)) {
    throw new Error(`Invalid monetary amount: ${amountRupees}`);
  }
  return Math.round(Number(amountRupees) * 100);
};

/**
 * Converts integer paise to two-decimal rupees
 * Example: 25050 -> 250.50
 * @param {number} amountPaise
 * @returns {number} Decimal rupees
 */
const toRupees = (amountPaise) => {
  if (amountPaise === undefined || amountPaise === null || isNaN(amountPaise)) {
    return 0;
  }
  return Number((Number(amountPaise) / 100).toFixed(2));
};

/**
 * Calculates item subtotal in paise
 * @param {number} unitPricePaise - Unit price in paise
 * @param {number} quantity - Quantity of items
 * @returns {number} Subtotal in paise
 */
const calculateItemSubtotal = (unitPricePaise, quantity) => {
  const qty = parseInt(quantity, 10);
  const price = parseInt(unitPricePaise, 10);
  if (isNaN(qty) || qty <= 0) {
    throw new Error(`Invalid quantity for price calculation: ${quantity}`);
  }
  if (isNaN(price) || price < 0) {
    throw new Error(`Invalid unit price for calculation: ${unitPricePaise}`);
  }
  return price * qty;
};

/**
 * Sums all item subtotals in paise
 * @param {Array<{ subtotal: number }>} items
 * @returns {number} Total subtotal in paise
 */
const calculateOrderSubtotal = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return 0;
  }
  return items.reduce((sum, item) => sum + parseInt(item.subtotal, 10), 0);
};

/**
 * Calculates delivery fee in paise (default: 4000 paise = ₹40.00)
 * Isolated pure function for easy extension with distance/surge pricing later
 * @param {object} [params]
 * @returns {number} Delivery fee in paise
 */
const calculateDeliveryFee = (params = {}) => {
  const envFee = process.env.DEFAULT_DELIVERY_FEE_PAISE;
  if (envFee && !isNaN(envFee)) {
    return parseInt(envFee, 10);
  }
  return 4000; // 4000 paise = ₹40
};

module.exports = {
  toPaise,
  toRupees,
  calculateItemSubtotal,
  calculateOrderSubtotal,
  calculateDeliveryFee
};
