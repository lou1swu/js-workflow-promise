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
]
/**
 * 偏函数实现格式校验
 * @param {*} type
 */
export const isType: (type: string) => (obj) => boolean = type => {
  const typeMap = typesMap
  if (typeMap.indexOf(type) === -1) throw `type must in ${typeMap}`
  return obj => toString.call(obj) == `[object ${type}]`
}

/**
 * 自执行generatorFunction
 * @param generatorFunction
 */
export const generatorAutoRunner = function(
  generatorFunction: GeneratorFunction,
  scope,
  args: Array<any> = []
) {
  const iterator = generatorFunction.call(scope, ...args)
  const kTrue = true
  while (kTrue) {
    let res = iterator.next()
    if (res.done) return res.value
  }
}

export const awsomeFnRunner = async function(fn, scope, args: Array<any> = []) {
  const isAsyncFunction = isType('AsyncFunction')
  const isGeneratorFunction = isType('GeneratorFunction')
  const isPromise = isType('Promise')
  const isFunction = isType('Function')

  try {
    if (isAsyncFunction(fn) || isPromise(fn)) {
      return await fn.call(scope, ...args)
    }
    if (isGeneratorFunction(fn)) {
      return generatorAutoRunner(fn, scope, args)
    }
    if (isFunction(fn)) {
      return fn.call(scope, ...args)
    }
  } catch (e) {
    throw e
  }
  throw TypeError(
    'fn必须满足[AsyncFunction,GeneratorFunction,Promise,Function]之一'
  )
}
