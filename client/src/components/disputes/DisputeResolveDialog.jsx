import { useEffect, useState } from "react";
import { resolveDispute } from "../../api/disputeApi";
import { getOrderById, getOrderPayment } from "../../api/orderApi";
import { getUser } from "../../api/userApi";
import { formatDate } from "../../utils/formatDate";
import { getDisputeStatusClassName, getDisputeStatusLabel } from "../../utils/disputeStatus";
import { getOrderStatusClassName, getOrderStatusLabel } from "../../utils/orderStatus";
import { getPaymentStatusClassName, getPaymentStatusLabel } from "../../utils/paymentStatus";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import ConfirmDialog from "../ui/ConfirmDialog";
import LoadingState from "../ui/LoadingState";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

const DisputeResolveDialog = ({ open, onOpenChange, dispute, onResolved }) => {
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [raisedByName, setRaisedByName] = useState(null);
  const [clientName, setClientName] = useState(null);
  const [freelancerName, setFreelancerName] = useState(null);
  const [resolvedByName, setResolvedByName] = useState(null);
  const [loadingContext, setLoadingContext] = useState(true);

  const [resolutionNote, setResolutionNote] = useState("");
  const [pendingDecision, setPendingDecision] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState("");

  useEffect(() => {
    if (!open || !dispute) {
      return;
    }

    let isMounted = true;

    const fetchContext = async () => {
      setLoadingContext(true);
      setResolutionNote("");
      setResolveError("");

      try {
        const orderResponse = await getOrderById(dispute.orderId).catch(() => null);
        const fetchedOrder = orderResponse?.data?.data || null;

        const [paymentResponse, raisedByResponse, clientResponse, freelancerResponse, resolvedByResponse] =
          await Promise.all([
            getOrderPayment(dispute.orderId).catch(() => null),
            getUser(dispute.raisedBy).catch(() => null),
            fetchedOrder ? getUser(fetchedOrder.clientId).catch(() => null) : null,
            fetchedOrder ? getUser(fetchedOrder.freelancerId).catch(() => null) : null,
            dispute.resolvedBy ? getUser(dispute.resolvedBy).catch(() => null) : null,
          ]);

        if (isMounted) {
          setOrder(fetchedOrder);
          setPayment(paymentResponse?.data?.data || null);
          setRaisedByName(raisedByResponse?.data?.data?.fullName || null);
          setClientName(clientResponse?.data?.data?.fullName || null);
          setFreelancerName(freelancerResponse?.data?.data?.fullName || null);
          setResolvedByName(resolvedByResponse?.data?.data?.fullName || null);
        }
      } finally {
        if (isMounted) {
          setLoadingContext(false);
        }
      }
    };

    fetchContext();

    return () => {
      isMounted = false;
    };
  }, [open, dispute]);

  const handleOpenChange = (nextOpen) => {
    if (resolving) {
      return;
    }

    if (!nextOpen) {
      setOrder(null);
      setPayment(null);
      setRaisedByName(null);
      setClientName(null);
      setFreelancerName(null);
      setResolvedByName(null);
      setPendingDecision(null);
      setResolveError("");
    }

    onOpenChange(nextOpen);
  };

  const askConfirm = (decision) => {
    setPendingDecision(decision);
    setConfirmOpen(true);
  };

  const handleConfirmResolve = async () => {
    setResolveError("");
    setResolving(true);

    try {
      const response = await resolveDispute(dispute._id, {
        decision: pendingDecision,
        resolutionNote: resolutionNote.trim(),
      });
      onResolved?.(response?.data?.data);
      setConfirmOpen(false);
      handleOpenChange(false);
    } catch (err) {
      setResolveError(err?.response?.data?.message || "Couldn't resolve this dispute.");
      setConfirmOpen(false);
    } finally {
      setResolving(false);
    }
  };

  if (!dispute) {
    return null;
  }

  const isPending = dispute.status === "PENDING";

  return (
    <>
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Dispute details</AlertDialogTitle>
            <AlertDialogDescription>
              Raised {formatDate(dispute.createdAt)}
              {raisedByName ? ` by ${raisedByName}` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Status</span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${getDisputeStatusClassName(dispute.status)}`}
              >
                {getDisputeStatusLabel(dispute.status)}
              </span>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-text-muted">Reason</p>
              <p className="mt-1 whitespace-pre-line text-text-primary">{dispute.reason}</p>
            </div>

            {dispute.attachments?.length > 0 ? (
              <div>
                <p className="text-xs uppercase tracking-wide text-text-muted">Attachments</p>
                <ul className="mt-1 space-y-1">
                  {dispute.attachments.map((attachment) => (
                    <li key={attachment.url}>
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        {attachment.filename}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="rounded-lg border border-border p-4">
              <p className="text-xs uppercase tracking-wide text-text-muted">Order</p>

              {loadingContext ? (
                <LoadingState label="Loading order details..." />
              ) : order ? (
                <div className="mt-2 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-text-primary">{order.gigSnapshot?.title}</p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${getOrderStatusClassName(order.status)}`}
                    >
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </div>

                  <p className="text-text-secondary">${order.gigSnapshot?.price}</p>

                  <div className="grid grid-cols-2 gap-2 text-text-secondary">
                    <p>Client: {clientName || "-"}</p>
                    <p>Freelancer: {freelancerName || "-"}</p>
                  </div>

                  {payment ? (
                    <p className="flex items-center gap-2 text-text-secondary">
                      Payment:
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${getPaymentStatusClassName(payment.status)}`}
                      >
                        {getPaymentStatusLabel(payment.status)}
                      </span>
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-1 text-text-muted">Couldn&apos;t load order details.</p>
              )}
            </div>

            {!isPending ? (
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs uppercase tracking-wide text-text-muted">Resolution</p>
                <p className="mt-1 text-text-primary">
                  Resolved {formatDate(dispute.resolvedAt)}
                  {resolvedByName ? ` by ${resolvedByName}` : ""}
                </p>
                {dispute.resolutionNote ? (
                  <p className="mt-2 whitespace-pre-line text-text-secondary">
                    {dispute.resolutionNote}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="resolution-note">Resolution note (optional)</Label>
                <Textarea
                  id="resolution-note"
                  value={resolutionNote}
                  onChange={(event) => setResolutionNote(event.target.value)}
                  placeholder="Explain your decision..."
                  maxLength={2000}
                />
              </div>
            )}

            {resolveError ? <p className="text-danger-text">{resolveError}</p> : null}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={resolving}>Close</AlertDialogCancel>
            {isPending ? (
              <>
                <Button
                  variant="outline"
                  className="text-danger-text hover:text-danger-text"
                  disabled={resolving}
                  onClick={() => askConfirm("REFUND_REJECTED")}
                >
                  Reject dispute
                </Button>
                <Button disabled={resolving} onClick={() => askConfirm("REFUND_APPROVED")}>
                  Approve refund
                </Button>
              </>
            ) : null}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={
          pendingDecision === "REFUND_APPROVED"
            ? "Approve refund for this order?"
            : "Reject this dispute?"
        }
        description={
          pendingDecision === "REFUND_APPROVED"
            ? "This refunds the client and marks the order as refunded. This can't be undone."
            : "This restores the order to its status before the dispute was raised. This can't be undone."
        }
        confirmLabel={pendingDecision === "REFUND_APPROVED" ? "Approve refund" : "Reject dispute"}
        cancelLabel="Back"
        destructive={pendingDecision === "REFUND_REJECTED"}
        loading={resolving}
        onConfirm={handleConfirmResolve}
      />
    </>
  );
};

export default DisputeResolveDialog;
