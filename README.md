# IdeaTrackerApp

A zero-dependency CLI tool for tracking, organizing, and managing ideas.

## Requirements

- Node.js >= 18.0.0

## Usage

```bash
node src/index.js <command> [options]
```

Or install globally:

```bash
npm link
idea <command> [options]
```

### Commands

**Add an idea:**
```bash
idea add Build a CLI tool --desc "Track ideas from the terminal" --tags dev,productivity --priority high
```

**List ideas:**
```bash
idea list                       # all ideas, newest first
idea list --status done         # filter by status
idea list --tag dev             # filter by tag
idea list --priority high       # filter by priority
idea list --sort priority       # sort by priority
idea list -v                    # verbose output with descriptions
```

**Show an idea:**
```bash
idea show <id>
```

**Update an idea:**
```bash
idea update <id> --status done
idea update <id> --title "New title" --priority low --tags new,tags
```

**Delete an idea:**
```bash
idea delete <id>
```

**Search ideas:**
```bash
idea search rocket              # searches title, description, and tags
```

### Statuses

`new` | `in_progress` | `done` | `archived`

### Priorities

`high` | `medium` | `low`

## Data Storage

Ideas are stored as JSON in `~/.idea-tracker/ideas.json`.

## Running Tests

```bash
npm test
```

## Project Structure

```
src/
  index.js       - Entry point and command routing
  commands.js    - Command handlers
  store.js       - Data persistence (JSON file store)
  format.js      - Output formatting
  parse-args.js  - Minimal argument parser
test/
  store.test.js      - Store unit tests
  format.test.js     - Format unit tests
  parse-args.test.js - Argument parser tests
```
