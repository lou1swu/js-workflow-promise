"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const isObject = utils_1.isType('Object');
const isArray = utils_1.isType('Array');
let historyStore = {
    record: {},
    initWorkflow(name) {
        this.record[name] = {
            workflowName: name,
            taskPath: [],
            timeCost: 0
        };
    },
    initTask(workflowName, forkTask) {
        if (isObject(forkTask)) {
            this.record[workflowName].taskPath.push(null);
        }
        else if (isArray(forkTask)) {
            this.record[workflowName].taskPath.push([]);
        }
    },
    setTask(workflowName, taskConfig, orderId) {
        const taskPath = this.record[workflowName]['taskPath'];
        if (!taskPath[orderId]) {
            taskPath[orderId] = taskConfig;
        }
        else if (isArray(taskPath[orderId])) {
            taskPath[orderId].push(taskConfig);
        }
    },
    setWorkflowTimeCost(workflowName, timeCost) {
        this.record[workflowName]['timeCost'] = timeCost;
    },
    removeWorkflow(workflowName) {
        this.record[workflowName] = null;
    }
};
const taskRunner = async function (task, workflowInst) {
    const { name, target, scope, description, filter } = task;
    if (workflowInst.done)
        return;
    if (filter) {
        const filterRes = await utils_1.awsomeFnRunner(filter, task, [task]);
        if (!filterRes)
            return;
    }
    let error = null;
    let ret = null;
    const startTime = Date.now();
    try {
        ret = await utils_1.awsomeFnRunner(target, scope || task, [
            task,
            scope || workflowInst
        ]);
    }
    catch (e) {
        error = e;
    }
    if (workflowInst.debug) {
        const endTime = Date.now();
        const taskConfig = {
            taskName: name,
            description,
            ret,
            error,
            timeCost: (endTime - startTime).toFixed(2)
        };
        historyStore.setTask(workflowInst.name, taskConfig, workflowInst.orderId);
    }
    if (error)
        throw error;
    return ret;
};
class Workflow {
    constructor(opts) {
        this.name = 'workflow-demo';
        this.context = null;
        this.debug = false;
        this.record = null;
        this.orderId = 0;
        this.done = false;
        this._taskArr = [];
        const { name, context, debug } = opts;
        if (debug) {
            historyStore.initWorkflow(name);
            this.record = historyStore.record[name];
        }
        this.name = name;
        this.context = context;
        this.debug = debug;
    }
    add(forkTask) {
        if (this.debug)
            historyStore.initTask(this.name, forkTask);
        this._taskArr.push(forkTask);
        return this;
    }
    async run() {
        const _ts = this;
        const taskArr = _ts._taskArr;
        if (_ts.done)
            return;
        const startTime = Date.now();
        for (let forkTask of taskArr) {
            if (isObject(forkTask)) {
                try {
                    await taskRunner(forkTask, _ts);
                }
                catch (e) {
                    _ts.cancel();
                    throw e;
                }
            }
            else if (isArray(forkTask)) {
                const promiseArr = forkTask.map(item => taskRunner(item, _ts));
                try {
                    await Promise.all(promiseArr);
                }
                catch (e) {
                    _ts.cancel();
                    throw e;
                }
            }
            else {
                throw TypeError('task 必须满足 [array, object]之一');
            }
            _ts.orderId++;
        }
        _ts.cancel();
        if (_ts.debug) {
            const endTime = Date.now();
            historyStore.setWorkflowTimeCost(_ts.name, (endTime - startTime).toFixed(2));
        }
        return _ts;
    }
    cancel() {
        this.done = true;
    }
}
const WorkflowEntry = {
    init(opts) {
        return new Workflow(opts);
    }
};
exports.default = WorkflowEntry;
