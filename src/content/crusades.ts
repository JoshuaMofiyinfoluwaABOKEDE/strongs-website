/**
 * STRONGS Crusades. The vision and objectives are drafts for the leadership to confirm.
 * Each entry in crusadePages becomes its own page at /crusades/<slug>/.
 * Text in [square brackets] is still to be supplied.
 */

export const crusadeArm = {
  intro:
    "The major evangelistic arm of STRONGS, dedicated to preaching the gospel, reaching communities and bringing people to the knowledge of Jesus Christ.",
  vision:
    "We hold open-air gospel crusades so that whole communities hear the message of Jesus Christ, turn to Him, and are grounded in sound teaching and the local church.",
  objectives: [
    "Proclaim the gospel publicly in open-air meetings.",
    "Call sinners to repentance and faith in Jesus Christ.",
    "Follow up every convert and connect them with a local church.",
    "Equip ministers and workers through crusade conferences.",
    "Show the love of Christ through medical mission and community care.",
  ],
  director: {
    name: "Prophet Wasiu Olawale OYERINDE",
    role: "Crusade Director",
    photo: "/images/people/oyerinde.webp",
    profile:
      "Prophet Oyerinde, known to many as Prophet Bolu, directs the crusade arm of STRONGS. He prepares each town for the gospel through prayer, publicity and the training of counsellors, and he has laboured beside the founder in town and village crusades. [Add his call, years in ministry and the crusades he has led.]",
    responsibilities:
      "He works with each host church and local crusade director on prayer, publicity, counsellors, music, welfare and the crusade budget, and he sees that every convert is followed up and joined to a local church.",
  },
  team: [
    {
      name: "Nurse Ruth O. ODUOLA",
      role: "Head of the Medical Mission",
      text: "Leads the medical outreach and health talks at our crusades.",
      photo: "/images/people/oduola.webp",
    },
    {
      name: "Ev. Godwin Ayorinde OLAEWE",
      role: "Vice President and drama minister",
      text: "Preaches and leads drama ministry on the crusade ground.",
      photo: "/images/people/olaewe.webp",
    },
    {
      name: "Ev. Joshua OYETUNJI",
      role: "Music evangelist (saxophonist)",
      text: "Leads worship before the gospel is preached.",
      photo: "/images/people/oyetunji.webp",
    },
    {
      name: "Blessing AJAYI",
      role: "Music evangelist",
      text: "Ministers in song at our crusades.",
      photo: "/images/people/ajayi.webp",
    },
  ] as { name: string; role: string; text: string; photo?: string }[],
  howItRuns: [
    {
      title: "Prayer first",
      text: "Thirty days of evening prayer before every crusade, a prayer chain through the night, and a day of prayer and fasting on the Sunday before. In prayer we rise or fall.",
    },
    {
      title: "Publicity six weeks ahead",
      text: "Posters, banners, flyers, radio and social media. The best invitation is still a believer, excited about Jesus, bringing a friend.",
    },
    {
      title: "Counsellors trained",
      text: "Counsellors are trained at least four weeks before, to lead enquirers to Christ from the Bible and to record every decision.",
    },
    {
      title: "Wednesday to Sunday",
      text: "The crusade opens on Wednesday evening and closes on Sunday evening. Saturday morning is kept for the Students' and Teens' Fire Conference.",
    },
    {
      title: "No offerings taken",
      text: "We do not take offerings at our crusades. We trust God to move the hearts of His people to support the work.",
    },
    {
      title: "Converts kept",
      text: "Every convert is followed up, welcomed at the converts' rally, joined to a local church and, where possible, gathered into a Bible club.",
    },
  ],
  ongoing: {
    title: "Preparing for Sepeteri",
    text: "Prayer, mobilisation and partnerships for This Same Jesus are under way. [Add what partners can do this month.]",
  },
  testimonies: [
    { text: "[A testimony shared with the person's permission.]", who: "[First name], [Crusade, year]" },
    { text: "[A testimony shared with the person's permission.]", who: "[First name], [Crusade, year]" },
    { text: "[A testimony shared with the person's permission.]", who: "[First name], [Crusade, year]" },
  ],
  partners: [
    { title: "Host churches", text: "Co-host the crusade, send workers and welcome new believers into fellowship." },
    { title: "Partner ministries", text: "Preach, pray and labour alongside us on the field." },
    { title: "Community leaders", text: "Open doors in the town and help us serve with honour." },
    { title: "Values-aligned sponsors", text: "Fund or supply a crusade, with no influence on doctrine." },
  ],
  needs: [
    "Prayer cover",
    "Bibles and follow-up materials",
    "Transport for the team",
    "Feeding of workers",
    "Medical supplies",
    "Venue, sound and stage",
  ],
  volunteerUnits: [
    "Prayer",
    "Counselling and follow-up",
    "Ushering and protocol",
    "Music",
    "Drama",
    "Medical (qualified professionals)",
    "Media",
  ],
};

