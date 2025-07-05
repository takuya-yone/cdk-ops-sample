export const ENV = {
  SAMPLE_QUEUE_URL:
    "https://sqs.ap-northeast-1.amazonaws.com/123456789012/sample-queue",
  SAMPLE_API_BASE: "https://pokeapi.co",
};

export default (): void => {
  process.env.SAMPLE_QUEUE_URL = ENV.SAMPLE_QUEUE_URL;
  process.env.SAMPLE_API_BASE = ENV.SAMPLE_API_BASE;
  return;
};
