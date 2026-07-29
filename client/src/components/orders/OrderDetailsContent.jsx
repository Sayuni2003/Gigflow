import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import {
  completeOrder,
  getOrderById,
  getOrderClient,
  getOrderDeliveries,
  getOrderFreelancer,
  getOrderPayment,
} from "../../api/orderApi";
import { useAuth } from "../../hooks/useAuth";
import { ROLES, ROUTES } from "../../utils/constants";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import ConfirmDialog from "../ui/ConfirmDialog";
import LoadingState from "../ui/LoadingState";
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
import RequestRevisionDialog from "./RequestRevisionDialog";

const FREELANCER_DELIVERABLE_STATUSES = ["IN_PROGRESS", "REVISION_REQUESTED"];
const CLIENT_ACTIONABLE_STATUSES = ["DELIVERED"];
const DISPUTE_ELIGIBLE_STATUSES = [
  "PENDING_ACCEPTANCE",
  "IN_PROGRESS",
  "DELIVERED",
  "REVISION_REQUESTED",
];

const OrderDetailsContent = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const isFreelancer = user?.role === ROLES.FREELANCER;

  const [order, setOrder] = useState(null);
  const [counterpartyName, setCounterpartyName] = useState(null);
  const [payment, setPayment] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deliverOpen, setDeliverOpen] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [disputeOpen, setDisputeOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchDetails = async () => {
      setLoading(true);
      setError("");

      try {
        const getCounterparty = isFreelancer ? getOrderClient : getOrderFreelancer;

        const [orderResponse, counterpartyResponse, paymentResponse, deliveriesResponse] =
          await Promise.all([
            getOrderById(id),
            getCounterparty(id).catch(() => null),
            getOrderPayment(id).catch(() => null),
            getOrderDeliveries(id).catch(() => null),
          ]);

        if (isMounted) {
          setOrder(orderResponse?.data?.data || null);
          setCounterpartyName(counterpartyResponse?.data?.data?.fullName || null);
          setPayment(paymentResponse?.data?.data || null);
          setDeliveries(deliveriesResponse?.data?.data || []);
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
      <Link
        to={backRoute}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to orders
      </Link>

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

          {isFreelancer && FREELANCER_DELIVERABLE_STATUSES.includes(order.status) ? (
            <div className="border-t border-border pt-4">
              <Button className="w-full" onClick={() => setDeliverOpen(true)}>
                {order.status === "REVISION_REQUESTED" ? "Submit revised delivery" : "Submit delivery"}
              </Button>
            </div>
          ) : null}

          {DISPUTE_ELIGIBLE_STATUSES.includes(order.status) ? (
            <div className="border-t border-border pt-4">
              <Button
                variant="outline"
                className="w-full text-danger-text hover:text-danger-text"
                onClick={() => setDisputeOpen(true)}
              >
                <AlertTriangle className="size-4" />
                Raise a dispute
              </Button>
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
    </div>
  );
};

export default OrderDetailsContent;
