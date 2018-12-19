export interface WorkflowOptions {
    name: string;
    context: any;
    debug?: boolean;
}
export interface Target {
    (task: Task, scope: Workflow): any;
}
export interface Task {
    name: string;
    target: Target;
    scope?: any;
    description?: any;
    filter?: (task: Task) => boolean;
}
export interface TaskConfig {
    taskName: string;
    timeCost: string | number;
    ret: any;
    error: any;
    description: string;
}
export interface WorkflowConfig {
    workflowName: string;
    timeCost: string | number;
    taskPath: Array<Task> | Array<Array<Task>>;
}
export interface Record {
    [propName: string]: WorkflowConfig;
}
declare class Workflow {
    name: string;
    context: any;
    debug: boolean;
    record: WorkflowConfig;
    orderId: number;
    done: boolean;
    private _taskArr;
    constructor(opts: WorkflowOptions);
    add(forkTask: Array<Task> | Task): this;
    run(): Promise<this>;
    cancel(): void;
}
declare const WorkflowEntry: {
    init(opts: WorkflowOptions): Workflow;
};
export default WorkflowEntry;
