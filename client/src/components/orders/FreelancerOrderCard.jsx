import { useEffect, useState } from "react";
import { acceptOrder, getOrderClient, rejectOrder } from "../../api/orderApi";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import ConfirmDialog from "../ui/ConfirmDialog";
import { formatDate } from "../../utils/formatDate";
import { getOrderStatusClassName, getOrderStatusLabel } from "../../utils/orderStatus";

const FreelancerOrderCard = ({ order }) => {
  const { _id, gigSnapshot, createdAt } = order;
  const [status, setStatus] = useState(order.status);
  const [clientName, setClientName] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getOrderClient(_id)
      .then((response) => {
        if (isMounted) {
          setClientName(response?.data?.data?.fullName || null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setClientName(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [_id]);

  const handleAccept = async () => {
    setActionError("");
    setAccepting(true);

    try {
      await acceptOrder(_id);
      setStatus("IN_PROGRESS");
    } catch (err) {
      setActionError(err?.response?.data?.message || "Couldn't accept this order.");
    } finally {
      setAccepting(false);
    }
  };

  const handleConfirmReject = async () => {
    setActionError("");
    setRejecting(true);

    try {
      await rejectOrder(_id);
      setStatus("REJECTED");
    } catch (err) {
      setActionError(err?.response?.data?.message || "Couldn't reject this order.");
    } finally {
      setRejecting(false);
      setConfirmOpen(false);
    }
  };

  const canRespond = status === "PENDING_ACCEPTANCE";

  return (
    <Card className="gap-0 p-0">
      <CardContent className="grid gap-2 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-text-primary">{gigSnapshot?.title}</h3>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${getOrderStatusClassName(status)}`}
          >
            {getOrderStatusLabel(status)}
          </span>
        </div>

        {clientName ? <p className="text-sm text-text-muted">from {clientName}</p> : null}

        <p className="line-clamp-2 text-sm text-text-secondary">{gigSnapshot?.description}</p>
      </CardContent>

      <CardFooter className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-muted">Received</p>
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

      {canRespond ? (
        <div className="border-t border-border p-5">
          <div className="flex gap-3">
            <Button className="flex-1" onClick={handleAccept} disabled={accepting || rejecting}>
              {accepting ? "Accepting..." : "Accept"}
            </Button>
            <Button
              variant="destructive"
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={() => setConfirmOpen(true)}
              disabled={accepting || rejecting}
            >
              {rejecting ? "Rejecting..." : "Reject"}
            </Button>
          </div>
          {actionError ? <p className="mt-2 text-sm text-danger-text">{actionError}</p> : null}
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Reject this order?"
        description="The client's payment will be refunded. This can't be undone."
        confirmLabel="Reject order"
        cancelLabel="Keep order"
        destructive
        loading={rejecting}
        onConfirm={handleConfirmReject}
      />
    </Card>
  );
};

export default FreelancerOrderCard;
