export interface Vocab {
  id: number;
  word: string;
  meaning: string;
  categoryId: number;
  topic: string;
  isLearned: boolean;
}

export interface Category {
  id: number;
  name: string;
  topic: string;
}
