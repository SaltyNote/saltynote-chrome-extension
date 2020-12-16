import CryptoJS from 'crypto-js';
import * as dayjs from 'dayjs';
import * as relativeTime from 'dayjs/plugin/relativeTime';
import validator from 'validator';

dayjs.extend(relativeTime);
const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

export const removeScriptTags = text => {
  while (SCRIPT_REGEX.test(text)) {
    text = text.replace(SCRIPT_REGEX, '');
  }
  return text;
};

export const addZero = value => ('0' + value).slice(-2);

export const formatDate = value => {
  if (value) {
    const dt = new Date(value);
    return `${dt.getFullYear()}/${addZero(dt.getMonth() + 1)}/${addZero(dt.getDate())}`;
  }
  return '';
};

export const encrypt = (object, key) => {
  return CryptoJS.AES.encrypt(JSON.stringify(object), key).toString();
};

export const decrypt = (text, key) => {
  const bytes = CryptoJS.AES.decrypt(text, key);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

export const getCurrentTimestamp = () => new Date().getTime();

export const parseNoteId = path => {
  if (path && path.lastIndexOf('/') > 0 && !path.endsWith('/')) {
    return path.substring(path.lastIndexOf('/') + 1);
  }
  return '';
};

export const parseTags = tags => {
  if (!tags) return [];
  const result = new Set();
  tags.split(',').forEach(t => {
    const tag = t.trim();
    if (!tag) return;
    result.add(tag);
  });
  return result;
};

export const isBlank = str => {
  return !str || !str.trim();
};

export const readableTimestamp = ts => dayjs(ts).fromNow();

export const isNoShortThanN = (value, len) => {
  return !validator.isEmpty(value) && value.length >= len;
};
export const isUsernameValid = username => {
  return isNoShortThanN(username, 6) && validator.matches(username, '^[a-z0-9-_]+$', 'i');
};
export const isPasswordValid = password => {
  return isNoShortThanN(password, 6);
};
export const isEmail = email => {
  return validator.isEmail(email);
};
