import * as crypto from 'crypto';

export function buildCacheKey(prefix: string, params: any): string {
  const normalized = JSON.stringify(sortObject(params));
  return crypto
    .createHash('sha1')
    .update(prefix + normalized)
    .digest('hex');
}

function sortObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.slice().sort();
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((result: any, key) => {
        result[key] = sortObject(obj[key]);
        return result;
      }, {});
  }

  return obj;
}
