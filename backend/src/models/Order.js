const mongoose = require('mongoose');
const { ORDER_STATUS, ALL_ORDER_STATUSES } = require('../utils/orderStatus');

/**
 * Embedded Order Item Schema
 * Stores immutable snapshot of item details at time of order creation
 */
const OrderItemSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: [true, 'Menu item ID is required']
    },
    itemNameSnapshot: {
      type: String,
      required: [true, 'Item name snapshot is required'],
      trim: true
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price snapshot is required'],
      min: [0, 'Unit price cannot be negative']
    }, // in integer paise
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    subtotal: {
      type: Number,
      required: [true, 'Item subtotal is required'],
      min: [0, 'Item subtotal cannot be negative']
    } // in integer paise (unitPrice * quantity)
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      required: [true, 'Customer ID is required'],
      index: true,
      trim: true
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Restaurant ID is required'],
      index: true
    },
    driverId: {
      type: String,
      default: null,
      index: true,
      trim: true
    },
    items: {
      type: [OrderItemSchema],
      required: [true, 'Order items are required'],
      validate: [
        {
          validator: (items) => Array.isArray(items) && items.length > 0,
          message: 'Order must contain at least one item'
        }
      ]
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative']
    }, // in integer paise
    deliveryFee: {
      type: Number,
      required: [true, 'Delivery fee is required'],
      min: [0, 'Delivery fee cannot be negative']
    }, // in integer paise
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    }, // in integer paise (subtotal + deliveryFee)
    cancellationReason: {
      type: String,
      default: null,
      trim: true
    },
    deliveryAddress: {
      type: String,
      required: [true, 'Delivery address is required'],
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: ALL_ORDER_STATUSES,
        message: '{VALUE} is not a valid order status'
      },
      default: ORDER_STATUS.PLACED,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Indexes for query performance
OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ restaurantId: 1, status: 1, createdAt: -1 });
OrderSchema.index({ driverId: 1, status: 1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
