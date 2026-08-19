import { useEffect, useState } from "react";
import { createRating, updateRating } from "../../api/ratingApi";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import StarRating from "../ui/StarRating";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

const RateOrderDialog = ({ open, onOpenChange, orderId, existingRating, onSaved }) => {
  const isEditing = Boolean(existingRating);

  const [rating, setRating] = useState(existingRating?.rating || 0);
  const [comment, setComment] = useState(existingRating?.comment || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setRating(existingRating?.rating || 0);
      setComment(existingRating?.comment || "");
      setError("");
    }
  }, [open, existingRating]);

  const handleOpenChange = (nextOpen) => {
    if (submitting) {
      return;
    }

    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (rating < 1) {
      setError("Choose a star rating.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const response = isEditing
        ? await updateRating(orderId, { rating, comment: comment.trim() })
        : await createRating(orderId, { rating, comment: comment.trim() });

      onSaved?.(response?.data?.data);
      onOpenChange(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't save your rating.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{isEditing ? "Edit your rating" : "Rate this order"}</AlertDialogTitle>
          <AlertDialogDescription>
            Let the freelancer and other clients know how this order went.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form id="rate-order-form" className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label>Rating</Label>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="rating-comment">Comment (optional)</Label>
            <Textarea
              id="rating-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Share details about your experience..."
              maxLength={1000}
            />
          </div>

          {error ? <p className="text-sm text-danger-text">{error}</p> : null}
        </form>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <Button type="submit" form="rate-order-form" disabled={submitting}>
            {submitting ? "Saving..." : isEditing ? "Save changes" : "Submit rating"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RateOrderDialog;
