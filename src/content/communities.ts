/** STRONGS Communities, from the STRONGS Communities concept document. */

export const communityBenefits = [
  "Connect with people who share your interests",
  "Discover and develop your abilities",
  "Learn from experienced people",
  "Exchange knowledge and ideas",
  "Receive mentorship and guidance",
  "Collaborate on meaningful projects",
  "Grow in leadership and people skills",
  "Offer your gifts to God's Kingdom and society",
];

export type Community = {
  name: string;
  short: string;
  focus: string;
  areas: string[];
  activities: string[];
  flagship?: string;
  note?: string;
};

export const communities: Community[] = [
  {
    name: "Writers' Community",
    short: "Writers",
    focus: "Writing, literature, publishing and communication, for aspiring and established writers.",
    flagship: "Writers' Symposium",
    areas: ["Creative writing", "Fiction and nonfiction", "Christian literature", "Poetry and spoken word", "Copywriting", "Content writing", "Academic and research writing", "Scriptwriting", "Editing and proofreading", "Publishing and authorship", "Journalism and storytelling"],
    activities: ["Writers' Hangout", "Writers' Symposium", "Writing workshops", "Monthly writing challenges", "Book and manuscript reviews", "Author interviews", "Collaborative publications", "Writing competitions"],
  },
  {
    name: "Musicians' Community",
    short: "Musicians",
    focus: "Singers, instrumentalists, composers and producers growing in music and worship.",
    areas: ["Vocal development", "Instrumental music", "Music theory", "Songwriting and composition", "Music production", "Choral music", "Worship leadership", "Sound engineering", "Music arrangement", "Music technology"],
    activities: ["Musicians' Hangout", "Musicians' Symposium", "Songwriting sessions", "Music workshops", "Vocal development classes", "Instrumental training", "Music production masterclasses", "Collaborative musical projects", "Competitions and showcases"],
  },
  {
    name: "Teenagers' Community",
    short: "Teenagers",
    focus: "Spiritual, intellectual, moral and personal growth for teenagers.",
    flagship: "Teenagers' Symposium",
    areas: ["Christian faith and spiritual growth", "Identity and purpose", "Character development", "Academic excellence", "Critical thinking", "Communication", "Leadership", "Relationships and peer pressure", "Digital literacy and safety", "Career discovery", "Personal discipline"],
    activities: ["Teenagers' Symposium", "Teenagers' Hangout", "Question and answer sessions", "Academic development sessions", "Career discovery programmes", "Leadership workshops", "Reading challenges", "Mentorship sessions", "Talent exhibitions"],
    note: "Runs with parental consent, adult supervision, a safeguarding policy and carefully moderated communication channels.",
  },
  {
    name: "Intellectuals' Community",
    short: "Intellectuals",
    focus: "Critical thinking, philosophy, research, apologetics and serious discussion.",
    areas: ["Philosophy", "Christian apologetics", "Science and faith", "Logic and critical thinking", "Theology", "History", "Psychology", "Politics and society", "Research and scholarship", "Contemporary issues", "Debate"],
    activities: ["Intellectuals' Symposium", "Public lectures", "Debates", "Research presentations", "Reading circles", "Panel discussions", "Academic writing workshops", "Interdisciplinary conversations"],
  },
  {
    name: "Creatives' Community",
    short: "Creatives",
    focus: "Graphic design, photography, filmmaking, art and creative expression.",
    areas: ["Graphic design", "UI/UX design", "Photography", "Videography", "Filmmaking", "Animation", "Motion graphics", "Illustration", "Branding", "Creative direction", "Digital art", "AI-assisted creativity"],
    activities: ["Creatives' Hangout", "Design workshops", "Portfolio reviews", "Creative challenges", "Photography exhibitions", "Film screenings", "Design competitions", "Creative business masterclasses"],
  },
  {
    name: "Speakers' Community",
    short: "Speakers",
    focus: "Public speaking, debate, preaching, teaching and presentation.",
    areas: ["Public speaking", "Persuasive communication", "Speech writing", "Debate", "Presentation skills", "Preaching", "Teaching", "Storytelling", "Leadership communication"],
    activities: ["Speakers' Hangout", "Public speaking exercises", "Debate sessions", "Speech competitions", "Presentation workshops", "Speech evaluation", "Guest speaker sessions", "Communication masterclasses"],
  },
  {
    name: "Young Professionals' Community",
    short: "Young Professionals",
    focus: "Career growth, entrepreneurship and the workplace, for students, graduates and professionals.",
    areas: ["Career development", "Professional ethics", "Entrepreneurship", "Business development", "Financial literacy", "Networking", "Leadership", "Remote work and freelancing", "Personal branding", "Professional mentorship"],
    activities: ["Professionals' Hangout", "Career development sessions", "Mentorship programmes", "Professional networking", "Entrepreneurship masterclasses", "Job and opportunity sharing", "Industry experience sessions"],
  },
  {
    name: "Readers' Community",
    short: "Readers",
    focus: "A strong reading culture through books, discussion and accountability.",
    areas: ["Christian literature", "Personal development", "Philosophy", "History", "Science", "Fiction", "Biography", "Leadership", "Theology"],
    activities: ["Reading Hangout", "Monthly reading challenges", "Book discussions", "Book reviews", "Author conversations", "Reading accountability", "Book recommendation sessions"],
  },
];

export const rhythm = [
  { name: "The Hangout", purpose: "Connection", text: "An informal gathering to meet, talk, share experiences and build friendships." },
  { name: "The Symposium", purpose: "Knowledge exchange", text: "A central theme, keynotes, guest speakers, panels and questions." },
  { name: "The Masterclass", purpose: "Practical skill", text: "Experienced people teach a specific skill, from publishing a book to public speaking." },
  { name: "The Challenge", purpose: "Application", text: "Put learning to work: a 30-day writing, songwriting, photography or reading challenge." },
  { name: "The Project", purpose: "Producing together", text: "An anthology, a recording, a short film, a public debate, a set of book reviews." },
];
