import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { deleteGig } from "../../api/gigApi";
import { ROUTES } from "../../utils/constants";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import ConfirmDialog from "../ui/ConfirmDialog";

const MyGigCard = ({ gig, onDeleted }) => {
  const { _id, image, title, description, category, price, deliveryTime, tags = [] } = gig;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const detailsRoute = ROUTES.dashboardGigDetails(_id);

  const handleConfirmDelete = async () => {
    setDeleteError("");
    setDeleting(true);

    try {
      await deleteGig(_id);
      setConfirmOpen(false);
      onDeleted?.(_id);
    } catch (error) {
      setDeleteError(error?.response?.data?.message || "Couldn't delete this gig.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="group gap-0 overflow-hidden p-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <Link to={detailsRoute} className="block">
        <div className="relative aspect-video w-full overflow-hidden bg-bg-soft">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <Badge className="absolute left-3 top-3 bg-cta text-cta-text">{category}</Badge>
        </div>

        <CardContent className="grid gap-2 px-5 pt-4">
          <h3 className="line-clamp-2 font-semibold text-text-primary">{title}</h3>
          <p className="line-clamp-2 text-sm text-text-secondary">{description}</p>

          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>

        <CardFooter className="mt-3 flex items-center justify-between border-t border-border px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted">Delivery</p>
            <p className="text-sm font-semibold text-text-primary">
              {deliveryTime} {deliveryTime === 1 ? "day" : "days"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-text-muted">Price</p>
            <p className="text-lg font-bold text-primary">${price}</p>
          </div>
        </CardFooter>
      </Link>

      <div className="flex items-center gap-2 px-5 pb-5">
        <Button asChild size="sm" className="flex-1 bg-green-600 text-white hover:bg-green-700">
          <Link to={ROUTES.freelancerGigEdit(_id)}>
            <Pencil className="size-4" />
            Edit
          </Link>
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="flex-1 bg-red-600 hover:bg-red-700"
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      </div>
      {deleteError ? <p className="px-5 pb-4 text-xs text-danger-text">{deleteError}</p> : null}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this gig?"
        description={`"${title}" will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </Card>
  );
};

export default MyGigCard;
