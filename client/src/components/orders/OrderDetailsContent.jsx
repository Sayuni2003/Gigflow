import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertTriangle, Pencil, Trash2 } from "lucide-react";
import {
  completeOrder,
  getOrderById,
  getOrderClient,
  getOrderDeliveries,
  getOrderFreelancer,
  getOrderPayment,
} from "../../api/orderApi";
import { deleteRating, getOrderRating } from "../../api/ratingApi";
import { useAuth } from "../../hooks/useAuth";
import { ROLES, ROUTES } from "../../utils/constants";
import { Badge } from "../ui/badge";
import BackButton from "../ui/BackButton";
import { Button } from "../ui/button";
import ConfirmDialog from "../ui/ConfirmDialog";
import LoadingState from "../ui/LoadingState";
import StarRating from "../ui/StarRating";
import { formatDate } from "../../utils/formatDate";
import { getOrderStatusClassName, getOrderStatusLabel } from "../../utils/orderStatus";
import {
  getFreelancerPaymentStatusClassName,
  getFreelancerPaymentStatusLabel,
  getPaymentStatusClassName,
  getPaymentStatusLabel,
} from "../../utils/paymentStatus";
import DeliverOrderDialog from "./DeliverOrderDialog";
import DeliveryTimeline from "./DeliveryTimeline";
import RaiseDisputeDialog from "./RaiseDisputeDialog";
import RateOrderDialog from "./RateOrderDialog";
import RequestRevisionDialog from "./RequestRevisionDialog";

const FREELANCER_DELIVERABLE_STATUSES = ["IN_PROGRESS", "REVISION_REQUESTED"];
const CLIENT_ACTIONABLE_STATUSES = ["DELIVERED"];
const DISPUTE_ELIGIBLE_STATUSES = [
  "PENDING_ACCEPTANCE",
  "IN_PROGRESS",
  "DELIVERED",
  "REVISION_REQUESTED",
];
// Mirrors RATEABLE_STATUSES in server/src/services/ratingService.js - a
// dispute always resolves into one of these two, so both are rateable.
const RATEABLE_STATUSES = ["COMPLETED", "REFUNDED"];

