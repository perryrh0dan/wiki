import { base64ToArrayBuffer, arrayBufferToBase64 } from './base64';

/**
 * Decodes arrayBuffer required fields for credential request.
 */
export const preformatMakeCredReq = function (makeCredReq) {
  makeCredReq.challenge = base64ToArrayBuffer(makeCredReq.challenge);
  makeCredReq.user.id = base64ToArrayBuffer(makeCredReq.user.id);

  return makeCredReq
}

/**
 * Decodes arrayBuffer required fields for assertion request.
 */
export const preformatGetAssertReq = function (getAssert) {
  getAssert.challenge = base64ToArrayBuffer(getAssert.challenge);

  for (let allowCred of getAssert.allowCredentials) {
    allowCred.id = base64ToArrayBuffer(allowCred.id);
  }

  return getAssert
}

/**
 * Converts PublicKeyCredential into serialised JSON
 * @param  {Object} pubKeyCred
 * @return {Object}            - JSON encoded publicKeyCredential
 */
export const publicKeyCredentialToJSON = function (pubKeyCred) {
  if (pubKeyCred instanceof Array) {
    let arr = [];
    for (let i of pubKeyCred)
      arr.push(publicKeyCredentialToJSON(i));

    return arr
  }

  if (pubKeyCred instanceof ArrayBuffer) {
    return arrayBufferToBase64(pubKeyCred)
  }

  if (pubKeyCred instanceof Object) {
    let obj = {};

    for (let key in pubKeyCred) {
      obj[key] = publicKeyCredentialToJSON(pubKeyCred[key])
    }

    return obj
  }

  return pubKeyCred
}