export interface Conversation {
  messages: {
    type: string;
    data: {
      content: string;
      example: boolean;
      additional_kwargs: {};
    };
  }[];
}
