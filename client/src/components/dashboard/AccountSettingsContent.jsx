import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onboardFreelancer } from "../../api/paymentApi";
import { changePassword, deleteUser, getUser, updateUser } from "../../api/userApi";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import LoadingState from "../ui/LoadingState";
import { Textarea } from "../ui/textarea";
import ThemeToggle from "../ui/ThemeToggle";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { ROLES, ROUTES } from "../../utils/constants";
import DashboardLayout from "./DashboardLayout";

const FULL_NAME_PATTERN = "^[A-Za-z]+([ '-][A-Za-z]+)*$";
const MIN_PASSWORD_LENGTH = 8;
const MAX_BIO_LENGTH = 500;
const today = new Date().toISOString().split("T")[0];

const getInitials = (fullName) => {
  if (!fullName) {
    return "?";
  }

  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

const getErrorMessage = (error, fallback) => error?.response?.data?.message || fallback;

const toDateInputValue = (value) => (value ? new Date(value).toISOString().split("T")[0] : "");

const AccountSettingsContent = ({ navItems }) => {
  const { user, logout, patchUser } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const isFreelancer = user.role === ROLES.FREELANCER;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [profileForm, setProfileForm] = useState({ fullName: "", dateOfBirth: "", bio: "", experience: [] });
  const [savedExperience, setSavedExperience] = useState([]);
  const [pictureUrl, setPictureUrl] = useState(null);
  const [pictureFile, setPictureFile] = useState(null);
  const [picturePreview, setPicturePreview] = useState("");
  const [removePicture, setRemovePicture] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutError, setPayoutError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const response = await getUser(user.id);
        const profile = response?.data?.data;

        if (isMounted && profile) {
          const experience = Array.isArray(profile.experience) ? profile.experience : [];
          setProfileForm({
            fullName: profile.fullName || "",
            dateOfBirth: toDateInputValue(profile.dateOfBirth),
            bio: profile.bio || "",
            experience,
          });
          setSavedExperience(experience);
          setPictureUrl(profile.profilePictureUrl || null);
        }
      } catch {
        if (isMounted) {
          setLoadError("Couldn't load your profile.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [user.id]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleExperienceChange = (index, value) => {
    setProfileForm((prev) => ({
      ...prev,
      experience: prev.experience.map((entry, i) => (i === index ? value : entry)),
    }));
  };

  const handleAddExperience = () => {
    setProfileForm((prev) => ({ ...prev, experience: [...prev.experience, ""] }));
  };

  const handleRemoveExperience = (index) => {
    setProfileForm((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const handlePictureChange = (event) => {
    const file = event.target.files?.[0] || null;
    setPictureFile(file);
    setPicturePreview(file ? URL.createObjectURL(file) : "");
    setRemovePicture(false);
  };

  const handleRemovePicture = () => {
    setPictureFile(null);
    setPicturePreview("");
    setRemovePicture(true);
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileSaving(true);

    const formData = new FormData();
    formData.append("fullName", profileForm.fullName);
    formData.append("dateOfBirth", profileForm.dateOfBirth);

    if (isFreelancer) {
      formData.append("bio", profileForm.bio);

      const trimmedExperience = profileForm.experience.map((entry) => entry.trim()).filter(Boolean);
      if (trimmedExperience.length > 0) {
        trimmedExperience.forEach((entry) => formData.append("experience[]", entry));
      } else if (savedExperience.length > 0) {
        formData.append("experience[]", "");
      }

      if (pictureFile) {
        formData.append("profilePicture", pictureFile);
      } else if (removePicture) {
        formData.append("removeProfilePicture", "true");
      }
    }

    try {
      const response = await updateUser(user.id, formData);
      const updated = response?.data?.data;
      setProfileSuccess("Profile updated.");
      setSavedExperience(profileForm.experience.map((entry) => entry.trim()).filter(Boolean));
      if (updated) {
        setPictureUrl(updated.profilePictureUrl ?? null);
        patchUser({
          fullName: updated.fullName,
          bio: updated.bio,
          experience: Array.isArray(updated.experience) ? updated.experience : [],
          profilePictureUrl: updated.profilePictureUrl ?? null,
        });
      }
      setPictureFile(null);
      setPicturePreview("");
      setRemovePicture(false);
    } catch (error) {
      setProfileError(getErrorMessage(error, "Couldn't update your profile."));
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation don't match.");
      return;
    }

    setPasswordSaving(true);

    try {
      await changePassword(user.id, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess("Password changed.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setPasswordError(getErrorMessage(error, "Couldn't change your password."));
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSetupPayouts = async () => {
    setPayoutError("");
    setPayoutLoading(true);

    // Open the tab synchronously (before the await) so browsers don't treat
    // it as an unrequested popup and block it.
    const onboardingTab = window.open("", "_blank");

    try {
      const response = await onboardFreelancer();
      const url = response?.data?.data?.url;

      if (!url) {
        onboardingTab?.close();
        setPayoutError("Couldn't start payout setup.");
        return;
      }

      if (onboardingTab) {
        onboardingTab.location.href = url;
      }
    } catch (error) {
      onboardingTab?.close();
      setPayoutError(getErrorMessage(error, "Couldn't start payout setup."));
    } finally {
      setPayoutLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Delete your account? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setDeleteError("");
    setDeleting(true);

    try {
      await deleteUser(user.id);
      await logout();
      navigate(ROUTES.login, { replace: true });
    } catch (error) {
      setDeleteError(getErrorMessage(error, "Couldn't delete your account."));
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems}>
      <h1 className="text-3xl font-extrabold text-text-primary sm:text-4xl">Account settings</h1>
      <p className="mt-1 text-text-secondary">Manage your profile, password, and account.</p>

      {loading ? <LoadingState label="Loading your profile..." /> : null}
      {loadError ? <p className="mt-6 text-danger-text">{loadError}</p> : null}

      {!loading && !loadError ? (
        <div className="mt-8 grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Appearance</CardTitle>
              <CardDescription>Choose how GigFlow looks on this device.</CardDescription>
            </CardHeader>

            <CardFooter className="items-center justify-between">
              <p className="text-sm font-medium text-text-primary">
                {isDark ? "Dark mode" : "Light mode"}
              </p>
              <ThemeToggle />
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile</CardTitle>
              <CardDescription>
                {isFreelancer
                  ? "Update your name, photo, bio, and experience."
                  : "Update your name and date of birth."}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form id="profile-form" className="grid gap-4" onSubmit={handleProfileSubmit}>
                {isFreelancer ? (
                  <div className="grid gap-2">
                    <Label htmlFor="profilePicture">Profile picture</Label>
                    <div className="flex items-center gap-4">
                      {picturePreview || (pictureUrl && !removePicture) ? (
                        <img
                          src={picturePreview || pictureUrl}
                          alt="Profile"
                          className="size-16 shrink-0 rounded-full border border-border object-cover"
                        />
                      ) : (
                        <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary-soft text-lg font-semibold text-primary">
                          {getInitials(profileForm.fullName)}
                        </span>
                      )}

                      <div className="grid gap-2">
                        <Input
                          id="profilePicture"
                          name="profilePicture"
                          type="file"
                          accept="image/*"
                          onChange={handlePictureChange}
                          className="max-w-xs"
                        />
                        {pictureUrl && !removePicture ? (
                          <button
                            type="button"
                            onClick={handleRemovePicture}
                            className="w-fit text-sm text-danger-text hover:underline"
                          >
                            Remove photo
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={profileForm.fullName}
                    onChange={handleProfileChange}
                    pattern={FULL_NAME_PATTERN}
                    title="Letters, spaces, apostrophes, and hyphens only."
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="dateOfBirth">Date of birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={profileForm.dateOfBirth}
                    onChange={handleProfileChange}
                    max={today}
                    required
                  />
                </div>

                {isFreelancer ? (
                  <div className="grid gap-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={profileForm.bio}
                      onChange={handleProfileChange}
                      maxLength={MAX_BIO_LENGTH}
                      placeholder="Tell clients about yourself..."
                    />
                    <p className="text-xs text-text-muted">
                      {profileForm.bio.length}/{MAX_BIO_LENGTH}
                    </p>
                  </div>
                ) : null}

                {isFreelancer ? (
                  <div className="grid gap-2">
                    <Label>Experience</Label>
                    <div className="grid gap-2">
                      {profileForm.experience.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            type="text"
                            value={entry}
                            onChange={(event) => handleExperienceChange(index, event.target.value)}
                            placeholder="e.g. 3 years building React apps"
                            maxLength={200}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleRemoveExperience(index)}
                            aria-label="Remove experience entry"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-fit"
                      onClick={handleAddExperience}
                      disabled={profileForm.experience.length >= 20}
                    >
                      <Plus className="size-4" />
                      Add experience
                    </Button>
                  </div>
                ) : null}

                {profileError ? <p className="text-sm text-danger-text">{profileError}</p> : null}
                {profileSuccess ? <p className="text-sm text-success-text">{profileSuccess}</p> : null}
              </form>
            </CardContent>

            <CardFooter>
              <Button type="submit" form="profile-form" disabled={profileSaving}>
                {profileSaving ? "Saving..." : "Save changes"}
              </Button>
            </CardFooter>
          </Card>

          {user.role === ROLES.FREELANCER ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  Payouts
                  {user.payoutsEnabled ? (
                    <Badge className="bg-success-soft text-success-text">Enabled</Badge>
                  ) : (
                    <Badge className="bg-warning-soft text-warning-text">Not set up</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Connect a Stripe payout account so you can receive money from completed orders.
                </CardDescription>
              </CardHeader>

              <CardFooter className="flex-col items-start gap-3">
                {payoutError ? <p className="text-sm text-danger-text">{payoutError}</p> : null}
                <Button type="button" onClick={handleSetupPayouts} disabled={payoutLoading}>
                  {payoutLoading
                    ? "Opening..."
                    : user.payoutsEnabled
                      ? "Update payout details"
                      : "Set up payouts"}
                </Button>
              </CardFooter>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Change password</CardTitle>
              <CardDescription>Choose a new password for your account.</CardDescription>
            </CardHeader>

            <CardContent>
              <form id="password-form" className="grid gap-4" onSubmit={handlePasswordSubmit}>
                <div className="grid gap-2">
                  <Label htmlFor="currentPassword">Current password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    minLength={MIN_PASSWORD_LENGTH}
                    title={`At least ${MIN_PASSWORD_LENGTH} characters.`}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    minLength={MIN_PASSWORD_LENGTH}
                    required
                  />
                </div>

                {passwordError ? <p className="text-sm text-danger-text">{passwordError}</p> : null}
                {passwordSuccess ? <p className="text-sm text-success-text">{passwordSuccess}</p> : null}
              </form>
            </CardContent>

            <CardFooter>
              <Button type="submit" form="password-form" disabled={passwordSaving}>
                {passwordSaving ? "Updating..." : "Update password"}
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-danger-text/30">
            <CardHeader>
              <CardTitle className="text-lg">Danger zone</CardTitle>
              <CardDescription>Permanently delete your account. This cannot be undone.</CardDescription>
            </CardHeader>

            <CardFooter className="flex-col items-start gap-3">
              {deleteError ? <p className="text-sm text-danger-text">{deleteError}</p> : null}
              <Button type="button" variant="destructive" onClick={handleDeleteAccount} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete account"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : null}
    </DashboardLayout>
  );
};

export default AccountSettingsContent;
