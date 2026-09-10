import { transformFileSync } from '@babel/core';

const files = [
  'App.js',
  'src/theme.js',
  'src/theme-context.js',
  'src/components/ui.js',
  'src/screens/LoginScreen.js',
  'src/screens/DashboardScreen.js',
  'src/screens/MedicinesScreen.js',
  'src/screens/PosScanScreen.js',
  'src/screens/FinancialReportsScreen.js',
  'src/screens/GenericListScreen.js',
  'src/screens/StaffUsersScreen.js',
];

let failures = 0;
for (const f of files) {
  try {
    transformFileSync(f, { presets: ['babel-preset-expo'], babelrc: false, configFile: false });
    console.log('OK   ' + f);
  } catch (e) {
    failures++;
    console.log('FAIL ' + f + '\n     ' + e.message.split('\n')[0]);
  }
}
console.log('\n' + (failures === 0 ? 'ALL PASS' : failures + ' FAILURES'));
process.exit(failures === 0 ? 0 : 1);
