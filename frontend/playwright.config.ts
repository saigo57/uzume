import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  expect: {
    timeout: 10000,
    toMatchSnapshot: {
      maxDiffPixels: 10,
    },
  },
};
export default config;
