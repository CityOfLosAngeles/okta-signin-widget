import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import ChallengeEmailPageObject from '../framework/page-objects/ChallengeEmailPageObject';
import { RequestMock, RequestLogger } from 'testcafe';
import emailVerification from '../../../playground/mocks/data/idp/idx/authenticator-verification-email';
import success from '../../../playground/mocks/data/idp/idx/success';
import invalidOTP from '../../../playground/mocks/data/idp/idx/error-email-verify';

const logger = RequestLogger(/challenge|challenge\/poll|challenge\/answer/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const validOTPmock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(emailVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(emailVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

const invalidOTPMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(invalidOTP, 403);

fixture(`Challenge Email Authenticator Form`);

async function setup(t) {
  const challengeEmailPageObject = new ChallengeEmailPageObject(t);
  challengeEmailPageObject.navigateToPage();
  return challengeEmailPageObject;
}

test
  .requestHooks(validOTPmock)(`challenge email authenticator screen has right labels`, async t => {
    const challengeEmailPageObject = await setup(t);
    const pageTitle = challengeEmailPageObject.getPageTitle();
    const saveBtnText = challengeEmailPageObject.getSaveButtonLabel();
    await t.expect(saveBtnText).contains('Verify');
    await t.expect(pageTitle).contains('Verify with your email');
    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .contains(`An email was sent to`);
    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .contains(`inca@hello.net.`);
    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .contains(`Check your email and enter the code below.`);
  });

test
  .requestHooks(invalidOTPMock)(`challenge email authenticator with invalid OTP`, async t => {
    const challengeEmailPageObject = await setup(t);
    await challengeEmailPageObject.verifyFactor('credentials.passcode', 'xyz');
    await challengeEmailPageObject.clickNextButton();
    await challengeEmailPageObject.waitForErrorBox();
    await t.expect(challengeEmailPageObject.getInvalidOTPError()).contains('Authentication failed');
  });

test
  .requestHooks(logger, validOTPmock)(`challenge email authenticator with valid OTP`, async t => {
    const challengeEmailPageObject = await setup(t);
    await challengeEmailPageObject.verifyFactor('credentials.passcode', '1234');
    await challengeEmailPageObject.clickNextButton();
    const successPage = new SuccessPageObject(t);
    const pageUrl = await successPage.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
    await t.expect(logger.count(() => true)).eql(1);

    const { request: {
        body: answerRequestBodyString,
        method: answerRequestMethod,
        url: answerRequestUrl,
      }
    } = logger.requests[0];
    const answerRequestBody = JSON.parse(answerRequestBodyString);
    await t.expect(answerRequestBody).eql({
      credentials: {
        passcode: '1234',
      },
      stateHandle: '02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8'
    });
    await t.expect(answerRequestMethod).eql('post');
    await t.expect(answerRequestUrl).eql('http://localhost:3000/idp/idx/challenge/answer');
  });

test
  .requestHooks(logger, validOTPmock)(`Callout appears after 30 seconds`, async t => {
    const challengeEmailPageObject = await setup(t);
    await t.expect(challengeEmailPageObject.resendEmailView().hasClass('hide')).ok();
    await t.wait(30500);
    await t.expect(challengeEmailPageObject.resendEmailView().hasClass('hide')).notOk();
    const resendEmailView = challengeEmailPageObject.resendEmailView();
    await t.expect(resendEmailView.innerText).eql('Haven\'t received an email? Send again');
  });

test
  .requestHooks(logger, validOTPmock)(`Callout resend link click`, async t => {
    const challengeEmailPageObject = await setup(t);
    await t.wait(32000);

    // 8 poll requests in 32 seconds and 1 resend request after click.
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/poll/)
    )).eql(8);

    await challengeEmailPageObject.clickSendAgainLink();
    await t.expect(challengeEmailPageObject.resendEmailView().hasClass('hide')).ok();
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/resend/)
    )).eql(1);

    const { request: {
        body: firstRequestBody,
        method: firstRequestMethod,
        url: firstRequestUrl,
      }
    } = logger.requests[0];
    const { request: {
        body: lastRequestBody,
        method: lastRequestMethod,
        url: lastRequestUrl,
      }
    } = logger.requests[logger.requests.length - 1];
    let jsonBody = JSON.parse(firstRequestBody);
    await t.expect(jsonBody).eql({"stateHandle":"02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8"});
    await t.expect(firstRequestMethod).eql('post');
    await t.expect(firstRequestUrl).eql('http://localhost:3000/idp/idx/challenge/poll');

    jsonBody = JSON.parse(lastRequestBody);
    await t.expect(jsonBody).eql({"stateHandle":"02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8"});
    await t.expect(lastRequestMethod).eql('post');
    await t.expect(lastRequestUrl).eql('http://localhost:3000/idp/idx/challenge/resend');
  });