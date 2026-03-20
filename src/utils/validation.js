const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

const isStrongPassword = (password) => {
  return password && password.length >= 8;
};

module.exports = { isValidEmail, isValidUrl, isStrongPassword };