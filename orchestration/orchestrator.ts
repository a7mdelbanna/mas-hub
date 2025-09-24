#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Types
interface Task {
  id: string;
  title: string;
  agent: string;
  inputs: string[];
  outputs: string[];
  acceptance_criteria: string[];
  deps: string[];
  state: 'todo' | 'running' | 'review' | 'done' | 'blocked';
}

interface TaskGraph {
  tasks: Task[];
  metadata: {
    version: string;
    created: string;
    last_updated: string;
  };
}

// Paths
const ORCHESTRATION_DIR = '/Users/ahmed/Documents/MasHub/orchestration';
const TASKS_FILE = join(ORCHESTRATION_DIR, 'tasks.json');
const LOGS_DIR = join(ORCHESTRATION_DIR, 'logs');

// Agent prompt templates
const AGENT_PROMPTS: Record<string, (task: Task) => string> = {
  'prd-refinement': (task) => `
You are the PRD Refinement Agent. Your role is to consume the SRS and ERD documents and produce a comprehensive Product Requirements Document (PRD).

## Inputs:
${task.inputs.map(input => `- ${input}`).join('\n')}

## Expected Outputs:
${task.outputs.map(output => `- ${output}`).join('\n')}

## Acceptance Criteria:
${task.acceptance_criteria.map(criteria => `- ${criteria}`).join('\n')}

Please:
1. Read the input documents thoroughly
2. Generate a complete PRD with all required sections
3. Include user stories in Given/When/Then format
4. Create a traceability matrix
5. Document all TODOs and open questions

The PRD must be the single source of truth for all downstream agents.
`,

  'solution-architect': (task) => `
You are the Solution Architect Agent. Your role is to design the system architecture based on the PRD.

## Primary Input:
- PRD: ${task.inputs[0]}

## Expected Outputs:
${task.outputs.map(output => `- ${output}`).join('\n')}

## Acceptance Criteria:
${task.acceptance_criteria.map(criteria => `- ${criteria}`).join('\n')}

Please:
1. Read the PRD thoroughly
2. Design microservice architecture with clear boundaries
3. Define API contracts in OpenAPI format
4. Document data flow between services
5. Select appropriate technology stack
6. Create deployment architecture

Focus on scalability, maintainability, and alignment with PRD requirements.
`,

  'data-modeler': (task) => `
You are the Data Modeler Agent. Your role is to create database schemas and data models.

## Inputs:
${task.inputs.map(input => `- ${input}`).join('\n')}

## Expected Outputs:
${task.outputs.map(output => `- ${output}`).join('\n')}

## Acceptance Criteria:
${task.acceptance_criteria.map(criteria => `- ${criteria}`).join('\n')}

Please:
1. Read the PRD and architecture documents
2. Create SQL schema with all tables
3. Define indexes for performance
4. Generate TypeScript model files
5. Create migration scripts
6. Document data dictionary

Ensure all entities from the ERD are properly implemented with relationships.
`,

  'rules-engineer': (task) => `
You are the Rules Engineer Agent. Your role is to implement business rules and workflows.

## Inputs:
${task.inputs.map(input => `- ${input}`).join('\n')}

## Expected Outputs:
${task.outputs.map(output => `- ${output}`).join('\n')}

## Acceptance Criteria:
${task.acceptance_criteria.map(criteria => `- ${criteria}`).join('\n')}

Please:
1. Read the PRD for business logic requirements
2. Implement approval workflows
3. Create automation rules engine
4. Build SLA calculation logic
5. Implement budget tracking
6. Configure notification triggers

Ensure all business rules align with PRD specifications.
`,

  'design-system': (task) => `
You are the Design System Agent. Your role is to create the UI component library and design system.

## Primary Input:
- PRD: ${task.inputs[0]}

## Expected Outputs:
${task.outputs.map(output => `- ${output}`).join('\n')}

## Acceptance Criteria:
${task.acceptance_criteria.map(criteria => `- ${criteria}`).join('\n')}

Please:
1. Read the PRD for UI requirements
2. Create reusable React components
3. Implement theme system with dark mode
4. Ensure responsive design
5. Add RTL support for Arabic
6. Meet accessibility standards (WCAG 2.1 AA)

Focus on consistency, reusability, and user experience.
`,

  'frontend': (task) => `
You are the Frontend Developer Agent. Your role is to build the frontend application.

## Inputs:
${task.inputs.map(input => `- ${input}`).join('\n')}

## Expected Outputs:
${task.outputs.map(output => `- ${output}`).join('\n')}

## Acceptance Criteria:
${task.acceptance_criteria.map(criteria => `- ${criteria}`).join('\n')}

Please:
1. Read the PRD for feature requirements
2. Implement all Phase 1 user stories
3. Create portal routing (Client, Employee, Candidate)
4. Setup state management (Redux/Zustand)
5. Integrate with backend APIs
6. Implement authentication flows

Use React with TypeScript and ensure code quality.
`,

  'backend': (task) => `
You are the Backend Developer Agent. Your role is to develop backend services and APIs.

## Inputs:
${task.inputs.map(input => `- ${input}`).join('\n')}

## Expected Outputs:
${task.outputs.map(output => `- ${output}`).join('\n')}

## Acceptance Criteria:
${task.acceptance_criteria.map(criteria => `- ${criteria}`).join('\n')}

Please:
1. Read the PRD and API specifications
2. Implement all API endpoints
3. Integrate business logic from rules engine
4. Setup database operations with models
5. Implement authentication and authorization
6. Add comprehensive error handling

Use Node.js with TypeScript and follow RESTful principles.
`,

  'payments': (task) => `
You are the Payments Integration Agent. Your role is to implement payment processing.

## Inputs:
${task.inputs.map(input => `- ${input}`).join('\n')}

## Expected Outputs:
${task.outputs.map(output => `- ${output}`).join('\n')}

## Acceptance Criteria:
${task.acceptance_criteria.map(criteria => `- ${criteria}`).join('\n')}

Please:
1. Read the PRD for payment requirements
2. Integrate Stripe payment gateway
3. Integrate Paymob for Egyptian payments
4. Implement manual payment tracking
5. Setup webhook handlers
6. Build payment reconciliation system

Ensure PCI compliance and secure payment handling.
`,

  'lms': (task) => `
You are the LMS Developer Agent. Your role is to build the Learning Management System.

## Inputs:
${task.inputs.map(input => `- ${input}`).join('\n')}

## Expected Outputs:
${task.outputs.map(output => `- ${output}`).join('\n')}

## Acceptance Criteria:
${task.acceptance_criteria.map(criteria => `- ${criteria}`).join('\n')}

Please:
1. Read the PRD for training requirements
2. Build course management system
3. Implement lesson delivery (video, PDF, articles)
4. Create quiz and assessment engine
5. Add progress tracking
6. Generate certificates

Support multiple audiences: employees, candidates, and clients.
`,

  'qa': (task) => `
You are the QA Engineer Agent. Your role is to ensure quality through comprehensive testing.

## Inputs:
${task.inputs.map(input => `- ${input}`).join('\n')}

## Expected Outputs:
${task.outputs.map(output => `- ${output}`).join('\n')}

## Acceptance Criteria:
${task.acceptance_criteria.map(criteria => `- ${criteria}`).join('\n')}

Please:
1. Read the PRD for test requirements
2. Write unit tests (>80% coverage)
3. Create integration tests
4. Build E2E tests for critical paths
5. Perform performance testing
6. Conduct security testing

Use Jest for unit tests and Playwright for E2E tests.
`,

  'devops': (task) => `
You are the DevOps Engineer Agent. Your role is to setup infrastructure and deployment.

## Inputs:
${task.inputs.map(input => `- ${input}`).join('\n')}

## Expected Outputs:
${task.outputs.map(output => `- ${output}`).join('\n')}

## Acceptance Criteria:
${task.acceptance_criteria.map(criteria => `- ${criteria}`).join('\n')}

Please:
1. Read the deployment architecture
2. Create Docker containers
3. Write Kubernetes manifests
4. Setup CI/CD pipeline with GitHub Actions
5. Configure monitoring and logging
6. Implement backup strategy

Focus on scalability, reliability, and automation.
`,

  'seeder': (task) => `
You are the Data Seeder Agent. Your role is to create seed data for testing.

## Inputs:
${task.inputs.map(input => `- ${input}`).join('\n')}

## Expected Outputs:
${task.outputs.map(output => `- ${output}`).join('\n')}

## Acceptance Criteria:
${task.acceptance_criteria.map(criteria => `- ${criteria}`).join('\n')}

Please:
1. Read the PRD for data requirements
2. Create demo users with different roles
3. Generate sample projects
4. Add test client data
5. Create training courses
6. Generate financial records

Ensure data is realistic and covers all test scenarios.
`,

  'gatekeeper': (task) => `
You are the Gatekeeper Agent. Your role is to validate outputs against the PRD.

## PRD Reference:
- /Users/ahmed/Documents/MasHub/docs/PRD.md

## Artifact to Validate:
${task.outputs.join(', ')}

Please:
1. Read the PRD thoroughly
2. Review the generated artifact
3. Check alignment with requirements
4. Verify acceptance criteria are met
5. Document any deviations or issues
6. Provide pass/fail decision with reasons

Be strict in your validation to ensure quality.
`
};

