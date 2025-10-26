export type TalkItem = {
  id: string;
  key?: string;
  title: string;
  speaker?: string;
  date?: string; // ISO string
  type: "audio" | "video";
  durationSeconds?: number;
  createdAt: string; // ISO string
};

export type TalksMetadataFile = {
  items: TalkItem[];
  updatedAt: string;
};
