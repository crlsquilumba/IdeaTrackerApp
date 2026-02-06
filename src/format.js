const PRIORITY_LABELS = { high: 'HIGH', medium: 'MED', low: 'LOW' };
const STATUS_LABELS = { new: 'New', in_progress: 'In Progress', done: 'Done', archived: 'Archived' };

function formatIdea(idea, verbose = false) {
  const priority = PRIORITY_LABELS[idea.priority] || idea.priority;
  const status = STATUS_LABELS[idea.status] || idea.status;
  const tags = idea.tags.length > 0 ? ` [${idea.tags.join(', ')}]` : '';

  let output = `  ${idea.id}  [${priority}] [${status}]  ${idea.title}${tags}`;

  if (verbose && idea.description) {
    output += `\n           ${idea.description}`;
  }
  if (verbose) {
    output += `\n           Created: ${new Date(idea.createdAt).toLocaleString()}`;
    if (idea.updatedAt !== idea.createdAt) {
      output += `  |  Updated: ${new Date(idea.updatedAt).toLocaleString()}`;
    }
  }

  return output;
}

function formatIdeaList(ideas, verbose = false) {
  if (ideas.length === 0) {
    return '  No ideas found.';
  }
  return ideas.map(i => formatIdea(i, verbose)).join('\n');
}

module.exports = { formatIdea, formatIdeaList };
