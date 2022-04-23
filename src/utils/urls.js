/*
 * Pattern matching the prefix of at least one stripped query string
 * parameter. We'll search the query string portion of the URL for this
 * pattern to determine if there's any stripping work to do.
 */
const searchPattern = new RegExp('utm_|clid|_hs|icid|igshid|mc_|mkt_tok', 'i');

/*
 * Pattern matching the query string parameters (key=value) that will be
 * stripped from the final URL.
 */
const replacePattern = new RegExp(
  '([?&]' + '(icid|mkt_tok|(g|fb)clid|igshid|_hs(enc|mi)|mc_[ce]id|utm_(source|medium|term|campaign|content|cid|reader|referrer|name|social|social-type))' + '=[^&#]*)',
  'ig'
);

// clean tracking query strings
// reference: https://git.io/Jfvnd
const strippedUrl = url => {
  const queryStringIndex = url.indexOf('?');
  if (url.search(searchPattern) > queryStringIndex) {
    let stripped = url.replace(replacePattern, '');
    if (stripped.charAt(queryStringIndex) === '&') {
      stripped = stripped.substr(0, queryStringIndex) + '?' + stripped.substr(queryStringIndex + 1);
    }
    if (stripped !== url) {
      return stripped;
    }
  }
  return url;
};

const sortQueryParam = queryString => {
  // Create a test URLSearchParams object
  const searchParams = new URLSearchParams(queryString);
  // Sort the key/value pairs
  searchParams.sort();
  let result = searchParams.toString();
  if (result && !result.startsWith('?')) {
    result = '?' + result;
  }
  return result;
};

const removeHash = url => {
  const index = url.indexOf('#');
  return index > 0 ? url.substring(0, index) : url;
};

const preprocessUrl = url => {
  const result = { url: '', query: '' };

  const tmp = removeHash(url);
  const index = tmp.indexOf('?');

  if (index > 0) {
    result.url = tmp.substring(0, index);
    result.query = tmp.substring(index + 1);
  } else {
    result.url = tmp;
  }
  return result;
};

export function getSanitizedUrl(url) {
  if (!url || !url.startsWith('http')) return '';
  const urlPart = preprocessUrl(url);
  if (urlPart.query) {
    const tmp = urlPart.url + sortQueryParam(urlPart.query);
    return strippedUrl(tmp);
  }
  return urlPart.url;
}

export function getUrlHostname(url) {
  return new URL(url).hostname;
}

export function getUrlOrigin(url) {
  return new URL(url).origin;
}

export function getUrlHost(url) {
  return new URL(url).host;
}
