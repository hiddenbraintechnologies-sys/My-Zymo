import { Card } from "@/components/ui/card";
import { format } from "date-fns";

interface InvitationTemplate {
  id: string;
  name: string;
  category: string;
  gradient: string;
  accentColor: string;
  pattern: string;
  textColor: string;
}

interface InvitationCardRendererProps {
  templateData: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  className?: string;
}

const TEMPLATES: Record<string, InvitationTemplate> = {
  "diwali-golden": {
    id: "diwali-golden",
    name: "Golden Diwali",
    category: "Diwali Celebration",
    gradient: "from-amber-500 via-orange-500 to-red-500",
    accentColor: "amber-300",
    pattern: "diyas",
    textColor: "white",
  },
  "diwali-purple": {
    id: "diwali-purple",
    name: "Royal Diwali",
    category: "Diwali Celebration",
    gradient: "from-purple-600 via-pink-500 to-orange-500",
    accentColor: "pink-300",
    pattern: "rangoli",
    textColor: "white",
  },
  "holi-rainbow": {
    id: "holi-rainbow",
    name: "Colorful Holi",
    category: "Holi Celebration",
    gradient: "from-pink-500 via-purple-500 to-blue-500",
    accentColor: "pink-300",
    pattern: "splashes",
    textColor: "white",
  },
  "holi-vibrant": {
    id: "holi-vibrant",
    name: "Vibrant Holi",
    category: "Holi Celebration",
    gradient: "from-yellow-400 via-green-400 to-cyan-400",
    accentColor: "green-300",
    pattern: "colors",
    textColor: "gray-800",
  },
  "birthday-confetti": {
    id: "birthday-confetti",
    name: "Party Confetti",
    category: "Birthday Party",
    gradient: "from-pink-500 via-purple-500 to-indigo-500",
    accentColor: "pink-300",
    pattern: "confetti",
    textColor: "white",
  },
  "birthday-golden": {
    id: "birthday-golden",
    name: "Golden Celebration",
    category: "Birthday Party",
    gradient: "from-amber-400 via-yellow-500 to-orange-400",
    accentColor: "yellow-200",
    pattern: "sparkles",
    textColor: "gray-800",
  },
  "birthday-fun": {
    id: "birthday-fun",
    name: "Fun Party",
    category: "Birthday Party",
    gradient: "from-cyan-400 via-blue-500 to-purple-500",
    accentColor: "cyan-300",
    pattern: "balloons",
    textColor: "white",
  },
  "wedding-elegant": {
    id: "wedding-elegant",
    name: "Elegant Wedding",
    category: "Wedding",
    gradient: "from-rose-300 via-pink-200 to-amber-200",
    accentColor: "rose-400",
    pattern: "floral",
    textColor: "gray-800",
  },
  "wedding-royal": {
    id: "wedding-royal",
    name: "Royal Wedding",
    category: "Wedding",
    gradient: "from-amber-600 via-yellow-500 to-amber-400",
    accentColor: "amber-300",
    pattern: "mandala",
    textColor: "white",
  },
  "wedding-modern": {
    id: "wedding-modern",
    name: "Modern Wedding",
    category: "Wedding",
    gradient: "from-slate-700 via-gray-600 to-slate-500",
    accentColor: "amber-400",
    pattern: "geometric",
    textColor: "white",
  },
  "reunion-classic": {
    id: "reunion-classic",
    name: "Classic Reunion",
    category: "College Reunion",
    gradient: "from-blue-600 via-indigo-600 to-purple-600",
    accentColor: "blue-300",
    pattern: "caps",
    textColor: "white",
  },
  "reunion-nostalgic": {
    id: "reunion-nostalgic",
    name: "Nostalgic Memories",
    category: "School Reunion",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    accentColor: "emerald-300",
    pattern: "books",
    textColor: "white",
  },
  "corporate-professional": {
    id: "corporate-professional",
    name: "Professional Event",
    category: "Corporate Event",
    gradient: "from-slate-800 via-gray-700 to-slate-600",
    accentColor: "blue-400",
    pattern: "lines",
    textColor: "white",
  },
  "corporate-modern": {
    id: "corporate-modern",
    name: "Modern Corporate",
    category: "Corporate Event",
    gradient: "from-blue-700 via-blue-600 to-indigo-600",
    accentColor: "cyan-300",
    pattern: "dots",
    textColor: "white",
  },
  "engagement-romantic": {
    id: "engagement-romantic",
    name: "Romantic Engagement",
    category: "Engagement",
    gradient: "from-rose-400 via-pink-400 to-red-400",
    accentColor: "rose-200",
    pattern: "hearts",
    textColor: "white",
  },
  "anniversary-golden": {
    id: "anniversary-golden",
    name: "Golden Anniversary",
    category: "Anniversary",
    gradient: "from-amber-500 via-yellow-400 to-amber-300",
    accentColor: "amber-200",
    pattern: "rings",
    textColor: "gray-800",
  },
  "baby-shower-pink": {
    id: "baby-shower-pink",
    name: "Baby Girl Shower",
    category: "Baby Shower",
    gradient: "from-pink-400 via-rose-300 to-pink-200",
    accentColor: "pink-100",
    pattern: "stars",
    textColor: "gray-800",
  },
  "baby-shower-blue": {
    id: "baby-shower-blue",
    name: "Baby Boy Shower",
    category: "Baby Shower",
    gradient: "from-blue-400 via-cyan-300 to-blue-200",
    accentColor: "blue-100",
    pattern: "clouds",
    textColor: "gray-800",
  },
  "christmas-festive": {
    id: "christmas-festive",
    name: "Festive Christmas",
    category: "Christmas Party",
    gradient: "from-red-600 via-red-500 to-green-600",
    accentColor: "yellow-300",
    pattern: "snowflakes",
    textColor: "white",
  },
  "newyear-sparkle": {
    id: "newyear-sparkle",
    name: "New Year Sparkle",
    category: "New Year Party",
    gradient: "from-indigo-900 via-purple-800 to-pink-700",
    accentColor: "yellow-400",
    pattern: "fireworks",
    textColor: "white",
  },
  "eid-elegant": {
    id: "eid-elegant",
    name: "Elegant Eid",
    category: "Eid Celebration",
    gradient: "from-emerald-600 via-teal-500 to-cyan-500",
    accentColor: "yellow-300",
    pattern: "crescent",
    textColor: "white",
  },
  "housewarming-warm": {
    id: "housewarming-warm",
    name: "Warm Welcome",
    category: "Housewarming",
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    accentColor: "orange-200",
    pattern: "home",
    textColor: "white",
  },
};

