import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { vi } from 'vitest';

afterEach(() => {
  cleanup();
});

// Mock window.confirm for delete confirmations
global.confirm = vi.fn(() => true);

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
};