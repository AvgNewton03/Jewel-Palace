import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  imageUrl: {
    type: String,
    required: true,
  },
  media: [{
    url: String,
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      default: 'image'
    }
  }],
  category: {
    type: [String],
    default: [],
  },
  occasion: {
    type: [String],
    default: [],
  },
  color: {
    type: [String],
    default: [],
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true }); // Automatically handles createdAt and updatedAt

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
