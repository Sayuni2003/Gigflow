import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { ROUTES } from "../../utils/constants";

const STEPS = [
  { title: "Freelancer posts a gig" },
  { title: "Client browses and orders" },
  { title: "Client pays into escrow" },
  { title: "Freelancer delivers" },
  { title: "Approve and rate" },
];

const StepIndicator = () => (
  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success-soft text-success-text">
    <Check className="size-4" />
  </span>
);

const HowItWorks = () => {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            How it works
          </p>
          <h2 className="mt-2 text-3xl font-extrabold leading-tight text-text-primary sm:text-4xl">
            Simple steps.
            <br />
            <span className="text-primary">Secure outcome.</span>
          </h2>
          <p className="mt-4 max-w-md text-text-secondary">
            Freelancers post gigs. Clients order and pay securely. Funds only
            move when the work is approved.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary-hover">
              <Link to={ROUTES.browseGigs}>Browse gigs</Link>
            </Button>
            <Button type="button" variant="outline">
              Post a gig
            </Button>
          </div>
        </div>

        <div className="divide-y divide-divider rounded-xl border border-border bg-bg-card px-5">
          {STEPS.map((step) => (
            <div key={step.title} className="flex items-center gap-4 py-4">
              <StepIndicator />
              <div>
                <p className="font-medium text-text-primary">{step.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
