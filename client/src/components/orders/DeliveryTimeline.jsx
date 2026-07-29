import { formatDate } from "../../utils/formatDate";

const formatFileSize = (bytes) => {
  if (!bytes) {
    return "";
  }

  const kb = bytes / 1024;
  return kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(1)} MB`;
};

const DeliveryTimeline = ({ deliveries, lastRevisionNote, orderStatus, latestDeliveryActions }) => {
  const showRevisionNote = orderStatus === "REVISION_REQUESTED" && Boolean(lastRevisionNote);
  const hasContent = deliveries.length > 0 || showRevisionNote || Boolean(latestDeliveryActions);

  if (!hasContent) {
    return null;
  }

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-lg font-bold text-text-primary">Delivery activity</h2>

      {showRevisionNote ? (
        <div className="rounded-xl border border-warning-text/20 bg-warning-soft p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-warning-text">
            Revision requested
          </p>
          <p className="mt-1 whitespace-pre-line text-sm text-text-primary">{lastRevisionNote}</p>
        </div>
      ) : null}

      {deliveries.length > 0 ? (
        <ul className="space-y-4">
          {deliveries.map((delivery, index) => (
            <li key={delivery._id} className="rounded-xl border border-border bg-bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-text-primary">
                  {delivery.revisionNumber === 0
                    ? "Initial delivery"
                    : `Revision ${delivery.revisionNumber}`}
                </p>
                <p className="text-xs text-text-muted">{formatDate(delivery.createdAt)}</p>
              </div>

              <p className="mt-2 whitespace-pre-line text-sm text-text-secondary">
                {delivery.message}
              </p>

              {delivery.attachments?.length > 0 ? (
                <ul className="mt-3 space-y-1">
                  {delivery.attachments.map((attachment) => (
                    <li key={attachment.url}>
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {attachment.filename}
                      </a>
                      {attachment.size ? (
                        <span className="ml-2 text-xs text-text-muted">
                          {formatFileSize(attachment.size)}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}

              {index === 0 && latestDeliveryActions ? (
                <div className="mt-4 border-t border-border pt-4">{latestDeliveryActions}</div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : latestDeliveryActions ? (
        <div className="rounded-xl border border-border bg-bg-card p-4">{latestDeliveryActions}</div>
      ) : null}
    </div>
  );
};

export default DeliveryTimeline;
