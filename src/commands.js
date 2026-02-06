const store = require('./store');
const { formatIdea, formatIdeaList } = require('./format');

function cmdAdd(args) {
  const title = args._.join(' ');
  if (!title) {
    console.error('Error: Title is required.\nUsage: idea add <title> [--desc "..."] [--tags tag1,tag2] [--priority high|medium|low]');
    process.exit(1);
  }

  const tags = args.tags ? args.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
  const priority = args.priority || 'medium';

  if (!['high', 'medium', 'low'].includes(priority)) {
    console.error('Error: Priority must be high, medium, or low.');
    process.exit(1);
  }

  const idea = store.addIdea(title, {
    description: args.desc || '',
    tags,
    priority,
  });

  console.log(`Added idea ${idea.id}: "${idea.title}"`);
}

function cmdList(args) {
  const ideas = store.listIdeas({
    status: args.status,
    tag: args.tag,
    priority: args.priority,
    sortBy: args.sort,
  });

  console.log(formatIdeaList(ideas, args.verbose || args.v));
}

function cmdShow(args) {
  const id = args._[0];
  if (!id) {
    console.error('Error: Idea ID is required.\nUsage: idea show <id>');
    process.exit(1);
  }

  const idea = store.getIdea(id);
  if (!idea) {
    console.error(`Error: Idea "${id}" not found.`);
    process.exit(1);
  }

  console.log(formatIdea(idea, true));
}

function cmdUpdate(args) {
  const id = args._[0];
  if (!id) {
    console.error('Error: Idea ID is required.\nUsage: idea update <id> [--title "..."] [--desc "..."] [--tags a,b] [--priority high] [--status done]');
    process.exit(1);
  }

  const updates = {};
  if (args.title) updates.title = args.title;
  if (args.desc !== undefined) updates.description = args.desc;
  if (args.tags) updates.tags = args.tags.split(',').map(t => t.trim()).filter(Boolean);
  if (args.priority) {
    if (!['high', 'medium', 'low'].includes(args.priority)) {
      console.error('Error: Priority must be high, medium, or low.');
      process.exit(1);
    }
    updates.priority = args.priority;
  }
  if (args.status) {
    if (!['new', 'in_progress', 'done', 'archived'].includes(args.status)) {
      console.error('Error: Status must be new, in_progress, done, or archived.');
      process.exit(1);
    }
    updates.status = args.status;
  }

  if (Object.keys(updates).length === 0) {
    console.error('Error: No updates provided.');
    process.exit(1);
  }

  const idea = store.updateIdea(id, updates);
  if (!idea) {
    console.error(`Error: Idea "${id}" not found.`);
    process.exit(1);
  }

  console.log(`Updated idea ${idea.id}: "${idea.title}"`);
}

function cmdDelete(args) {
  const id = args._[0];
  if (!id) {
    console.error('Error: Idea ID is required.\nUsage: idea delete <id>');
    process.exit(1);
  }

  const deleted = store.deleteIdea(id);
  if (!deleted) {
    console.error(`Error: Idea "${id}" not found.`);
    process.exit(1);
  }

  console.log(`Deleted idea ${id}.`);
}

function cmdSearch(args) {
  const query = args._.join(' ');
  if (!query) {
    console.error('Error: Search query is required.\nUsage: idea search <query>');
    process.exit(1);
  }

  const ideas = store.searchIdeas(query);
  console.log(formatIdeaList(ideas, args.verbose || args.v));
}

function cmdHelp() {
  console.log(`
IdeaTracker - Track and organize your ideas

Usage: idea <command> [options]

Commands:
  add <title>       Add a new idea
    --desc "..."    Description
    --tags a,b      Comma-separated tags
    --priority      high, medium, or low (default: medium)

  list              List all ideas
    --status        Filter by status (new, in_progress, done, archived)
    --tag           Filter by tag
    --priority      Filter by priority
    --sort          Sort by: createdAt (default) or priority
    -v, --verbose   Show full details

  show <id>         Show details of a specific idea

  update <id>       Update an existing idea
    --title "..."   New title
    --desc "..."    New description
    --tags a,b      New tags
    --priority      New priority
    --status        New status

  delete <id>       Delete an idea

  search <query>    Search ideas by title, description, or tags
    -v, --verbose   Show full details

  help              Show this help message
`);
}

module.exports = { cmdAdd, cmdList, cmdShow, cmdUpdate, cmdDelete, cmdSearch, cmdHelp };
