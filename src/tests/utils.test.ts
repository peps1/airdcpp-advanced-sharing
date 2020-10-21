
import { expect } from 'chai';
import * as assert from 'assert';
import { describe, it } from 'mocha';
// import sinon from 'sinon';

import { addLeadingSlash, addTrailingSlash, formatSize, getLastDirectory, sleep } from '../utils';

describe('formatSize', () => {
  it('Should format bytes to MiB, GiB, TiB', () => {
    expect(formatSize(9812391156851)).to.equal('8.92 TB');
  });
  it('Should properly show Byte values', () => {
    expect(formatSize(1000)).to.equal('1000 B');
  });
});

describe('getLastDirectory', () => {
  it('Should return last folder of a path, when no trailing slash provided', () => {
    expect(getLastDirectory('/home/user/folder/2ndfolder/lastfolder')).to.equal('lastfolder');
  });
  it('Should return last folder of a path, when trailing slash provided', () => {
    expect(getLastDirectory('/home/user/folder/2ndfolder/lastfolder/')).to.equal('lastfolder');
  });
  it('Should return last folder, when root level folder', () => {
    expect(getLastDirectory('/home')).to.equal('home');
  });
  it('Should return full path if last folder can\'t be determined', () => {
    expect(getLastDirectory('/home/user//')).to.equal('/home/user//');
  });
});

describe('sleep', () => {
  it('Should sleep for specified amount', () => {
    sleep(100);
    assert.ok(true);
  });
});

describe('addLeadingSlash', () => {
  it('Should add leading slash', () => {
    expect(addLeadingSlash('some string')).to.equal('/some string');
  });
  it('Should not duplicate leading slash', () => {
    expect(addLeadingSlash('/some string')).to.equal('/some string');
  });
});

describe('addTrailingSlash', () => {
  it('Should add trailing slash', () => {
    expect(addTrailingSlash('some string')).to.equal('some string/');
  });
  it('Should not duplicate trailing slash', () => {
    expect(addTrailingSlash('some string/')).to.equal('some string/');
  });
});