// Utility functions
function loadTasks(): TaskGraph {
  if (!existsSync(TASKS_FILE)) {
    throw new Error('Tasks file not found. Please initialize first.');
  }
  return JSON.parse(readFileSync(TASKS_FILE, 'utf-8'));
}

function saveTasks(graph: TaskGraph): void {
  graph.metadata.last_updated = new Date().toISOString();
  writeFileSync(TASKS_FILE, JSON.stringify(graph, null, 2));
}

function getTask(taskId: string): Task | undefined {
  const graph = loadTasks();
  return graph.tasks.find(t => t.id === taskId);
}

function updateTaskState(taskId: string, state: Task['state']): void {
  const graph = loadTasks();
  const task = graph.tasks.find(t => t.id === taskId);
  if (task) {
    task.state = state;
    saveTasks(graph);
  }
}

function canRunTask(task: Task, graph: TaskGraph): boolean {
  return task.deps.every(depId => {
    const dep = graph.tasks.find(t => t.id === depId);
    return dep?.state === 'done';
  });
}

function createLogEntry(taskId: string, content: string): void {
  if (!existsSync(LOGS_DIR)) {
    mkdirSync(LOGS_DIR, { recursive: true });
  }
  const logFile = join(LOGS_DIR, `${taskId}.md`);
  const timestamp = new Date().toISOString();
  const entry = `\n\n## ${timestamp}\n${content}`;

  if (existsSync(logFile)) {
    const existing = readFileSync(logFile, 'utf-8');
    writeFileSync(logFile, existing + entry);
  } else {
    const header = `# Task Log: ${taskId}\n\n## Execution History`;
    writeFileSync(logFile, header + entry);
  }
}

