const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// Override HOME to use a temp directory for tests
const TEST_DIR = path.join(__dirname, '.test-data');
process.env.HOME = TEST_DIR;

const store = require('../src/store');

function cleanup() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

describe('Store', () => {
  beforeEach(() => cleanup());
  afterEach(() => cleanup());

  describe('addIdea', () => {
    it('creates an idea with defaults', () => {
      const idea = store.addIdea('My idea');
      assert.equal(idea.title, 'My idea');
      assert.equal(idea.description, '');
      assert.deepEqual(idea.tags, []);
      assert.equal(idea.priority, 'medium');
      assert.equal(idea.status, 'new');
      assert.ok(idea.id);
      assert.ok(idea.createdAt);
    });

    it('creates an idea with all fields', () => {
      const idea = store.addIdea('Tagged idea', {
        description: 'A great idea',
        tags: ['work', 'urgent'],
        priority: 'high',
      });
      assert.equal(idea.description, 'A great idea');
      assert.deepEqual(idea.tags, ['work', 'urgent']);
      assert.equal(idea.priority, 'high');
    });

    it('persists ideas to disk', () => {
      store.addIdea('Persistent idea');
      const raw = fs.readFileSync(store.DATA_FILE, 'utf8');
      const ideas = JSON.parse(raw);
      assert.equal(ideas.length, 1);
      assert.equal(ideas[0].title, 'Persistent idea');
    });
  });

  describe('listIdeas', () => {
    it('returns empty array when no ideas exist', () => {
      const ideas = store.listIdeas();
      assert.deepEqual(ideas, []);
    });

    it('lists all ideas sorted by date descending', () => {
      store.addIdea('First');
      store.addIdea('Second');
      const ideas = store.listIdeas();
      assert.equal(ideas.length, 2);
      assert.equal(ideas[0].title, 'Second');
    });

    it('filters by status', () => {
      const idea = store.addIdea('Done idea');
      store.updateIdea(idea.id, { status: 'done' });
      store.addIdea('New idea');

      const done = store.listIdeas({ status: 'done' });
      assert.equal(done.length, 1);
      assert.equal(done[0].title, 'Done idea');
    });

    it('filters by tag', () => {
      store.addIdea('Tagged', { tags: ['work'] });
      store.addIdea('Untagged');

      const filtered = store.listIdeas({ tag: 'work' });
      assert.equal(filtered.length, 1);
      assert.equal(filtered[0].title, 'Tagged');
    });

    it('filters by priority', () => {
      store.addIdea('High', { priority: 'high' });
      store.addIdea('Low', { priority: 'low' });

      const filtered = store.listIdeas({ priority: 'high' });
      assert.equal(filtered.length, 1);
      assert.equal(filtered[0].title, 'High');
    });

    it('sorts by priority', () => {
      store.addIdea('Low', { priority: 'low' });
      store.addIdea('High', { priority: 'high' });
      store.addIdea('Med', { priority: 'medium' });

      const sorted = store.listIdeas({ sortBy: 'priority' });
      assert.equal(sorted[0].priority, 'high');
      assert.equal(sorted[1].priority, 'medium');
      assert.equal(sorted[2].priority, 'low');
    });
  });

  describe('getIdea', () => {
    it('returns an idea by id', () => {
      const created = store.addIdea('Find me');
      const found = store.getIdea(created.id);
      assert.equal(found.title, 'Find me');
    });

    it('returns null for unknown id', () => {
      const found = store.getIdea('nonexistent');
      assert.equal(found, null);
    });
  });

  describe('updateIdea', () => {
    it('updates allowed fields', () => {
      const idea = store.addIdea('Original');
      const updated = store.updateIdea(idea.id, {
        title: 'Updated',
        description: 'New desc',
        priority: 'high',
        status: 'done',
        tags: ['updated'],
      });

      assert.equal(updated.title, 'Updated');
      assert.equal(updated.description, 'New desc');
      assert.equal(updated.priority, 'high');
      assert.equal(updated.status, 'done');
      assert.deepEqual(updated.tags, ['updated']);
    });

    it('returns null for unknown id', () => {
      const result = store.updateIdea('nonexistent', { title: 'x' });
      assert.equal(result, null);
    });

    it('does not update disallowed fields', () => {
      const idea = store.addIdea('Safe');
      store.updateIdea(idea.id, { id: 'hacked', createdAt: 'hacked' });
      const found = store.getIdea(idea.id);
      assert.equal(found.id, idea.id);
      assert.equal(found.createdAt, idea.createdAt);
    });
  });

  describe('deleteIdea', () => {
    it('removes an idea', () => {
      const idea = store.addIdea('Delete me');
      assert.equal(store.deleteIdea(idea.id), true);
      assert.equal(store.getIdea(idea.id), null);
    });

    it('returns false for unknown id', () => {
      assert.equal(store.deleteIdea('nonexistent'), false);
    });
  });

  describe('searchIdeas', () => {
    it('searches by title', () => {
      store.addIdea('Build a rocket');
      store.addIdea('Cook dinner');
      const results = store.searchIdeas('rocket');
      assert.equal(results.length, 1);
      assert.equal(results[0].title, 'Build a rocket');
    });

    it('searches by description', () => {
      store.addIdea('Project', { description: 'Build something amazing' });
      store.addIdea('Other');
      const results = store.searchIdeas('amazing');
      assert.equal(results.length, 1);
    });

    it('searches by tags', () => {
      store.addIdea('Tagged', { tags: ['javascript'] });
      store.addIdea('Other');
      const results = store.searchIdeas('javascript');
      assert.equal(results.length, 1);
    });

    it('is case insensitive', () => {
      store.addIdea('UPPERCASE IDEA');
      const results = store.searchIdeas('uppercase');
      assert.equal(results.length, 1);
    });
  });
});
