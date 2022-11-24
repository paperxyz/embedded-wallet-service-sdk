export type MessageType<T> =
  | {
      eventType: string;
      success: true;
      data: T;
    }
  | {
      eventType: string;
      success: false;
      error: Error;
    };
export type CustomizationOptionsType = {
  colorPrimary?: string;
  colorBackground?: string;
  colorText?: string;
  borderRadius?: number;
  fontFamily?: string;
};
