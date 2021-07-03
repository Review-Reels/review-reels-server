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
    ],
  });
  //     const payload = ticket.getPayload();
  //     // const userid = payload["sub"];
  //     return payload;
  //   } catch (e) {
  //     return e;
  //   }
  // If request specified a G Suite domain:
  // const domain = payload['hd'];
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
      ...rest
    }) => rest;
    return removeFields(userInfo);
  } catch (e) {
    return null;
  }
};
