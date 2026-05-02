import AuthorizeNet from "authorizenet";
import { TransactionService } from "./transaction.service.js";
import { authorizeNetConfig } from "../config/authorize-net.config.js";

const { APIContracts, APIControllers } = AuthorizeNet;

export class PaymentService {
  private transactionService: TransactionService;

  constructor() {
    this.transactionService = new TransactionService();
  }

  /**
   * Process credit card payment
   */
  async processCreditCardPayment(params: {
    amount: number;
    cardNumber: string;
    expirationDate: string; // YYYY-MM
    cardCode: string;
    customerName: string;
    customerEmail?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    orderId: number;
  }): Promise<{
    success: boolean;
    transactionId?: string;
    message: string;
    response?: any;
  }> {
    try {
      if (
        !authorizeNetConfig.apiLoginId ||
        !authorizeNetConfig.transactionKey
      ) {
        throw new Error("Authorize.Net credentials missing");
      }

      // Merchant Auth
      const merchantAuth = new APIContracts.MerchantAuthenticationType();
      merchantAuth.setName(authorizeNetConfig.apiLoginId);
      merchantAuth.setTransactionKey(authorizeNetConfig.transactionKey);

      // Card
      const card = new APIContracts.CreditCardType();
      card.setCardNumber(params.cardNumber);
      card.setExpirationDate(params.expirationDate);
      card.setCardCode(params.cardCode);

      const paymentType = new APIContracts.PaymentType();
      paymentType.setCreditCard(card);

      // Transaction Request
      const transactionRequest = new APIContracts.TransactionRequestType();
      transactionRequest.setTransactionType(
        APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION,
      );
      transactionRequest.setAmount(params.amount);
      transactionRequest.setPayment(paymentType);

      // Customer
      if (params.customerEmail) {
        const customerData = new APIContracts.CustomerDataType();
        customerData.setEmail(params.customerEmail);
        transactionRequest.setCustomer(customerData);
      }

      // Billing Address
      if (params.address || params.city || params.state || params.zip) {
        const billTo = new APIContracts.CustomerAddressType();
        const names = params.customerName.split(" ");
        billTo.setFirstName(names[0] || "");
        billTo.setLastName(names.slice(1).join(" ") || "");
        if (params.address) billTo.setAddress(params.address);
        if (params.city) billTo.setCity(params.city);
        if (params.state) billTo.setState(params.state);
        if (params.zip) billTo.setZip(params.zip);
        transactionRequest.setBillTo(billTo);
      }

      // Final Request
      const request = new APIContracts.CreateTransactionRequest();
      request.setMerchantAuthentication(merchantAuth);
      request.setTransactionRequest(transactionRequest);

      const responseData = await new Promise<any>((resolve, reject) => {
        const controller = new APIControllers.CreateTransactionController(
          request.getJSON(),
        );
        controller.execute(() => {
          try {
            const apiResponse = controller.getResponse();
            if (!apiResponse) {
              reject(new Error("No response from Authorize.Net"));
              return;
            }
            const response = new APIContracts.CreateTransactionResponse(
              apiResponse,
            );
            resolve(response);
          } catch (err) {
            reject(err);
          }
        });
      });

      if (responseData.getMessages().getResultCode() === "Ok") {
        const tx = responseData.getTransactionResponse();
        if (tx?.getMessages()) {
          const transactionId = tx.getTransId();

          await this.transactionService.createTransaction({
            orderId: params.orderId,
            paymentMethod: "ONLINE",
            amount: params.amount,
            status: "COMPLETED",
            transactionId,
            gatewayResponse: {
              authCode: tx.getAuthCode(),
              transId: transactionId,
              responseCode: tx.getResponseCode(),
              message: tx.getMessages().getMessage()[0].getDescription(),
            },
          });

          return {
            success: true,
            transactionId,
            message: "Payment processed successfully",
            response: {
              authCode: tx.getAuthCode(),
              transId: transactionId,
            },
          };
        }
      }

      const errorMessage =
        responseData?.getMessages()?.getMessage()?.[0]?.getText() ||
        "Payment failed";

      return {
        success: false,
        message: errorMessage,
        response: responseData,
      };
    } catch (error: any) {
      console.error("Authorize.Net Payment Error:", error);
      return {
        success: false,
        message: error.message || "Payment processing failed",
      };
    }
  }

  /**
   * Process payment with Accept.js opaque data (PCI-compliant)
   * This method was missing and causing the error
   */
  async processPaymentWithOpaqueData(params: {
    amount: number;
    opaqueDataDescriptor: string;
    opaqueDataValue: string;
    customerName: string;
    customerEmail?: string;
    orderId: number;
  }): Promise<{
    success: boolean;
    transactionId?: string;
    message: string;
  }> {
    try {
      if (
        !authorizeNetConfig.apiLoginId ||
        !authorizeNetConfig.transactionKey
      ) {
        throw new Error("Authorize.Net credentials missing");
      }

      // Merchant Auth
      const merchantAuth = new APIContracts.MerchantAuthenticationType();
      merchantAuth.setName(authorizeNetConfig.apiLoginId);
      merchantAuth.setTransactionKey(authorizeNetConfig.transactionKey);

      // Opaque Data (tokenized card from Accept.js)
      const opaqueData = new APIContracts.OpaqueDataType();
      opaqueData.setDataDescriptor(params.opaqueDataDescriptor);
      opaqueData.setDataValue(params.opaqueDataValue);

      const paymentType = new APIContracts.PaymentType();
      paymentType.setOpaqueData(opaqueData);

      // Transaction Request
      const transactionRequest = new APIContracts.TransactionRequestType();
      transactionRequest.setTransactionType(
        APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION,
      );
      transactionRequest.setAmount(params.amount);
      transactionRequest.setPayment(paymentType);

      // Customer
      if (params.customerEmail) {
        const customerData = new APIContracts.CustomerDataType();
        customerData.setEmail(params.customerEmail);
        transactionRequest.setCustomer(customerData);
      }

      // Final Request
      const request = new APIContracts.CreateTransactionRequest();
      request.setMerchantAuthentication(merchantAuth);
      request.setTransactionRequest(transactionRequest);

      const responseData = await new Promise<any>((resolve, reject) => {
        const controller = new APIControllers.CreateTransactionController(
          request.getJSON(),
        );
        controller.execute(() => {
          try {
            const apiResponse = controller.getResponse();
            if (!apiResponse) {
              reject(new Error("No response from Authorize.Net"));
              return;
            }
            const response = new APIContracts.CreateTransactionResponse(
              apiResponse,
            );
            resolve(response);
          } catch (err) {
            reject(err);
          }
        });
      });

      if (responseData.getMessages().getResultCode() === "Ok") {
        const tx = responseData.getTransactionResponse();
        if (tx?.getMessages()) {
          const transactionId = tx.getTransId();

          await this.transactionService.createTransaction({
            orderId: params.orderId,
            paymentMethod: "ONLINE",
            amount: params.amount,
            status: "COMPLETED",
            transactionId,
            gatewayResponse: {
              authCode: tx.getAuthCode(),
              transId: transactionId,
            },
          });

          return {
            success: true,
            transactionId,
            message: "Payment processed successfully",
          };
        }
      }

      return {
        success: false,
        message: "Payment authorization failed",
      };
    } catch (error: any) {
      console.error("Authorize.Net Opaque Payment Error:", error);
      return {
        success: false,
        message: error.message || "Payment processing failed",
      };
    }
  }
}
