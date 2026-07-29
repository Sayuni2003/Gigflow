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
    bio: userDoc.bio,
    experience: userDoc.experience,
    profilePictureUrl: userDoc.profilePictureUrl,
    isActive: userDoc.isActive,
    isDeleted: userDoc.isDeleted,
    payoutsEnabled: userDoc.payoutsEnabled,
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt,
  };
};
