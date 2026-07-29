import { useState } from "react";
import { requestRevision } from "../../api/orderApi";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

const RequestRevisionDialog = ({ open, onOpenChange, orderId, onRevisionRequested }) => {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleOpenChange = (nextOpen) => {
    if (submitting) {
      return;
    }

    if (!nextOpen) {
      setMessage("");
      setError("");
    }

    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await requestRevision(orderId, message.trim());
      onRevisionRequested?.(response?.data?.data);
      setMessage("");
      onOpenChange(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't request a revision.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Request a revision</AlertDialogTitle>
          <AlertDialogDescription>
            Tell the freelancer what needs to change before you approve this delivery.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form id="request-revision-form" className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="revision-message">Message (optional)</Label>
            <Textarea
              id="revision-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="What would you like changed?"
            />
          </div>

          {error ? <p className="text-sm text-danger-text">{error}</p> : null}
        </form>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <Button type="submit" form="request-revision-form" disabled={submitting}>
            {submitting ? "Sending..." : "Request revision"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RequestRevisionDialog;
