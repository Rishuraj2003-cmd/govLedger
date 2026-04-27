export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function getOtpExpiry(minutes = 10) {
  return new Date(Date.now() + minutes * 60 * 1000);
}
