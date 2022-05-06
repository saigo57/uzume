const { _electron: electron } = require('playwright')
const fse = require('fs-extra');
const path = require('path');
const axiosBase = require('axios');

exports.testDir = () => {
  return path.join(__dirname, 'testarea')
}

exports.initApp = async () => {
  const electronApp = await electron.launch({ env: { E2E_TEST: true }, args: ['./dist/main.js'] })

  // キャッシュ削除
  try {
    let axios = axiosBase.create({
      baseURL: 'http://localhost:22112',
      headers: {
        'Content-Type': 'application/json'
      },
      responseType: 'json'
    })
    await axios.post('/e2etest/resetcache', {})
  } catch (e) {
    console.log(`resetcache error[${e}]`)
    throw e
  }

  // テスト用.uzume削除
  const userHome = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"]
  fse.removeSync(path.join(userHome, '.uzume/e2e-test'));

  // testDirリセット
  fse.removeSync(this.testDir());
  fse.mkdirSync(this.testDir());

  // テストデータをコピー
  const datasetPath = path.join(__dirname, 'dataset');
  fse.copySync(datasetPath, path.join(this.testDir(), 'dataset'))

  return electronApp
}
