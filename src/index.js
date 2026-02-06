#!/usr/bin/env node

const { parseArgs } = require('./parse-args');
const { cmdAdd, cmdList, cmdShow, cmdUpdate, cmdDelete, cmdSearch, cmdHelp } = require('./commands');

const COMMANDS = {
  add: cmdAdd,
  list: cmdList,
  show: cmdShow,
  update: cmdUpdate,
  delete: cmdDelete,
  search: cmdSearch,
  help: cmdHelp,
};

const args = parseArgs(process.argv);
const handler = COMMANDS[args.command];

if (!handler) {
  cmdHelp();
  process.exit(args.command ? 1 : 0);
}

handler(args);
