/**
 * PayEx: Payment gateway
 * ##CreditCard checkout flow
 * 
 */
const PayExOrder = require('./src/order');

const SETTINGS= {
  
  TEST_URL: 'https://external.externaltest.payex.com/',
  LIVE_URL: 'https://external.payex.com',
  
};

const PayEx = {
  initialize_payex: (config) => {
    let validated = {};
    if(config.account_number){
      validated.account_number = config.account_number;
    }else{
      throw 'account_number missing in config!';
    }
    if(config.encryption_key){
      validated.encryption_key = config.encryption_key;
    }else{
      throw 'encryption_key missing in config!';
    }
    validated.default_currency = config.default_currency ? config.default_currency : 'SEK';
    validated.base_url = config.environment === 'production' ? SETTINGS.LIVE_URL : SETTINGS.TEST_URL;
    return validated;
  },
  initialize_transaction: (config, params) => {
    config = PayEx.initialize_payex(config);
    return PayExOrder.Initialize(config, params);
  },
  complete_transactions: (config, params) => {
    config = PayEx.initialize_payex(config);
    return PayExOrder.Complete(config, params);
  }
};

module.exports = PayEx;