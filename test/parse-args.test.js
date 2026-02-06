const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { parseArgs } = require('../src/parse-args');

describe('parseArgs', () => {
  it('parses command', () => {
    const result = parseArgs(['node', 'idea', 'add']);
    assert.equal(result.command, 'add');
  });

  it('parses positional arguments', () => {
    const result = parseArgs(['node', 'idea', 'add', 'My', 'great', 'idea']);
    assert.equal(result.command, 'add');
    assert.deepEqual(result._, ['My', 'great', 'idea']);
  });

  it('parses --key value flags', () => {
    const result = parseArgs(['node', 'idea', 'add', 'Title', '--desc', 'Description here']);
    assert.equal(result.desc, 'Description here');
  });

  it('parses --key=value flags', () => {
    const result = parseArgs(['node', 'idea', 'add', '--priority=high']);
    assert.equal(result.priority, 'high');
  });

  it('parses boolean flags', () => {
    const result = parseArgs(['node', 'idea', 'list', '--verbose']);
    assert.equal(result.verbose, true);
  });

  it('parses short flags', () => {
    const result = parseArgs(['node', 'idea', 'list', '-v']);
    assert.equal(result.v, true);
  });

  it('returns null command when none given', () => {
    const result = parseArgs(['node', 'idea']);
    assert.equal(result.command, null);
  });

  it('handles mixed args', () => {
    const result = parseArgs(['node', 'idea', 'add', 'Title', '--tags', 'a,b', '--priority', 'high', '-v']);
    assert.equal(result.command, 'add');
    assert.deepEqual(result._, ['Title']);
    assert.equal(result.tags, 'a,b');
    assert.equal(result.priority, 'high');
    assert.equal(result.v, true);
  });
});
