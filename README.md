# payex-node
A node module to interact with [PayEx](https://payex.com/) payment API. This library only implements ['Credit Card'](http://www.payexpim.com/category/payment-methods/) payment method provided by PayEx.

You will need a merchant account from PayEx in order get credentails to user for testing or production purpose. For further details on API you can visit PayEx technical docs; http://www.payexpim.com/payment-methods/credit-cards/

## Installation

Requirements:

- Node.js
- npm (Node.js package manager)

You can install it using npm.
```bash
npm install payex-node
```

## Usage
Detailed discription of Credit Card payment model can be found on PayEx docs reference.

Completing a transaction will involve following two steps;
1. Initialize the payment process
2. Complete transaction

The client has finished shopping and goes to “check out” to pay. The client makes a request to the merchant. Merchant starts the payment process.

### Initialize
To initialize the payment process you'll do something like this in your code;

```node
// Import package
const PayEx = require('payex-node');

// Provide credentials for PayEx 
const payex_config = {
  account_number: 'XXXXXXXX',
  encryption_key: 'XXXXXXXXXXXXXX',
  environment: 'development', // Optional; can be production/development, by default will be 'development'
  default_currency: 'SEK'
};

// Lets initialize payment process
const params = {
  orderID: "<orderID>",
  productNumber: "<productNumber>",
  description: "Some description of order",
  price: "<price>",
  vat: 0, // Vat is included in price, for further info. visit PayEx docs
  clientIPAddress: "<clientIPAddress>",
  returnUrl: "<returnUrl>",
  cancelUrl: "<cancelUrl>"
};

PayEx.initialize_transaction(payex_config, params)
  .then(response => {
    // Here you got your response from PayEx
    console.log(response);  
  });

// You can also use async/await style here. If you call this method inside of async method then you can do;
// const response = await PayEx.initialize_transaction(payex_config, params);

```

Here is what you would get in response;

```
  {
    code: 'OK',// OK in case of success otherwise different
    errorCode: 'OK',// OK in case of success otherwise different
    orderRef: 'XXXXXXXXXXXXXXXX',// will container order reference
    redirectUrl: 'https://confined.externaltest.payex.com/PxOrderCC.aspx?orderRef=XXXXXXXXXXXXXXXX' 
  }

```
You will then redirect customer to `redirectUrl` or this can be opened in an iFrame which uses PayEx new responsive design.

After redirecting the customers to `redirectUrl`, they'll enter their payment details and then PayEx will redirect them back to `return_url` with a parameter called `orderRef` appended to the query string.

### Complete
The `PayEx.complete_transactions` takes `orderRef` as input which is returned with `return_url` as query string. 

To mark transaction complete;
```node
PayEx.complete_transactions(payex_config, {orderRef: res.orderRef})
  .then(response =>{
      // response object 
      console.log(response);
      // Here you can perform completion of your order based on the response status
    });
```

The response returned from `PayEx.complete_transactions` contains following information;
```
  { 
    code: 'OK', // 
    errorCode: 'OK',
    orderStatus: '0',// 0 for success otherwise can be 1 or 2
    orderId: 'XXX',// the orderId you sent with initialize method
    transactionStatus: 'sale', // sale/0 in case of success otherwise can be initialize/1, credit/2, authorize/3, cancel/4, failure/5, capture/6 ...
    transactionRef: '',
    errorDetails: '' 
  }
```
For details on what each response parameter means visit [PayEx docs](http://www.payexpim.com/technical-reference/pxorder/complete-2/).

With this your checkout flow should be completed. Happy coding!


## License
This package is open-sourced software licensed under [MIT license](https://github.com/tahirwaseer/payex-node/blob/master/LICENSE).
