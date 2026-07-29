import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { getDisputes } from "../../api/disputeApi";
import { getUser } from "../../api/userApi";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import DisputeResolveDialog from "../../components/disputes/DisputeResolveDialog";
import { Button } from "../../components/ui/button";
import LoadingState from "../../components/ui/LoadingState";
import { ADMIN_NAV_ITEMS } from "../../config/dashboardNav";
import { formatDate } from "../../utils/formatDate";
import { getDisputeStatusClassName, getDisputeStatusLabel } from "../../utils/disputeStatus";

const STATUS_FILTERS = [
  { label: "Pending", value: "PENDING" },
  { label: "Refund approved", value: "REFUND_APPROVED" },
  { label: "Refund rejected", value: "REFUND_REJECTED" },
  { label: "All", value: "" },
];

const AdminDisputesPage = () => {
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [disputes, setDisputes] = useState([]);
  const [raisedByNames, setRaisedByNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDispute, setSelectedDispute] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDisputes = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getDisputes(statusFilter || undefined);
        const fetchedDisputes = response?.data?.data || [];

        if (!isMounted) {
          return;
        }

        setDisputes(fetchedDisputes);

        const uniqueUserIds = [...new Set(fetchedDisputes.map((dispute) => dispute.raisedBy))];
        const nameEntries = await Promise.all(
          uniqueUserIds.map(async (userId) => {
            const userResponse = await getUser(userId).catch(() => null);
            return [userId, userResponse?.data?.data?.fullName || null];
          }),
        );

        if (isMounted) {
          setRaisedByNames(Object.fromEntries(nameEntries));
        }
      } catch {
        if (isMounted) {
          setError("Couldn't load disputes.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDisputes();

    return () => {
      isMounted = false;
    };
  }, [statusFilter]);

  const handleResolved = (updatedDispute) => {
    setDisputes((prev) =>
      prev
        .map((dispute) => (dispute._id === updatedDispute._id ? updatedDispute : dispute))
        .filter((dispute) => !statusFilter || dispute.status === statusFilter),
    );
  };

  return (
    <DashboardLayout navItems={ADMIN_NAV_ITEMS}>
      <h1 className="text-3xl font-extrabold text-text-primary sm:text-4xl">Disputes</h1>
      <p className="mt-1 text-text-secondary">
        Review disputes raised by clients and freelancers, then approve a refund or reject the
        dispute.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <Button
            key={filter.label}
            size="sm"
            variant={statusFilter === filter.value ? "default" : "outline"}
            onClick={() => setStatusFilter(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {loading ? <LoadingState label="Loading disputes..." /> : null}
      {error ? <p className="mt-6 text-danger-text">{error}</p> : null}

      {!loading && !error && disputes.length === 0 ? (
        <div className="mt-8 rounded-xl border border-border bg-bg-card p-8 text-center">
          <AlertTriangle className="mx-auto size-8 text-text-muted" />
          <p className="mt-3 text-text-secondary">No disputes here.</p>
        </div>
      ) : null}

      {!loading && !error && disputes.length > 0 ? (
        <ul className="mt-8 space-y-4">
          {disputes.map((dispute) => (
            <li
              key={dispute._id}
              className="rounded-xl border border-border bg-bg-card p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-text-muted">
                    Raised {formatDate(dispute.createdAt)}
                    {raisedByNames[dispute.raisedBy] ? ` by ${raisedByNames[dispute.raisedBy]}` : ""}
                  </p>
                  <p className="mt-1 line-clamp-2 text-text-primary">{dispute.reason}</p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${getDisputeStatusClassName(dispute.status)}`}
                >
                  {getDisputeStatusLabel(dispute.status)}
                </span>
              </div>

              <div className="mt-4 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => setSelectedDispute(dispute)}>
                  View & resolve
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <DisputeResolveDialog
        open={Boolean(selectedDispute)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDispute(null);
          }
        }}
        dispute={selectedDispute}
        onResolved={handleResolved}
      />
    </DashboardLayout>
  );
};

export default AdminDisputesPage;
