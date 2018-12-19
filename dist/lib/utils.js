"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typesMap = [
    'Number',
    'String',
    'Function',
    'Null',
    'Undefined',
    'Array',
    'Object',
    'Symbol',
    'AsyncFunction',
    'GeneratorFunction',
    'Promise'
];
exports.isType = type => {
    const typeMap = typesMap;
    if (typeMap.indexOf(type) === -1)
        throw `type must in ${typeMap}`;
    return obj => toString.call(obj) == `[object ${type}]`;
};
exports.generatorAutoRunner = function (generatorFunction, scope, args = []) {
    const iterator = generatorFunction.call(scope, ...args);
    const kTrue = true;
    while (kTrue) {
        let res = iterator.next();
        if (res.done)
            return res.value;
    }
};
exports.awsomeFnRunner = async function (fn, scope, args = []) {
    const isAsyncFunction = exports.isType('AsyncFunction');
    const isGeneratorFunction = exports.isType('GeneratorFunction');
    const isPromise = exports.isType('Promise');
    const isFunction = exports.isType('Function');
    try {
        if (isAsyncFunction(fn) || isPromise(fn)) {
            return await fn.call(scope, ...args);
        }
        if (isGeneratorFunction(fn)) {
            return exports.generatorAutoRunner(fn, scope, args);
        }
        if (isFunction(fn)) {
            return fn.call(scope, ...args);
        }
    }
    catch (e) {
        throw e;
    }
    throw TypeError('fn必须满足[AsyncFunction,GeneratorFunction,Promise,Function]之一');
};
