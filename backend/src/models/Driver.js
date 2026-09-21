const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema(
  {
    driverId: {
      type: String,
      required: [true, 'Driver ID is required'],
      unique: true,
      trim: true,
      index: true
    },

    name: {
      type: String,
      required: [true, 'Driver name is required'],
      trim: true
    },

    available: {
      type: Boolean,
      default: true,
      index: true
    },

    activeOrders: {
      type: Number,
      default: 0,
      min: [0, 'Active orders cannot be negative']
    },

    rating: {
      type: Number,
      default: 5,
      min: [0, 'Rating cannot be below 0'],
      max: [5, 'Rating cannot exceed 5']
    },

    vehicleType: {
      type: String,
      enum: ['BIKE', 'SCOOTER', 'CAR'],
      required: [true, 'Vehicle type is required']
    },

    location: {
      latitude: {
        type: Number,
        required: [true, 'Driver latitude is required']
      },

      longitude: {
        type: Number,
        required: [true, 'Driver longitude is required']
      }
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

// Useful for finding available drivers with lower workloads
DriverSchema.index({
  available: 1,
  activeOrders: 1
});

const Driver = mongoose.model('Driver', DriverSchema);

module.exports = Driver;