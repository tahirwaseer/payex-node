/**
 * PayExOrder 
 * Implements order flow methods
 */

const PayExAPI = require('./api');

const wsdl = (config) => `${config.base_url}/pxorder/pxorder.asmx?WSDL`;

const Initialize = (config, params) => {
  return PayExAPI.invoke(config, wsdl(config), 'Initialize8', params, {
    'accountNumber': {
      signed: true,
      default: config.account_number
    },
    'purchaseOperation': {
      signed: true,
      default: 'SALE'
    },
    'price': {
      signed: true,
      format: Number
    },
    'priceArgList': {
      signed: true,
      default: ''
    },
    'currency': {
      signed: true,
      default: config.default_currency
    },
    'vat': {
      signed: true,
      format: Number,
      default: 0
    },
    'orderID': {
      signed: true,
      format: /^[a-z0-9]{,50}$/i
    },
    'productNumber': {
      signed: true,
      format: /^[A-Z0-9]{,50}$/
    },
    'description': {
      signed: true,
      format: /^.{,160}$/
    },
    'clientIPAddress': {
      signed: true
    },
    'clientIdentifier': {
      signed: true,
      default: ''
    },
    'additionalValues': {
      signed: true,
      default: ''
    },
    'externalID': {
      signed: true,
      default: ''
    },
    'returnUrl': {
      signed: true
    },
    'view': {
      signed: true,
      default: 'CREDITCARD'
    },
    'agreementRef': {
      signed: true,
      default: ''
    },
    'cancelUrl': {
      signed: true,
      default: ''
    },
    'clientLanguage': {
      signed: true,
      default: ''
    }
  });
};

const Complete = (config, params) => {
  return PayExAPI.invoke(config, wsdl(config), 'Complete', params, {
    'accountNumber' : {
      signed: true,
      default: config.account_number
    },
    'orderRef' : {
      signed: true
    }
  });
};

module.exports = {Initialize, Complete, wsdl};