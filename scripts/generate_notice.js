const checker = require('license-checker');
const fs = require("fs");
const path = require('path');

const NOTICE_FILE_NAME = 'NOTICE';
const SEPARATOR = '================================================\n';

checker.init({
  start: './',
  production: true
}, function(err, packages) {
  if (err) {
      console.log(err)
  } else {
    generateNoticeFile(packages)
  }
});

// license-checkerの結果からライセンスファイルをまとめたものを作成する
function generateNoticeFile(packages) {
  const THIS_PROJECT_NAME = 'uzume@';
  var notice_text = '';

  notice_text += 'This project includes the following projects.\n';
  notice_text += '\n';

  for (var key in packages) {
    // packages[key].licenses
    if ( key.indexOf(THIS_PROJECT_NAME) === 0 ) continue;

    notice_text += `${key}(${packages[key].repository})\n`;
    if ( 'publisher' in packages[key] ) {
      notice_text += `publisher: ${packages[key].publisher}\n`;
    }
    notice_text += SEPARATOR;
    notice_text += tryReadLicenseFile(packages[key].licenseFile);
    notice_text += '\n';
    notice_text += SEPARATOR;
    notice_text += '\n\n';
  }

  try {
    fs.writeFileSync(NOTICE_FILE_NAME, notice_text);
  } catch(e) {
    console.log(e);
  }
}

// ファイルパスからライセンスの内容を返す
// 未知のファイル名の場合は特定の文字列を含めて返す(readme.mdなどは手で入れる必要がある)
function tryReadLicenseFile(license_file_name) {
  var error_message = '';
  const allow_file_name = [
    'license',
    'licence',
    'license-mit',
    'license-mit.txt',
    'license.txt',
    'license.md',
  ]

  try {
    const file_name = path.basename(license_file_name);
    if ( !allow_file_name.includes(file_name.toLowerCase()) ) throw '未知のライセンスファイル名です';

    var license_text = fs.readFileSync(license_file_name);
    return license_text;
  } catch (err) {
    error_message = err;
  }

  return `!!!edit me!!!\n${license_file_name}\n${error_message}`
}
