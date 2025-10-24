const crypto = require('crypto');

const splitFullName = (fullName = '') => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { firstName: null, lastName: null };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: null };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' ')
  };
};

const buildEmployeeCode = (prefix = 'EMP') => {
  const stamp = Date.now().toString().slice(-6);
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}-${stamp}-${random}`;
};

const buildCandidateCode = (prefix = 'CAN') => {
  const stamp = Date.now().toString().slice(-6);
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}-${stamp}-${random}`;
};

const buildJobCode = (title = 'JOB') => {
  const normalized = title
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 6);
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${normalized || 'JOB'}-${random}`;
};

const parseLocation = (label = '') => {
  if (!label) {
    return { label: null, city: null, country: null };
  }

  const pieces = label.split(',').map((part) => part.trim()).filter(Boolean);

  if (pieces.length === 1) {
    return { label, city: pieces[0], country: null };
  }

  const country = pieces.pop();
  const city = pieces.join(', ');

  return {
    label,
    city: city || null,
    country: country || null
  };
};

module.exports = {
  splitFullName,
  buildEmployeeCode,
  buildCandidateCode,
  buildJobCode,
  parseLocation
};