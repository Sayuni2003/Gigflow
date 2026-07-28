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

export const getCategoryIcon = (name) => CATEGORY_ICONS[name] || Sparkles;
