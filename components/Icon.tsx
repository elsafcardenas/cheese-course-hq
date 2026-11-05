"use client";

import {
  Award,
  Mail,
  Search as SearchIcon,
  Eye,
  Camera,
  Clock,
  Hash,
  Lightbulb,
  MessageCircle,
  Mic,
  PenLine,
  Ruler,
  Zap,
  BookOpen,
  Boxes,
  Building2,
  CalendarDays,
  ChartLine,
  CircleCheckBig,
  Film,
  Flag,
  Gift,
  CircleHelp,
  House,
  List,
  ListChecks,
  Megaphone,
  Plug,
  Route,
  Scale,
  Share2,
  Star,
  Store,
  UserCog,
  Users,
  UtensilsCrossed,
  Wallet,
  WandSparkles,
  Wrench,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  home: House,
  megaphone: Megaphone,
  calendar: CalendarDays,
  "check-circle": CircleCheckBig,
  share: Share2,
  chart: ChartLine,
  wand: WandSparkles,
  eye: Eye,
  route: Route,
  film: Film,
  store: Store,
  gift: Gift,
  users: Users,
  "list-check": ListChecks,
  boxes: Boxes,
  wrench: Wrench,
  utensils: UtensilsCrossed,
  wallet: Wallet,
  star: Star,
  flag: Flag,
  building: Building2,
  list: List,
  scale: Scale,
  book: BookOpen,
  plug: Plug,
  "user-cog": UserCog,
  help: CircleHelp,
  camera: Camera,
  clock: Clock,
  hash: Hash,
  idea: Lightbulb,
  message: MessageCircle,
  voice: Mic,
  pen: PenLine,
  ruler: Ruler,
  zap: Zap,
  award: Award,
  mail: Mail,
  search: SearchIcon,
};

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const C = ICONS[name] ?? House;
  return <C {...props} />;
}

/** A rounded tile in the department's colour with its icon. */
export function IconTile({ name, tone, size = 34 }: { name: string; tone: string; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-xl"
      style={{ width: size, height: size, background: `rgb(var(${tone}) / 0.14)`, color: `rgb(var(${tone}))` }}
    >
      <Icon name={name} size={Math.round(size * 0.5)} strokeWidth={2} />
    </span>
  );
}