const getPatternSVG = (pattern: string) => {
  switch (pattern) {
    case "diyas":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" opacity="0.15"><path d="M30 10 L35 25 L25 25 Z" fill="currentColor"/><circle cx="30" cy="8" r="3" fill="currentColor"/></svg>`;
    case "rangoli":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" opacity="0.1"><circle cx="30" cy="30" r="20" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="30" cy="30" r="10" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;
    case "confetti":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" opacity="0.15"><rect x="10" y="10" width="6" height="6" fill="currentColor" transform="rotate(30 13 13)"/><rect x="40" y="40" width="6" height="6" fill="currentColor" transform="rotate(-20 43 43)"/><rect x="45" y="15" width="6" height="6" fill="currentColor" transform="rotate(45 48 18)"/></svg>`;
    case "sparkles":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" opacity="0.2"><path d="M30 5 L32 15 L42 17 L32 19 L30 29 L28 19 L18 17 L28 15 Z" fill="currentColor"/></svg>`;
    case "hearts":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" opacity="0.15"><path d="M30 50 C10 30 10 15 25 15 C30 15 30 20 30 20 C30 20 30 15 35 15 C50 15 50 30 30 50" fill="currentColor"/></svg>`;
    case "floral":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" opacity="0.1"><circle cx="30" cy="20" r="8" fill="currentColor"/><circle cx="20" cy="30" r="8" fill="currentColor"/><circle cx="40" cy="30" r="8" fill="currentColor"/><circle cx="30" cy="40" r="8" fill="currentColor"/><circle cx="30" cy="30" r="5" fill="currentColor"/></svg>`;
    case "mandala":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" opacity="0.1"><circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="40" cy="40" r="20" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="40" cy="40" r="10" fill="none" stroke="currentColor" stroke-width="1"/><line x1="40" y1="10" x2="40" y2="70" stroke="currentColor" stroke-width="1"/><line x1="10" y1="40" x2="70" y2="40" stroke="currentColor" stroke-width="1"/></svg>`;
    case "geometric":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" opacity="0.1"><polygon points="30,5 55,55 5,55" fill="none" stroke="currentColor" stroke-width="1"/></svg>`;
    case "snowflakes":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" opacity="0.2"><line x1="30" y1="10" x2="30" y2="50" stroke="currentColor" stroke-width="2"/><line x1="10" y1="30" x2="50" y2="30" stroke="currentColor" stroke-width="2"/><line x1="15" y1="15" x2="45" y2="45" stroke="currentColor" stroke-width="1"/><line x1="45" y1="15" x2="15" y2="45" stroke="currentColor" stroke-width="1"/></svg>`;
    case "fireworks":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" opacity="0.15"><circle cx="30" cy="30" r="3" fill="currentColor"/><line x1="30" y1="10" x2="30" y2="20" stroke="currentColor" stroke-width="2"/><line x1="30" y1="40" x2="30" y2="50" stroke="currentColor" stroke-width="2"/><line x1="10" y1="30" x2="20" y2="30" stroke="currentColor" stroke-width="2"/><line x1="40" y1="30" x2="50" y2="30" stroke="currentColor" stroke-width="2"/></svg>`;
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" opacity="0.1"><circle cx="30" cy="30" r="5" fill="currentColor"/></svg>`;
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "Date TBD";
  try {
    const date = new Date(dateStr);
    return format(date, "EEEE, MMMM d, yyyy 'at' h:mm a");
  } catch {
    return dateStr;
  }
};

export function parseTemplateData(templateDataUrl: string): { templateId: string } | null {
  if (!templateDataUrl.startsWith('template:')) return null;
  const parts = templateDataUrl.split(':');
  return { templateId: parts[1] };
}

export function isTemplateCard(url: string | null | undefined): boolean {
  return !!url && url.startsWith('template:');
}

export function InvitationCardRenderer({
  templateData,
  eventTitle,
  eventDate,
  eventLocation,
  className = "",
}: InvitationCardRendererProps) {
  const parsed = parseTemplateData(templateData);
  if (!parsed) return null;
  
  const template = TEMPLATES[parsed.templateId];
  if (!template) return null;

  const patternDataUrl = `data:image/svg+xml,${encodeURIComponent(getPatternSVG(template.pattern))}`;

  return (
    <div className={`rounded-xl overflow-hidden ${className}`}>
      <div
        className={`bg-gradient-to-br ${template.gradient} p-8 aspect-[4/3] flex flex-col justify-between`}
        style={{
          backgroundImage: `url("${patternDataUrl}")`,
          backgroundRepeat: "repeat",
        }}
      >
        <div className="text-center">
          <div className={`inline-block bg-white/20 backdrop-blur-sm border border-white/30 text-${template.textColor} px-4 py-1 rounded-full text-sm font-medium`}>
            You're Invited
          </div>
        </div>
        <div className="text-center space-y-3">
          <h3 className={`text-2xl font-bold text-${template.textColor} drop-shadow-lg`}>
            {eventTitle || "Event Title"}
          </h3>
          <div className={`text-${template.textColor}/90 drop-shadow space-y-1`}>
            <p className="text-base font-medium">
              {formatDate(eventDate)}
            </p>
            <p className="text-sm">
              {eventLocation || "Location TBD"}
            </p>
          </div>
        </div>
        <div className="text-center">
          <span className={`text-xs text-${template.textColor}/60`}>
            Powered by Myzymo
          </span>
        </div>
      </div>
    </div>
  );
}
