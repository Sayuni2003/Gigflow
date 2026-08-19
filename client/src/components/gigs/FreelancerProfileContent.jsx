import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ClipboardList, Star } from "lucide-react";
import { getGigs } from "../../api/gigApi";
import { getFreelancerRatings } from "../../api/ratingApi";
import { getPublicProfile } from "../../api/userApi";
import { formatDate } from "../../utils/formatDate";
import { getInitials } from "../../utils/getInitials";
import LoadingState from "../ui/LoadingState";
import StarRating from "../ui/StarRating";
import GigCard from "./GigCard";

const GIGS_FETCH_LIMIT = 100;

const FreelancerProfileContent = () => {
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [gigs, setGigs] = useState([]);
  const [ratings, setRatings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const [profileResponse, gigsResponse, ratingsResponse] = await Promise.all([
          getPublicProfile(id),
          getGigs({ freelancerId: id, limit: GIGS_FETCH_LIMIT }),
          getFreelancerRatings(id).catch(() => null),
        ]);

        if (isMounted) {
          setProfile(profileResponse?.data?.data || null);
          setGigs(gigsResponse?.data?.data?.gigs || []);
          setRatings(ratingsResponse?.data?.data || null);
        }
      } catch {
        if (isMounted) {
          setError("Couldn't load this profile.");
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
  }, [id]);

  if (loading) {
    return <LoadingState label="Loading profile..." />;
  }

  if (error || !profile) {
    return <p className="mt-8 text-danger-text">{error || "Freelancer not found."}</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        {profile.profilePictureUrl ? (
          <img
            src={profile.profilePictureUrl}
            alt={profile.fullName}
            className="size-20 shrink-0 rounded-full border border-border object-cover"
          />
        ) : (
          <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-primary-soft text-2xl font-semibold text-primary">
            {getInitials(profile.fullName)}
          </span>
        )}

        <div>
          <h1 className="text-3xl font-extrabold text-text-primary sm:text-4xl">{profile.fullName}</h1>
          <p className="text-text-muted">Freelancer</p>

          {ratings?.count > 0 ? (
            <p className="mt-1 flex items-center gap-1 text-sm">
              <Star className="size-4 fill-current text-warning-text" />
              <span className="font-medium text-text-primary">{ratings.average}</span>
              <span className="text-text-muted">
                ({ratings.count} {ratings.count === 1 ? "review" : "reviews"})
              </span>
            </p>
          ) : null}
        </div>
      </div>

      {profile.bio ? (
        <p className="mt-6 max-w-3xl whitespace-pre-line text-text-secondary">{profile.bio}</p>
      ) : null}

      {profile.experience?.length > 0 ? (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-text-primary">Experience</h2>
          <ul className="mt-3 grid gap-2">
            {profile.experience.map((entry, index) => (
              <li
                key={index}
                className="rounded-lg border border-border bg-bg-card px-4 py-2.5 text-sm text-text-secondary"
              >
                {entry}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-10">
        <h2 className="text-xl font-semibold text-text-primary">Gigs</h2>

        {gigs.length === 0 ? (
          <div className="mt-4 rounded-xl border border-border bg-bg-card p-8 text-center">
            <ClipboardList className="mx-auto size-8 text-text-muted" />
            <p className="mt-3 text-text-secondary">This freelancer hasn&apos;t posted any gigs yet.</p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gigs.map((gig) => (
              <GigCard key={gig._id} gig={gig} />
            ))}
          </div>
        )}
      </div>

      {ratings?.ratings?.length > 0 ? (
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-text-primary">Reviews</h2>
          <div className="mt-4 space-y-4">
            {ratings.ratings.map((entry) => (
              <div key={entry._id} className="rounded-xl border border-border bg-bg-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <StarRating value={entry.rating} readOnly size="sm" />
                  <span className="text-xs text-text-muted">{formatDate(entry.createdAt)}</span>
                </div>
                {entry.client?.fullName ? (
                  <p className="mt-1 text-sm font-medium text-text-primary">{entry.client.fullName}</p>
                ) : null}
                {entry.comment ? (
                  <p className="mt-1 whitespace-pre-line text-sm text-text-secondary">{entry.comment}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default FreelancerProfileContent;
