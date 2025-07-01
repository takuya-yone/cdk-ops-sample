export const ENV = {
  SAMPLE_QUEUE_URL:
    "https://sqs.ap-northeast-1.amazonaws.com/123456789012/sample-queue",
};

export default (): void => {
  process.env.SAMPLE_QUEUE_URL = ENV.SAMPLE_QUEUE_URL;
  return;
};
