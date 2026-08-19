import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, LayoutGrid, Search } from "lucide-react";
import { getCategories, getGigs } from "../../api/gigApi";
import { getCategoryIcon } from "../../utils/categoryIcons";
import CategoryFilterBadge from "./CategoryFilterBadge";
import GigCard from "./GigCard";
import GigFiltersSidebar from "./GigFiltersSidebar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import LoadingState from "../ui/LoadingState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

const RESULTS_PER_PAGE = 9;

const GigBrowseContent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const [categories, setCategories] = useState([]);
  const [result, setResult] = useState({ gigs: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const categoryScrollRef = useRef(null);

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const maxDeliveryDays = searchParams.get("maxDeliveryDays") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  useEffect(() => {
    let cancelled = false;

    getCategories()
      .then((response) => {
        if (!cancelled) {
          setCategories(response?.data?.data || []);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchGigs = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getGigs({
          q: q || undefined,
          category: category || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          maxDeliveryDays: maxDeliveryDays || undefined,
          sort,
          page,
          limit: RESULTS_PER_PAGE,
        });

        if (!cancelled) {
          setResult(response?.data?.data || { gigs: [], total: 0, totalPages: 1 });
        }
      } catch {
        if (!cancelled) {
          setError("Couldn't load gigs.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchGigs();

    return () => {
      cancelled = true;
    };
  }, [q, category, minPrice, maxPrice, maxDeliveryDays, sort, page]);

  const updateParams = (updates, { resetPage = true } = {}) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });

    if (resetPage) {
      next.delete("page");
    }

    setSearchParams(next);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    updateParams({ q: searchInput.trim() });
  };

  const handleCategoryClick = (name) => {
    updateParams({ category: category === name ? undefined : name });
  };

  const updateCategoryScrollState = () => {
    const el = categoryScrollRef.current;
    if (!el) {
      return;
    }

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    updateCategoryScrollState();
  }, [categories]);

  const scrollCategories = (direction) => {
    categoryScrollRef.current?.scrollBy({ left: direction * 240, behavior: "smooth" });
  };

  return (
    <>
      <form onSubmit={handleSearchSubmit} className="relative mt-4 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Try 'logo designer', 'React developer'..."
          className="h-11 pl-9"
        />
      </form>

      <div className="relative mt-4">
        {canScrollLeft ? (
          <button
            type="button"
            onClick={() => scrollCategories(-1)}
            aria-label="Scroll categories left"
            className="absolute -left-3 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg-card text-text-secondary shadow-md transition-colors hover:text-text-primary"
          >
            <ChevronLeft className="size-4" />
          </button>
        ) : null}

        <div
          ref={categoryScrollRef}
          onScroll={updateCategoryScrollState}
          className="scrollbar-hide flex gap-2 overflow-x-auto scroll-smooth"
        >
          <CategoryFilterBadge
            icon={LayoutGrid}
            label="All"
            active={!category}
            onClick={() => handleCategoryClick("")}
          />
          {categories.map((name) => (
            <CategoryFilterBadge
              key={name}
              icon={getCategoryIcon(name)}
              label={name}
              active={category === name}
              onClick={() => handleCategoryClick(name)}
            />
          ))}
        </div>

        {canScrollRight ? (
          <button
            type="button"
            onClick={() => scrollCategories(1)}
            aria-label="Scroll categories right"
            className="absolute -right-3 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg-card text-text-secondary shadow-md transition-colors hover:text-text-primary"
          >
            <ChevronRight className="size-4" />
          </button>
        ) : null}
      </div>

      <h1 className="mt-6 text-3xl font-extrabold text-text-primary sm:text-4xl">
        {q ? `Results for "${q}"` : "Browse gigs"}
      </h1>
      <p className="mt-1 text-text-secondary">
        {loading
          ? "Searching..."
          : `${result.total} gig${result.total === 1 ? "" : "s"} · Vetted freelancers · Escrow protected`}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <GigFiltersSidebar
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={(updates) => updateParams(updates)}
          maxDeliveryDays={maxDeliveryDays}
          onDeliveryChange={(value) => updateParams({ maxDeliveryDays: value })}
        />

        <div>
          <div className="flex items-center justify-end">
            <Select value={sort} onValueChange={(value) => updateParams({ sort: value })}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? <LoadingState label="Loading gigs..." /> : null}
          {error ? <p className="mt-4 text-danger-text">{error}</p> : null}

          {!loading && !error && result.gigs.length === 0 ? (
            <p className="mt-8 text-text-secondary">No gigs match your filters yet.</p>
          ) : null}

          {!loading && !error && result.gigs.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.gigs.map((gig) => (
                <GigCard key={gig._id} gig={gig} />
              ))}
            </div>
          ) : null}

          {!loading && !error && result.totalPages > 1 ? (
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => updateParams({ page: page - 1 }, { resetPage: false })}
              >
                Previous
              </Button>
              <span className="text-sm text-text-secondary">
                Page {page} of {result.totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= result.totalPages}
                onClick={() => updateParams({ page: page + 1 }, { resetPage: false })}
              >
                Next
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default GigBrowseContent;
