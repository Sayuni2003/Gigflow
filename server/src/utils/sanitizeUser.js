export const sanitizeUser = (userDoc) => {
  if (!userDoc) {
    return null;
  }

  return {
    userId: userDoc._id.toString(),
    fullName: userDoc.fullName,
    email: userDoc.email,
    role: userDoc.role,
    dateOfBirth: userDoc.dateOfBirth,
    isActive: userDoc.isActive,
    isDeleted: userDoc.isDeleted,
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt,
  };
};
