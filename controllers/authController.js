const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const jwt = require('jsonwebtoken');

const sendAuthResponse = async (user, statusCode, res) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res
    .status(statusCode)
    .cookie('accessToken', accessToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + 15 * 60 * 1000)
    })
    .cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })
    .json({
      success: true,
      accessToken,
      refreshToken,
      data: { user }
    });
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  const user = await User.create({ name, email, password });
	await sendAuthResponse(user, 201, res);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account deactivated. Contact support.', 401);
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }
	await sendAuthResponse(user, 201, res);
});

const logout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+refreshToken');

  if (user) {
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });
  }

  res
    .cookie('accessToken', 'none', {
      expires: new Date(Date.now() + 5000),
      httpOnly: true
    })
    .cookie('refreshToken', 'none', {
      expires: new Date(Date.now() + 5000),
      httpOnly: true
    })
    .json({
      success: true,
      message: 'Logged out successfully'
    });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({ success: true, data: user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = {};

  const fields = ['name', 'phone', 'address'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      allowedFields[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.user.id, allowedFields, {
    new: true,
    runValidators: true
  });

  res.json({ success: true, data: user });
});

const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Please provide current and new password', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters', 400);
  }

  const user = await User.findById(req.user.id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;

  if (!token) {
    throw new AppError('Refresh token not provided', 401);
  }

  const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user || user.refreshToken !== token) {
    throw new AppError('Invalid refresh token', 401);
  }

  const newAccessToken = user.generateAccessToken();

  res.cookie('accessToken', newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(Date.now() + 15 * 60 * 1000)
  });

  res.json({
    success: true,
    accessToken: newAccessToken
  });
});

module.exports = {
  register,
  refreshAccessToken,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword
};
