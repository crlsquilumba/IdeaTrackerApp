const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(process.env.HOME || process.env.USERPROFILE || '.', '.idea-tracker');
const DATA_FILE = path.join(DATA_DIR, 'ideas.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadIdeas() {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}

function saveIdeas(ideas) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(ideas, null, 2), 'utf8');
}

function generateId() {
  return crypto.randomBytes(4).toString('hex');
}

function addIdea(title, { description = '', tags = [], priority = 'medium' } = {}) {
  const ideas = loadIdeas();
  const idea = {
    id: generateId(),
    title,
    description,
    tags,
    priority,
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  ideas.push(idea);
  saveIdeas(ideas);
  return idea;
}

function listIdeas({ status, tag, priority, sortBy = 'createdAt' } = {}) {
  let ideas = loadIdeas();

  if (status) {
    ideas = ideas.filter(i => i.status === status);
  }
  if (tag) {
    ideas = ideas.filter(i => i.tags.includes(tag));
  }
  if (priority) {
    ideas = ideas.filter(i => i.priority === priority);
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };

  if (sortBy === 'priority') {
    ideas.sort((a, b) => (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1));
  } else {
    ideas.reverse();
  }

  return ideas;
}

function getIdea(id) {
  const ideas = loadIdeas();
  return ideas.find(i => i.id === id) || null;
}

function updateIdea(id, updates) {
  const ideas = loadIdeas();
  const index = ideas.findIndex(i => i.id === id);
  if (index === -1) return null;

  const allowed = ['title', 'description', 'tags', 'priority', 'status'];
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      ideas[index][key] = updates[key];
    }
  }
  ideas[index].updatedAt = new Date().toISOString();

  saveIdeas(ideas);
  return ideas[index];
}

function deleteIdea(id) {
  const ideas = loadIdeas();
  const index = ideas.findIndex(i => i.id === id);
  if (index === -1) return false;

  ideas.splice(index, 1);
  saveIdeas(ideas);
  return true;
}

function searchIdeas(query) {
  const ideas = loadIdeas();
  const lower = query.toLowerCase();
  return ideas.filter(i =>
    i.title.toLowerCase().includes(lower) ||
    i.description.toLowerCase().includes(lower) ||
    i.tags.some(t => t.toLowerCase().includes(lower))
  );
}

module.exports = {
  addIdea,
  listIdeas,
  getIdea,
  updateIdea,
  deleteIdea,
  searchIdeas,
  DATA_FILE,
  loadIdeas,
  saveIdeas,
};
