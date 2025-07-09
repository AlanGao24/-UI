export type Alert = {
  name: string;
  tags: {
    domain: string;
    country: string;
    device: string;
    severity: string;
  };
  timestamp: string;
};
