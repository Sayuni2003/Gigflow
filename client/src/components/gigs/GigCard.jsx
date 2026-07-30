import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getGigFreelancer } from "../../api/gigApi";
import { createOrder } from "../../api/orderApi";
import { useAuth } from "../../hooks/useAuth";
import { ROLES, ROUTES } from "../../utils/constants";
import { getInitials } from "../../utils/getInitials";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";

const GigCard = ({ gig }) => {
  const {
    _id,
    image,
    title,
    description,
    category,
    price,
    deliveryTime,
    tags = [],
  } = gig;

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [freelancerId, setFreelancerId] = useState(null);
  const [freelancerName, setFreelancerName] = useState(null);
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState("");

  useEffect(() => {
    let isMounted = true;

    getGigFreelancer(_id)
      .then((response) => {
        if (isMounted) {
          setFreelancerId(response?.data?.data?.freelancerId || null);
          setFreelancerName(response?.data?.data?.fullName || null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setFreelancerId(null);
          setFreelancerName(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [_id]);

  const detailsRoute = isAuthenticated ? ROUTES.dashboardGigDetails(_id) : ROUTES.gigDetails(_id);
  const freelancerProfileRoute = freelancerId
    ? isAuthenticated
      ? ROUTES.dashboardFreelancerProfile(freelancerId)
      : ROUTES.freelancerProfile(freelancerId)
    : null;
  const canOrder = !isAuthenticated || user?.role === ROLES.CLIENT;

  const handleFreelancerClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (freelancerProfileRoute) {
      navigate(freelancerProfileRoute);
    }
  };

  const handleOrderClick = async () => {
    setOrderError("");

    if (!isAuthenticated) {
      navigate(ROUTES.login, { state: { from: detailsRoute } });
      return;
    }

    setOrdering(true);

    try {
      await createOrder(_id);
      navigate(ROUTES.clientOrders);
    } catch (error) {
      setOrderError(error?.response?.data?.message || "Couldn't place the order.");
    } finally {
      setOrdering(false);
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
          <Badge className="absolute left-3 top-3 bg-cta text-cta-text">
            {category}
          </Badge>
        </div>

        <CardContent className="grid gap-2 px-5 pt-4">
          <h3 className="line-clamp-2 font-semibold text-text-primary">
            {title}
          </h3>
          {freelancerName ? (
            <button
              type="button"
              onClick={handleFreelancerClick}
              className="flex w-fit items-center gap-1.5 text-sm text-text-muted hover:text-text-primary hover:underline"
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-primary-soft text-[10px] font-semibold text-primary">
                {getInitials(freelancerName)}
              </span>
              by {freelancerName}
            </button>
          ) : null}
          <p className="line-clamp-2 text-sm text-text-secondary">
            {description}
          </p>

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
            <p className="text-xs uppercase tracking-wide text-text-muted">
              Delivery
            </p>
            <p className="text-sm font-semibold text-text-primary">
              {deliveryTime} {deliveryTime === 1 ? "day" : "days"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-text-muted">
              Price
            </p>
            <p className="text-lg font-bold text-primary">${price}</p>
          </div>
        </CardFooter>
      </Link>

      {canOrder ? (
        <div className="px-5 pb-5">
          <Button type="button" className="w-full" onClick={handleOrderClick} disabled={ordering}>
            {ordering ? "Placing order..." : "Order now"}
          </Button>
          {orderError ? <p className="mt-2 text-xs text-danger-text">{orderError}</p> : null}
        </div>
      ) : null}
    </Card>
  );
};

export default GigCard;
