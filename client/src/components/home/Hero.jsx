import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import heroImage from "../../assets/hero.jpg";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ROUTES } from "../../utils/constants";

const Hero = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmed = query.trim();
    navigate(
      trimmed
        ? `${ROUTES.browseGigs}?q=${encodeURIComponent(trimmed)}`
        : ROUTES.browseGigs,
    );
  };

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 scale-110 bg-cover bg-center blur-5xl"
        style={{ backgroundImage: `url(${heroImage})` }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroImage})`,
          maskImage:
            "radial-gradient(ellipse 90% 85% at center, black 55%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 85% at center, black 55%, transparent 100%)",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />

      <div className="relative mx-auto max-w-7xl px-5 py-24 lg:py-32">
        <div className="max-w-xl">
          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            Browse. <span className="text-primary">Order.</span> Delivered.
          </h1>

          <p className="mt-5 max-w-md text-lg text-white/80">
            Find the right gig, pay securely into escrow, receive high-quality
            work, and review your freelancer when the job is done.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try 'logo designer', 'React developer'..."
                className="h-11 bg-white pl-9 text-text-primary"
              />
            </div>
            <Button
              type="submit"
              className="h-11 bg-cta px-5 text-cta-text transition-transform hover:scale-[1.03] hover:bg-cta-hover"
            >
              Search gigs
              <ArrowRight className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Hero;
