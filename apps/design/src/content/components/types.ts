export type ComponentDocSection = {
  title: string;
  body?: string;
  code?: string;
};

export type ComponentDocExample = {
  title: string;
  body: string;
  code: string;
};

export type ComponentDoc = {
  id: string;
  summary: string;
  shadcnSlug?: string;
  imports: string[];
  install?: string;
  usage: string;
  composition: string[];
  examples: ComponentDocExample[];
  figmaNotes: string[];
  apiNotes: string[];
};
