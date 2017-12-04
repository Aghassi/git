import test from 'ava';
import {stub} from 'sinon';
import verify from '../lib/verify';
import {gitRepo, gitCommit} from './helpers/git-utils';

test.beforeEach(t => {
  // Save the current process.env
  t.context.env = Object.assign({}, process.env);
  // Delete env paramaters that could have been set on the machine running the tests
  delete process.env.GH_TOKEN;
  delete process.env.git_TOKEN;
  delete process.env.GIT_CREDENTIALS;
  delete process.env.GIT_EMAIL;
  delete process.env.GIT_USERNAME;
  // Save the current working diretory
  t.context.cwd = process.cwd();
  // Stub the logger functions
  t.context.log = stub();
  t.context.logger = {log: t.context.log};
});

test.afterEach.always(t => {
  // Restore process.env
  process.env = Object.assign({}, t.context.env);
  // Restore the current working directory
  process.chdir(t.context.cwd);
});

test('Throw SemanticReleaseError if "assets" option is not a String or false or an Array of Objects', async t => {
  const assets = true;
  const error = await t.throws(verify({assets}, {}, t.context.logger));

  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDASSETS');
});

test('Throw SemanticReleaseError if "assets" option is not an Array with invalid elements', async t => {
  const assets = ['file.js', 42];
  const error = await t.throws(verify({assets}, {}, t.context.logger));

  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDASSETS');
});

test.serial('Verify "assets" is a String', async t => {
  // Create a git repository with a remote, set the current working directory at the root of the repo
  const repo = await gitRepo(true);
  await gitCommit('Test commit');
  const assets = 'file2.js';

  await t.notThrows(verify({assets}, {repositoryUrl: repo, branch: 'master'}, t.context.logger));
});

test.serial('Verify "assets" is an Array of String', async t => {
  // Create a git repository with a remote, set the current working directory at the root of the repo
  const repo = await gitRepo(true);
  await gitCommit('Test commit');
  const assets = ['file1.js', 'file2.js'];

  await t.notThrows(verify({assets}, {repositoryUrl: repo, branch: 'master'}, t.context.logger));
});

test.serial('Verify "assets" is an Object with a path property', async t => {
  // Create a git repository with a remote, set the current working directory at the root of the repo
  const repo = await gitRepo(true);
  await gitCommit('Test commit');
  const assets = {path: 'file2.js'};

  await t.notThrows(verify({assets}, {repositoryUrl: repo, branch: 'master'}, t.context.logger));
});

test.serial('Verify "assets" is an Array of Object with a path property', async t => {
  // Create a git repository with a remote, set the current working directory at the root of the repo
  const repo = await gitRepo(true);
  await gitCommit('Test commit');
  const assets = [{path: 'file1.js'}, {path: 'file2.js'}];

  await t.notThrows(verify({assets}, {repositoryUrl: repo, branch: 'master'}, t.context.logger));
});

test.serial('Verify disabled "assets" (set to false)', async t => {
  // Create a git repository with a remote, set the current working directory at the root of the repo
  const repo = await gitRepo(true);
  await gitCommit('Test commit');
  const assets = false;

  await t.notThrows(verify({assets}, {repositoryUrl: repo, branch: 'master'}, t.context.logger));
});

test.serial('Verify "assets" is an Array of glob Arrays', async t => {
  // Create a git repository with a remote, set the current working directory at the root of the repo
  const repo = await gitRepo(true);
  await gitCommit('Test commit');
  const assets = [['dist/**', '!**/*.js'], 'file2.js'];

  await t.notThrows(verify({assets}, {repositoryUrl: repo, branch: 'master'}, t.context.logger));
});

test.serial('Verify "assets" is an Array of Object with a glob Arrays in path property', async t => {
  // Create a git repository with a remote, set the current working directory at the root of the repo
  const repo = await gitRepo(true);
  await gitCommit('Test commit');
  const assets = [{path: ['dist/**', '!**/*.js']}, {path: 'file2.js'}];

  await t.notThrows(verify({assets}, {repositoryUrl: repo, branch: 'master'}, t.context.logger));
});

test('Throw SemanticReleaseError if "message" option is not a String', async t => {
  const message = 42;
  const error = await t.throws(verify({message}, {}, t.context.logger));

  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDMESSAGE');
});

test('Throw SemanticReleaseError if "message" option is an empty String', async t => {
  const message = '';
  const error = await t.throws(verify({message}, {}, t.context.logger));

  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDMESSAGE');
});

test('Throw SemanticReleaseError if "message" option is a whitespace String', async t => {
  const message = '  \n \r ';
  const error = await t.throws(verify({message}, {}, t.context.logger));

  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDMESSAGE');
});

test('Throw SemanticReleaseError if "changelog" option is not a Boolean', async t => {
  const changelog = 42;
  const error = await t.throws(verify({changelog}, {}, t.context.logger));

  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'EINVALIDCHANGELOG');
});

test.serial('Verify undefined "message" and "assets"', async t => {
  // Create a git repository with a remote, set the current working directory at the root of the repo
  const repo = await gitRepo(true);
  await gitCommit('Test commit');

  await t.notThrows(verify({}, {repositoryUrl: repo, branch: 'master'}, t.context.logger));
});
