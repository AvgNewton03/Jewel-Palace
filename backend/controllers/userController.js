import mongoose from "mongoose";
import User from "../models/User.js";

export const syncUser = async (req, res) => {
  try {
    const { firebaseUser } = req;
    if (!firebaseUser) {
      return res.status(401).json({ message: "Not authenticated with Firebase" });
    }

    // Try to find the user by their new Firebase UID.
    let user = await User.findOne({ firebaseUid: firebaseUser.uid });

    if (!user) {
      // If not matched by Firebase UID, check if they exist by email (from older Auth system)
      const inputEmail = req.body.email || firebaseUser.email;
      
      if (inputEmail) {
        user = await User.findOne({ email: inputEmail });
        if (user) {
          // Link this pre-existing user to the new Firebase UID
          user.firebaseUid = firebaseUser.uid;
          await user.save();
        }
      }

      // If user still doesn't exist at this point, create a brand new user
      if (!user) {
        const { name, phone_number } = req.body;
        user = await User.create({
          firebaseUid: firebaseUser.uid,
          name: name || firebaseUser.name || (firebaseUser.phone_number ? "User" : "New User"),
          email: inputEmail || `${firebaseUser.uid}@placeholder.com`, 
        });
      }
    }

    await user.populate("wishlist");

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      wishlist: user.wishlist,
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Sync Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wishlist: user.wishlist,
        addresses: user.addresses,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.id;

    if (user) {
      if (!user.wishlist.includes(productId)) {
        user.wishlist.push(productId);
        await user.save();
      }
      res.json(user.wishlist);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.id;

    if (user) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
      await user.save();
      res.json(user.wishlist);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/user/address/:userId or /api/user/address
// @desc    Get user's saved addresses
// @access  Public / Private
export const getUserAddresses = async (req, res) => {
  try {
    const targetUserId =
      req.params.userId ||
      req.query.userId ||
      req.user?._id ||
      req.user?.firebaseUid ||
      req.firebaseUser?.uid;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required to retrieve addresses",
      });
    }

    let user = null;
    if (mongoose.Types.ObjectId.isValid(targetUserId)) {
      user = await User.findById(targetUserId);
    }
    if (!user) {
      user = await User.findOne({ firebaseUid: targetUserId });
    }

    if (!user) {
      return res.status(200).json({
        success: true,
        addresses: [],
      });
    }

    return res.status(200).json({
      success: true,
      addresses: user.addresses || [],
    });
  } catch (error) {
    console.error("Get Addresses Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve addresses",
    });
  }
};

// @route   POST /api/user/address
// @desc    Save new address to user's addresses array using $push
// @access  Public / Private
export const addAddress = async (req, res) => {
  try {
    const { userId, address } = req.body;
    const targetUserId =
      userId ||
      req.body.user_id ||
      req.user?._id ||
      req.user?.firebaseUid ||
      req.firebaseUser?.uid;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: "userId is required to save an address",
      });
    }

    // Support both nested { address } or direct address fields in req.body
    const addrData = address || req.body;

    let user = null;
    if (mongoose.Types.ObjectId.isValid(targetUserId)) {
      user = await User.findById(targetUserId);
    }
    if (!user) {
      user = await User.findOne({ firebaseUid: targetUserId });
    }

    if (!user) {
      user = await User.create({
        firebaseUid: targetUserId,
        name: addrData.fullName || "Customer",
        email: addrData.email || `${targetUserId}@jewelpalace.local`,
      });
    }

    const {
      fullName,
      phone,
      flatHouse,
      areaStreet,
      landmark,
      city,
      state,
      pincode,
      isDefault,
    } = addrData;

    const street =
      `${flatHouse || ""}, ${areaStreet || ""}`.replace(/^,\s*|,\s*$/g, "") ||
      addrData.street ||
      "";
    const zip = pincode || addrData.zip || "";

    const newAddress = {
      fullName: fullName || user.name || "",
      phone: phone || "",
      flatHouse: flatHouse || "",
      areaStreet: areaStreet || "",
      landmark: landmark || "",
      street,
      city: city || "",
      state: state || "",
      pincode: zip,
      zip,
      isDefault: isDefault ?? user.addresses.length === 0,
    };

    // If default, unset previous default flags
    if (newAddress.isDefault && user.addresses.length > 0) {
      await User.updateOne(
        { _id: user._id },
        { $set: { "addresses.$[].isDefault": false } }
      );
    }

    // Push the address into the User document's addresses array in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $push: { addresses: newAddress } },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Address saved successfully",
      addresses: updatedUser.addresses,
      address: updatedUser.addresses[updatedUser.addresses.length - 1],
    });
  } catch (error) {
    console.error("Save Address Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to save address",
    });
  }
};

// @route   DELETE /api/user/address/:id
// @desc    Delete an address by its subdocument ID
// @access  Public / Private
export const deleteAddress = async (req, res) => {
  try {
    const { userId } = req.body || {};
    const targetUserId =
      userId ||
      req.query.userId ||
      req.user?._id ||
      req.user?.firebaseUid ||
      req.firebaseUser?.uid;

    const addressId = req.params.id;

    let filter = {};
    if (targetUserId) {
      if (mongoose.Types.ObjectId.isValid(targetUserId)) {
        filter = { _id: targetUserId };
      } else {
        filter = { firebaseUid: targetUserId };
      }
    } else {
      filter = { "addresses._id": addressId };
    }

    const updatedUser = await User.findOneAndUpdate(
      filter,
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Address removed successfully",
      addresses: updatedUser ? updatedUser.addresses : [],
    });
  } catch (error) {
    console.error("Delete Address Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete address",
    });
  }
};
