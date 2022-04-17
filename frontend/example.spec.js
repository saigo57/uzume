
const { _electron: electron } = require('playwright')
const { test, expect } = require('@playwright/test')

test('example test', async () => {
  const electronApp = await electron.launch({ args: ['./dist/main.js'] })
  const isPackaged = await electronApp.evaluate(async ({ app }) => {
    // これは Electron のメインプロセスで実行され、この引数は常に
    // メインのアプリスクリプトでの require('electron') の戻り値です。
    return app.isPackaged;
  });

  expect(isPackaged).toBe(false);

  // 最初の BrowserWindow が開かれるのを待機し、
  // その Page オブジェクトが返されます
  const window = await electronApp.firstWindow()
  window.setViewportSize({width: 1200, height: 800})
  await window.screenshot({ path: './tmp/1.png' })
  await window.click('text="タグ管理"');
  await window.screenshot({ path: './tmp/2.png' })

  // アプリを閉じます
  await electronApp.close()
});
