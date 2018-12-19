import { workflow } from '../src/index'

workflow
  .init({
    name: 'workflow-demo',
    context: {
      params: {},
      body: {}
    },
    debug: true
  })
  .add({
    name: 'task1',
    target(curTask) {
      console.log(`Workflow-excuting: ${curTask.name}-excuted`)
    },
    description: 'FALSE',
    filter: task => task.description === 'TRUE'
  })
  .add([
    {
      name: 'task2-1',
      async target(curTask) {
        console.log(`Workflow-excuting: ${curTask.name}-excuted`)
      }
    },
    {
      name: 'task2-2',
      async target(curTask) {
        console.log(`Workflow-excuting: ${curTask.name}-excuted`)
      }
    }
  ])
  .add({
    name: 'task3',
    *target(curTask) {
      yield console.log(`Workflow-excuting: ${curTask.name}-excuted`)
    }
  })
  .run()
  .then(res => {
    console.log('Workflow-record', res.record)
  })
