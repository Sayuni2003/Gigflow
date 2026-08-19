import { useEffect, useState } from "react";
import { CheckCircle2, DollarSign, Receipt } from "lucide-react";
import { getOrders } from "../../api/orderApi";
import { getFreelancerEarnings, getPayments } from "../../api/paymentApi";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import { FREELANCER_NAV_ITEMS } from "../../config/dashboardNav";
import LoadingState from "../../components/ui/LoadingState";
import { formatDate } from "../../utils/formatDate";
import {
  getFreelancerPaymentStatusClassName,
  getFreelancerPaymentStatusLabel,
} from "../../utils/paymentStatus";

const FreelancerEarningsPage = () => {
  const [earnings, setEarnings] = useState({ totalEarned: 0, completedOrders: 0 });
  const [payments, setPayments] = useState([]);
  const [gigTitleByOrderId, setGigTitleByOrderId] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const [earningsResponse, paymentsResponse, ordersResponse] = await Promise.all([
          getFreelancerEarnings(),
          getPayments(),
          getOrders(),
        ]);

        if (isMounted) {
          setEarnings(
            earningsResponse?.data?.data || { totalEarned: 0, completedOrders: 0 },
          );
          setPayments(paymentsResponse?.data?.data || []);

          const titleByOrderId = {};
          (ordersResponse?.data?.data || []).forEach((order) => {
            titleByOrderId[order._id] = order.gigSnapshot?.title;
          });
          setGigTitleByOrderId(titleByOrderId);
        }
      } catch {
        if (isMounted) {
          setError("Couldn't load your earnings.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DashboardLayout navItems={FREELANCER_NAV_ITEMS}>
      <h1 className="text-3xl font-extrabold text-text-primary sm:text-4xl">Earnings</h1>
      <p className="mt-1 text-text-secondary">
        Your total earnings and the payment status of every order.
      </p>

      {loading ? <LoadingState label="Loading earnings..." /> : null}
      {error ? <p className="mt-6 text-danger-text">{error}</p> : null}

      {!loading && !error ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard icon={DollarSign} label="Total earned" value={`$${earnings.totalEarned}`} />
          <StatCard
            icon={CheckCircle2}
            label="Completed orders"
            value={earnings.completedOrders}
          />
        </div>
      ) : null}

      {!loading && !error && payments.length === 0 ? (
        <div className="mt-8 rounded-xl border border-border bg-bg-card p-8 text-center">
          <Receipt className="mx-auto size-8 text-text-muted" />
          <p className="mt-3 text-text-secondary">You don&apos;t have any payments yet.</p>
        </div>
      ) : null}

      {!loading && !error && payments.length > 0 ? (
        <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
                <th className="px-5 py-3 font-medium">Gig</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Your payout</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.orderId} className="border-b border-border last:border-0">
                  <td className="px-5 py-4 font-medium text-text-primary">
                    {gigTitleByOrderId[payment.orderId] || `Order #${payment.orderId.slice(-6)}`}
                  </td>
                  <td className="px-5 py-4 text-text-secondary">{formatDate(payment.createdAt)}</td>
                  <td className="px-5 py-4 font-semibold text-primary">
                    ${payment.freelancerPayout}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${getFreelancerPaymentStatusClassName(payment.status)}`}
                    >
                      {getFreelancerPaymentStatusLabel(payment.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </DashboardLayout>
  );
};

export default FreelancerEarningsPage;
