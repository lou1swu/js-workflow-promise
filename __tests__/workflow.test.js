const { workflow } = require('../dist/index')

describe('Workflow-test', () => {
  test('all-sync-function', cb => {
    const syncWorkflow = workflow
      .init({
        name: 'all-sync-function',
        context: null
      })
      .add({
        name: 'all-sync-function-task1',
        target(curTask, inst) {
          expect(curTask.name).toBe(this.name)
        }
      })
      .add({
        name: 'all-sync-function-task2',
        target(curTask) {
          expect(curTask.name).toBe(this.name)
        },
        description: 'FALSE',
        filter: curTask => curTask === 'TRUE'
      })
      .add({
        name: 'all-sync-function-task3',
        target(curTask) {
          expect(curTask.name).toBe(this.name)
        }
      })
      .run()
      .then(() => cb())
  })

  test('complie-function', cb => {
    const syncWorkflow = workflow
      .init({
        name: 'complie-function',
        context: null
      })
      .add({
        name: 'complie-function-task1',
        async target(curTask) {
          return expect(curTask.name).toBe(this.name)
        }
      })
      .add({
        name: 'complie-function-task2',
        target(curTask) {
          expect(curTask.name).toBe(this.name)
        },
        description: 'FALSE',
        filter: curTask => curTask === 'TRUE'
      })
      .add({
        name: 'complie-function-task2',
        *target(curTask) {
          yield expect(curTask.name).toBe(this.name)
        }
      })
      .run()
      .then(() => cb())
  })
})
