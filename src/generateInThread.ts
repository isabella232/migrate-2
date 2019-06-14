import { fork } from 'child_process'
import path from 'path'
import { GeneratorOptions } from '@prisma/cli'

export type GeneratorWorkerJob = {
  packagePath: string
  config: GeneratorOptions
}

export async function generateInThread(options: GeneratorWorkerJob): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = fork(path.join(__dirname, 'GeneratorWorker.js'), [], {
      silent: true,
    })
    child.send(JSON.stringify(options))
    child.on('error', e => {
      reject(e)
    })
    child.on('message', msg => {
      const data = JSON.parse(msg)
      if (data.error) {
        reject(data.error)
      }
    })
    child.on('close', code => {
      if (code === 0) {
        resolve('')
      } else {
        reject()
      }
    })
  })
}