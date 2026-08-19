import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { cancelOrder, getOrderFreelancer, getOrderPayment } from "../../api/orderApi";
import { stripePromise } from "../../lib/stripe";
import { ROUTES } from "../../utils/constants";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import ConfirmDialog from "../ui/ConfirmDialog";
import { formatDate } from "../../utils/formatDate";
import { getOrderStatusClassName, getOrderStatusLabel } from "../../utils/orderStatus";
import CheckoutForm from "./CheckoutForm";

const CANCELLABLE_STATUSES = ["PENDING_PAYMENT", "PENDING_ACCEPTANCE"];

const OrderCard = ({ order }) => {
  const { _id, gigSnapshot, status, createdAt } = order;
  const [freelancerName, setFreelancerName] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [justPaid, setJustPaid] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [cancelled, setCancelled] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getOrderFreelancer(order._id)
      .then((response) => {
        if (isMounted) {
          setFreelancerName(response?.data?.data?.fullName || null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setFreelancerName(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [order._id]);

  const handlePayNowClick = async () => {
    setPaymentError("");
    setLoadingPayment(true);

    try {
      const response = await getOrderPayment(_id);
      const secret = response?.data?.data?.clientSecret;

      if (!secret) {
        setPaymentError("This order can no longer be paid.");
        return;
      }

      setClientSecret(secret);
    } catch {
      setPaymentError("Couldn't load payment details.");
    } finally {
      setLoadingPayment(false);
    }
  };

  const handlePaymentSuccess = () => {
    setClientSecret(null);
    setJustPaid(true);
  };

  const handleConfirmCancel = async () => {
    setCancelError("");
    setCancelling(true);

    try {
      await cancelOrder(_id);
      setCancelled(true);
    } catch (err) {
      setCancelError(err?.response?.data?.message || "Couldn't cancel this order.");
    } finally {
      setCancelling(false);
      setConfirmOpen(false);
    }
  };

  const canPay = status === "PENDING_PAYMENT" && !justPaid && !cancelled;
  const canCancel = CANCELLABLE_STATUSES.includes(status) && !cancelled;

  return (
    <Card className="gap-0 p-0">
      <Link to={ROUTES.orderDetails(_id)} className="block">
        <CardContent className="grid gap-2 p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-text-primary">{gigSnapshot?.title}</h3>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${getOrderStatusClassName(status)}`}
            >
              {getOrderStatusLabel(status)}
            </span>
          </div>

          {freelancerName ? (
            <p className="text-sm text-text-muted">by {freelancerName}</p>
          ) : null}

          <p className="line-clamp-2 text-sm text-text-secondary">{gigSnapshot?.description}</p>
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted">Ordered</p>
            <p className="text-sm font-semibold text-text-primary">{formatDate(createdAt)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted">Delivery</p>
            <p className="text-sm font-semibold text-text-primary">
              {gigSnapshot?.deliveryTime} {gigSnapshot?.deliveryTime === 1 ? "day" : "days"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-text-muted">Price</p>
            <p className="text-lg font-bold text-primary">${gigSnapshot?.price}</p>
          </div>
        </CardFooter>
      </Link>

      {(canPay || canCancel) && !justPaid ? (
        <div className="border-t border-border p-5">
          {clientSecret ? (
            <div className="space-y-4">
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm clientSecret={clientSecret} onSuccess={handlePaymentSuccess} />
              </Elements>
              {canCancel ? (
                <Button
                  variant="destructive"
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={() => setConfirmOpen(true)}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelling..." : "Cancel order"}
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="flex gap-3">
              {canPay ? (
                <Button className="flex-1" onClick={handlePayNowClick} disabled={loadingPayment}>
                  {loadingPayment ? "Loading..." : "Pay now"}
                </Button>
              ) : null}
              {canCancel ? (
                <Button
                  variant="destructive"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={() => setConfirmOpen(true)}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelling..." : "Cancel order"}
                </Button>
              ) : null}
            </div>
          )}

          {paymentError ? <p className="mt-2 text-sm text-danger-text">{paymentError}</p> : null}
          {cancelError ? <p className="mt-2 text-sm text-danger-text">{cancelError}</p> : null}
        </div>
      ) : null}

      {justPaid ? (
        <p className="border-t border-border p-5 text-sm text-success-text">
          Payment submitted - awaiting confirmation.
        </p>
      ) : null}

      {cancelled ? (
        <p className="border-t border-border p-5 text-sm text-text-muted">Order cancelled.</p>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Cancel this order?"
        description="Any payment hold will be released. This can't be undone."
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        destructive
        loading={cancelling}
        onConfirm={handleConfirmCancel}
      />
    </Card>
  );
};

export default OrderCard;
