import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { Pencil, Star, Trash2 } from "lucide-react";
import { deleteGig, getGig, getGigFreelancer } from "../../api/gigApi";
import { createOrder } from "../../api/orderApi";
import { getFreelancerRatings } from "../../api/ratingApi";
import { useAuth } from "../../hooks/useAuth";
import { stripePromise } from "../../lib/stripe";
import { ROLES, ROUTES } from "../../utils/constants";
import { formatDate } from "../../utils/formatDate";
import { getInitials } from "../../utils/getInitials";
import { Badge } from "../ui/badge";
import BackButton from "../ui/BackButton";
import { Button } from "../ui/button";
import ConfirmDialog from "../ui/ConfirmDialog";
import LoadingState from "../ui/LoadingState";
import StarRating from "../ui/StarRating";
import CheckoutForm from "../orders/CheckoutForm";

const GigDetailsContent = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [gig, setGig] = useState(null);
  const [freelancerId, setFreelancerId] = useState(null);
  const [freelancerName, setFreelancerName] = useState(null);
  const [ratings, setRatings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [clientSecret, setClientSecret] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchGig = async () => {
      setLoading(true);
      setError("");

      try {
        const [gigResponse, freelancerResponse] = await Promise.all([
          getGig(id),
          getGigFreelancer(id).catch(() => null),
        ]);

        const gigFreelancerId = freelancerResponse?.data?.data?.freelancerId;
        const ratingsResponse = gigFreelancerId
          ? await getFreelancerRatings(gigFreelancerId).catch(() => null)
          : null;

        if (isMounted) {
          setGig(gigResponse?.data?.data || null);
          setFreelancerId(gigFreelancerId || null);
          setFreelancerName(freelancerResponse?.data?.data?.fullName || null);
          setRatings(ratingsResponse?.data?.data || null);
        }
      } catch {
        if (isMounted) {
          setError("Couldn't load this gig.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchGig();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const detailsRoute = isAuthenticated ? ROUTES.dashboardGigDetails(id) : ROUTES.gigDetails(id);
  const freelancerProfileRoute = freelancerId
    ? isAuthenticated
      ? ROUTES.dashboardFreelancerProfile(freelancerId)
      : ROUTES.freelancerProfile(freelancerId)
    : null;
  const canOrder = !isAuthenticated || user?.role === ROLES.CLIENT;
  const isOwner = user?.role === ROLES.FREELANCER && gig?.freelancerId === user?.id;

  const handleOrderClick = () => {
    setOrderError("");

    if (!isAuthenticated) {
      navigate(ROUTES.login, { state: { from: detailsRoute } });
      return;
    }

    setConfirmOpen(true);
  };

  const handleConfirmOrder = async () => {
    setOrdering(true);

    try {
      const response = await createOrder(gig._id);
      const secret = response?.data?.data?.payment?.clientSecret;

      if (!secret) {
        navigate(ROUTES.clientOrders);
        return;
      }

      setClientSecret(secret);
    } catch (err) {
      setOrderError(err?.response?.data?.message || "Couldn't place the order.");
    } finally {
      setOrdering(false);
      setConfirmOpen(false);
    }
  };

  const handlePaymentSuccess = () => {
    navigate(ROUTES.clientOrders);
  };

  const handleConfirmDelete = async () => {
    setDeleteError("");
    setDeleting(true);

    try {
      await deleteGig(gig._id);
      navigate(ROUTES.freelancerMyGigs);
    } catch (err) {
      setDeleteError(err?.response?.data?.message || "Couldn't delete this gig.");
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading gig..." />;
  }

  if (error || !gig) {
    return <p className="mt-8 text-danger-text">{error || "Gig not found."}</p>;
  }

  return (
    <>
      <BackButton className="-ml-3" />

      <div className="mt-4 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="overflow-hidden rounded-xl border border-border bg-bg-soft">
            <img src={gig.image} alt={gig.title} className="aspect-video w-full object-cover" />
          </div>

          <Badge className="mt-4 bg-cta text-cta-text">{gig.category}</Badge>
          <h1 className="mt-3 text-3xl font-extrabold text-text-primary sm:text-4xl">{gig.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-text-muted">
            {freelancerName ? (
              freelancerProfileRoute ? (
                <Link
                  to={freelancerProfileRoute}
                  className="flex items-center gap-1.5 hover:text-text-primary"
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary-soft text-[10px] font-semibold text-primary">
                    {getInitials(freelancerName)}
                  </span>
                  by {freelancerName}
                </Link>
              ) : (
                <p>by {freelancerName}</p>
              )
            ) : null}
            {ratings?.count > 0 ? (
              <p className="flex items-center gap-1 text-sm">
                <Star className="size-4 fill-current text-warning-text" />
                <span className="font-medium text-text-primary">{ratings.average}</span>
                <span>
                  ({ratings.count} {ratings.count === 1 ? "review" : "reviews"})
                </span>
              </p>
            ) : null}
          </div>

          <p className="mt-4 whitespace-pre-line text-text-secondary">{gig.description}</p>

          {gig.tags?.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {gig.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}

          {ratings?.ratings?.length > 0 ? (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-text-primary">Reviews</h2>
              <div className="mt-4 space-y-4">
                {ratings.ratings.map((entry) => (
                  <div key={entry._id} className="rounded-xl border border-border bg-bg-card p-4">
                    <div className="flex items-center justify-between gap-2">
                      <StarRating value={entry.rating} readOnly size="sm" />
                      <span className="text-xs text-text-muted">{formatDate(entry.createdAt)}</span>
                    </div>
                    {entry.client?.fullName ? (
                      <p className="mt-1 text-sm font-medium text-text-primary">
                        {entry.client.fullName}
                      </p>
                    ) : null}
                    {entry.comment ? (
                      <p className="mt-1 whitespace-pre-line text-sm text-text-secondary">
                        {entry.comment}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="h-fit rounded-xl border border-border bg-bg-card p-6">
          <p className="text-xs uppercase tracking-wide text-text-muted">Price</p>
          <p className="text-3xl font-bold text-primary">${gig.price}</p>

          <p className="mt-4 text-xs uppercase tracking-wide text-text-muted">Delivery time</p>
          <p className="text-lg font-semibold text-text-primary">
            {gig.deliveryTime} {gig.deliveryTime === 1 ? "day" : "days"}
          </p>

          {canOrder && clientSecret ? (
            <div className="mt-6">
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm clientSecret={clientSecret} onSuccess={handlePaymentSuccess} />
              </Elements>
            </div>
          ) : null}

          {canOrder && !clientSecret ? (
            <>
              <Button className="mt-6 w-full" onClick={handleOrderClick} disabled={ordering}>
                {ordering ? "Placing order..." : "Order now"}
              </Button>
              {orderError ? <p className="mt-2 text-sm text-danger-text">{orderError}</p> : null}
            </>
          ) : null}

          {isOwner ? (
            <div className="mt-6 flex items-center gap-2">
              <Button asChild className="flex-1 bg-green-600 text-white hover:bg-green-700">
                <Link to={ROUTES.freelancerGigEdit(gig._id)}>
                  <Pencil className="size-4" />
                  Edit
                </Link>
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
            </div>
          ) : null}
          {deleteError ? <p className="mt-2 text-sm text-danger-text">{deleteError}</p> : null}
        </div>

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Order this gig?"
          description={`You're about to order "${gig.title}" for $${gig.price}. You'll be asked to pay right after.`}
          confirmLabel="Order now"
          cancelLabel="Not yet"
          loading={ordering}
          onConfirm={handleConfirmOrder}
        />

        <ConfirmDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          title="Delete this gig?"
          description={`"${gig.title}" will be permanently removed. This cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          destructive
          loading={deleting}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </>
  );
};

export default GigDetailsContent;
