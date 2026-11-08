/**
 * Site-wide facts. Change a detail here and it updates on every page.
 */

export const site = {
  name: "STRONGS",
  fullName: "STRONGS · The Spiritual Intellectuals",
  tagline: "The Spiritual Intellectuals",
  description:
    "STRONGS is a Christian, non-denominational gospel mission. We carry the gospel to campuses, schools, towns and villages, ground believers in sound biblical teaching, and send them out as soul winners.",
  url: "https://www.strongsimpact.org",
  watchword: "Turning sinners to saints, equipping them, and saints to soul winners.",
  motto: ["Resolute.", "Resilient.", "Relentless."],
  email: "strongsimpact@gmail.com",
  phone: "+234 813 789 0055",
  phoneHref: "tel:+2348137890055",
  address: "STRONGS HQ, Obananko Road, Oyo, Oyo State",
  facebook: { label: "Strongs on Facebook", href: "" }, // [Add the STRONGS Facebook page link]
  founder: "Joshua Mofiyinfoluwa ABOKEDE",
  founded: "September 2020",
};

export const mainNav = [
  { href: "/about/", label: "Who we are" },
  { href: "/meetings/", label: "Bible Club & Training" },
  { href: "/crusades/", label: "Crusades" },
  { href: "/missions/", label: "Missions" },
  { href: "/communities/", label: "Communities" },
  { href: "/courses/", label: "Courses" },
  { href: "/calendar/", label: "Calendar" },
  { href: "/resources/", label: "Resources" },
  { href: "/get-involved/", label: "Get involved" },
];

export const footerNav = [
  { href: "/about/", label: "Who we are" },
  { href: "/meetings/", label: "Bible Club and Evangelism Training" },
  { href: "/crusades/", label: "STRONGS Crusades" },
  { href: "/missions/", label: "STRONGS Missions" },
  { href: "/college/", label: "STRONGS College" },
  { href: "/communities/", label: "STRONGS Communities" },
  { href: "/courses/", label: "Courses" },
  { href: "/calendar/", label: "Calendar" },
  { href: "/resources/", label: "Resources" },
  { href: "/get-involved/", label: "Pray, go, give" },
];

export const giving = {
  accountNumber: "7068369227",
  bank: "Opay",
  accountName: "Fulfillment FOLAHAN, General Secretary, receiving on behalf of STRONGS",
};

export const leaders: { name: string; role: string; bio: string; initials: string; photo?: string }[] = [
  {
    name: "Joshua Mofiyinfoluwa ABOKEDE",
    role: "Founder and General Coordinator",
    bio: "A Bible expositor who personally leads the weekly Bible Club and Evangelism Training, and is committed to preaching to and leading secondary-school students.",
    initials: "JA",
    photo: "/images/people/abokede.webp",
  },
  {
    name: "Ev. Godwin Ayorinde OLAEWE",
    role: "Vice President",
    bio: "A Bible teacher, evangelist, chanter and drama evangelist.",
    initials: "GO",
    photo: "/images/people/olaewe.webp",
  },
  {
    name: "Ev. Enoch Oluwatobiloba OLADOSU",
    role: "Administrative Secretary",
    bio: "An evangelist committed to preaching and to raising young people.",
    initials: "EO",
    photo: "/images/people/oladosu.webp",
  },
  {
    name: "Ev. Fulfillment Omorinsola FOLAHAN",
    role: "General Secretary",
    bio: "Serves faithfully in coordinating the affairs of the STRONGS team.",
    initials: "FF",
    photo: "/images/people/folahan.webp",
  },
];

/** Where form submissions go. Leave empty until a form service is connected. */
export const formEndpoint = process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? "";
