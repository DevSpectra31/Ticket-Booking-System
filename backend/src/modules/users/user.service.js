const User = require('./user.model');

const findByEmail = async (email) => {
  return User.findOne({ email }).select('+password');
};

const findById = async (id) => {
  return User.findById(id);
};

const createUser = async (userData) => {
  return User.create(userData);
};

const getAllUsers = async () => {
  return User.find().select('-password');
};

module.exports = { findByEmail, findById, createUser, getAllUsers };
