import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

  const userSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true }, // Not requiring unique here immediately as people might have the same email if using different providers, but we use firebaseUid as the primary key. Let's keep unique: true if we want one account per email.
      firebaseUid: { type: String, required: true, unique: true },
      role: { type: String, default: "customer" },
      wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
      addresses: [addressSchema],
    },
  {
    timestamps: true,
  },
);



const User = mongoose.model("User", userSchema);
export default User;