export type CrusadePage = {
  slug: string;
  title: string;
  /** The title as it appears on the local-language flyer. */
  localTitle?: string;
  coHost?: string;
  flyers?: { src: string; alt: string }[];
  themeScripture: string;
  dates: string;
  /** Start and end, with time zone, for the countdown (e.g. 2026-12-09T16:00:00+01:00). */
  startsAt?: string;
  endsAt?: string;
  venue: string;
  summary: string;
  components: { title: string; text: string }[];
  schedule: { day: string; morning: string; afternoon: string; evening: string }[];
  ministers: { name: string; role: string; photo?: string }[];
  afterwards: string;
};

export const crusadePages: CrusadePage[] = [
  {
    slug: "this-same-jesus",
    title: "This Same Jesus",
    localTitle: "Isoji Aragbayamuyamu ti Sepeteri · Jesu Yi Kan Na",
    coHost: "CAN, Sepeteri",
    themeScripture: "[Theme scripture for the crusade]",
    dates: "Wednesday 9 – Sunday 13 December 2026, 4pm daily",
    startsAt: "2026-12-09T16:00:00+01:00",
    endsAt: "2026-12-13T21:00:00+01:00",
    venue: "Isere Baptist Primary School field, Ladojuko, and First Baptist Church, Isale Igbagbo, Sepeteri, Oyo State",
    summary:
      "Five days of the gospel in Sepeteri with the Christian Association of Nigeria, Sepeteri. The gospel preached to the whole town, ministers and workers equipped for follow-up, and the sick cared for by qualified professionals.",
    flyers: [
      { src: "/images/flyers/this-same-jesus-26.webp", alt: "Crusade flyer: Isoji Aragbayamuyamu ti Sepeteri, theme Jesu Yi Kan Na, 9–13 December 2026, 4pm daily" },
      { src: "/images/flyers/ministers-fire-conference-26.webp", alt: "Flyer: Ministers and Workers Fire Conference, Saturday 12 December 2026, 9am, Oke-Agoro Baptist Church" },
    ],
    components: [
      { title: "Gospel meetings", text: "4pm every day, Wednesday to Sunday" },
      { title: "Ministers' and Workers' Fire Conference", text: "Saturday 12 December, 9am, Oke-Agoro Baptist Church, Oke-Agoro. Theme: Preaching the same Jesus in a changing world with the Spirit's power" },
      { title: "Students' programme", text: "For students and young adults" },
      { title: "Community engagement", text: "Practical connection with the host community" },
      { title: "Medical mission", text: "Led by the STRONGS Medical Mission" },
    ],
    schedule: [
      { day: "Wed 9 Dec", morning: "[To be confirmed]", afternoon: "Gospel meeting, 4pm", evening: "[To be confirmed]" },
      { day: "Thu 10 Dec", morning: "[To be confirmed]", afternoon: "Gospel meeting, 4pm", evening: "[To be confirmed]" },
      { day: "Fri 11 Dec", morning: "[To be confirmed]", afternoon: "Gospel meeting, 4pm", evening: "[To be confirmed]" },
      { day: "Sat 12 Dec", morning: "Ministers' and Workers' Fire Conference, 9am, Oke-Agoro Baptist Church", afternoon: "Gospel meeting, 4pm", evening: "[To be confirmed]" },
      { day: "Sun 13 Dec", morning: "[To be confirmed]", afternoon: "Closing gospel meeting, 4pm", evening: "[To be confirmed]" },
    ],
    ministers: [
      { name: "J. Mofiyinfoluwa ABOKEDE", role: "Founder and General Coordinator, STRONGS", photo: "/images/people/abokede.webp" },
      { name: "Prophet Wasiu Olawale (Bolu) OYERINDE", role: "Crusade Director", photo: "/images/people/oyerinde.webp" },
      { name: "Ev. Godwin Ayorinde OLAEWE", role: "Vice President, STRONGS", photo: "/images/people/olaewe.webp" },
      { name: "Prophet Ogundeji", role: "Minister", photo: "/images/people/ogundeji.webp" },
      { name: "Ev. Joshua OYETUNJI", role: "Music evangelist (saxophone)", photo: "/images/people/oyetunji.webp" },
      { name: "Blessing AJAYI", role: "Music minister", photo: "/images/people/ajayi.webp" },
      { name: "Temiloluwa ADEYEMO", role: "Music minister", photo: "/images/people/adeyemo.webp" },
    ],
    afterwards: "Photographs, video recordings and the crusade report will be published here after 13 December.",
  },
];
