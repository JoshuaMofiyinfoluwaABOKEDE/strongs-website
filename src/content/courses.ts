/**
 * STRONGS Courses: short courses for believers who want to grow and serve.
 * Every course is a draft outline for the leadership to confirm: length, cost, format and instructors.
 * Add a course here and it gets its own page at /courses/<slug>/ and a card in the catalogue.
 */

export type CourseCategory =
  | "bible"
  | "evangelism"
  | "writing"
  | "music"
  | "media"
  | "leadership"
  | "health"
  | "skills";

export const courseCategories: { id: CourseCategory; name: string; blurb: string }[] = [
  { id: "bible", name: "Bible and doctrine", blurb: "Read, understand and live the Scriptures." },
  { id: "evangelism", name: "Evangelism and discipleship", blurb: "Win souls and keep them." },
  { id: "writing", name: "Writing", blurb: "Write for God with clarity and craft." },
  { id: "music", name: "Music and singing", blurb: "Sing and play to the glory of God." },
  { id: "media", name: "Drama, design and media", blurb: "Tell the gospel story on stage and screen." },
  { id: "leadership", name: "Leadership and ministry", blurb: "Lead, speak and serve well." },
  { id: "health", name: "Health and care", blurb: "Care for the body God gave you, and for others." },
  { id: "skills", name: "Life and career skills", blurb: "Excel in your studies, work and calling." },
];

export type Course = {
  slug: string;
  title: string;
  category: CourseCategory;
  level: "Beginner" | "Intermediate" | "All levels";
  weeks: number;
  effort: string;
  format: string;
  summary: string;
  about: string;
  outcomes: string[];
  modules: { title: string; text: string }[];
  audience: string;
  prerequisites: string;
  featured?: boolean;
};

/** Shared facts shown on every course page. Change them here once confirmed. */
export const courseFacts = {
  cost: "Free",
  language: "English",
  certificate: "Certificate of completion from STRONGS",
  instructors: "Taught by the STRONGS team and guest teachers with practical experience in the subject.",
  status: "Register your interest",
};

