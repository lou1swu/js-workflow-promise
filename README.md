# js-workflow-promise

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![NPM Version](https://img.shields.io/npm/v/js-workflow-promise.svg?style=flat)](https://www.npmjs.com/package/js-workflow-promise)
[![NODE Version](https://img.shields.io/node/v/js-workflow-promise.svg)](https://www.npmjs.com/package/js-workflow-promise)
[![CircleCI](https://circleci.com/gh/Lighting-Jack/js-workflow-promise/tree/master.svg?style=svg)](https://circleci.com/gh/Lighting-Jack/js-workflow-promise/tree/master)

用类似promise链式调用的方式来做js工作流管理，有利于梳理和简化复杂的业务流程。

[中文版文档](./README.md)

## Installation

```
npm install js-workflow-promise -g
```

## Examples

```javascript
import { workflow } from '../src/index'

workflow
  .init({
    name: 'workflow-demo',
    context: null
  })
  .add({
    name: 'task1',
    target(curTask) {
      console.log(`Workflow-excuting: ${curTask.name}-excuted`)
    }
  })
  .run()
```

这个例子新建了一个名为workflow-demo的工作流，并往这个工作流中添加了一个任务task1，然后启动工作流。需要注意的是，工作流的返回值都会是一个`promise`

## API Reference
- [Init `({opt: WorkflowOptions})=>Workflow`](#init)
- [Add `(Array<Task> | Task)`](#add)
- [Run `()=>Promise<Workflow>`](#run)
- [Cancel `()=>void`](#cancel)

### Init
传入自定义配置来初始化一个工作流，配置可选

| 属性    |          含义          |
| :------ | :--------------------: |
| name    |       工作流名称       |
| context | 作为贯穿工作流的上下文 |
| debug   |    是否开启调试模式    |

### Add
往工作流中添加一个任务`task`或者一个任务组`taskGroup`，要注意必须先进行初始化`init`。
每个工作流都是由无数的合流，分流任务组成的，每个`task`需要满足以下特征

| 属性        |                  类型                  |                                               含义 |
| :---------- | :------------------------------------: | -------------------------------------------------: |
| name        |                 string                 |                                           任务名称 |
| target      | (task:Task,workflowInst:Workflow)=>any |                                       任务目标函数 |
| scope       |                  any                   | 任务函数执行作用域，不传则作用域默认为当前工作流。 |
| description |                 string                 |                                           任务描述 |
| filter      |          (task:Task)=>boolean          |                               是否应该执行该次任务 |

### Run
执行工作流中的任务，最终返回一个`promise`。
要注意的是，只要工作流中的一个任务中断(出错或者显性地调用`this.cancel()`)，则会抛出异常，且不会执行后续任务。

### Cancel
中断工作流，中断正在执行的任务，且不会执行后续任务。

## Property Reference
- [Name](#name)
- [Context](#context)
- [Debug](#debug)
- [Record](#record)

### Name
工作流的名称

### Context
贯穿工作流的上下文，可以类似使用`koa.ctx`的思想和习惯来使用该属性。

### Debug
开启调试模式。开启后会将`task`运行的细节记录起来，可以通过`record`获取到每个`task`运行的结果，错误信息，耗时信息

## TODO LIST
* 收集workflow运行结果并可视化展示

## Licence

[MIT](./LICENSE)
