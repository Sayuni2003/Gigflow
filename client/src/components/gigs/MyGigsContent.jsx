import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Plus } from "lucide-react";
import { getMyGigs } from "../../api/gigApi";
import { ROUTES } from "../../utils/constants";
import { Button } from "../ui/button";
import LoadingState from "../ui/LoadingState";
import MyGigCard from "./MyGigCard";

const MyGigsContent = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchMyGigs = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getMyGigs();

        if (isMounted) {
          setGigs(response?.data?.data || []);
        }
      } catch {
        if (isMounted) {
          setError("Couldn't load your gigs.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMyGigs();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDeleted = (id) => {
    setGigs((prev) => prev.filter((gig) => gig._id !== id));
  };

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary sm:text-4xl">My gigs</h1>
          <p className="mt-1 text-text-secondary">Gigs you&apos;ve posted for clients to order.</p>
        </div>

        <Button asChild>
          <Link to={ROUTES.freelancerGigNew}>
            <Plus className="size-4" />
            Add gig
          </Link>
        </Button>
      </div>

      {loading ? <LoadingState label="Loading your gigs..." /> : null}
      {error ? <p className="mt-6 text-danger-text">{error}</p> : null}

      {!loading && !error && gigs.length === 0 ? (
        <div className="mt-8 rounded-xl border border-border bg-bg-card p-8 text-center">
          <ClipboardList className="mx-auto size-8 text-text-muted" />
          <p className="mt-3 text-text-secondary">You haven&apos;t posted any gigs yet.</p>
          <Button asChild className="mt-4">
            <Link to={ROUTES.freelancerGigNew}>
              <Plus className="size-4" />
              Add your first gig
            </Link>
          </Button>
        </div>
      ) : null}

      {!loading && !error && gigs.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gigs.map((gig) => (
            <MyGigCard key={gig._id} gig={gig} onDeleted={handleDeleted} />
          ))}
        </div>
      ) : null}
    </>
  );
};

export default MyGigsContent;
