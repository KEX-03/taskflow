const User = require("../models/User");
const { validatePassword } = require("../utils/password");

// ── GET /api/v1/me ───────────────────────────
const getProfile = async (req, res) => {
  // req.user is already populated by the protect middleware
  res.json({ success: true, user: req.user });
};

// ── PUT /api/v1/me ───────────────────────────
const updateProfile = async (req, res) => {
  const { name, bio, avatar, currentPassword, newPassword } = req.body;
  const user = req.user;

  // ── Update simple fields ─────────────────
  if (name !== undefined) {
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters.",
      });
    }
    user.name = name.trim();
  }

  if (bio !== undefined) user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;

  // ── Password change flow ─────────────────
  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password is required to change password.",
      });
    }
    const match = await user.comparePassword(currentPassword);
    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }
    const passwordErrors = validatePassword(newPassword);

    if (passwordErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: passwordErrors[0],
        errors: passwordErrors,
      });
    }
    // Re-fetch full doc so pre-save hook fires properly
    const fullUser = await User.findById(user._id);
    fullUser.password = newPassword; // hook will hash
    fullUser.name = user.name;
    fullUser.bio = user.bio;
    fullUser.avatar = user.avatar;
    await fullUser.save();
    return res.json({ success: true, message: "Profile updated.", user: fullUser });
  }

  // ── Save non-password changes ───────────
  // We need to fetch again so the pre-save hook doesn't re-hash existing password
  const fullUser = await User.findById(user._id);
  fullUser.name = user.name;
  fullUser.bio = user.bio;
  fullUser.avatar = user.avatar;
  await fullUser.save({ validateModifiedOnly: true });

  res.json({ success: true, message: "Profile updated.", user: fullUser });
};

module.exports = { getProfile, updateProfile };
