export enum SummaryLength {
  Short = 'a short paragraph',
  Medium = 'three paragraphs',
  Long = 'a detailed summary with multiple paragraphs',
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
