const DOT_SEPARATOR = ".";
const _ = require("lodash");

const editPropertyByKeyPath = (obj, paths, value, condition) => {
  const pathArr = paths.split(DOT_SEPARATOR);
  let virtual = obj;
  const lastAttributeIndex = pathArr.length - 1;
  for (let i = 0; i < lastAttributeIndex; i += 1) {
    const path = pathArr[i];
    virtual = virtual[path];
    if (typeof virtual !== "object" || virtual === null) {
      return false;
    }
  }
  if (
    (typeof condition === "function" && condition(virtual[pathArr[lastAttributeIndex]]) === true) ||
    condition === undefined
  ) {
    virtual[pathArr[lastAttributeIndex]] = value;
    return true;
  }
  return false;
};

const getPropertyByKeyPath = (obj, paths) => {
  const pathArr = paths.split(DOT_SEPARATOR);
  let virtual = obj;
  const lastAttributeIndex = pathArr.length - 1;
  for (let i = 0; i < lastAttributeIndex; i += 1) {
    const path = pathArr[i];
    virtual = virtual[path];
    if (typeof virtual !== "object" || virtual === null) {
      return undefined;
    }
  }
  return virtual[pathArr[lastAttributeIndex]];
};

const deletePropertyByKeyPath = (obj, paths) => {
  let virtual = obj;
  const lastAttributeIndex = paths.length - 1;
  for (let i = 0; i < lastAttributeIndex; i += 1) {
    const path = paths[i];
    virtual = virtual[path];
    if (typeof virtual !== "object" || virtual === null) {
      return false;
    }
  }
  delete virtual[paths[lastAttributeIndex]];
  return true;
};

const deleteKeysFromObject = function(object, keys, options) {
  if (_.isEmpty(object)) {
    return object;
  }
  let keysToDelete;
  const isDeep = true;
  if (_.isUndefined(options) == false) {
    if (_.isBoolean(options.copy)) {
      isDeep = options.copy;
    }
  }

  let finalObject;
  if (isDeep) {
    finalObject = _.clone(object, isDeep);
  } else {
    finalObject = object;
  }
  if (typeof finalObject === "undefined") {
    throw new Error("undefined is not a valid object.");
  }
  if (arguments.length < 2) {
    throw new Error("provide at least two parameters: object and list of keys");
  }

  if (Array.isArray(keys)) {
    keysToDelete = keys;
  } else {
    keysToDelete = [keys];
  }
  keysToDelete.forEach(function(elem) {
    if (elem.indexOf(DOT_SEPARATOR) != -1) {
      const paths = elem.split(DOT_SEPARATOR);
      deletePropertyByKeyPath(finalObject, paths);
    } else if (typeof elem === "string") {
      delete finalObject[elem];
    }
  });

  return finalObject;
};

module.exports = {
  getPropertyByKeyPath,
  deletePropertyByKeyPath,
  deleteKeysFromObject,
  editPropertyByKeyPath
};
