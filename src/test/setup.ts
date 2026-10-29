import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'

beforeEach(() => {
  if (typeof window !== 'undefined') {
    window.localStorage.clear()
    document.documentElement.className = ''
  }
})

afterEach(() => {
  cleanup()
})
