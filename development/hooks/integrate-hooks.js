/**
 * Integrate Development Notebook Hooks
 * 
 * This script integrates the development notebook hooks with the test runner.
 * It should be run once to set up the hooks.
 * 
 * 🚨 ATTENTION AI AGENTS 🚨
 * This script modifies the test runner to include development notebook checks.
 * Do not modify this file unless specifically instructed to do so.
 */

const fs = require('fs');
const path = require('path');

// Paths
const TEST_RUNNER_PATH = path.join(__dirname, '..', '..', 'testing', 'runTests.js');
const HOOK_PATH = path.join(__dirname, 'pre-test-hook.js');
const BACKUP_PATH = `${TEST_RUNNER_PATH}.bak`;

// Import statements to add
const HOOK_IMPORT = "const { runPreTestCheck } = require('../development/hooks/pre-test-hook');";

// Hook execution to add
const HOOK_EXECUTION = `
  // Run development notebook status check
  console.log('');
  runPreTestCheck();
  console.log('');
`;

function backupFile(sourcePath, destPath) {
  if (!fs.existsSync(destPath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✅ Backup created at ${destPath}`);
  } else {
    console.log(`⚠️ Backup already exists at ${destPath}`);
  }
}

function integrateHook() {
  if (!fs.existsSync(TEST_RUNNER_PATH)) {
    console.error(`❌ Test runner not found at ${TEST_RUNNER_PATH}`);
    return false;
  }
  
  if (!fs.existsSync(HOOK_PATH)) {
    console.error(`❌ Hook not found at ${HOOK_PATH}`);
    return false;
  }
  
  // Create backup
  backupFile(TEST_RUNNER_PATH, BACKUP_PATH);
  
  // Read test runner file
  let content = fs.readFileSync(TEST_RUNNER_PATH, 'utf8');
  
  // Check if hook is already integrated
  if (content.includes('runPreTestCheck')) {
    console.log('⚠️ Hook is already integrated');
    return true;
  }
  
  // Add import statement
  let lines = content.split('\n');
  let importIndex = -1;
  
  // Find the last import statement
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('const ') || 
        lines[i].trim().startsWith('let ') || 
        lines[i].trim().startsWith('import ') ||
        lines[i].trim().startsWith('require(')) {
      importIndex = i;
    }
  }
  
  if (importIndex >= 0) {
    lines.splice(importIndex + 1, 0, HOOK_IMPORT);
  } else {
    // Add at the beginning if no imports found
    lines.unshift(HOOK_IMPORT);
  }
  
  // Find the async function or main entry point
  let mainFunctionIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('async function runTests') || 
        lines[i].includes('function main') ||
        lines[i].includes('async function main')) {
      mainFunctionIndex = i;
      break;
    }
  }
  
  if (mainFunctionIndex < 0) {
    console.error('❌ Could not find main function in test runner');
    return false;
  }
  
  // Find opening brace of the function
  let braceIndex = -1;
  for (let i = mainFunctionIndex; i < lines.length; i++) {
    if (lines[i].includes('{')) {
      braceIndex = i;
      break;
    }
  }
  
  if (braceIndex < 0) {
    console.error('❌ Could not find function body in test runner');
    return false;
  }
  
  // Add hook execution after the opening brace
  lines.splice(braceIndex + 1, 0, HOOK_EXECUTION);
  
  // Write updated content
  fs.writeFileSync(TEST_RUNNER_PATH, lines.join('\n'));
  console.log(`✅ Hook integrated into ${TEST_RUNNER_PATH}`);
  
  return true;
}

// Run the script
if (require.main === module) {
  console.log('📝 Integrating development notebook hooks...');
  const result = integrateHook();
  console.log(result ? '✅ Integration complete!' : '❌ Integration failed!');
}

module.exports = {
  integrateHook
};