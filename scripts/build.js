const { build } = require('electron-builder');

build({
  config: {
    appId: 'com.example.Sample',
    productName: 'Sample',
    files: ['dist/**/*'],
  },
});