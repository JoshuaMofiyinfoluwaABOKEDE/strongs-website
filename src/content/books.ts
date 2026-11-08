/** STRONGS books. Each book can have articles drawn from it (see book-articles.json). */
export type Book = {
  slug: string;
  title: string;
  author: string;
  authorBio: string;
  cover: string;
  pdf: string;
  pages: number;
  foreword: string;
  summary: string;
  chapters: string[];
};

export const books: Book[] = [
  {
    slug: "the-transitioning-phase-of-mans-life",
    title: "The Transitioning Phase of Man's Life",
    author: "Ruth Oduola",
    authorBio:
      "A Registered Nurse and Midwife and a teacher of God's word, with a passion to see young men and women burn for Him in the prime of their age. She leads the STRONGS Medical Mission.",
    cover: "/images/flyers/oduola-book.webp",
    pdf: "/books/the-transitioning-phase-of-mans-life.pdf",
    pages: 42,
    foreword: "Pastor Adeola Oduola",
    summary:
      "The book likens a man's life to a day: it starts at midnight, then comes the dawn, the bright morning, the sunny afternoon; then the sun sets, twilight follows, and finally night falls. Written for every young person who wants to keep burning for God, it calls the reader to discover God's purpose early, spend the strength of youth well, and stay faithful through the busy years of adulthood.",
    chapters: ["Before I formed thee", "The teen years", "The time of strength (the youthful age)", "The hustling and bustling years (adulthood)"],
  },
];