const OrderDetailsContent = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const isFreelancer = user?.role === ROLES.FREELANCER;

  const [order, setOrder] = useState(null);
  const [counterpartyName, setCounterpartyName] = useState(null);
  const [payment, setPayment] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deliverOpen, setDeliverOpen] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const [deleteRatingOpen, setDeleteRatingOpen] = useState(false);
  const [deletingRating, setDeletingRating] = useState(false);
  const [ratingError, setRatingError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchDetails = async () => {
      setLoading(true);
      setError("");

      try {
        const getCounterparty = isFreelancer ? getOrderClient : getOrderFreelancer;

        const [orderResponse, counterpartyResponse, paymentResponse, deliveriesResponse, ratingResponse] =
          await Promise.all([
            getOrderById(id),
            getCounterparty(id).catch(() => null),
            getOrderPayment(id).catch(() => null),
            getOrderDeliveries(id).catch(() => null),
            getOrderRating(id).catch(() => null),
          ]);

        if (isMounted) {
          setOrder(orderResponse?.data?.data || null);
          setCounterpartyName(counterpartyResponse?.data?.data?.fullName || null);
          setPayment(paymentResponse?.data?.data || null);
          setDeliveries(deliveriesResponse?.data?.data || []);
          setRating(ratingResponse?.data?.data || null);
        }
      } catch {
        if (isMounted) {
          setError("Couldn't load this order.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [id, isFreelancer]);

  const backRoute = isFreelancer ? ROUTES.freelancerOrders : ROUTES.clientOrders;
  const getPaymentLabel = isFreelancer ? getFreelancerPaymentStatusLabel : getPaymentStatusLabel;
  const getPaymentClassName = isFreelancer
    ? getFreelancerPaymentStatusClassName
    : getPaymentStatusClassName;

  const handleDelivered = ({ order: updatedOrder, delivery }) => {
    setOrder(updatedOrder);
    setDeliveries((prev) => [delivery, ...prev]);
  };

  const handleRevisionRequested = ({ order: updatedOrder }) => {
    setOrder(updatedOrder);
  };

  const handleDisputeRaised = () => {
    setOrder((prev) => (prev ? { ...prev, status: "DISPUTED" } : prev));
  };

  const handleRatingSaved = (savedRating) => {
    setRating(savedRating);
  };

  const handleConfirmDeleteRating = async () => {
    setRatingError("");
    setDeletingRating(true);

    try {
      await deleteRating(order._id);
      setRating(null);
    } catch (err) {
      setRatingError(err?.response?.data?.message || "Couldn't delete your rating.");
    } finally {
      setDeletingRating(false);
      setDeleteRatingOpen(false);
    }
  };

  const handleConfirmComplete = async () => {
    setActionError("");
    setCompleting(true);

    try {
      const response = await completeOrder(order._id);
      setOrder(response?.data?.data?.order || order);
    } catch (err) {
      setActionError(err?.response?.data?.message || "Couldn't approve this delivery.");
    } finally {
      setCompleting(false);
      setCompleteOpen(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading order..." />;
  }

  if (error || !order) {
    return <p className="mt-8 text-danger-text">{error || "Order not found."}</p>;
  }

  const { gigSnapshot } = order;

  const clientDeliveryActions =
    !isFreelancer && CLIENT_ACTIONABLE_STATUSES.includes(order.status) ? (
      <div className="space-y-2">
        <div className="flex flex-wrap justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => setRevisionOpen(true)}>
            Request revision
          </Button>
          <Button size="sm" onClick={() => setCompleteOpen(true)} disabled={completing}>
            {completing ? "Approving..." : "Approve & complete"}
          </Button>
        </div>
        {actionError ? <p className="text-right text-sm text-danger-text">{actionError}</p> : null}
      </div>
    ) : null;

  return (
    <div>
      <BackButton to={backRoute} className="-ml-3">
        Back to orders
      </BackButton>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <Badge className="bg-cta text-cta-text">{gigSnapshot?.category}</Badge>
              <h1 className="mt-3 text-3xl font-extrabold text-text-primary sm:text-4xl">
                {gigSnapshot?.title}
              </h1>
              {counterpartyName ? (
                <p className="mt-1 text-text-muted">
                  {isFreelancer ? "from" : "by"} {counterpartyName}
                </p>
              ) : null}
            </div>

            <span
              className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${getOrderStatusClassName(order.status)}`}
            >
              {getOrderStatusLabel(order.status)}
            </span>
          </div>

          <p className="mt-4 whitespace-pre-line text-text-secondary">
            {gigSnapshot?.description}
          </p>

          {order.status === "DISPUTED" ? (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-danger-text/20 bg-danger-soft p-4">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-danger-text" />
              <p className="text-sm text-danger-text">
                This order is under dispute. An admin is reviewing it and will resolve it soon.
              </p>
            </div>
          ) : null}
        </div>

        <div className="h-fit space-y-6 rounded-xl border border-border bg-bg-card p-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted">Price</p>
            <p className="text-3xl font-bold text-primary">${gigSnapshot?.price}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted">Delivery time</p>
            <p className="text-lg font-semibold text-text-primary">
              {gigSnapshot?.deliveryTime}{" "}
              {gigSnapshot?.deliveryTime === 1 ? "day" : "days"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-text-muted">Ordered</p>
              <p className="text-sm font-semibold text-text-primary">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-text-muted">Last updated</p>
              <p className="text-sm font-semibold text-text-primary">
                {formatDate(order.updatedAt)}
              </p>
            </div>
            {order.deliveryDeadline ? (
              <div className="col-span-2">
                <p className="text-xs uppercase tracking-wide text-text-muted">
                  Delivery deadline
                </p>
                <p className="text-sm font-semibold text-text-primary">
                  {formatDate(order.deliveryDeadline)}
                </p>
              </div>
            ) : null}
          </div>

          {payment ? (
            <div className="border-t border-border pt-4">
              <p className="text-xs uppercase tracking-wide text-text-muted">Payment</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-lg font-bold text-text-primary">${payment.amount}</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${getPaymentClassName(payment.status)}`}
                >
                  {getPaymentLabel(payment.status)}
                </span>
              </div>
            </div>
          ) : null}

        </div>
      </div>

      <DeliveryTimeline
        deliveries={deliveries}
        lastRevisionNote={order.lastRevisionNote}
        orderStatus={order.status}
        latestDeliveryActions={clientDeliveryActions}
      />

      {isFreelancer && FREELANCER_DELIVERABLE_STATUSES.includes(order.status) ? (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-bg-card p-6">
          <div>
            <h3 className="font-semibold text-text-primary">Ready to deliver?</h3>
            <p className="mt-1 text-sm text-text-secondary">
              Upload your work and notify the client.
            </p>
          </div>
          <Button onClick={() => setDeliverOpen(true)}>
            {order.status === "REVISION_REQUESTED" ? "Submit revised delivery" : "Submit delivery"}
          </Button>
        </div>
      ) : null}

      {DISPUTE_ELIGIBLE_STATUSES.includes(order.status) ? (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-bg-card p-6">
          <div>
            <h3 className="font-semibold text-text-primary">Having an issue with this order?</h3>
            <p className="mt-1 text-sm text-text-secondary">
              Raising a dispute freezes the order and hands it to an admin for review.
            </p>
          </div>
          <Button
            variant="outline"
            className="shrink-0 text-danger-text hover:text-danger-text"
            onClick={() => setDisputeOpen(true)}
          >
            <AlertTriangle className="size-4" />
            Raise a dispute
          </Button>
        </div>
      ) : null}

      {!isFreelancer && RATEABLE_STATUSES.includes(order.status) ? (
        <div className="mt-8 rounded-xl border border-border bg-bg-card p-6">
          <h3 className="font-semibold text-text-primary">Your rating</h3>

          {rating ? (
            <div className="mt-3 space-y-2">
              <StarRating value={rating.rating} readOnly />
              {rating.comment ? (
                <p className="whitespace-pre-line text-sm text-text-secondary">{rating.comment}</p>
              ) : null}
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={() => setRateOpen(true)}>
                  <Pencil className="size-4" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-danger-text hover:text-danger-text"
                  onClick={() => setDeleteRatingOpen(true)}
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-text-secondary">
                Let the freelancer know how this order went.
              </p>
              <Button onClick={() => setRateOpen(true)}>Rate this order</Button>
            </div>
          )}

          {ratingError ? <p className="mt-2 text-sm text-danger-text">{ratingError}</p> : null}
        </div>
      ) : null}

      {isFreelancer && rating ? (
        <div className="mt-8 rounded-xl border border-border bg-bg-card p-6">
          <h3 className="font-semibold text-text-primary">Client feedback</h3>
          <div className="mt-3 space-y-2">
            <StarRating value={rating.rating} readOnly />
            {rating.comment ? (
              <p className="whitespace-pre-line text-sm text-text-secondary">{rating.comment}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      <DeliverOrderDialog
        open={deliverOpen}
        onOpenChange={setDeliverOpen}
        orderId={order._id}
        onDelivered={handleDelivered}
      />

      <RequestRevisionDialog
        open={revisionOpen}
        onOpenChange={setRevisionOpen}
        orderId={order._id}
        onRevisionRequested={handleRevisionRequested}
      />

      <RaiseDisputeDialog
        open={disputeOpen}
        onOpenChange={setDisputeOpen}
        orderId={order._id}
        onDisputeRaised={handleDisputeRaised}
      />

      <ConfirmDialog
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        title="Approve this delivery?"
        description="This releases payment to the freelancer and marks the order complete. This can't be undone."
        confirmLabel="Approve & complete"
        cancelLabel="Not yet"
        loading={completing}
        onConfirm={handleConfirmComplete}
      />

      <RateOrderDialog
        open={rateOpen}
        onOpenChange={setRateOpen}
        orderId={order._id}
        existingRating={rating}
        onSaved={handleRatingSaved}
      />

      <ConfirmDialog
        open={deleteRatingOpen}
        onOpenChange={setDeleteRatingOpen}
        title="Delete your rating?"
        description="This removes your rating and comment from this order. This can't be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        loading={deletingRating}
        onConfirm={handleConfirmDeleteRating}
      />
    </div>
  );
};

export default OrderDetailsContent;
