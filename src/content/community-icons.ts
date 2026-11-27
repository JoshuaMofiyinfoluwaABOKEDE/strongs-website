import { Book, Briefcase, Camera, Lightbulb, Mic, Music, Pen, People } from "@/components/icons";

/** One icon for each STRONGS community, by its short name. */
export const communityIcons: Record<string, typeof Book> = {
  Writers: Pen,
  Musicians: Music,
  Teenagers: People,
  Intellectuals: Lightbulb,
  Creatives: Camera,
  Speakers: Mic,
  "Young Professionals": Briefcase,
  Readers: Book,
};
