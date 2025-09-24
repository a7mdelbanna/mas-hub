# MAS Business OS - Orchestration System

## Overview

The MAS Orchestration System is a pipeline coordinator that manages the entire agent workflow for building the MAS Business OS. It enforces strict process discipline, ensures proper task sequencing, and validates all outputs against the Product Requirements Document (PRD).

## Core Principles

1. **PRD as Single Source of Truth**: The PRD at `/docs/PRD.md` is the ultimate authority for all requirements
2. **Stateless Agent Execution**: Each agent runs on-demand with defined inputs/outputs
3. **Dependency Management**: Tasks execute only when all dependencies are complete
4. **Gatekeeper Validation**: Every task output is validated against the PRD

## Installation

```bash
# Navigate to orchestration directory
cd /Users/ahmed/Documents/MasHub/orchestration

# Install dependencies
pnpm install

# Verify installation
pnpm orchestrator help
```

## Usage

### View Pipeline Status

```bash
pnpm orchestrator status
```

Shows all tasks with their current states (todo, running, review, done, blocked).

### Get Next Runnable Tasks

```bash
pnpm orchestrator next
```

Lists tasks that are ready to run (all dependencies satisfied).

### Run a Specific Task

```bash
pnpm orchestrator run <taskId>

# Example:
pnpm orchestrator run architecture.v1
```

Generates the exact prompt for the specified agent. Copy this prompt and execute with Claude.

### Review Task Output

```bash
pnpm orchestrator review <taskId>

# Example:
pnpm orchestrator review architecture.v1
```

Generates a Gatekeeper validation prompt to verify outputs against PRD.

### Complete a Task

```bash
pnpm orchestrator complete <taskId>

# Example:
pnpm orchestrator complete prd.v1
```

Marks a task as successfully completed after passing validation.

### Block a Task

```bash
pnpm orchestrator block <taskId> "reason"

# Example:
pnpm orchestrator block schema.v1 "Missing data model specifications"
```

Marks a task as blocked when validation fails. TODOs should be added to PRD.

### View Task Logs

```bash
pnpm orchestrator log <taskId>

# Example:
pnpm orchestrator log prd.v1
```

Shows the execution history and log entries for a specific task.

## Task Lifecycle

```
todo → running → review → done
                    ↓
                 blocked
```

1. **todo**: Task is waiting for dependencies
2. **running**: Task is being executed by an agent
3. **review**: Task output is being validated
4. **done**: Task completed successfully
5. **blocked**: Task failed validation, needs fixes

## Pipeline Phases

### Phase 1 (MVP)
- `prd.v1`: Generate PRD from SRS/ERD
- `architecture.v1`: Design system architecture
- `schema.v1`: Create data models
- `rules.v1`: Implement business rules
- `design.v1`: Create design system
- `frontend.v1`: Build frontend
- `backend.v1`: Develop backend
- `qa.v1`: Quality assurance

### Phase 2
- `payments.v1`: Payment integrations
- `lms.v1`: Learning Management System

### Phase 3
- `devops.v1`: DevOps and deployment
- `seeder.v1`: Seed data generation

## Available Agents

| Agent ID | Responsibility |
|----------|---------------|
| `prd-refinement` | Processes SRS/ERD into refined PRD |
| `solution-architect` | Designs system architecture |
| `data-modeler` | Creates data schemas and models |
| `rules-engineer` | Implements business rules |
| `design-system` | Develops UI/UX components |
| `frontend` | Builds frontend application |
| `backend` | Develops backend services |
| `payments` | Implements payment processing |
| `lms` | Integrates learning management |
| `qa` | Performs quality assurance |
| `devops` | Handles deployment and infrastructure |
| `seeder` | Creates seed data |
| `gatekeeper` | Validates artifacts against PRD |

## Task Configuration

Tasks are defined in `/orchestration/tasks.json` with the following structure:

```json
{
  "id": "unique.identifier",
  "title": "Human-readable task name",
  "agent": "responsible-agent-id",
  "inputs": ["list of input files"],
  "outputs": ["list of expected outputs"],
  "acceptance_criteria": ["validation criteria"],
  "deps": ["dependency task IDs"],
  "state": "current state"
}
```

## Extending the System

### Adding a New Task

1. Edit `/orchestration/tasks.json`
2. Add task definition with proper dependencies
3. Update agent prompt template in `orchestrator.ts` if needed
4. Run `pnpm orchestrator status` to verify

### Adding a New Agent

1. Define agent prompt template in `AGENT_PROMPTS` object
2. Create tasks that use the new agent
3. Document agent responsibilities

## Best Practices

1. **Always validate PRD first**: Ensure PRD is complete before running downstream tasks
2. **Check dependencies**: Use `pnpm orchestrator next` to see what's ready
3. **Document failures**: When blocking tasks, provide clear reasons
4. **Update PRD TODOs**: Add clarifications needed to unblock tasks
5. **Review logs**: Check task logs for execution history

## Troubleshooting

### Task won't run
- Check dependencies with `pnpm orchestrator status`
- Ensure all dependent tasks are in "done" state
- Verify task is in "todo" state

### Validation failures
- Review acceptance criteria in task definition
- Check PRD alignment
- Add missing requirements to PRD TODOs

### Missing outputs
- Verify agent created expected files
- Check output paths in task definition
- Review agent execution logs

## File Structure

```
/orchestration/
├── orchestrator.ts      # Main CLI tool
├── tasks.json          # Task graph definition
├── package.json        # Node dependencies
├── tsconfig.json       # TypeScript config
├── README.md          # This file
└── logs/              # Task execution logs
    ├── prd.v1.md
    ├── architecture.v1.md
    └── ...
```

## Current Status

The PRD has been successfully generated and is in REVIEW state. Next steps:

1. Validate PRD with Gatekeeper
2. If approved, run `pnpm orchestrator complete prd.v1`
3. Then run `pnpm orchestrator next` to see available tasks
4. Start with `architecture.v1` once PRD is approved

## Support

For issues or questions about the orchestration system:
1. Check task logs for errors
2. Review PRD for requirements
3. Consult agent-specific documentation
4. Add clarifications to PRD TODOs section

---

**Version**: 1.0.0
**Last Updated**: 2024-01-24