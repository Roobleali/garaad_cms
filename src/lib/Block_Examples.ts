import { ContentBlockData, DiagramConfig } from "@/app/types/content";

export const DEFAULT_CONTENT: ContentBlockData = {
  title: "",
  text: "",
  url: "",
  text1: "",
  text2: "",
  text3: "",
  text4: "",
  text5: "",
  type: "qoraal",
  order: 0,
  content: {
    type: "text",
    hints: [],
    steps: [],
    feedback: {
      correct: "Waa sax!",
      incorrect: "Isku day mar kale",
    },
    metadata: {
      tags: [],
      difficulty: "medium",
      estimated_time: 5,
    },
  },
  features: [],
  table: {
    header: [],
    rows: [],
  },
};

export // Add table example template
const TABLE_EXAMPLE: ContentBlockData = {
  type: "table",
  title: "",
  text: "Nidaamka hadda jira, tuugtu waxay xadi karaan qoraallo bannaan ama way beddeli karaan markii wax dhacaan ka dib. Tixgeli liiskan astaamaha amniga ee aan ku dari karno:",
  format: "latex",
  order: 0,
  content: {
    type: "table",
    hints: [],
    steps: [],
    feedback: {
      correct: "Waa sax!",
      incorrect: "Isku day mar kale",
    },
    metadata: {
      tags: [],
      difficulty: "medium",
      estimated_time: 5,
    },
  },
  features: [
    {
      title: "Xaqiijinta",
      text: "Milkiilayaasha akoonnada waxay leeyihiin hab ay ku daraan saxiix aan la been abuuri karin, qoraalladuna waxay qiimo yeeshaan oo keliya marka saxiixan la saxiixo.",
    },
    {
      title: "Celceliska Lacag Bixinta",
      text: "Milkiilaha akoonku wuu buri karaa wareejinta ka dib marka la dhammeeyo.",
    },
    {
      title: "Qarin",
      text: "Macluumaadka ku qoran qoraalka waa laga qariyaa qof kasta marka laga reebo qofka loogu talagalay.",
    },
    {
      title: "Ka Hortagga Wax Ka Beddelka",
      text: "Waxaa jirta hab lagu hubiyo in qoraalka aan la beddelin ka dib marka uu milkiilaha akoonku bixiyo.",
    },
  ],
};

export const DEFAULT_DIAGRAM_CONFIG: DiagramConfig = {
  diagram_id: 101,
  diagram_type: "scale",
  scale_weight: 15,
  objects: [
    {
      type: "cube",
      color: "#4F8EF7",
      number: 5,
      position: "left",
      layout: {
        rows: 2,
        columns: 3,
        position: "center",
        alignment: "center",
      },
      weight_value: null,
    },
  ],
};

export const DIAGRAM_EXAMPLE: ContentBlockData = {
  type: "problem",
  question_type: "diagram",
  which: "diagram",
  question_text: "What is the total weight on the scale?",
  options: [
    { id: "1", text: "10" },
    { id: "2", text: "15" },
    { id: "3", text: "20" },
    { id: "4", text: "25" },
  ],
  correct_answer: [{ id: "2", text: "15" }],
  explanation: "The total weight is the sum of all objects.",
  content: {
    type: "diagram",
    format: "default",
    hints: [],
    steps: [],
    feedback: {
      correct: "Waa sax!",
      incorrect: "Isku day mar kale",
    },
    metadata: {
      tags: [],
      difficulty: "medium",
      estimated_time: 5,
    },
  },
  diagram_config: DEFAULT_DIAGRAM_CONFIG,
  img: null,
  xp: 10,
  order: 0,
};

export const MULTIPLE_CHOICE_EXAMPLE: ContentBlockData = {
  type: "problem",
  question_type: "multiple_choice",
  which: null,
  question_text:
    "Waa maxay isla'egta ay tahay inay run noqoto haddii saxiixa Alice ee 707 laga xisaabiyay wax soo saarka furaha qarsoon iyo fariinteeda?",
  options: [
    {
      id: "a",
      text: "\\(\\text{signature} = \\text{publicKey} \\times m\\)",
    },
    {
      id: "b",
      text: "\\(\\text{signature} \\times 5 = \\text{publicKey} \\times m\\)",
    },
    {
      id: "c",
      text: "\\(\\text{signature} \\times m = \\text{publicKey} \\times 5\\)",
    },
    {
      id: "d",
      text: "Suurtagal maaha in la xaqiijiyo ilaa aan isticmaalno furaha qarsoon ee isla'egta.",
    },
  ],
  correct_answer: [
    {
      id: "b",
      text: "\\(\\text{signature} \\times 5 = \\text{publicKey} \\times m\\)",
    },
  ],
  explanation:
    "Furaha guud (\\(\\text{publicKey}\\)) waxaa laga xisaabiyaa \\(5 \\times s\\), halka saxiixa (\\(\\text{signature}\\)) laga xisaabiyo \\(m \\times s\\). Sidaas darteed, saxiix ansax ah, isla'egtan ayaa run noqon doonta:\n\n$$\\text{signature} \\times 5 = \\text{publicKey} \\times m$$\n$$m \\times s \\times 5 = 5 \\times s \\times m$$\n\nTani waa sababta oo ah kala horreynta isku dhufashadu waxba kama duwana, labadan tibaaxoodna waxay leeyihiin isla arrimo sax ah: \\(5\\), \\(m\\), iyo \\(s\\).",
  format: "latex",
  order: 0,
  content: {
    type: "multiple_choice",
    hints: [],
    steps: [],
    feedback: {
      correct:
        "Waa sax! Waxaad si fiican u fahamtay sida saxiixyada cryptographic-ga ah u shaqeeyaan.",
      incorrect:
        "Isku day mar kale. Tixgeli sida furaha guud iyo saxiixa loo xisaabiyay.",
    },
    metadata: {
      tags: ["cryptography", "digital-signatures", "math"],
      difficulty: "medium",
      estimated_time: 5,
    },
  },
  xp: 10,
};

export const LIST_EXAMPLE: ContentBlockData = {
  type: "list",
  title: "",
  text: "",
  list_items: [""],
  order: 0,
  content: {
    type: "list",
    hints: [],
    steps: [],
    feedback: {
      correct: "Waa sax!",
      incorrect: "Isku day mar kale",
    },
    metadata: {
      tags: [],
      difficulty: "medium",
      estimated_time: 5,
    },
  },
};
