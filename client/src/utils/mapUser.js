export const mapUser = (rawUser) => {
  if (!rawUser) {
    return null;
  }

  return {
    id: rawUser.userId || rawUser.id || "",
    role: rawUser.role || "",
    email: rawUser.email || "",
    fullName: rawUser.fullName || "",
  };
};
