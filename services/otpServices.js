const redis = require("../config/redis");
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const storeOTP = async (email) => {
  const otp = generateOTP();
  await redis.set(email, otp, "EX", 120); // Expire in 2 minutes
  return otp;
};

const verifyOTP = async (email, otp) => {
  const storedOTP = await redis.get(email);
  if (storedOTP === otp) {
    await redis.del(email); // Delete OTP after successful verification
    return true;
  }
  return false;
};
module.exports = { storeOTP, verifyOTP };
