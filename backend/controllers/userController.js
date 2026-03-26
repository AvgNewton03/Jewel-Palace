import User from "../models/User.js";

export const syncUser = async (req, res) => {
  try {
    const { firebaseUser } = req;
    if (!firebaseUser) {
      return res.status(401).json({ message: "Not authenticated with Firebase" });
    }

    // Try to find the user.
    let user = await User.findOne({ firebaseUid: firebaseUser.uid });

    if (!user) {
      // Create user if not found
      // We will take name and email from Firebase. phone_number can also be mapped if it exists
      const { name, email, phone_number } = req.body;
      user = await User.create({
        firebaseUid: firebaseUser.uid,
        name: name || firebaseUser.name || (firebaseUser.phone_number ? "User" : "New User"),
        email: email || firebaseUser.email || `${firebaseUser.uid}@placeholder.com`, // Email might be omitted if phone auth
      });
    }

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
