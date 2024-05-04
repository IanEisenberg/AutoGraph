export type TopicData = {
    [topic: string]: {
      topic_input: string;
      summary_text: string;
      existing_entities_used: string[];
      new_entities: string[];
    };
  };