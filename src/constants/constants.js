import domToReact from "html-react-parser/lib/dom-to-react";
import { Clipboard, FileText, HelpCircle, Video } from "lucide-react";

export const DEBOUNCE_DELAY = 800;
export const LIMIT = 10;

// Add and Update course constants - step 1

export const categories = [
  "Web Development",
  "Data Science",
  "Mobile Development",
  "Digital Marketing",
  "Graphic Design",
  "UI/UX Design",
  "Machine Learning",
  "Artificial Intelligence",
  "Blockchain",
  "Cloud Computing",
  "Cybersecurity",
  "DevOps",
];

export const subCategories = {
  "Web Development": [
    "Frontend",
    "Backend",
    "Full Stack",
    "MERN Stack",
    "MEAN Stack",
  ],
  "Data Science": ["Python", "R", "SQL", "Machine Learning", "Data Analysis"],
  "Mobile Development": ["React Native", "Flutter", "iOS", "Android", "Hybrid"],
  "Digital Marketing": [
    "SEO",
    "Social Media",
    "Content Marketing",
    "Email Marketing",
  ],
  "Graphic Design": ["Adobe Photoshop", "Adobe Illustrator", "CorelDRAW"],
  "UI/UX Design": ["Figma", "Adobe XD", "Sketch", "User Research"],
};

// Add and Update course constants - step 3
export const contentTypes = [
  {
    value: "video",
    label: "Video",
    icon: Video,
    color: "bg-blue-100 text-blue-700",
  },
  {
    value: "article",
    label: "Article",
    icon: FileText,
    color: "bg-green-100 text-green-700",
  },
  {
    value: "quiz",
    label: "Quiz",
    icon: HelpCircle,
    color: "bg-purple-100 text-purple-700",
  },
  {
    value: "assignment",
    label: "Assignment",
    icon: Clipboard,
    color: "bg-orange-100 text-orange-700",
  },
];

// Add and Update course constants- step 4
export const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const commonTools = [
  "React",
  "Node.js",
  "MongoDB",
  "Express",
  "JavaScript",
  "HTML",
  "CSS",
  "Python",
  "Django",
  "Flask",
  "PostgreSQL",
  "MySQL",
  "Git",
  "Docker",
  "AWS",
  "Firebase",
  "Vue.js",
  "Angular",
  "TypeScript",
  "GraphQL",
];

// Add and Update course constants- step 5
export const commonFeatures = [
  { title: "Pan India Placements", subtitle: "100+ hiring partners" },
  { title: "Live Project Training", subtitle: "Real-world experience" },
  { title: "24/7 Doubt Support", subtitle: "Never get stuck" },
  { title: "Industry Mentorship", subtitle: "Learn from experts" },
  { title: "Certification", subtitle: "Government recognized" },
  { title: "Flexible Timing", subtitle: "Weekend & weekday batches" },
  { title: "Lifetime Access", subtitle: "Course materials forever" },
  { title: "Money Back Guarantee", subtitle: "100% refund policy" },
];

export const durationOptions = [
  "1 month",
  "2 months",
  "3 months",
  "4 months",
  "6 months",
  "1 year",
  "2 years",
];

export const timingOptions = [
  "Weekdays 9-11 AM",
  "Weekdays 7-9 PM",
  "Weekends 10-12 PM",
  "Mon-Wed-Fri 6-8 PM",
  "Tue-Thu-Sat 9-11 AM",
  "Flexible timing",
];

export const platformOptions = [
  "Zoom",
  "Google Meet",
  "Microsoft Teams",
  "Custom LMS",
  "Discord",
];

// students statusMap
export const statusMap = {
  active: "success",
  inactive: "secondary",
  suspended: "destructive",
  pending: "inProgress",
};

// course application statusMap
export const courseApplicationStatusMap = {
  reviewed: "secondary",
  accepted: "success",
  rejected: "destructive",
  pending: "inProgress",
};

// parse options
export const options = {
  replace: (domNode) => {
    if (domNode.name === "code") {
      return (
        <pre className="whitespace-pre-wrap">
          {domToReact(domNode.children)}
        </pre>
      );
    }
  },
};
