export interface Option {
  id: string;
  text: string;
  is_correct?: boolean;
}

export interface DiagramObject {
  type: string;
  color: string;
  number: number;
  position: string;
  layout: {
    rows: number;
    columns: number;
    position: "top" | "bottom" | "left" | "right" | "center";
    alignment: "left" | "center" | "right";
  };
  weight_value: number | null;
}

export interface DiagramConfig {
  diagram_id: number;
  diagram_type: string;
  scale_weight: number;
  objects: DiagramObject[];
}

export interface ContentBlockData {
  type: "qoraal" | "table" | "table-grid" | "problem" | "video" | "list" | "quiz";
  title?: string;
  text?: string;
  url?: string;
  url1?: string;
  url2?: string;
  url3?: string;
  url4?: string;
  url5?: string;
  text1?: string;
  text2?: string;
  text3?: string;
  text4?: string;
  text5?: string;
  format?: "latex" | "markdown" | "html";
  order: number;
  content: {
    type: string;
    format?: string;
    hints: Array<{ text: string; order: number }>;
    steps: Array<{ text: string; order: number }>;
    feedback: {
      correct: string;
      incorrect: string;
    };
    metadata: {
      tags: string[];
      difficulty: string;
      estimated_time: number;
    };
  };
  // List specific fields
  list_items?: string[];
  // Problem specific fields
  question_type?:
  | "multiple_choice"
  | "single_choice"
  | "true_false"
  | "fill_blank"
  | "matching"
  | "open_ended"
  | "math_expression"
  | "code"
  | "diagram";
  which?: string | null;
  question_text?: string;
  options?: Option[];
  correct_answer?: Option[];
  explanation?: string;
  xp?: number;
  img?: string | null;
  diagram_config?: DiagramConfig;
  // Table specific fields
  features?: Array<{ title: string; text: string }>;
  table?: {
    header: string[];
    rows: string[][];
  };
  // Video specific fields
  description?: string;
  duration?: number;
  video_source_type?: 'upload' | 'external';
  uploaded_video_id?: number | null;
  video_url?: string | null;
}

export interface ContentBlock {
  id: number;
  block_type: "text" | "problem";
  content: ContentBlockData;
  order: number;
  lesson: number;
  problem?: number;
}

export interface ProblemData {
  id?: number;
  lesson: number;
  which: string | null;
  question_text: string;
  question_type: string;
  options: Option[];
  correct_answer: Option[];
  explanation: string;
  content: {
    type: string;
    hints: Array<{ text: string; order: number }>;
    steps: Array<{ text: string; order: number }>;
    feedback: {
      correct: string;
      incorrect: string;
    };
    metadata: {
      tags: string[];
      difficulty: string;
      estimated_time: number;
    };
  };
  xp: number;
  order: number;
  img?: string | null;
  video_url?: string | null;
  uploaded_video_id?: number | null;
  diagram_config?: DiagramConfig;
}
