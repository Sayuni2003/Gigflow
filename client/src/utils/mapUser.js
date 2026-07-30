export const mapUser = (rawUser) => {
  if (!rawUser) {
    return null;
  }

  return {
    id: rawUser.userId || rawUser.id || "",
    role: rawUser.role || "",
    email: rawUser.email || "",
    fullName: rawUser.fullName || "",
    payoutsEnabled: Boolean(rawUser.payoutsEnabled),
    bio: rawUser.bio || "",
    experience: Array.isArray(rawUser.experience) ? rawUser.experience : [],
    profilePictureUrl: rawUser.profilePictureUrl || null,
  };
};
