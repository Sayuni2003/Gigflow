const PRICE_BANDS = [
  { label: "Under $50", minPrice: undefined, maxPrice: 50 },
  { label: "$50 – $150", minPrice: 50, maxPrice: 150 },
  { label: "$150 – $500", minPrice: 150, maxPrice: 500 },
  { label: "$500 – $1,000", minPrice: 500, maxPrice: 1000 },
  { label: "$1,000+", minPrice: 1000, maxPrice: undefined },
];

const DELIVERY_BANDS = [
  { label: "Express 24h", maxDeliveryDays: 1 },
  { label: "Up to 3 days", maxDeliveryDays: 3 },
  { label: "Up to 7 days", maxDeliveryDays: 7 },
  { label: "Anytime", maxDeliveryDays: undefined },
];

const filterButtonClass = (active) =>
  `rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
    active ? "bg-primary-soft font-medium text-primary" : "text-text-secondary hover:bg-bg-soft"
  }`;

const isBandActive = (band, minPrice, maxPrice) =>
  String(minPrice || "") === String(band.minPrice || "") &&
  String(maxPrice || "") === String(band.maxPrice || "");

const GigFiltersSidebar = ({ minPrice, maxPrice, onPriceChange, maxDeliveryDays, onDeliveryChange }) => {
  const handleBandClick = (band) => {
    onPriceChange(
      isBandActive(band, minPrice, maxPrice)
        ? { minPrice: undefined, maxPrice: undefined }
        : { minPrice: band.minPrice, maxPrice: band.maxPrice },
    );
  };

  return (
    <aside className="grid content-start gap-8">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Budget</h2>
        <div className="mt-3 grid gap-1">
          {PRICE_BANDS.map((band) => (
            <button
              key={band.label}
              type="button"
              onClick={() => handleBandClick(band)}
              className={filterButtonClass(isBandActive(band, minPrice, maxPrice))}
            >
              {band.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Delivery time</h2>
        <div className="mt-3 grid gap-1">
          {DELIVERY_BANDS.map((band) => (
            <button
              key={band.label}
              type="button"
              onClick={() => onDeliveryChange(band.maxDeliveryDays)}
              className={filterButtonClass(
                String(maxDeliveryDays || "") === String(band.maxDeliveryDays || ""),
              )}
            >
              {band.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default GigFiltersSidebar;