// Command implementations
class Orchestrator {
  status(): void {
    const graph = loadTasks();
    console.log('\n📊 MAS Business OS - Pipeline Status\n');
    console.log('='.repeat(60));

    const states = { todo: 0, running: 0, review: 0, done: 0, blocked: 0 };

    graph.tasks.forEach(task => {
      states[task.state]++;
      const statusEmoji = {
        todo: '⏳',
        running: '🔄',
        review: '👁',
        done: '✅',
        blocked: '🚫'
      }[task.state];

      const deps = task.deps.length > 0 ? `[deps: ${task.deps.join(', ')}]` : '';
      console.log(`${statusEmoji} ${task.id.padEnd(20)} ${task.title.padEnd(35)} ${deps}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log(`Summary: TODO: ${states.todo} | RUNNING: ${states.running} | REVIEW: ${states.review} | DONE: ${states.done} | BLOCKED: ${states.blocked}`);
    console.log(`Progress: ${states.done}/${graph.tasks.length} tasks completed (${Math.round((states.done / graph.tasks.length) * 100)}%)\n`);
  }

  next(): void {
    const graph = loadTasks();
    const runnable = graph.tasks.filter(task =>
      task.state === 'todo' && canRunTask(task, graph)
    );

    console.log('\n🚀 Next Runnable Tasks\n');
    console.log('='.repeat(60));

    if (runnable.length === 0) {
      console.log('No tasks ready to run. Check task dependencies or blocked items.\n');
      return;
    }

    runnable.forEach((task, index) => {
      console.log(`\n${index + 1}. ${task.id} - ${task.title}`);
      console.log(`   Agent: ${task.agent}`);
      console.log(`   Inputs: ${task.inputs.join(', ')}`);
      console.log(`   Outputs: ${task.outputs.join(', ')}`);
      console.log(`   Command: pnpm orchestrator run ${task.id}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log(`Suggested order based on dependencies.\n`);
  }

  run(taskId: string): void {
    const task = getTask(taskId);
    if (!task) {
      console.error(`❌ Task ${taskId} not found`);
      return;
    }

    const graph = loadTasks();
    if (!canRunTask(task, graph)) {
      console.error(`❌ Cannot run ${taskId} - dependencies not satisfied`);
      console.log('Missing dependencies:', task.deps.filter(depId => {
        const dep = graph.tasks.find(t => t.id === depId);
        return dep?.state !== 'done';
      }));
      return;
    }

    if (task.state === 'done') {
      console.log(`✅ Task ${taskId} already completed`);
      return;
    }

    console.log(`\n🚀 Running Task: ${taskId} - ${task.title}\n`);
    console.log('='.repeat(60));

    updateTaskState(taskId, 'running');
    createLogEntry(taskId, 'Task started');

    const promptGenerator = AGENT_PROMPTS[task.agent];
    if (!promptGenerator) {
      console.error(`❌ No prompt template for agent: ${task.agent}`);
      updateTaskState(taskId, 'blocked');
      return;
    }

    const prompt = promptGenerator(task);

    console.log('Generated Prompt for Claude:\n');
    console.log(prompt);
    console.log('\n' + '='.repeat(60));
    console.log('\nTask state updated to RUNNING.');
    console.log('Please execute this prompt with Claude, then run:');
    console.log(`  pnpm orchestrator review ${taskId}`);

    createLogEntry(taskId, `Prompt generated:\n${prompt}`);
  }

  review(taskId: string): void {
    const task = getTask(taskId);
    if (!task) {
      console.error(`❌ Task ${taskId} not found`);
      return;
    }

    if (task.state !== 'running' && task.state !== 'review') {
      console.error(`❌ Task ${taskId} is not in running/review state`);
      return;
    }

    console.log(`\n👁 Reviewing Task: ${taskId}\n`);
    console.log('='.repeat(60));

    updateTaskState(taskId, 'review');

    // Generate Gatekeeper validation prompt
    const gatekeeperPrompt = `
You are the Gatekeeper Agent. Please validate the outputs from task ${taskId}.

Task: ${task.title}
Expected Outputs: ${task.outputs.join(', ')}

Acceptance Criteria:
${task.acceptance_criteria.map(c => `- ${c}`).join('\n')}

Please:
1. Check if all expected outputs exist
2. Validate outputs against PRD requirements
3. Verify acceptance criteria are met
4. Provide PASS or FAIL decision

If FAIL, add specific TODOs to the PRD.
`;

    console.log('Gatekeeper Validation Prompt:\n');
    console.log(gatekeeperPrompt);
    console.log('\n' + '='.repeat(60));
    console.log('\nRun this validation with Claude Gatekeeper.');
    console.log('Based on result:');
    console.log('  PASS: pnpm orchestrator complete ' + taskId);
    console.log('  FAIL: pnpm orchestrator block ' + taskId);

    createLogEntry(taskId, 'Task under review');
  }

  complete(taskId: string): void {
    const task = getTask(taskId);
    if (!task) {
      console.error(`❌ Task ${taskId} not found`);
      return;
    }

    updateTaskState(taskId, 'done');
    createLogEntry(taskId, 'Task completed successfully');

    console.log(`✅ Task ${taskId} marked as DONE`);
    this.status();
  }

  block(taskId: string, reason?: string): void {
    const task = getTask(taskId);
    if (!task) {
      console.error(`❌ Task ${taskId} not found`);
      return;
    }

    updateTaskState(taskId, 'blocked');
    const logMessage = reason ? `Task blocked: ${reason}` : 'Task blocked';
    createLogEntry(taskId, logMessage);

    console.log(`🚫 Task ${taskId} marked as BLOCKED`);
    if (reason) {
      console.log(`Reason: ${reason}`);
    }
    console.log('Please add TODOs to PRD and resolve before retrying.');
  }

  log(taskId: string): void {
    const logFile = join(LOGS_DIR, `${taskId}.md`);
    if (!existsSync(logFile)) {
      console.error(`❌ No logs found for task ${taskId}`);
      return;
    }

    const logs = readFileSync(logFile, 'utf-8');
    console.log(logs);
  }

  help(): void {
    console.log(`
MAS Business OS Orchestrator CLI

Commands:
  status              Show pipeline status
  next                Show next runnable tasks
  run <taskId>        Generate prompt to run task
  review <taskId>     Review task outputs
  complete <taskId>   Mark task as done
  block <taskId>      Mark task as blocked
  log <taskId>        Show task execution log
  help                Show this help message

Examples:
  pnpm orchestrator status
  pnpm orchestrator next
  pnpm orchestrator run architecture.v1
  pnpm orchestrator review architecture.v1
  pnpm orchestrator complete architecture.v1
`);
  }
}

// CLI entry point
function main() {
  const [,, command, ...args] = process.argv;
  const orchestrator = new Orchestrator();

  switch (command) {
    case 'status':
      orchestrator.status();
      break;
    case 'next':
      orchestrator.next();
      break;
    case 'run':
      if (args[0]) orchestrator.run(args[0]);
      else console.error('❌ Please provide task ID');
      break;
    case 'review':
      if (args[0]) orchestrator.review(args[0]);
      else console.error('❌ Please provide task ID');
      break;
    case 'complete':
      if (args[0]) orchestrator.complete(args[0]);
      else console.error('❌ Please provide task ID');
      break;
    case 'block':
      if (args[0]) orchestrator.block(args[0], args[1]);
      else console.error('❌ Please provide task ID');
      break;
    case 'log':
      if (args[0]) orchestrator.log(args[0]);
      else console.error('❌ Please provide task ID');
      break;
    case 'help':
    case undefined:
      orchestrator.help();
      break;
    default:
      console.error(`❌ Unknown command: ${command}`);
      orchestrator.help();
  }
}

// Run CLI
main();