export const courses: Course[] = [
  // ——— Bible and doctrine ———
  {
    slug: "how-to-study-the-bible",
    title: "How to Study the Bible",
    category: "bible",
    level: "Beginner",
    weeks: 4,
    effort: "2–3 hours a week",
    format: "Online, WhatsApp group",
    featured: true,
    summary: "Learn the systematic and expository method we use at the Bible Club: observe, interpret, apply.",
    about:
      "Many believers love the Bible but do not know how to study it. This course teaches the method behind the STRONGS Bible Club: reading a book of the Bible from start to finish, passage by passage, and letting the text say what God meant it to say.",
    outcomes: [
      "Read a passage carefully and see what it actually says",
      "Interpret Scripture by its context, and Scripture by Scripture",
      "Apply what you learn to your own life",
      "Lead a small group through a passage",
    ],
    modules: [
      { title: "Why study the Bible?", text: "The authority of Scripture and the call to rightly divide it." },
      { title: "Observation", text: "Asking the right questions of a passage." },
      { title: "Interpretation", text: "Context, words and the flow of the argument." },
      { title: "Application and teaching", text: "From the page to life, and to others." },
    ],
    audience: "Every believer, especially new believers and Bible Club members.",
    prerequisites: "A Bible and a notebook. No experience needed.",
  },
  {
    slug: "foundations-of-the-faith",
    title: "Foundations of the Faith",
    category: "bible",
    level: "Beginner",
    weeks: 6,
    effort: "2 hours a week",
    format: "Online, WhatsApp group",
    summary: "The great doctrines every Christian should know: God, Christ, salvation, the Spirit and the Church.",
    about:
      "A clear, plain walk through the core truths of the Christian faith, with the Scriptures for each. Ideal for new converts and for anyone who wants to know what they believe and why.",
    outcomes: [
      "Explain who God is and what He has done in Christ",
      "Understand salvation by grace through faith",
      "Know the person and work of the Holy Spirit",
      "Give a reason for the hope that is in you",
    ],
    modules: [
      { title: "The Word of God", text: "Why the Bible is our final authority." },
      { title: "God and man", text: "Creation, the fall and the problem of sin." },
      { title: "Christ and His cross", text: "The person and work of Jesus." },
      { title: "Salvation", text: "Repentance, faith, the new birth and assurance." },
      { title: "The Holy Spirit and holiness", text: "The Spirit-filled, sanctified life." },
      { title: "The Church and the last things", text: "Fellowship, mission and the return of Christ." },
    ],
    audience: "New believers, and any Christian who wants firm foundations.",
    prerequisites: "None.",
  },
  {
    slug: "the-life-of-prayer-and-fasting",
    title: "The Life of Prayer and Fasting",
    category: "bible",
    level: "All levels",
    weeks: 3,
    effort: "1–2 hours a week",
    format: "Online, WhatsApp group",
    summary: "What the Bible teaches about prayer and fasting, and how to keep a steady life of both.",
    about:
      "Prayer is where the work of STRONGS begins. This course prepares believers for our three seasons of fasting and prayer each year, and for a daily life of communion with God.",
    outcomes: [
      "Understand the biblical purpose of prayer and fasting",
      "Build a daily rhythm of prayer and the Word",
      "Fast wisely and safely",
      "Pray for souls, workers and the harvest",
    ],
    modules: [
      { title: "Prayer in Scripture", text: "How the saints prayed, and how Jesus taught us to pray." },
      { title: "Fasting rightly", text: "Purpose, kinds of fasts and practical wisdom." },
      { title: "Intercession for the harvest", text: "Praying for the lost and for labourers." },
    ],
    audience: "Every believer, especially before our January, March and September fasts.",
    prerequisites: "None.",
  },

  // ——— Evangelism and discipleship ———
  {
    slug: "personal-soul-winning",
    title: "Personal Soul-Winning",
    category: "evangelism",
    level: "Beginner",
    weeks: 4,
    effort: "2–3 hours a week",
    format: "Online, with a field outreach",
    featured: true,
    summary: "Share the gospel clearly with one person at a time, and lead them to Christ from the Bible.",
    about:
      "Drawn from our Sunday Evangelism and Follow-up Training. You will learn the message we preach, how to start gospel conversations, how to answer common questions, and how to lead someone to Christ. The course ends with an outreach in the field.",
    outcomes: [
      "Present the gospel clearly in a few minutes",
      "Start gospel conversations naturally",
      "Answer common questions and objections",
      "Lead a seeking soul to Christ and give assurance",
    ],
    modules: [
      { title: "The gospel we preach", text: "The singularity of the gospel (1 Corinthians 15:1–4)." },
      { title: "Starting conversations", text: "Openings, listening and courage." },
      { title: "Questions and objections", text: "Answering with Scripture and gentleness." },
      { title: "Leading to Christ, and field outreach", text: "Prayer, decision and assurance; then out to the streets." },
    ],
    audience: "Every believer who wants to win souls.",
    prerequisites: "None. Joining the Sunday Evangelism Training is encouraged.",
  },
  {
    slug: "follow-up-and-discipleship",
    title: "Follow-up and Discipleship of New Converts",
    category: "evangelism",
    level: "Intermediate",
    weeks: 4,
    effort: "2 hours a week",
    format: "Online, WhatsApp group",
    summary: "Care for new believers until they are rooted in Christ and joined to a local church.",
    about:
      "“That your fruit should remain.” Winning a soul is the beginning, not the end. This course teaches the follow-up pattern behind every STRONGS crusade: visits, letters, classes and spiritual adoption.",
    outcomes: [
      "Give a new convert assurance of salvation",
      "Plan a simple follow-up programme",
      "Disciple one person for a year",
      "Connect converts to a local church",
    ],
    modules: [
      { title: "Why follow-up matters", text: "John 15:16 and the cost of neglect." },
      { title: "The first weeks", text: "Assurance, visits and the convert rally." },
      { title: "Discipling one person", text: "Spiritual adoption, mentoring and accountability." },
      { title: "Rooted in the church", text: "Baptism, membership and the new believers' class." },
    ],
    audience: "Soul winners, counsellors and church workers.",
    prerequisites: "Personal Soul-Winning, or experience in evangelism.",
  },
  {
    slug: "crusade-counselling",
    title: "Crusade Counselling",
    category: "evangelism",
    level: "Intermediate",
    weeks: 2,
    effort: "3 hours a week",
    format: "Online, then on the crusade ground",
    summary: "Be ready to counsel those who respond at the altar call of a STRONGS crusade.",
    about:
      "Every crusade needs trained counsellors. Taken from the STRONGS Crusade Manual, this course prepares you to deal with enquirers one by one, record decisions correctly and hand converts to the local church.",
    outcomes: [
      "Counsel an enquirer from the Bible",
      "Handle the main kinds of decision",
      "Fill in a decision card correctly",
      "Serve with care, courtesy and confidentiality",
    ],
    modules: [
      { title: "The counsellor's heart and conduct", text: "Prayer, preparation and courtesy." },
      { title: "Counselling at the altar", text: "Salvation, assurance and restoration." },
    ],
    audience: "Volunteers for our crusades and host-church workers.",
    prerequisites: "A born-again believer, recommended by a pastor or STRONGS leader.",
  },

  // ——— Writing ———
  {
    slug: "christian-writing-foundations",
    title: "Christian Writing Foundations",
    category: "writing",
    level: "Beginner",
    weeks: 4,
    effort: "2–3 hours a week",
    format: "Online, Google Meet",
    featured: true,
    summary: "Find your voice and write clearly about faith, from the first idea to a finished piece.",
    about:
      "STRONGS began with writers. This course gives new writers the basics: ideas, structure, clear sentences and honest editing, all with a heart to serve God and the reader.",
    outcomes: [
      "Turn an idea into a clear outline",
      "Write plain, strong sentences",
      "Use Scripture faithfully in your writing",
      "Edit your own work before you share it",
    ],
    modules: [
      { title: "The writer's calling", text: "Why we write, and for whom." },
      { title: "From idea to outline", text: "Finding and shaping what you want to say." },
      { title: "Clear sentences", text: "Plain words, active verbs, short paragraphs." },
      { title: "Revising and sharing", text: "Self-editing, feedback and publishing." },
    ],
    audience: "Anyone who wants to start writing for God.",
    prerequisites: "None.",
  },
  {
    slug: "writing-devotionals-and-articles",
    title: "Writing Devotionals and Articles",
    category: "writing",
    level: "Intermediate",
    weeks: 4,
    effort: "3 hours a week",
    format: "Online, Google Meet",
    summary: "Write short devotionals and articles that open a passage and stir the reader to act.",
    about:
      "Learn the form behind the articles on our Resources page: a sharp title, one big idea, a faithful handling of Scripture and a clear call to respond.",
    outcomes: [
      "Write a 400–700 word article with one clear idea",
      "Write a daily devotional",
      "Write titles and openings that draw the reader in",
      "Submit work for publishing on the STRONGS website",
    ],
    modules: [
      { title: "One big idea", text: "Focus, theme and the reader's need." },
      { title: "Handling the text", text: "Exposition in a short form." },
      { title: "Titles, openings and endings", text: "Drawing the reader in, and sending them out." },
      { title: "Workshop", text: "Writing, feedback and a finished piece." },
    ],
    audience: "Writers who have done some writing and want to grow.",
    prerequisites: "Christian Writing Foundations, or a few pieces already written.",
  },
  {
    slug: "editing-and-proofreading",
    title: "Editing and Proofreading",
    category: "writing",
    level: "All levels",
    weeks: 3,
    effort: "2 hours a week",
    format: "Online, Google Meet",
    summary: "Catch the errors, tighten the prose and prepare writing for print and the web.",
    about:
      "Every book and article needs an editor. This practical course teaches grammar, punctuation, consistency and the editor's eye, using real manuscripts.",
    outcomes: [
      "Correct common grammar and punctuation errors",
      "Tighten wordy writing",
      "Keep a manuscript consistent",
      "Proofread for print and the web",
    ],
    modules: [
      { title: "Grammar and punctuation", text: "The errors that matter most." },
      { title: "Line editing", text: "Clarity, flow and concision." },
      { title: "Proofreading", text: "Checklists and a final pass." },
    ],
    audience: "Writers, students and church media teams.",
    prerequisites: "None.",
  },
  {
    slug: "storytelling-and-testimony-writing",
    title: "Storytelling and Testimony Writing",
    category: "writing",
    level: "Beginner",
    weeks: 3,
    effort: "2 hours a week",
    format: "Online, Google Meet",
    summary: "Tell true stories of what God has done, with honesty, consent and care.",
    about:
      "Testimonies and mission reports encourage the Church and give glory to God. Learn to tell a true story well, and to tell it honestly, with the person's consent.",
    outcomes: [
      "Shape a testimony with a clear beginning, turn and end",
      "Write a short mission report",
      "Interview someone about their story",
      "Respect consent and dignity in every story",
    ],
    modules: [
      { title: "The shape of a story", text: "Before, the turning point, and after." },
      { title: "Interviewing and listening", text: "Getting the story right." },
      { title: "Reports and consent", text: "Honest reporting, dignity and permission." },
    ],
    audience: "Writers, media volunteers and anyone with a story to tell.",
    prerequisites: "None.",
  },

  // ——— Music and singing ———
  {
    slug: "voice-training-for-beginners",
    title: "Voice Training for Beginners",
    category: "music",
    level: "Beginner",
    weeks: 6,
    effort: "3 hours a week, with daily practice",
    format: "Online, Google Meet, with recorded exercises",
    featured: true,
    summary: "Breathe, sing in tune and care for your voice, step by step.",
    about:
      "A practical start for anyone who wants to sing better. Short daily exercises build breath support, pitch, tone and diction, and teach you to look after your voice for a lifetime of praise.",
    outcomes: [
      "Breathe and support your voice properly",
      "Sing in tune and hold your part",
      "Improve tone, range and diction",
      "Warm up and care for your voice",
    ],
    modules: [
      { title: "Posture and breath", text: "The foundation of every good note." },
      { title: "Pitch and ear training", text: "Hearing and matching notes." },
      { title: "Tone and resonance", text: "Finding a clear, free sound." },
      { title: "Range and agility", text: "Stretching the voice safely." },
      { title: "Diction", text: "Singing words people can understand." },
      { title: "Vocal health", text: "Warm-ups, rest and care." },
    ],
    audience: "Anyone who wants to sing, including complete beginners.",
    prerequisites: "None. A phone to record yourself is helpful.",
  },
  {
    slug: "singing-in-a-choir",
    title: "Singing in a Choir: Parts and Harmony",
    category: "music",
    level: "Beginner",
    weeks: 4,
    effort: "2–3 hours a week",
    format: "Online, Google Meet",
    summary: "Learn your part (soprano, alto, tenor or bass) and sing it confidently in harmony.",
    about:
      "For choir members and crusade choir volunteers. Learn how harmony works, how to find and hold your part, and how to blend with the people around you.",
    outcomes: [
      "Know your voice part",
      "Learn and hold a harmony line",
      "Blend and balance in a section",
      "Follow a music director",
    ],
    modules: [
      { title: "Voice parts", text: "Soprano, alto, tenor and bass." },
      { title: "Learning a part", text: "By ear and with simple notation." },
      { title: "Blend and balance", text: "Singing as one." },
      { title: "Rehearsal and ministry", text: "Following the director, and singing to the Lord." },
    ],
    audience: "Choir members, crusade choir volunteers and church singers.",
    prerequisites: "Voice Training for Beginners is helpful but not required.",
  },
  {
    slug: "leading-worship",
    title: "Leading Worship",
    category: "music",
    level: "Intermediate",
    weeks: 4,
    effort: "3 hours a week",
    format: "Online, Google Meet",
    summary: "Lead God's people in worship with a right heart, sound doctrine and good preparation.",
    about:
      "True worshippers worship in spirit and in truth. This course covers the worship leader's life, choosing songs that teach truth, planning a set and leading a congregation.",
    outcomes: [
      "Understand biblical worship",
      "Choose songs for their truth as well as their tune",
      "Plan and flow a worship set",
      "Lead a team and a congregation",
    ],
    modules: [
      { title: "The worshipper's life", text: "Spirit and truth (John 4:23–24)." },
      { title: "Songs that teach", text: "Judging lyrics by Scripture." },
      { title: "Planning a set", text: "Keys, flow and transitions." },
      { title: "Leading people", text: "Directing a team and a congregation." },
    ],
    audience: "Worship leaders, music directors and singers who lead.",
    prerequisites: "Some experience singing in church.",
  },
  {
    slug: "music-theory-basics",
    title: "Music Theory Basics",
    category: "music",
    level: "Beginner",
    weeks: 5,
    effort: "2–3 hours a week",
    format: "Online, Google Meet",
    summary: "Notes, scales, keys, rhythm and chords, explained simply for church musicians.",
    about:
      "Understand the music you sing and play. Learn to read simple notation and tonic sol-fa, build scales and chords, and follow a chord chart.",
    outcomes: [
      "Read simple staff notation and tonic sol-fa",
      "Understand rhythm and time signatures",
      "Build major and minor scales and chords",
      "Follow and write a chord chart",
    ],
    modules: [
      { title: "Notes and rhythm", text: "The building blocks." },
      { title: "Sol-fa and staff", text: "Reading what you sing." },
      { title: "Scales and keys", text: "Major, minor and the key signature." },
      { title: "Chords", text: "Triads and common progressions." },
      { title: "Charts and practice", text: "Putting it to work in church." },
    ],
    audience: "Singers and instrumentalists who want to understand music.",
    prerequisites: "None.",
  },
  {
    slug: "songwriting-for-worship",
    title: "Songwriting for Worship",
    category: "music",
    level: "Intermediate",
    weeks: 4,
    effort: "3 hours a week",
    format: "Online, Google Meet",
    summary: "Write songs that are true to Scripture, simple to sing and rich in meaning.",
    about:
      "From the psalms to the hymns of the revivals, God's people have written songs to teach and to praise. Learn to write lyrics rooted in Scripture and melodies a congregation can sing.",
    outcomes: [
      "Write lyrics that are biblically sound",
      "Shape verses, choruses and bridges",
      "Write singable melodies",
      "Finish and share a song",
    ],
    modules: [
      { title: "Songs that teach", text: "Lessons from the psalms and the hymn writers." },
      { title: "Lyrics", text: "Truth, imagery and simplicity." },
      { title: "Melody and form", text: "Singable tunes and song structure." },
      { title: "Finishing a song", text: "Feedback, recording and sharing." },
    ],
    audience: "Singers and musicians who want to write.",
    prerequisites: "Music Theory Basics is helpful.",
  },

  // ——— Drama, design and media ———
  {
    slug: "drama-for-the-gospel",
    title: "Drama for the Gospel",
    category: "media",
    level: "Beginner",
    weeks: 4,
    effort: "3 hours a week",
    format: "Online, then in person for rehearsal",
    summary: "Write and stage short gospel dramas for crusades, schools and churches.",
    about:
      "Some will hear the gospel through a story before they hear it from a pulpit. With the STRONGS Drama Mission, learn to write a short script, direct actors and stage a play that points to Christ.",
    outcomes: [
      "Write a short gospel drama script",
      "Act with clarity and conviction",
      "Direct and rehearse a small cast",
      "Stage drama outdoors and in halls",
    ],
    modules: [
      { title: "Drama and the gospel", text: "Why and how drama serves the message." },
      { title: "Script writing", text: "Story, scenes and dialogue." },
      { title: "Acting", text: "Voice, movement and character." },
      { title: "Staging", text: "Rehearsal, props and performing outdoors." },
    ],
    audience: "Drama team members and anyone interested in drama ministry.",
    prerequisites: "None.",
  },
  {
    slug: "graphic-design-for-ministry",
    title: "Graphic Design for Ministry",
    category: "media",
    level: "Beginner",
    weeks: 5,
    effort: "3–4 hours a week",
    format: "Online, Google Meet",
    featured: true,
    summary: "Design clear, attractive flyers and social media posts for church and mission events.",
    about:
      "Taught from the experience of designing STRONGS flyers. Learn layout, typography and colour, and make flyers in Canva or Photoshop that people read and act on.",
    outcomes: [
      "Apply layout, type and colour basics",
      "Design an event flyer from a brief",
      "Design for WhatsApp, Facebook and print",
      "Keep a ministry's brand consistent",
    ],
    modules: [
      { title: "Design basics", text: "Hierarchy, alignment and space." },
      { title: "Typography and colour", text: "Choosing and pairing well." },
      { title: "Canva and Photoshop", text: "Getting started with the tools." },
      { title: "The event flyer", text: "From brief to finished design." },
      { title: "Brand and consistency", text: "Logos, colours and templates." },
    ],
    audience: "Media volunteers and anyone who designs for their church.",
    prerequisites: "A phone or computer. No design experience needed.",
  },
  {
    slug: "video-and-livestreaming-for-ministry",
    title: "Video and Livestreaming for Ministry",
    category: "media",
    level: "Beginner",
    weeks: 4,
    effort: "3 hours a week",
    format: "Online, Google Meet",
    summary: "Record, edit and livestream sermons and events with a phone and free tools.",
    about:
      "The message must travel further than the crusade ground. Learn to film with a phone, edit in CapCut, and stream a meeting live to YouTube or Facebook.",
    outcomes: [
      "Film clear video and sound with a phone",
      "Edit short clips and full sermons",
      "Livestream a meeting",
      "Plan media coverage of an event",
    ],
    modules: [
      { title: "Filming", text: "Light, framing and sound." },
      { title: "Editing", text: "Cuts, captions and music." },
      { title: "Livestreaming", text: "Set-up, testing and going live." },
      { title: "Event coverage", text: "Planning a media team for a crusade or conference." },
    ],
    audience: "Media volunteers and church tech teams.",
    prerequisites: "A smartphone.",
  },

  // ——— Leadership and ministry ———
  {
    slug: "servant-leadership",
    title: "Servant Leadership",
    category: "leadership",
    level: "All levels",
    weeks: 4,
    effort: "2 hours a week",
    format: "Online, Google Meet",
    summary: "Lead like Christ: character, humility, vision and care for people.",
    about:
      "Drawing on 1 Corinthians 3 and 4 (labourers, stewards and the lowly heart), this course prepares leaders of fellowships, units and teams to serve faithfully.",
    outcomes: [
      "Understand leadership as stewardship",
      "Lead with humility and integrity",
      "Plan, delegate and follow through",
      "Care for and grow the people you lead",
    ],
    modules: [
      { title: "Faithful stewards", text: "1 Corinthians 4:1–5." },
      { title: "Character before gifting", text: "Humility, integrity and the lowly heart." },
      { title: "Planning and delegation", text: "Diligence in the work of God." },
      { title: "Shepherding people", text: "Leading the flock of Christ." },
    ],
    audience: "Fellowship leaders, unit heads and emerging leaders.",
    prerequisites: "None.",
  },
  {
    slug: "public-speaking-and-preaching",
    title: "Public Speaking and Preaching",
    category: "leadership",
    level: "Beginner",
    weeks: 5,
    effort: "3 hours a week",
    format: "Online, Google Meet",
    summary: "Prepare and deliver a clear, faithful message with confidence.",
    about:
      "For anyone who speaks before people, from a school assembly to a crusade platform. Learn to prepare a message from a passage, structure it and deliver it with clarity and conviction.",
    outcomes: [
      "Prepare a message from a Bible passage",
      "Structure a talk with a clear aim",
      "Speak with confidence and clarity",
      "Adapt to students, churches and open-air crowds",
    ],
    modules: [
      { title: "The preacher's life", text: "Prayer, study and holiness." },
      { title: "From text to message", text: "Finding the big idea of a passage." },
      { title: "Structure", text: "Opening, points, illustrations and appeal." },
      { title: "Delivery", text: "Voice, body and nerves." },
      { title: "Speaking in the field", text: "Assemblies, churches and open air." },
    ],
    audience: "Evangelists, teachers, student leaders and anyone who speaks in public.",
    prerequisites: "How to Study the Bible is helpful.",
  },
  {
    slug: "the-daniel-generation",
    title: "The Daniel Generation: Faith and Excellence in Study",
    category: "leadership",
    level: "Beginner",
    weeks: 3,
    effort: "2 hours a week",
    format: "Online, WhatsApp group",
    summary: "Purpose in your heart, like Daniel: holiness, discipline and excellence in your studies.",
    about:
      "Daniel was found ten times better in wisdom and understanding, and he would not defile himself. This course helps students live for God and excel in school, side by side.",
    outcomes: [
      "Settle your convictions before the test comes",
      "Build habits of study and discipline",
      "Manage your time well",
      "Stand for Christ on campus",
    ],
    modules: [
      { title: "Purpose in the heart", text: "Daniel 1:8 and personal conviction." },
      { title: "Excellence in learning", text: "Study habits that work." },
      { title: "Faithful under pressure", text: "Witness and integrity on campus." },
    ],
    audience: "Secondary-school and university students.",
    prerequisites: "None.",
  },

  // ——— Health and care ———
  {
    slug: "first-aid-and-health-basics",
    title: "First Aid and Health Basics",
    category: "health",
    level: "Beginner",
    weeks: 3,
    effort: "2 hours a week",
    format: "Online, with an in-person practical",
    summary: "Know what to do in common emergencies, and when to get help, until a professional arrives.",
    about:
      "With the STRONGS Medical Mission. Learn basic first aid and health knowledge for home, school and outreach. This course does not make you a health professional; it helps you respond safely and get help quickly.",
    outcomes: [
      "Respond to common emergencies safely",
      "Know when and how to get professional help",
      "Understand basic hygiene and prevention",
      "Support a medical outreach as a volunteer",
    ],
    modules: [
      { title: "Staying safe and calling for help", text: "Assessing a scene and getting help." },
      { title: "Common emergencies", text: "Bleeding, burns, fainting and choking." },
      { title: "Health and prevention", text: "Hygiene, malaria prevention and clean water." },
    ],
    audience: "Outreach volunteers, teachers, parents and students.",
    prerequisites: "None.",
  },
  {
    slug: "health-for-teenagers",
    title: "Health and Wellbeing for Teenagers",
    category: "health",
    level: "Beginner",
    weeks: 3,
    effort: "1–2 hours a week",
    format: "In schools and online",
    summary: "Honest, Bible-based teaching on body, mind and habits for young people.",
    about:
      "Building on the health talks our Medical Mission gives in schools. Teenagers learn to care for their bodies, guard their minds and make wise choices, in the light of God's Word.",
    outcomes: [
      "Care for your body with good habits",
      "Understand the changes of the teenage years",
      "Guard your mind and choose wisely",
      "Know where to find trusted help",
    ],
    modules: [
      { title: "Your body, His temple", text: "Food, rest, exercise and hygiene." },
      { title: "Growing up", text: "Understanding change with wisdom." },
      { title: "Mind and choices", text: "Friends, media and saying no." },
    ],
    audience: "Teenagers, with parental consent. Also useful for parents and teachers.",
    prerequisites: "None.",
  },

  // ——— Life and career skills ———
  {
    slug: "digital-skills-for-students",
    title: "Digital Skills for Students",
    category: "skills",
    level: "Beginner",
    weeks: 4,
    effort: "3 hours a week",
    format: "Online, Google Meet",
    summary: "Word, Excel, email and online research: the computer skills every student needs.",
    about:
      "Practical training in the tools you will use at school and at work: writing and formatting documents, working with spreadsheets, professional email and finding reliable information online.",
    outcomes: [
      "Write and format documents in Word",
      "Use Excel for lists, sums and simple charts",
      "Write professional emails",
      "Search and judge information online",
    ],
    modules: [
      { title: "Documents", text: "Microsoft Word basics and formatting." },
      { title: "Spreadsheets", text: "Microsoft Excel basics and formulas." },
      { title: "Email and online safety", text: "Professional communication." },
      { title: "Research skills", text: "Finding and checking sources." },
    ],
    audience: "Students and school leavers.",
    prerequisites: "Access to a computer is best; a phone will do for some lessons.",
  },
  {
    slug: "career-discovery-and-scholarships",
    title: "Career Discovery and Scholarships",
    category: "skills",
    level: "Beginner",
    weeks: 3,
    effort: "2 hours a week",
    format: "Online, Google Meet",
    summary: "Discover your gifts, see your profession as a platform for God, and find scholarships.",
    about:
      "With the STRONGS Educational Mission. Discover your strengths, explore careers, and learn how to search for and apply to scholarships, with your work seen as a calling.",
    outcomes: [
      "Identify your gifts and interests",
      "Explore careers that fit them",
      "Find and apply for scholarships",
      "Write a simple CV and personal statement",
    ],
    modules: [
      { title: "Your work as a calling", text: "Your profession as a platform for God's purpose." },
      { title: "Gifts and careers", text: "Self-discovery and career paths." },
      { title: "Scholarships and applications", text: "Searching, CVs and personal statements." },
    ],
    audience: "Secondary-school students and graduates.",
    prerequisites: "None.",
  },
  {
    slug: "agribusiness-basics",
    title: "Agribusiness Basics",
    category: "skills",
    level: "Beginner",
    weeks: 3,
    effort: "2 hours a week",
    format: "Online, with a farm visit",
    summary: "Start small in farming and agribusiness: planning, growing, selling and keeping records.",
    about:
      "First taught at the Teenagers' Capacity Building in Sepeteri. An introduction to agriculture as a business, for young people in towns and villages.",
    outcomes: [
      "See the opportunities in agriculture",
      "Plan a small farm or agribusiness",
      "Keep simple records and costs",
      "Find buyers and sell well",
    ],
    modules: [
      { title: "Opportunities in agriculture", text: "Crops, livestock and processing." },
      { title: "Planning and starting small", text: "Land, inputs and a simple budget." },
      { title: "Records and selling", text: "Costs, profit and markets." },
    ],
    audience: "Teenagers and young adults, especially in rural communities.",
    prerequisites: "None.",
  },
  {
    slug: "entrepreneurship-and-stewardship",
    title: "Entrepreneurship and Stewardship",
    category: "skills",
    level: "Beginner",
    weeks: 4,
    effort: "2 hours a week",
    format: "Online, Google Meet",
    summary: "Start and run a small business with integrity, and steward money God's way.",
    about:
      "For young people with an idea. Learn to test an idea, serve customers, price and keep records, and handle money as a faithful steward.",
    outcomes: [
      "Test a business idea",
      "Serve customers and price your work",
      "Keep simple accounts",
      "Budget, save and give faithfully",
    ],
    modules: [
      { title: "Ideas and customers", text: "Solving a real need." },
      { title: "Starting small", text: "Pricing, selling and records." },
      { title: "Integrity in business", text: "Honest dealing as a witness." },
      { title: "Stewardship", text: "Budgeting, saving and giving." },
    ],
    audience: "Students and young adults.",
    prerequisites: "None.",
  },
];

export const getCourse = (slug: string) => courses.find((c) => c.slug === slug);
export const coursesIn = (cat: CourseCategory) => courses.filter((c) => c.category === cat);
export const categoryName = (cat: CourseCategory) => courseCategories.find((c) => c.id === cat)?.name ?? cat;
