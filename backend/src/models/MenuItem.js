const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Restaurant ID is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      index: true,
      maxlength: [100, 'Item name cannot exceed 100 characters']
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a non-negative number']
    }, // Stored in integer paise (e.g. 25000 paise = ₹250.00)
    imageUrl: {
      type: String,
      default: '',
      trim: true
    },
    available: {
      type: Boolean,
      default: true,
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

// Indexes for common queries
MenuItemSchema.index({ restaurantId: 1, available: 1 });
MenuItemSchema.index({ restaurantId: 1, category: 1 });
MenuItemSchema.index({ restaurantId: 1, price: 1 });
MenuItemSchema.index({ name: 'text', description: 'text' });

const MenuItem = mongoose.model('MenuItem', MenuItemSchema);

module.exports = MenuItem;
