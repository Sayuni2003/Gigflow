import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { getOrders } from "../../api/orderApi";
import { getPayments } from "../../api/paymentApi";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { CLIENT_NAV_ITEMS } from "../../config/dashboardNav";
import LoadingState from "../../components/ui/LoadingState";
import { formatDate } from "../../utils/formatDate";
import { getPaymentStatusClassName, getPaymentStatusLabel } from "../../utils/paymentStatus";

const ClientPaymentsPage = () => {
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
        const [paymentsResponse, ordersResponse] = await Promise.all([getPayments(), getOrders()]);

        if (isMounted) {
          setPayments(paymentsResponse?.data?.data || []);

          const titleByOrderId = {};
          (ordersResponse?.data?.data || []).forEach((order) => {
            titleByOrderId[order._id] = order.gigSnapshot?.title;
          });
          setGigTitleByOrderId(titleByOrderId);
        }
      } catch {
        if (isMounted) {
          setError("Couldn't load your payments.");
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
    <DashboardLayout navItems={CLIENT_NAV_ITEMS}>
      <h1 className="text-3xl font-extrabold text-text-primary sm:text-4xl">Payments</h1>
      <p className="mt-1 text-text-secondary">Payments you&apos;ve made for your ordered gigs.</p>

      {loading ? <LoadingState label="Loading payments..." /> : null}
      {error ? <p className="mt-6 text-danger-text">{error}</p> : null}

      {!loading && !error && payments.length === 0 ? (
        <div className="mt-8 rounded-xl border border-border bg-bg-card p-8 text-center">
          <CreditCard className="mx-auto size-8 text-text-muted" />
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
                <th className="px-5 py-3 font-medium">Amount</th>
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
                  <td className="px-5 py-4 font-semibold text-primary">${payment.amount}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${getPaymentStatusClassName(payment.status)}`}
                    >
                      {getPaymentStatusLabel(payment.status)}
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

export default ClientPaymentsPage;
