import { useEffect, useState } from "react";
import {
  Brush,
  Code2,
  Database,
  Languages,
  Megaphone,
  Palette,
  PenLine,
  Smartphone,
  Sparkles,
  TrendingUp,
  Video,
} from "lucide-react";
import { getCategories } from "../../api/gigApi";
import LoadingState from "../ui/LoadingState";
import { Card } from "../ui/card";

const CATEGORY_ICONS = {
  "Web Development": Code2,
  "Mobile Development": Smartphone,
  "UI/UX Design": Palette,
  "Graphic Design": Brush,
  "Content Writing": PenLine,
  "Digital Marketing": Megaphone,
  "Video Editing": Video,
  "Data Entry": Database,
  Translation: Languages,
  SEO: TrendingUp,
};

const getCategoryIcon = (name) => CATEGORY_ICONS[name] || Sparkles;

const CategoryGrid = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getCategories();
        if (!cancelled) {
          setCategories(response?.data?.data || []);
        }
      } catch {
        if (!cancelled) {
          setError("Couldn't load categories.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-5 py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">
            Browse by category
          </h2>
          <p className="mt-1 text-text-secondary">
            A specialist for every corner of your business.
          </p>
        </div>
      </div>

      {loading ? <LoadingState label="Loading categories..." /> : null}
      {error ? <p className="mt-4 text-danger-text">{error}</p> : null}

      {!loading && !error ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((name) => {
            const Icon = getCategoryIcon(name);

            return (
              <Card
                key={name}
                className="group cursor-pointer gap-3 border-border p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-md"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-lg bg-primary-soft text-primary transition-transform duration-200 group-hover:scale-110">
                  <Icon className="size-5" />
                </span>
                <p className="font-semibold text-text-primary">{name}</p>
              </Card>
            );
          })}
        </div>
      ) : null}
    </section>
  );
};

export default CategoryGrid;
