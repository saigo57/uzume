const { test, expect } = require('@playwright/test');
const { mock } = require('playwright-fake-dialog');
const path = require('path');
const test_helper = require('./test_helper');
const fs = require('fs');

// 実行する場所からの相対パス
const testAreaPath = 'test/testarea';

test('ワークスペース', async () => {
  const electronApp = await test_helper.initApp()
  const page = await electronApp.firstWindow();

  page.setViewportSize({width: 1200, height: 800})
  const serverIconsStr = "#server-list > .server-icon";

  //
  // 最初の状態をテスト
  //
  await expect(page.locator('.menu-title.selected').first()).toHaveText('Home');
  expect((await page.$$(serverIconsStr)).length).toBe(1); // +だけ

  //
  // ワークスペース新規追加(1つ目)
  //
  const workspaceName1 = 'workspace-test1';
  await page.locator('#server-icon-id').click();
  await page.fill('.modal-form .text-box', workspaceName1);
  // フォルダ選択ウィンドウのmock
  await mock(electronApp, [
    {
      method: 'showOpenDialogSync',
      value: [test_helper.testDir()]
    }
  ])
  await page.locator('.input-dir-path > .button').click();
  await page.locator('button:has-text("作成")').click();
  // ワークスペースが作成され、ワークスペース名が表示されていること
  await expect(page.locator('.menu-title').first()).toHaveText(workspaceName1);
  expect((await page.$$(serverIconsStr)).length).toBe(2);
  // ワークスペースがディスク上に作られていること
  const workspaceDirName1 = `${workspaceName1}.uzume`;
  const workspaceJsonPath1 = path.join(testAreaPath, workspaceDirName1, 'workspace.json');
  expect(fs.existsSync(workspaceJsonPath1)).toBeTruthy;

  //
  // ワークスペース新規追加(2つ目)
  //
  const workspaceName2 = 'workspace-test2';
  await page.locator('#server-icon-id').click();
  await page.fill('.modal-form .text-box', workspaceName2);
  // フォルダ選択ウィンドウのmock
  await mock(electronApp, [
    {
      method: 'showOpenDialogSync',
      value: [test_helper.testDir()]
    }
  ])
  await page.locator('.input-dir-path > .button').click();
  await page.locator('button:has-text("作成")').click();
  // ワークスペースが作成され、ワークスペース名が表示されていること
  await expect(page.locator('.menu-title').first()).toHaveText(workspaceName2);
  expect((await page.$$(serverIconsStr)).length).toBe(3);
  // ワークスペースがディスク上に作られていること
  const workspaceDirName2 = `${workspaceName2}.uzume`;
  const workspaceJsonPath2 = path.join(testAreaPath, workspaceDirName2, 'workspace.json');
  expect(fs.existsSync(workspaceJsonPath2)).toBeTruthy;

  //
  // ワークスペースの切り替え
  //
  await page.locator(serverIconsStr).first().click();
  await expect(page.locator('.menu-title').first()).toHaveText(workspaceName1);
  await page.locator(serverIconsStr).nth(1).click();
  await expect(page.locator('.menu-title').first()).toHaveText(workspaceName2);

  //
  // ワークスペースの削除
  //
  // TODO: コンテキストメニューのテスト方法がわからないので後回し

  //
  // 既存ワークスペースの追加
  //
  await page.locator('#server-icon-id').click();
  await page.locator('text=既存のワークスペースを追加する場合はこちら').click();
  // フォルダ選択ウィンドウのmock
  await mock(electronApp, [
    {
      method: 'showOpenDialogSync',
      value: [path.join(test_helper.testDir(), 'dataset', 'dataset-workspace1.uzume')]
    }
  ])
  await page.locator('button').first().click();
  await page.locator('button:has-text("追加")').click();
  // TODO: ここで一番上のworkspaceが選択されてしまう
  await expect(page.locator('.menu-title').first()).toHaveText(workspaceName1);
  expect((await page.$$(serverIconsStr)).length).toBe(4);
  await page.locator(serverIconsStr).nth(2).click();
  await expect(page.locator('.menu-title').first()).toHaveText('dataset-workspace1');

  await electronApp.close()
})

