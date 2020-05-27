/**
 * PayExAPI: SOAP API Cleint
 * Provides halper methods to interact with soap API
 */
const soap = require('soap');
const crypto = require('crypto-js');
const parseString = require('xml2js').parseString;

let CONFIG = {};

const invoke = async (config, wsdl, name, params, specs) => {
  CONFIG = config;
  const body = get_request_body(params, specs);
  let response;
  try {
    let client = await soap.createClientAsync(wsdl);
    let [result, rawResponse, soapHeader, rawRequest] = await client[`${name}Async`](body);
    // Lets unwrap Initialize8Result key from object and get xml string
    result = result[Object.keys(result)[0]];
    // Parse XML string
    response = await parseXml(result, name);
  } catch (error) {
    response = {
      status: 'Error',
      orderRef: '',
      redirectUrl: '',
      errorCode: error
    }
  }

  return response;
};

const get_request_body = (params, specs) => {
  // 1. Parse params
  let parsed = parse_params(params, specs);
  // 2. Add hash key to params
  parsed['hash'] = hash_params(parsed, specs);
  
  return parsed;
}

const parse_params = (params, specs) => {
  params = stringify_params(params);
  for (const name in specs) {
    try {
      params[name] = parse_param(params[name], specs[name]);
    } catch (error) {
      throw error;
    }
  }
  return params;
};

const stringify_params = (params) => {
  let stringified = {};
  for(const k in params){
    stringified[k.toString()] = params[k];
  } 
  return stringified;
}

const parse_param = (param, options) => {

  if (options !== null && (typeof options) !== 'object'){
    throw Error(`Expected hash got ${options}`);
  }
  let result;
  if (param !== undefined) {
    result = param;
  }else if(options.hasOwnProperty('default')){
    result = options['default'];
  }else{
    throw Error('parameter required!');
  }
  return result;
}

const hash_params = (params, specs) => {
  // Select parameter to be signed and join them
  let signAbleParams = [];
  for(const k in specs){
    if(specs[k].signed){
      signAbleParams.push(k);
    }
  }
  const stringToSign = signAbleParams.map(k => params[k]).join('');
  // Create a MD5 hash
  return crypto.MD5(stringToSign + CONFIG.encryption_key).toString(crypto.enc.Hex);  
}

const parseXml = (result,actionName) => {
  return new Promise((resolve, reject)=> {
    parseString(result, function (err, response) {
      let responseData = {};
      // unwrap payex key from response
      response = response['payex'];
      responseData.code = response['status'][0]['code'][0];
      responseData.errorCode = response['status'][0]['errorCode'][0]
      // If any error occured during connection/authentication then we don't need to extract this data. Mostly it is not available in response
      if (responseData.code == 'OK') {
        // Conditionaly extract data from XML based on action (Initialize8/Complete)
        if (actionName=='Complete') {
          const orderStatus = response['orderStatus'][0];
          responseData.orderStatus = orderStatus;
          /* Order Status can be 0 = The order is completed (a purchase has been done,
            but check the transactionStatus to see the result). 1 = The order is processing.
            The customer has not started the purchase. PxOrder.Complete can return 
            orderStatus 1 for 2 weeks after PxOrder.Initialize is called. 
            Afterwards the orderStatus will be set to 2 = No order or transaction is found.
          */

          // If order status is not equal to 0 then no other details will be available in response.
          // Lets just set other values to empty string otherwise
          responseData.orderId = orderStatus > 0 ? '' : response['orderId'][0];
          responseData.transactionStatus = orderStatus > 0 ? '' : parse_transaction_status(response['transactionStatus'][0]);
          responseData.transactionRef = orderStatus > 0 ? '' : response['transactionRef'][0];
          responseData.errorDetails = orderStatus > 0 ? '' : (response['errorDetails'] && response['errorDetails'][0]['transactionThirdPartyError'] ? response['errorDetails'][0]['transactionThirdPartyError'][0] : '');
        }else{
          responseData.orderRef = response['orderRef'][0];
          responseData.redirectUrl = response['redirectUrl'][0];
        }
      }
      resolve(responseData);
    });
  });
}
const parse_transaction_status = (status) => {
  let parsed;
  switch (status.toString()) {
    case '0':
      parsed = 'sale';
      break;
    case '1':
      parsed = 'initialize';
      break;
    case '2':
      parsed = 'credit';
      break;
    case '3':
      parsed = 'authorize';
      break;
    case '4':
      parsed = 'cancel';
      break;
    case '5':
      parsed = 'failure';
      break;
    case '6':
      parsed = 'capture';
      break;
    default:
      parsed = status.toString();
      break;
  }
  return parsed;
}

module.exports = {invoke};
