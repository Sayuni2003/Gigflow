import User from "../models/User.js";

export const findByEmail = (email) => {
  return User.findOne({ email, isDeleted: false });
};

export const findByEmailWithPassword = (email) => {
  return User.findOne({ email, isDeleted: false }).select("+password");
};

export const create = (userData) => {
  return User.create(userData);
};

export const findById = (userId) => {
  return User.findOne({ _id: userId, isDeleted: false });
};

export const findAuthUserById = (userId) => {
  return User.findOne({ _id: userId, isDeleted: false, isActive: true });
};

export const findAll = () => {
  return User.find({ isDeleted: false }).sort({ createdAt: -1 });
};

export const updateById = (userId, updateData) => {
  return User.findOneAndUpdate(
    { _id: userId, isDeleted: false },
    { $set: updateData },
    { new: true, runValidators: true },
  );
};

export const findByIdWithPassword = (userId) => {
  return User.findOne({ _id: userId, isDeleted: false }).select("+password");
};

export const save = (userDoc) => {
  return userDoc.save();
};

export const softDeleteById = (userId) => {
  return User.findOneAndUpdate(
    { _id: userId, isDeleted: false },
    { $set: { isDeleted: true, isActive: false } },
    { new: true },
  );
};
