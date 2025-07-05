export const ENV = {
  QUEUE_URL:
    "https://sqs.ap-northeast-1.amazonaws.com/123456789012/sample-queue",
  API_BASE_URL: "https://pokeapi.co",
};

export default (): void => {
  process.env.QUEUE_URL = ENV.QUEUE_URL;
  process.env.API_BASE_URL = ENV.API_BASE_URL;
  return;
};
