/**
 * Development Notebook Test
 * 
 * This script tests the development notebook structure to ensure all
 * required files exist and have the correct format.
 * 
 * 🚨 ATTENTION AI AGENTS 🚨
 * This script validates the development notebook structure.
 * You can run this test to verify the notebook is correctly set up.
 */

const fs = require('fs');
const path = require('path');

// Base paths
const NOTEBOOK_PATH = path.join(__dirname, 'notebook');

// Required files
const REQUIRED_FILES = [
  'README.md',
  'AI_AGENT_GUIDE.md',
  'tasks/CURRENT.md',
  'tasks/BACKLOG.md',
  'tasks/COMPLETED.md',
  'tasks/BLOCKED.md',
  'logs/DAILY_LOG.md',
  'logs/FAILURE_LOG.md',
  'logs/DECISION_LOG.md',
  'workflows/CI_COMPLIANCE.md',
  'workflows/RELEASE_PROCESS.md',
  'docs/STANDARDS.md',
  'docs/REVIEW_CHECKLIST.md'
];

// Required sections in files
const REQUIRED_SECTIONS = {
  'README.md': ['ATTENTION AI AGENTS', 'Notebook Structure', 'Workflow for AI Agents', 'Critical Rules'],
  'AI_AGENT_GUIDE.md': ['ATTENTION AI AGENTS', 'Development Notebook Navigation', 'AI-Specific Development Guidelines'],
  'tasks/CURRENT.md': ['Current Tasks', 'Critical Tasks', 'Instructions for AI Agents'],
  'logs/DAILY_LOG.md': ['Daily Development Log', 'Tasks Completed', 'Implementation Details', 'Decisions Made'],
  'docs/STANDARDS.md': ['Coding Standards', 'Architecture Guidelines', 'Security Standards', 'Testing Standards']
};

// Validate file existence
function validateFileExistence() {
  console.log('📋 Checking required files...');
  
  let allFilesExist = true;
  const missingFiles = [];
  
  for (const file of REQUIRED_FILES) {
    const filePath = path.join(NOTEBOOK_PATH, file);
    if (!fs.existsSync(filePath)) {
      allFilesExist = false;
      missingFiles.push(file);
      console.log(`❌ Missing: ${file}`);
    } else {
      console.log(`✅ Found: ${file}`);
    }
  }
  
  return { success: allFilesExist, missingFiles };
}

// Validate file content
function validateFileContent() {
  console.log('\n📝 Checking file content...');
  
  let allContentValid = true;
  const contentIssues = [];
  
  for (const [file, sections] of Object.entries(REQUIRED_SECTIONS)) {
    const filePath = path.join(NOTEBOOK_PATH, file);
    
    if (!fs.existsSync(filePath)) {
      continue; // Already reported as missing
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const missingSections = sections.filter(section => !content.includes(section));
    
    if (missingSections.length > 0) {
      allContentValid = false;
      contentIssues.push({ file, missingSections });
      console.log(`❌ ${file}: Missing sections: ${missingSections.join(', ')}`);
    } else {
      console.log(`✅ ${file}: All required sections present`);
    }
  }
  
  return { success: allContentValid, contentIssues };
}

// Validate task tracking
function validateTaskTracking() {
  console.log('\n🔄 Checking task tracking...');
  
  const currentTasksPath = path.join(NOTEBOOK_PATH, 'tasks', 'CURRENT.md');
  const completedTasksPath = path.join(NOTEBOOK_PATH, 'tasks', 'COMPLETED.md');
  
  if (!fs.existsSync(currentTasksPath) || !fs.existsSync(completedTasksPath)) {
    return { success: false, message: 'Task files missing' };
  }
  
  const currentTasks = fs.readFileSync(currentTasksPath, 'utf8');
  const completedTasks = fs.readFileSync(completedTasksPath, 'utf8');
  
  const currentTaskCount = (currentTasks.match(/### [A-Z]+-\d+:/g) || []).length;
  const completedTaskCount = (completedTasks.match(/### [A-Z]+-\d+:/g) || []).length;
  
  console.log(`📊 Current tasks: ${currentTaskCount}`);
  console.log(`📊 Completed tasks: ${completedTaskCount}`);
  
  // There should be at least some tasks in both files
  if (currentTaskCount === 0) {
    console.log('⚠️ No current tasks found');
  }
  
  if (completedTaskCount === 0) {
    console.log('⚠️ No completed tasks found');
  }
  
  // Check for task completion dates in completed tasks
  const hasDates = completedTasks.includes('**Completed**:') || completedTasks.includes('**Completed:**');
  if (!hasDates && completedTaskCount > 0) {
    console.log('❌ Completed tasks missing completion dates');
    return { success: false, message: 'Completed tasks missing dates' };
  }
  
  return { success: true };
}

// Main validation function
function validateNotebook() {
  console.log('🔍 Validating Development Notebook Structure...\n');
  
  const fileExistence = validateFileExistence();
  const fileContent = validateFileContent();
  const taskTracking = validateTaskTracking();
  
  console.log('\n📊 Validation Summary:');
  console.log(`Files: ${fileExistence.success ? '✅ All required files exist' : '❌ Missing files'}`);
  console.log(`Content: ${fileContent.success ? '✅ All required sections present' : '❌ Missing sections'}`);
  console.log(`Tasks: ${taskTracking.success ? '✅ Task tracking is correctly set up' : '❌ Task tracking issues'}`);
  
  const overallSuccess = fileExistence.success && fileContent.success && taskTracking.success;
  console.log(`\nOverall: ${overallSuccess ? '✅ Notebook structure is valid' : '❌ Notebook structure has issues'}`);
  
  return overallSuccess;
}

// Run validation if this script is executed directly
if (require.main === module) {
  const result = validateNotebook();
  process.exit(result ? 0 : 1);
}

module.exports = {
  validateNotebook
};