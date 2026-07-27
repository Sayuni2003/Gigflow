import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "./button";
import { cn } from "../../lib/utils";

const BackButton = ({ className, ...props }) => {
  const navigate = useNavigate();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => navigate(-1)}
      className={cn("text-text-secondary hover:text-text-primary", className)}
      {...props}
    >
      <ArrowLeft className="size-4" />
      Back
    </Button>
  );
};

export default BackButton;
