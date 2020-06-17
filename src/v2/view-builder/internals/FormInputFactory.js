import { Collection, _ } from 'okta';
import FactorOptions from '../components/FactorOptions';
import AuthenticatorEnrollOptions from '../components/AuthenticatorEnrollOptions';
import AuthenticatorVerifyOptions from '../components/AuthenticatorVerifyOptions';
import FactorUtil from '../../util/FactorUtil';

const createFactorSelectView = (opt) => {
  var optionItems = (opt.options || [])
    .map(opt => {
      return Object.assign({}, FactorUtil.getFactorData(opt.factorType), opt);
    });
  return {
    View: FactorOptions,
    options: {
      name: opt.name,
      collection: new Collection(optionItems),
    }
  };
};

const createAuthenticatorEnrollSelectView = (opt) => {
  var optionItems = (opt.options || [])
    .map(opt => {
      return Object.assign({}, opt, FactorUtil.getFactorData(opt.authenticatorType));
    });
  return {
    View: AuthenticatorEnrollOptions,
    options: {
      name: opt.name,
      collection: new Collection(optionItems),
    }
  };
};

const createAuthenticatorVerifySelectView = (opt) => {
  let optionItems = (opt.options || []);
  // If webauthn enrollments > 1 just show one entry with a generic namne (first) so user doesnt have to select which
  // one to pick. eg) If there is yubikey5 and another unknown u2f key, user cannot identify that easily. We need to
  // do this at least  until users can give authenticator enrollments custom names.
  const webauthnEnrollment = optionItems.find(x => x.authenticatorType === 'security_key');
  optionItems = optionItems.filter(opt => opt.authenticatorType !== 'security_key');
  optionItems.push(webauthnEnrollment);
  optionItems = optionItems.map(opt => {
    return Object.assign({}, opt, FactorUtil.getFactorData(opt.authenticatorType));
  });
  return {
    View: AuthenticatorVerifyOptions,
    options: {
      name: opt.name,
      collection: new Collection(optionItems),
    }
  };
};

const inputCreationStrategy = {
  factorSelect: createFactorSelectView,
  authenticatorEnrollSelect: createAuthenticatorEnrollSelectView,
  authenticatorVerifySelect: createAuthenticatorVerifySelectView
};

// TODO: move logic to uiSchemaTransformer
const create = function (uiSchemaObj) {
  const strategyFn = inputCreationStrategy[uiSchemaObj.type] || _.identity;
  return strategyFn(uiSchemaObj);
};
module.exports = {
  create,
};
