// ── Email format check ────────────────────
export const isValidEmail = (email) =>
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);

// ── Password rules ────────────────────────
export const passwordRules = [
  { label: "At least 12 characters", test: (p) => p.length >= 12 },
  { label: "At least one uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "At least one lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "At least one number", test: (p) => /\d/.test(p) },
  {
    label: "At least one special character (!@#$%^&*)",
    test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
  },
  {
    label: "No spaces at the beginning or end",
    test: (p) => p === p.trim(),
  },
];

export const validatePassword = (password) => {
  return passwordRules.filter((r) => !r.test(password)).map((r) => r.label);
};

// ── Signup form validation ─────────────────
export const validateSignup = ({ name, email, password, confirmPassword }) => {
  const errors = {};

  if (!name || name.trim().length < 2)
    errors.name = "Name must be at least 2 characters.";

  if (!email) errors.email = "Email is required.";
  else if (!isValidEmail(email.trim()))
    errors.email = "Enter a valid email address.";

  if (!password) errors.password = "Password is required.";
  else {
    const pwErrors = validatePassword(password);
    if (pwErrors.length) errors.password = pwErrors[0];
  }

  if (!confirmPassword)
    errors.confirmPassword = "Please confirm your password.";
  else if (password !== confirmPassword)
    errors.confirmPassword = "Passwords do not match.";

  return errors;
};

// ── Login form validation ──────────────────
export const validateLogin = ({ email, password }) => {
  const errors = {};

  if (!email) errors.email = "Email is required.";
  else if (!isValidEmail(email.trim()))
    errors.email = "Enter a valid email address.";

  if (!password) errors.password = "Password is required.";

  return errors;
};
