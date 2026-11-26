/**
 * STRONGS School of Theology: the order of tracks and courses.
 * Each course's content lives in src/content/theology/courses/<slug>.json.
 */

export const theologyTracks: { id: string; name: string; blurb: string }[] = [
  { id: "foundations", name: "Foundations: the Bible", blurb: "What the Bible is, how it came to us, and how to read it well." },
  { id: "survey", name: "Bible Survey", blurb: "The whole Bible, book by book, in its story and setting." },
  { id: "god", name: "God, Creation and Humanity", blurb: "Who God is, what He made, and what went wrong." },
  { id: "christ", name: "Christ, the Spirit and Salvation", blurb: "The person and work of Christ, the Holy Spirit, and how God saves." },
  { id: "church", name: "The Church and the Last Things", blurb: "The people of God, their life together, and the hope of the age to come." },
  { id: "living", name: "Christian Living and Ethics", blurb: "Prayer, holiness, family, money and society in the light of Scripture." },
  { id: "history", name: "Church History", blurb: "How the gospel has run from Jerusalem to Nigeria." },
  { id: "ministry", name: "Ministry, Mission and Apologetics", blurb: "Evangelism, preaching, teaching, care, leadership and answering objections." },
];

/** In the order learners should meet them. Foundation courses first in each track. */
export const theologyOrder: { slug: string; track: string }[] = [
  { slug: "introduction-to-theology", track: "foundations" },
  { slug: "the-bible-revelation-and-authority", track: "foundations" },
  { slug: "how-the-bible-came-to-us", track: "foundations" },
  { slug: "interpreting-the-bible", track: "foundations" },

  { slug: "old-testament-survey-law-and-history", track: "survey" },
  { slug: "old-testament-survey-poetry-and-prophets", track: "survey" },
  { slug: "new-testament-survey-gospels-and-acts", track: "survey" },
  { slug: "new-testament-survey-epistles-and-revelation", track: "survey" },

  { slug: "the-doctrine-of-god", track: "god" },
  { slug: "the-holy-trinity", track: "god" },
  { slug: "creation-and-providence", track: "god" },
  { slug: "angels-satan-and-demons", track: "god" },
  { slug: "humanity-in-the-image-of-god", track: "god" },
  { slug: "sin-and-the-fall", track: "god" },

  { slug: "the-person-of-christ", track: "christ" },
  { slug: "the-work-of-christ", track: "christ" },
  { slug: "the-holy-spirit", track: "christ" },
  { slug: "grace-election-and-calling", track: "christ" },
  { slug: "repentance-faith-and-conversion", track: "christ" },
  { slug: "justification-and-adoption", track: "christ" },
  { slug: "sanctification-and-holiness", track: "christ" },
  { slug: "baptism-in-the-spirit-and-spiritual-gifts", track: "christ" },
  { slug: "perseverance-and-assurance", track: "christ" },
  { slug: "divine-healing", track: "christ" },

  { slug: "the-church", track: "church" },
  { slug: "baptism-and-the-lords-supper", track: "church" },
  { slug: "church-government-and-leadership", track: "church" },
  { slug: "death-resurrection-and-judgment", track: "church" },
  { slug: "the-return-of-christ", track: "church" },
  { slug: "heaven-hell-and-the-new-creation", track: "church" },

  { slug: "prayer-and-fasting", track: "living" },
  { slug: "spiritual-growth-and-discipline", track: "living" },
  { slug: "christian-ethics", track: "living" },
  { slug: "marriage-family-and-sexuality", track: "living" },
  { slug: "stewardship-work-and-money", track: "living" },
  { slug: "the-christian-in-society", track: "living" },

  { slug: "church-history-early-and-medieval", track: "history" },
  { slug: "church-history-reformation-to-today", track: "history" },
  { slug: "baptist-history-and-distinctives", track: "history" },
  { slug: "holiness-and-pentecostal-movements", track: "history" },
  { slug: "christianity-in-africa-and-nigeria", track: "history" },

  { slug: "personal-evangelism", track: "ministry" },
  { slug: "missions-theology-and-practice", track: "ministry" },
  { slug: "discipleship-and-follow-up", track: "ministry" },
  { slug: "preaching-the-word", track: "ministry" },
  { slug: "teaching-the-bible", track: "ministry" },
  { slug: "pastoral-care-and-counselling", track: "ministry" },
  { slug: "christian-leadership", track: "ministry" },
  { slug: "christian-apologetics", track: "ministry" },
  { slug: "world-religions-and-cults", track: "ministry" },
];

/** Course settings shared by every theology course. */
export const theologyRules = {
  weights: { exam: 40, test: 20, assignments: 20, quizzes: 20 },
  passMark: 70,
  quiz: { questions: 10, pass: 80 },
  test: { attempts: 3, mcq: 10, short: 2, lists: 1 },
  exam: { mcq: 25, short: 3, lists: 1 },
  declaration: "No AI tools or plagiarism; this is my own work.",
  maxUploadBytes: 4 * 1024 * 1024,
};

/**
 * The catalogue subject each theology course is listed under, alongside the other STRONGS courses
 * (edX-style: one catalogue, browsed by subject; the School of Theology is a programme across subjects).
 */
const trackSubject: Record<string, string> = {
  foundations: "bible",
  survey: "bible",
  god: "theology",
  christ: "theology",
  church: "theology",
  living: "living",
  history: "history",
  ministry: "leadership",
};
const slugSubject: Record<string, string> = {
  "personal-evangelism": "evangelism",
  "missions-theology-and-practice": "evangelism",
  "discipleship-and-follow-up": "evangelism",
};
export function theologySubject(slug: string) {
  return slugSubject[slug] ?? trackSubject[theologyOrder.find((o) => o.slug === slug)?.track ?? ""] ?? "theology";
}
export const theologyCode = (slug: string) => `TH ${String(theologyOrder.findIndex((o) => o.slug === slug) + 1).padStart(3, "0")}`;
