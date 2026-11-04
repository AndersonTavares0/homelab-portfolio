const blockedKeys = new Set(['__proto__', 'constructor', 'prototype']);

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function clone(value, options) {
  if (Array.isArray(value)) {
    return value.map((item) => clone(item, options));
  }
  if (!isObject(value)) return value;
  return merge({}, value, options);
}

function merge(target, source, options = {}) {
  if (!isObject(source)) return clone(source, options);
  const output = {};
  if (isObject(target)) {
    for (const key of Object.keys(target)) {
      if (!blockedKeys.has(key)) output[key] = clone(target[key], options);
    }
  }

  for (const key of Object.keys(source)) {
    if (blockedKeys.has(key)) continue;
    const sourceValue = source[key];
    const targetValue = output[key];

    if (Array.isArray(sourceValue)) {
      output[key] = typeof options.arrayMerge === 'function'
        ? options.arrayMerge(Array.isArray(targetValue) ? targetValue : [], sourceValue)
        : clone(sourceValue, options);
    } else if (isObject(sourceValue) && isObject(targetValue)) {
      output[key] = merge(targetValue, sourceValue, options);
    } else {
      output[key] = clone(sourceValue, options);
    }
  }

  return output;
}

export default merge;
