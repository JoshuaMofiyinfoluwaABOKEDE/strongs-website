/**
 * STRONGS Missions. Responsibilities and some bios are drafts for the leadership to confirm.
 * Text in [brackets] is still to be supplied.
 */

export type Mission = {
  id: string;
  letter: string;
  name: string;
  short: string;
  focus: string;
  intro: string;
  leader?: { name: string; role: string; bio: string; photo?: string };
  /** A photo or flyer of the mission at work. */
  image?: { src: string; alt: string; caption: string };
  /** More photos from the field, shown as a strip. */
  gallery?: { src: string; alt: string }[];
  responsibilities?: string[];
  activitiesTitle: string;
  activities: string[];
};

export const missions: Mission[] = [
  {
    id: "medical",
    letter: "A",
    name: "STRONGS Medical Mission",
    short: "Medical Mission",
    focus: "Medical outreach, healthcare assistance and community health awareness.",
    intro:
      "Faith expressed in practical care. The Medical Mission brings qualified health professionals to the communities we reach, so that the gospel is preached and the sick are cared for.",
    leader: {
      name: "Nurse Ruth O. ODUOLA",
      role: "Mission Leader",
      bio: "A nurse and the author of The Transitioning Phase of Man's Life, a book for young people who want to stay burning for God at every stage of life. [Add her training and years in medical mission.]",
      photo: "/images/people/oduola.webp",
    },
    responsibilities: [
      "Plan and lead medical outreaches at crusades and as standalone missions",
      "Recruit and coordinate licensed health professionals",
      "Run community health-awareness sessions",
      "Make sure every patient is served with dignity and consent",
    ],
    activitiesTitle: "Where the mission has served",
    activities: [
      "Medical outreach at the Ebiaji Gospel Crusade, where more than 70 people were seen",
      "A standalone medical outreach, 5–7 March 2026",
      "Medical care at This Same Jesus, Sepeteri, December 2026",
      "Health teaching for students during our school outreaches",
    ],
    image: {
      src: "/images/photos/medical-school-talk-1.webp",
      alt: "Nurse Ruth O. Oduola speaking into a microphone to secondary-school students in green berets",
      caption: "Nurse Ruth O. Oduola teaching students about their health during a school outreach.",
    },
    gallery: [
      { src: "/images/photos/medical-school-talk-2.webp", alt: "Students from several schools seated in a church hall while Nurse Oduola speaks at the front" },
      { src: "/images/photos/medical-school-talk-3.webp", alt: "A wide view of the hall, with students in different uniforms listening to the health talk" },
      { src: "/images/photos/medical-school-talk-4.webp", alt: "Students seated on the pews during the school outreach" },
      { src: "/images/photos/medical-school-talk-5.webp", alt: "Nurse Oduola smiling as she speaks to students seated on the pews" },
    ],
  },
  {
    id: "school",
    letter: "B",
    name: "STRONGS School Mission",
    short: "School Mission",
    focus:
      "Reaching students and educational institutions with the gospel, alongside moral, spiritual and developmental programmes.",
    intro:
      "Schools and campuses are mission fields. The School Mission preaches Christ to students and walks with them in character, purpose and faith.",
    leader: {
      name: "Evng. Enoch OLADOSU",
      role: "Mission Leader",
      bio: "An evangelist committed to preaching and to raising young people. He also serves as Administrative Secretary of STRONGS.",
      photo: "/images/people/oladosu.webp",
    },
    responsibilities: [
      "Lead gospel outreaches to secondary schools and campuses",
      "Coordinate moral, spiritual and developmental programmes for students",
      "Work with school authorities and campus fellowships",
      "Follow up students who give their lives to Christ",
    ],
    image: {
      src: "/images/photos/irele-assembly-1.webp",
      alt: "A STRONGS evangelist preaching to secondary-school students gathered for morning assembly in the open air",
      caption: "Preaching at a school assembly during the Irele Student Outreach, October 2026.",
    },
    gallery: [
      { src: "/images/photos/irele-hall-preaching.webp", alt: "An evangelist ministering to students in a school hall with a thatched roof" },
      { src: "/images/photos/irele-classroom.webp", alt: "An evangelist teaching a class of students at a whiteboard" },
      { src: "/images/photos/irele-hall.webp", alt: "Students in green uniforms gathered in a school hall to hear the gospel" },
      { src: "/images/photos/school-tla-1.webp", alt: "A STRONGS minister speaking with a microphone to a full classroom of students taking notes" },
      { src: "/images/photos/school-tla-2.webp", alt: "A STRONGS minister addressing students seated at long wooden desks" },
      { src: "/images/photos/school-tla-3.webp", alt: "A speaker at the whiteboard while two STRONGS ministers look on from the side of the classroom" },
      { src: "/images/photos/school-tla-4.webp", alt: "A student answering a question with the microphone as a STRONGS minister listens" },
    ],
    activitiesTitle: "Programmes",
    activities: [
      "Secondary-school visits and assemblies, with talks on faith, character, health and careers",
      "Campus aFlame campus evangelism",
      "Students Mission Conference and Fire Conference",
      "The Teenagers' Community",
    ],
  },
  {
    id: "drama",
    letter: "C",
    name: "STRONGS Drama Mission",
    short: "Drama Mission",
    focus: "Using Christian drama, theatre and creative performance to communicate the gospel.",
    intro:
      "Some will hear the gospel through a story before they hear it from a pulpit. The Drama Mission carries the message through stage plays, chants and performance at crusades, schools and churches.",
    leader: {
      name: "Ev. Godwin Ayorinde OLAEWE",
      role: "Mission Leader",
      bio: "A Bible teacher, evangelist, chanter and drama evangelist, and Vice President of STRONGS.",
      photo: "/images/people/olaewe.webp",
    },
    responsibilities: [
      "Write and stage gospel drama for crusades, schools and churches",
      "Train and disciple members of the drama team",
      "Prepare productions for major STRONGS events",
      "Grow a film department as the work develops",
    ],
    image: {
      src: "/images/photos/olaewe-rcf-lautech.webp",
      alt: "Ev. Godwin Ayorinde OLAEWE preaching at RCF LAUTECH",
      caption: "Ev. Godwin Ayorinde OLAEWE preaching at RCF LAUTECH.",
    },
    activitiesTitle: "What the mission does",
    activities: [
      "Gospel drama at crusades and outreaches",
      "Stage productions for schools and churches",
      "Chants and spoken performance",
      "Film production (a dedicated department to come)",
    ],
  },
  {
    id: "educational",
    letter: "D",
    name: "STRONGS Educational Mission",
    short: "Educational Mission",
    focus: "Educational support, academic development, learning opportunities and educational outreach.",
    intro:
      "Raising spiritual intellectuals includes opening doors to learning. The Educational Mission supports students, especially the disadvantaged, and carries the vision for STRONGS College, a mission school we are planning.",
    leader: {
      name: "Fulfillment FOLAHAN",
      role: "Head of Educational Mission",
      bio: "Serves as General Secretary of STRONGS, coordinating the affairs of the team, and leads the planning for STRONGS College.",
      photo: "/images/people/folahan.webp",
    },
    responsibilities: [
      "Carry forward the plan for STRONGS College, in line with the STRONGS vision",
      "Lead educational outreaches and seminars",
      "Develop scholarship and learning-support initiatives",
      "Coordinate reading, literacy and career guidance programmes",
    ],
    activitiesTitle: "Activities",
    activities: [
      "Educational outreaches",
      "Academic support programmes",
      "Career guidance",
      "Scholarship initiatives",
      "Reading and literacy programmes",
      "Educational seminars",
      "Learning support for disadvantaged students",
    ],
  },
  {
    id: "media",
    letter: "E",
    name: "STRONGS Media Mission",
    short: "Media Mission",
    focus:
      "Using media, digital communication and creative production to advance the gospel and support STRONGS' activities.",
    intro:
      "The message must travel further than the crusade ground. The Media Mission records, produces and shares the work of STRONGS so the gospel reaches people online and on screen.",
    leader: {
      name: "Segun DANIEL",
      role: "Head of Media Mission",
      bio: "A storyteller and filmmaker who uses creativity as a tool for transformation and spiritual impact. He is a co-founder of THEVOLSHOW (The Voice of the Lord Show), a gospel-centred creative platform that helps children, teenagers and young adults discover and use their God-given creative gifts, and trained at the Mount Zion Film Academy.",
      photo: "/images/people/segun-daniel.webp",
    },
    image: {
      src: "/images/flyers/smc26-livestream.webp",
      alt: "Flyer announcing SMC '26 streaming live on YouTube with Godwin Ayorinde Olaewe",
      caption: "SMC '26 streamed live on YouTube.",
    },
    activitiesTitle: "Activities",
    activities: [
      "Christian media productions",
      "Photography and videography",
      "Graphics and visual communication",
      "Digital and social media evangelism",
      "Christian documentaries",
      "Audio and video production",
      "Media coverage of outreaches",
    ],
  },
  {
    id: "children",
    letter: "F",
    name: "STRONGS Children Mission",
    short: "Children Mission",
    focus: "Teaching children the Word of God and raising them to know, love and follow Jesus.",
    intro:
      "Children are not too young for the gospel. The Children Mission gathers children every Saturday for the STRONGS Children's Bible Club, and every year holds Children for Christ, a special day for children.",
    leader: {
      name: "Favour Abigail AYANDARE",
      role: "Mission Leader",
      bio: "Leads the Children Mission and the STRONGS Children's Bible Club. [Add a short bio.]",
    },
    image: {
      src: "/images/flyers/children-for-christ-26.webp",
      alt: "Flyer for Children for Christ 2026",
      caption: "Children for Christ 2026, Saturday 27 June.",
    },
    gallery: [
      { src: "/images/flyers/children-for-christ-25.webp", alt: "Flyer for Children for Christ 2025: Arrows in His Quiver" },
    ],
    activitiesTitle: "What the mission does",
    activities: [
      "STRONGS Children's Bible Club, every Saturday at 10am",
      "Children for Christ, held every year (2025: Arrows in His Quiver)",
      "Bible stories, songs, memory verses and prayer, taught at a child's level",
    ],
  },
];
