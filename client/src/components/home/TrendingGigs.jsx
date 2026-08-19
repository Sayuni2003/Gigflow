import { useEffect, useState } from "react";
import { getGigs } from "../../api/gigApi";
import GigCard from "../gigs/GigCard";
import LoadingState from "../ui/LoadingState";

const TrendingGigs = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchGigs = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getGigs({ limit: 4, sort: "newest" });
        if (!cancelled) {
          setGigs(response?.data?.data?.gigs || []);
        }
      } catch {
        if (!cancelled) {
          setError("Couldn't load gigs.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchGigs();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && !error && gigs.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">Featured</p>
      <h2 className="mt-1 text-2xl font-bold text-text-primary sm:text-3xl">Trending gigs this week</h2>

      {loading ? <LoadingState label="Loading gigs..." /> : null}
      {error ? <p className="mt-4 text-danger-text">{error}</p> : null}

      {!loading && !error ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {gigs.map((gig) => (
            <GigCard key={gig._id} gig={gig} />
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default TrendingGigs;