test('画像タグ周りの操作', async () => {
  const electronApp = await test_helper.initApp()
  const page = await electronApp.firstWindow();

  page.setViewportSize({width: 1200, height: 800})

  await page.locator('#server-icon-id').click();
  await page.locator('text=既存のワークスペースを追加する場合はこちら').click();
  // フォルダ選択ウィンドウのmock
  await mock(electronApp, [
    {
      method: 'showOpenDialogSync',
      value: [path.join(test_helper.testDir(), 'dataset', 'dataset-workspace1.uzume')]
    }
  ])
  await page.locator('button').first().click();
  await page.locator('button:has-text("追加")').click();
  await expect(page.locator('.menu-title').first()).toHaveText('dataset-workspace1');

  //
  // Homeと未分類で表示される画像をテスト
  //
  // Homeはすべての画像が出ていること
  await page.waitForTimeout(1000) // TODO: タイムアウト以外の待機方法に変える(読込中アイコンの監視など？)
  expect((await page.$$('#browse-image-area .thumbnail')).length).toBe(7)
  // 最初の画像のIDをテスト
  await page.locator('.thumbnail').first().click();
  await expect(
    page.locator('#image-side-bar .info-area li:nth-child(2) .info-body')
  ).toHaveText('b7aa6249-2ae9-4974-8f95-c73962e2b1cc');

  // 未分類はタグがついていない画像が表示されていること
  page.locator('#main-menu >> text=未分類').click()
  await page.waitForTimeout(1000) // TODO: タイムアウト以外の待機方法に変える(読込中アイコンの監視など？)
  expect((await page.$$('#browse-image-area .thumbnail')).length).toBe(1)
  // 最初の画像のIDをテスト
  await page.locator('.thumbnail').first().click();
  await expect(
    page.locator('#image-side-bar .info-area li:nth-child(2) .info-body')
  ).toHaveText('b7aa6249-2ae9-4974-8f95-c73962e2b1cc');

  page.locator('#main-menu >> text=Home').click()
  await page.waitForTimeout(1000) // TODO: タイムアウト以外の待機方法に変える(読込中アイコンの監視など？)

  //
  // タグ周り
  //
  // 2枚目
  await page.locator('#image-b2a22931-849f-4733-843d-20c0684d858d').click();
  expect((await page.$$('.tagged-area .tag')).length).toBe(2);
  // 1枚目
  await page.locator('#image-b7aa6249-2ae9-4974-8f95-c73962e2b1cc').click();
  expect((await page.$$('.tagged-area .tag')).length).toBe(0);
  // タグ付与
  await page.locator('.tagged-area').click();
  await page.locator('text=桜').nth(2).click();
  await page.locator('#image-b2a22931-849f-4733-843d-20c0684d858d').click();
  await page.locator('#image-b7aa6249-2ae9-4974-8f95-c73962e2b1cc').click();
  expect((await page.$$('.tagged-area .tag')).length).toBe(1);
  // TODO: 現状はタグパネルが表示されたままになっている

  // タグパネル内のタググループが機能しているかテスト
  expect((await page.$$('#tag-ctrl-panel-tagsarea-id > .tag')).length).toBe(3);
  await expect(page.locator('#tag-ctrl-panel-tagsarea-id')).toContainText(['桜', '富士山', '五重塔']);
  await page.locator('.tag-ctrl-panel .menu-item').locator('text=未分類').first().click();
  await expect(page.locator('#tag-ctrl-panel-tagsarea-id')).toContainText(['五重塔']);
  await expect(page.locator('#tag-ctrl-panel-tagsarea-id')).not.toContainText(['桜', '富士山']);
  await page.locator('.tag-ctrl-panel .menu-item').locator('text=よく使う').first().click();
  await expect(page.locator('#tag-ctrl-panel-tagsarea-id')).not.toContainText(['桜', '富士山', '五重塔']);
  await page.locator('.tag-ctrl-panel .menu-item').locator('text=被写体').first().click();
  await expect(page.locator('#tag-ctrl-panel-tagsarea-id')).toContainText(['桜', '富士山']);
  await expect(page.locator('#tag-ctrl-panel-tagsarea-id')).not.toContainText(['五重塔']);


  //await page.pause()

  await electronApp.close()
})
