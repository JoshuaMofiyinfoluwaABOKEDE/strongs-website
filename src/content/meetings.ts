/**
 * The two weekly meetings at the heart of STRONGS, both led by the founder.
 * Change a day, time or place here and it updates on every page.
 */

export type Meeting = {
  id: string;
  name: string;
  short: string;
  day: string;
  time: string;
  where: string;
  whereNote: string;
  online: boolean;
  purpose: string;
  description: string;
  whatHappens: string[];
  recent: { title: string; text: string; date: string; image?: string }[];
  /** A short note on how the meeting has changed over time. */
  history?: string;
  scripture: { text: string; reference: string };
};

export const meetingsLeader = {
  name: "Joshua Mofiyinfoluwa ABOKEDE",
  role: "Founder and General Coordinator",
  photo: "/images/people/abokede.webp",
};

export const meetings: Meeting[] = [
  {
    id: "bible-club",
    name: "STRONGS Bible Club",
    short: "Bible Club",
    day: "Every Monday",
    time: "6:00pm",
    where: "Agbeke Hostel Conference Hall, opposite Nurudeen Grammar School, Under-G, Ogbomoso",
    whereNote: "In person",
    online: false,
    purpose: "Grounding believers in the Word",
    description:
      "A systematic and expository study of the Scriptures. Week by week we open one book of the Bible and work through it verse by verse, so that believers know what they believe, why they believe it, and how it must be lived.",
    whatHappens: [
      "One book of the Bible taken passage by passage",
      "Plain explanation of the text, then its application",
      "Questions, discussion and prayer",
      "Open to believers of every church",
    ],
    recent: [
      {
        title: "The grave humiliation in the costly neglect of humility",
        text: "James 4:6–10, from the systematic and expository study of James",
        date: "Monday 1 June 2026",
        image: "/images/flyers/bible-club-james-humility.webp",
      },
      {
        title: "A new series: the Epistle of James",
        text: "The study of James, chapter by chapter",
        date: "2025",
        image: "/images/flyers/bible-club-james.webp",
      },
      {
        title: "Be cautioned, be comforted: all things are yours",
        text: "1 Corinthians 3:16–23, from the study of 1 Corinthians",
        date: "2025",
        image: "/images/flyers/bible-club-1cor.webp",
      },
    ],
    history: "Until 2026 the Bible Club met online every Sunday at 6:30pm as the Sunday Bible Club. It now meets in person every Monday at 6pm.",
    scripture: {
      text: "Study to shew thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth.",
      reference: "2 Timothy 2:15",
    },
  },
  {
    id: "evangelism-training",
    name: "Evangelism and Follow-up Training",
    short: "Evangelism Training",
    day: "Every Sunday",
    time: "7:00pm",
    where: "The STRONGS Bible Club WhatsApp group",
    whereNote: "Online",
    online: true,
    purpose: "Equipping believers to win souls and keep them",
    description:
      "Every week believers are trained to share the gospel clearly, to lead a seeking soul to Christ from the Bible, and to follow up new converts until they stand. This is where the crusade, school and campus labourers of STRONGS are made.",
    whatHappens: [
      "Teaching on the message we preach",
      "Practical soul-winning: how to present Christ and answer questions",
      "Follow-up: caring for new converts until they are rooted in a church",
      "Preparation for crusades and outreaches",
    ],
    recent: [
      {
        title: "Our Reward in Heaven",
        text: "Why the soul winner labours with eternity in view",
        date: "Sunday 6 September 2026",
        image: "/images/flyers/training-reward-in-heaven.webp",
      },
      {
        title: "The Great Tribulation",
        text: "Preaching the coming judgement with urgency and clarity",
        date: "Sunday 16 August 2026",
        image: "/images/flyers/training-great-tribulation.webp",
      },
      {
        title: "The Singularity of the Gospel",
        text: "1 Corinthians 15:1–4: the one gospel we preach",
        date: "June 2026",
        image: "/images/flyers/training-singularity-gospel.webp",
      },
      {
        title: "Diligent planning and strategising in soul-winning",
        text: "Winning souls with prayer, planning and order",
        date: "Sunday 24 May 2026",
        image: "/images/flyers/training-diligent-planning.webp",
      },
    ],
    scripture: {
      text: "The fruit of the righteous is a tree of life; and he that winneth souls is wise.",
      reference: "Proverbs 11:30",
    },
  },
];

export type Study = { title: string; passage: string; date: string; image?: string };

