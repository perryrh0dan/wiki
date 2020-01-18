export const base64ToArrayBuffer = function (base64url) {
  base64url = base64url.replace(/-/g,'+');
  base64url = base64url.replace(/_/g,'/');
  const base64 = base64url.replace(/%3d/g,'=');
  var binary_string = window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export const arrayBufferToBase64 = function(buffer) {
  var binary = '';
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  let base64 = window.btoa(binary);
  base64 = base64.replace(/\+/g,'-');
  base64 = base64.replace(/\//g,'_');
  const base64url = base64.replace(/=/g,'');
  return base64url
}