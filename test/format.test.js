const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { formatIdea, formatIdeaList } = require('../src/format');

const mockIdea = {
  id: 'abc123',
  title: 'Test Idea',
  description: 'A test description',
  tags: ['work', 'dev'],
  priority: 'high',
  status: 'new',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

describe('formatIdea', () => {
  it('formats an idea in summary mode', () => {
    const output = formatIdea(mockIdea);
    assert.ok(output.includes('abc123'));
    assert.ok(output.includes('HIGH'));
    assert.ok(output.includes('New'));
    assert.ok(output.includes('Test Idea'));
    assert.ok(output.includes('[work, dev]'));
  });

  it('includes description in verbose mode', () => {
    const output = formatIdea(mockIdea, true);
    assert.ok(output.includes('A test description'));
  });

  it('handles empty tags', () => {
    const idea = { ...mockIdea, tags: [] };
    const output = formatIdea(idea);
    assert.ok(!output.includes('[]'));
  });
});

describe('formatIdeaList', () => {
  it('shows message when no ideas', () => {
    const output = formatIdeaList([]);
    assert.ok(output.includes('No ideas found'));
  });

  it('formats multiple ideas', () => {
    const ideas = [mockIdea, { ...mockIdea, id: 'def456', title: 'Second' }];
    const output = formatIdeaList(ideas);
    assert.ok(output.includes('abc123'));
    assert.ok(output.includes('def456'));
  });
});
