import { isType, awsomeFnRunner } from './utils'

const isObject = isType('Object')
const isArray = isType('Array')

export interface WorkflowOptions {
  /**工作流名称 */
  name: string
  /**贯穿整个工作流的上下文 */
  context: any
  /**是否开启工作流调试模式，开启后会记录运行细节到historyStore */
  debug?: boolean
}

export interface Target {
  (task: Task, scope: Workflow): any
}

export interface Task {
  /**任务名称 */
  name: string
  /**目标任务-函数 */
  target: Target
  /**目标任务函数执行所在作用域 */
  scope?: any
  /**该次任务的描述 */
  description?
  /**是否应该执行该次任务 */
  filter?: (task: Task) => boolean
}

export interface TaskConfig {
  taskName: string
  timeCost: string | number
  ret: any
  error: any
  description: string
}

export interface WorkflowConfig {
  workflowName: string
  timeCost: string | number
  taskPath: Array<Task> | Array<Array<Task>>
}

export interface Record {
  [propName: string]: WorkflowConfig
}

interface historyStore {
  record: Record
  initWorkflow: (name: string) => void
  initTask: (workflowName: string, forkTask: Array<Task> | Task) => void
  setTask: (
    workflowName: string,
    taskConfig: TaskConfig,
    orderId: number
  ) => void
  setWorkflowTimeCost: (workflowName: string, timeCost: string) => void
  removeWorkflow: (workflowName: string) => void
}

///////////////////////////////////////////////
/**
 * 存储workflow的历史路径 - 全局
 */
//////////////////////////////////////////////
let historyStore: historyStore = {
  record: {},
  initWorkflow(name: string) {
    this.record[name] = {
      workflowName: name,
      taskPath: [],
      timeCost: 0
    }
  },
  initTask(workflowName: string, forkTask: Array<Task> | Task) {
    if (isObject(forkTask)) {
      this.record[workflowName].taskPath.push(null)
    } else if (isArray(forkTask)) {
      this.record[workflowName].taskPath.push([])
    }
  },
  setTask(workflowName: string, taskConfig: TaskConfig, orderId: number) {
    const taskPath = this.record[workflowName]['taskPath']
    if (!taskPath[orderId]) {
      taskPath[orderId] = taskConfig
    } else if (isArray(taskPath[orderId])) {
      taskPath[orderId].push(taskConfig)
    }
  },
  setWorkflowTimeCost(workflowName: string, timeCost: string) {
    this.record[workflowName]['timeCost'] = timeCost
  },
  removeWorkflow(workflowName: string) {
    this.record[workflowName] = null
  }
}

const taskRunner = async function(task: Task, workflowInst: Workflow) {
  const { name, target, scope, description, filter } = task as Task

  /**工作流结束 */
  if (workflowInst.done) return
  if (filter) {
    const filterRes = await awsomeFnRunner(filter, task, [task])
    /**当前任务不可命中 */
    if (!filterRes) return
  }

  let error = null
  let ret = null
  const startTime = Date.now()
  try {
    ret = await awsomeFnRunner(target, scope || task, [
      task,
      scope || workflowInst
    ])
  } catch (e) {
    error = e
  }
  if (workflowInst.debug) {
    const endTime = Date.now()
    const taskConfig = {
      taskName: name,
      description,
      ret,
      error,
      timeCost: (endTime - startTime).toFixed(2)
    }
    historyStore.setTask(workflowInst.name, taskConfig, workflowInst.orderId)
  }
  if (error) throw error
  return ret
}

///////////////////////////////////////////////
/**
 * js工作流
 * - init; 初始化工作流
 * - add; 往工作流添加任务
 * - cancel; 取消该工作流
 * @param {*} opts
 * @summary add-task可以添加单个task或者一个task组，只有其中一个task报错，则会抛出异常，且后面的task都不会执行
 */
//////////////////////////////////////////////
class Workflow {
  name: string = 'workflow-demo'
  context: any = null
  debug: boolean = false
  record: WorkflowConfig = null
  public orderId: number = 0
  public done: boolean = false
  private _taskArr: Array<any> = []

  constructor(opts: WorkflowOptions) {
    const { name, context, debug } = opts
    if (debug) {
      historyStore.initWorkflow(name)
      this.record = historyStore.record[name]
    }
    this.name = name
    this.context = context
    this.debug = debug
  }
  public add(forkTask: Array<Task> | Task) {
    if (this.debug) historyStore.initTask(this.name, forkTask)
    this._taskArr.push(forkTask)
    return this
  }

  public async run() {
    const _ts = this
    const taskArr = _ts._taskArr

    if (_ts.done) return

    const startTime = Date.now()
    for (let forkTask of taskArr) {
      if (isObject(forkTask)) {
        try {
          await taskRunner(forkTask, _ts)
        } catch (e) {
          _ts.cancel()
          throw e
        }
      } else if (isArray(forkTask)) {
        /**任务组并发执行 */
        const promiseArr = forkTask.map(item => taskRunner(item, _ts))
        try {
          await Promise.all(promiseArr)
        } catch (e) {
          _ts.cancel()
          throw e
        }
      } else {
        throw TypeError('task 必须满足 [array, object]之一')
      }
      _ts.orderId++
    }
    _ts.cancel()
    if (_ts.debug) {
      const endTime = Date.now()
      historyStore.setWorkflowTimeCost(
        _ts.name,
        (endTime - startTime).toFixed(2)
      )
    }
    return _ts
  }
  public cancel() {
    this.done = true
  }
}

const WorkflowEntry = {
  init(opts: WorkflowOptions): Workflow {
    return new Workflow(opts)
  }
}

export default WorkflowEntry
