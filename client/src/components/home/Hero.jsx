import { useState } from "react";
import { ArrowRight, Search, ShieldCheck } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";

const FREELANCERS = [
  { initials: "A", name: "Amara O.", role: "Design", match: "96%" },
  { initials: "S", name: "Sofia R.", role: "SEO writer", match: "92%" },
  { initials: "Y", name: "Yuki T.", role: "Video editor", match: "88%" },
];

const Hero = () => {
  const [query, setQuery] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:py-24">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full bg-success-soft px-3 py-1 text-sm font-medium text-success-text">
          <span className="size-2 rounded-full bg-success" />
          48,213 freelancers online now
        </span>

        <h1 className="mt-5 text-4xl font-extrabold leading-tight text-text-primary sm:text-5xl">
          Find the <span className="text-primary">perfect gig</span>, ship
          without the wait.
        </h1>

        <p className="mt-5 max-w-md text-lg text-text-secondary">
          GigFlow connects you with vetted freelancers in design, dev,
          marketing and more — matched in minutes, paid on delivery.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try 'logo designer', 'React developer'..."
              className="h-11 pl-9"
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

      <div className="relative mx-auto w-full max-w-sm">
        <Card className="gap-4 p-5 transition-transform duration-300 hover:-translate-y-1">
          {FREELANCERS.map((freelancer) => (
            <div
              key={freelancer.name}
              className="group -mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-bg-soft"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary transition-transform group-hover:scale-110">
                  {freelancer.initials}
                </span>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{freelancer.name}</p>
                  <p className="text-xs text-text-muted">{freelancer.role}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-success-text">{freelancer.match}</span>
            </div>
          ))}

          <Button className="w-full bg-primary text-primary-foreground transition-transform hover:scale-[1.02] hover:bg-primary-hover">
            Hire in one click
          </Button>
        </Card>

        <Card className="absolute -bottom-6 -right-4 hidden flex-row items-center gap-2 px-4 py-3 shadow-lg transition-transform duration-300 hover:-translate-y-1 sm:flex">
          <ShieldCheck className="size-5 text-success-text" />
          <div>
            <p className="text-xs font-semibold text-text-primary">Payment released</p>
            <p className="text-xs text-text-muted">$480 · Escrow secure</p>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default Hero;