/** Every Bible Club study we have a record of, grouped by series. Newest series first. */
export const studyArchive: { series: string; note: string; studies: Study[] }[] = [
  {
    series: "The Epistle of James",
    note: "A systematic and expository study, begun June 2025",
    studies: [
      { title: "The grave humiliation in the costly neglect of humility", passage: "James 4:6–10", date: "1 June 2026", image: "/images/flyers/bible-club-james-humility.webp" },
      { title: "Lights birthed by the word of truth", passage: "James 1:16–18", date: "20 July 2025", image: "/images/flyers/bc-2025-07-20.webp" },
      { title: "Lust: the root of every temptation", passage: "James 1:12–15", date: "13 July 2025", image: "/images/flyers/bc-2025-07-13.webp" },
      { title: "Unwavering faith in Christ", passage: "James 1:5–8", date: "22 June 2025", image: "/images/flyers/bc-2025-06-22.webp" },
      { title: "Trials: God's tool of working patience in us", passage: "James 1:1–4", date: "15 June 2025", image: "/images/flyers/bc-2025-06-15.webp" },
    ],
  },
  {
    series: "The First Epistle to the Corinthians",
    note: "A systematic and expository study, February to May 2025",
    studies: [
      { title: "Leading the flock of Christ and faithfully following His precept", passage: "1 Corinthians 4:14–21", date: "18 May 2025", image: "/images/flyers/bc-2025-05-18.webp" },
      { title: "The command for labourers and members to stay lowly, humble and meek (2)", passage: "1 Corinthians 4:6–13", date: "4 May 2025", image: "/images/flyers/bc-2025-05-04.webp" },
      { title: "The command for labourers and members to stay lowly, humble and meek", passage: "1 Corinthians 4:6–13", date: "27 April 2025", image: "/images/flyers/bc-2025-04-27.webp" },
      { title: "The trivial forwardness among talkative believers", passage: "1 Corinthians 4:3–5", date: "20 April 2025", image: "/images/flyers/bc-2025-04-20.webp" },
      { title: "Faithful stewards of the mystery of Christ", passage: "1 Corinthians 4:1–3", date: "12 April 2025", image: "/images/flyers/bc-2025-04-12.webp" },
      { title: "Be cautioned, be comforted: all things are yours", passage: "1 Corinthians 3:16–23", date: "6 April 2025", image: "/images/flyers/bc-2025-04-06.webp" },
      { title: "Building with God with the view of eternity and following the scriptural pattern", passage: "1 Corinthians 3:10–15", date: "29 March 2025", image: "/images/flyers/bc-2025-03-29.webp" },
      { title: "The commitment of labouring planters and waterers", passage: "1 Corinthians 3:6–9", date: "23 March 2025", image: "/images/flyers/bc-2025-03-23.webp" },
      { title: "The divine calling and distinct commission of unselfish preachers and watchmen", passage: "1 Corinthians 3:4–5", date: "16 March 2025", image: "/images/flyers/bc-2025-03-16.webp" },
      { title: "Curing the disease of carnality before possible spiritual growth", passage: "1 Corinthians 3:1–3", date: "8 March 2025", image: "/images/flyers/bc-2025-03-08.webp" },
      { title: "The revelation of the things of God by the Holy Spirit to spiritual men", passage: "1 Corinthians 2:9–16", date: "23 February 2025", image: "/images/flyers/bc-2025-02-23.webp" },
    ],
  },
  {
    series: "Special broadcasts",
    note: "Messages given outside the book studies",
    studies: [
      { title: "Towards the 60 Days of Fasting and Prayer (1)", passage: "Preparing for the March–April fast", date: "9 February 2025", image: "/images/flyers/bc-2025-02-09.webp" },
      { title: "Living in the reality of the invisible", passage: "", date: "2 February 2025", image: "/images/flyers/bc-2025-02-02.webp" },
    ],
  },
];

/** The three seasons of fasting and prayer held every year. */
export const prayerSeasons = [
  {
    title: "21 Days of Fasting and Prayer",
    when: "1–21 January",
    text: "The year opens in prayer.",
    past: [
      { year: "2026", theme: "Uphold Me", note: "Isaiah 41:10; 42:6", image: "/images/flyers/fasting-21-days-26.webp" },
    ],
  },
  {
    title: "60 Days of Fasting and Prayer",
    when: "1 March – 30 April",
    text: "Two months of seeking God for the harvest and the labourers.",
    past: [
      { year: "2026", theme: "Anointed for the End-Time Harvest", note: "6pm–9pm daily, Lico Field, LAUTECH, Ogbomoso, and other locations", image: "/images/flyers/fasting-60-days-anointed.webp" },
      { year: "2025", theme: "That I May Know Him", note: "5:30am–6:30am and 10pm–11pm every day", image: "/images/flyers/fasting-60-days-25.webp" },
    ],
  },
  {
    title: "21 Days of Fasting and Prayer",
    when: "1–21 September",
    text: "Prayer for the last quarter of the year: the crusades, conferences and outreaches ahead.",
    past: [] as { year: string; theme: string; note: string; image: string }[],
  },
];

/** The weekly Bible Club for children, run by the Children Mission. */
export const childrenClub = {
  name: "STRONGS Children's Bible Club",
  day: "Every Saturday",
  time: "10:00am",
  leader: "Favour Abigail AYANDARE",
  href: "/missions/#children",
};
