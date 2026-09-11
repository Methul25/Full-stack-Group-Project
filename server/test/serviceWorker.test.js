import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import { describe, expect, it } from 'vitest'

describe('service worker request policy', () => {
  it('does not intercept same-origin API requests', async () => {
    const listeners = {}
    const source = await readFile(new URL('../../public/sw.js', import.meta.url), 'utf8')
    vm.runInNewContext(source, {
      URL,
      self: {
        location: { origin: 'https://syncboard.example' },
        addEventListener: (name, listener) => { listeners[name] = listener },
      },
    })
    let intercepted = false
    listeners.fetch({
      request: { method: 'GET', url: 'https://syncboard.example/api/tasks', mode: 'cors', destination: '' },
      respondWith: () => { intercepted = true },
    })
    expect(intercepted).toBe(false)
  })
})
