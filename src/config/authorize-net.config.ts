import { config } from "./index.js";

export const authorizeNetConfig = {
  apiLoginId: config.authorizeNet.apiLoginId,
  transactionKey: config.authorizeNet.transactionKey,
  environment:
    config.authorizeNet.environment === "production" ? "production" : "sandbox",
};

export const getAuthorizeNetEnvironment = () => {
  return authorizeNetConfig.environment === "production"
    ? "https://api.authorize.net/xml/v1/request.api"
    : "https://apitest.authorize.net/xml/v1/request.api";
};
