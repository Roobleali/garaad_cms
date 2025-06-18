export interface TableFeature {
  title: string;
  text: string;
}

export interface TableGrid {
  header: string[];
  rows: string[][];
}

export interface TextContent {
  type: "text" | "2_hovers" | "table" | "table-grid";
  features?: TableFeature[];
  table?: TableGrid;
}
