import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { getGig, getGigFreelancer } from "../../api/gigApi";
import { createOrder } from "../../api/orderApi";
import { useAuth } from "../../hooks/useAuth";
import { stripePromise } from "../../lib/stripe";
import { ROLES, ROUTES } from "../../utils/constants";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import ConfirmDialog from "../ui/ConfirmDialog";
import LoadingState from "../ui/LoadingState";
import CheckoutForm from "../orders/CheckoutForm";

const GigDetailsContent = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [gig, setGig] = useState(null);
  const [freelancerName, setFreelancerName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [clientSecret, setClientSecret] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

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

        if (isMounted) {
          setGig(gigResponse?.data?.data || null);
          setFreelancerName(freelancerResponse?.data?.data?.fullName || null);
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
  const canOrder = !isAuthenticated || user?.role === ROLES.CLIENT;

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

  if (loading) {
    return <LoadingState label="Loading gig..." />;
  }

  if (error || !gig) {
    return <p className="mt-8 text-danger-text">{error || "Gig not found."}</p>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      <div>
        <div className="overflow-hidden rounded-xl border border-border bg-bg-soft">
          <img src={gig.image} alt={gig.title} className="aspect-video w-full object-cover" />
        </div>

        <Badge className="mt-4 bg-cta text-cta-text">{gig.category}</Badge>
        <h1 className="mt-3 text-3xl font-extrabold text-text-primary sm:text-4xl">{gig.title}</h1>
        {freelancerName ? <p className="mt-1 text-text-muted">by {freelancerName}</p> : null}

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
    </div>
  );
};

export default GigDetailsContent;
