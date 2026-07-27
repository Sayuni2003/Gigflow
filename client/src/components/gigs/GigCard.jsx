import { Badge } from "../ui/badge";
import { Card, CardContent, CardFooter } from "../ui/card";

const GigCard = ({ gig }) => {
  const {
    image,
    title,
    description,
    category,
    price,
    deliveryTime,
    tags = [],
  } = gig;

  return (
    <Card className="group gap-0 overflow-hidden p-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
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
    </Card>
  );
};

export default GigCard;
