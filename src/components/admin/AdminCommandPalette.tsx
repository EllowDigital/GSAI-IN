import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import {
  Home,
  UserPlus,
  Users,
  BadgeDollarSign,
  Dumbbell,
  Swords,
  Calendar,
  Trophy,
  BookOpen,
  Newspaper,
  Image as GalleryIcon,
  MessageSquare,
  Megaphone,
  Info,
  RefreshCw,
  Globe,
} from 'lucide-react';

export type AdminCommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
};

const NAV_COMMANDS = [
  { label: 'Dashboard', url: '/admin/dashboard', icon: Home },
  {
    label: 'Enrollment Requests',
    url: '/admin/dashboard/enrollments',
    icon: UserPlus,
  },
  { label: 'Students', url: '/admin/dashboard/students', icon: Users },
  {
    label: 'Fee Management',
    url: '/admin/dashboard/fees',
    icon: BadgeDollarSign,
  },
  {
    label: 'Student Progression',
    url: '/admin/dashboard/progression',
    icon: Dumbbell,
  },
  { label: 'Disciplines', url: '/admin/dashboard/disciplines', icon: Swords },
  { label: 'Events', url: '/admin/dashboard/events', icon: Calendar },
  { label: 'Competitions', url: '/admin/dashboard/competitions', icon: Trophy },
  { label: 'Blogs', url: '/admin/dashboard/blogs', icon: BookOpen },
  { label: 'News', url: '/admin/dashboard/news', icon: Newspaper },
  { label: 'Gallery', url: '/admin/dashboard/gallery', icon: GalleryIcon },
  {
    label: 'Testimonials',
    url: '/admin/dashboard/testimonials',
    icon: MessageSquare,
  },
  {
    label: 'Announcements',
    url: '/admin/dashboard/announcements',
    icon: Megaphone,
  },
  { label: 'About', url: '/admin/dashboard/about', icon: Info },
];

export default function AdminCommandPalette({
  open,
  onOpenChange,
  onRefresh,
}: AdminCommandPaletteProps) {
  const navigate = useNavigate();

  const run = React.useCallback(
    (action: () => void) => {
      onOpenChange(false);
      // Defer so the dialog close animation does not block navigation paint.
      window.requestAnimationFrame(action);
    },
    [onOpenChange]
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search pages and actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {NAV_COMMANDS.map((item) => (
            <CommandItem
              key={item.url}
              value={item.label}
              onSelect={() => run(() => navigate(item.url))}
            >
              <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          {onRefresh && (
            <CommandItem value="Refresh data" onSelect={() => run(onRefresh)}>
              <RefreshCw className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Refresh all data</span>
              <CommandShortcut>R</CommandShortcut>
            </CommandItem>
          )}
          <CommandItem
            value="Open public website"
            onSelect={() => run(() => window.open('/', '_blank', 'noopener'))}
          >
            <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Open public website</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
