import mongoose, { Schema, Model } from "mongoose";

const addressSchema = new Schema(
  {
    fullName: { type: String, default: "" },
    phone: { type: String, default: "" },
    flatHouse: { type: String, default: "" },
    areaStreet: { type: String, default: "" },
    landmark: { type: String, default: "" },
    street: { type: String, default: "" },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, default: "" },
    zip: { type: String, default: "" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    firebaseUid: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    addresses: [addressSchema],
  },
  {
    timestamps: true,
  }
);

const User: Model<any> =
  mongoose.models.User || mongoose.model("User", userSchema);

export default User;
