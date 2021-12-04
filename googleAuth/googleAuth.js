const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client([
  process.env.CLIENT_ID,
  process.env.IOS_CLIENT_ID,
  process.env.ANDROID_CLIENT_ID,
]);
function verify(token) {
  return client.verifyIdToken({
    idToken: token,
    audience: [
      process.env.CLIENT_ID,
      process.env.IOS_CLIENT_ID,
      process.env.ANDROID_CLIENT_ID,
      process.env.ANDROID_STANDALONE,
      process.env.IOS_STANDALONE,
    ],
  });
}

module.exports = async function verifyAndGetUser(token) {
  try {
    const response = await verify(token);
    const userInfo = response.getPayload();
    const removeFields = ({
      iss,
      azp,
      aud,
      sub,
      email_verified,
      at_hash,
      nonce,
      locale,
      iat,
      exp,
      given_name,
      family_name,
      hd,
      jti,
      ...rest
    }) => rest;
    return removeFields(userInfo);
  } catch (e) {
    return null;
  }
};
