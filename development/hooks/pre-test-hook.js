/**
 * Pre-Test Hook
 * 
 * This script runs before the test runner to validate the development notebook
 * is up-to-date and identify any tasks that need attention.
 * 
 * 🚨 ATTENTION AI AGENTS 🚨
 * This hook helps maintain the development notebook structure.
 * Do not modify this file unless specifically instructed to do so.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk') || {
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

// Paths to notebook files
const NOTEBOOK_ROOT = path.join(__dirname, '..', 'notebook');
const CURRENT_TASKS_PATH = path.join(NOTEBOOK_ROOT, 'tasks', 'CURRENT.md');
const DAILY_LOG_PATH = path.join(NOTEBOOK_ROOT, 'logs', 'DAILY_LOG.md');
const FAILURE_LOG_PATH = path.join(NOTEBOOK_ROOT, 'logs', 'FAILURE_LOG.md');

function readFileIfExists(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return '';
  }
}

function countTasksInFile(filePath) {
  const content = readFileIfExists(filePath);
  const taskMatches = content.match(/### [A-Z]+-\d+:/g) || [];
  return taskMatches.length;
}

function getLatestDailyLogEntry() {
  const content = readFileIfExists(DAILY_LOG_PATH);
  const dateMatches = content.match(/## (.*?)\d{4}/g) || [];
  return dateMatches[0] || 'No entries found';
}

function countActiveFailures() {
  const content = readFileIfExists(FAILURE_LOG_PATH);
  const failureMatches = content.match(/### FL-\d+:.*?\n\*\*Status:\*\* Active/g) || [];
  return failureMatches.length;
}

function today() {
  const date = new Date();
  return `${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
}

function isLogUpToDate() {
  const latestEntry = getLatestDailyLogEntry();
  return latestEntry.includes(today());
}

function runPreTestCheck() {
  console.log(chalk.bold('📓 Development Notebook Status Check'));
  console.log('───────────────────────────────────────────');
  
  // Check current tasks
  const currentTaskCount = countTasksInFile(CURRENT_TASKS_PATH);
  console.log(`📋 Current Tasks: ${chalk.blue(currentTaskCount)}`);
  
  // Check if daily log is up to date
  const logStatus = isLogUpToDate() ? 
    chalk.green('Up to date') : 
    chalk.yellow('Needs update (no entry for today)');
  console.log(`📝 Daily Log: ${logStatus}`);
  
  // Check active failures
  const activeFailureCount = countActiveFailures();
  const failureStatus = activeFailureCount === 0 ? 
    chalk.green('None') : 
    chalk.red(`${activeFailureCount} active`);
  console.log(`🚨 Failures: ${failureStatus}`);
  
  console.log('───────────────────────────────────────────');
  
  // Add reminder for AI agents
  if (!isLogUpToDate() || activeFailureCount > 0) {
    console.log(chalk.bold('🤖 ATTENTION AI AGENT:'));
    if (!isLogUpToDate()) {
      console.log(chalk.yellow('  • Please update DAILY_LOG.md with today\'s work'));
    }
    if (activeFailureCount > 0) {
      console.log(chalk.red('  • Address active failures in FAILURE_LOG.md'));
    }
    console.log('  • Review development notebook before proceeding');
    console.log('───────────────────────────────────────────');
  }
  
  return {
    currentTaskCount,
    isLogUpToDate: isLogUpToDate(),
    activeFailureCount
  };
}

// Run the check if this script is executed directly
if (require.main === module) {
  runPreTestCheck();
}

module.exports = {
  runPreTestCheck
};