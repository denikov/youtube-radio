import { async, fakeAsync, tick } from '@angular/core/testing';
import { StorageService } from './storage.service';

import { MockStorageData } from '../tests/data/mockStorageData';

import { SongHistory } from '../models/interfaces';


describe('StorageService', () => {

  let storage: StorageService;
  let mockStorage = [...MockStorageData];

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('storage', {
      get: new Promise(resolve => resolve(mockStorage)),
      set: new Promise(resolve => resolve())
    });
    storage = new StorageService(storageSpy);
  });


  it('should be created', () => {
    expect(storage).toBeTruthy();
  });


  it('getItem() should return mocked data', async () => {
    const returned = await storage.getItem('foo')
    expect(returned.length).toEqual(3);
  });


  it('getSpecificItem() should filter and return data', async () => {
    const returned = await storage.getSpecificItem('foo', 'another+song+by+artist')
    expect(returned.length).toEqual(1);
    expect(returned[0].author).toBe('Artist');
    const returned2 = await storage.getSpecificItem('foo', 'another+song')
    expect(returned2.length).toEqual(0);
  });


  it('checkDuplicates() should detect whether duplicate exists', () => {
    const returned = storage.checkDuplicates(MockStorageData, {
      param: 'foo+bar+song+3',
      title: 'Song 3 - Some Other Name feat. Foo Bar',
      id: 'lasdkl3292',
      author: 'Some Other Name'
    });
    expect(returned).toBe(true);
    const returned2 = storage.checkDuplicates(MockStorageData, {
      param: 'foo+bar+song+3',
      title: 'Song 3 - Some Other Name',
      id: 'lasdkl3292',
      author: 'Some Other Name'
    });
    expect(returned2).toBe(false);
  });


  it('saveItem function should save only when no duplicate', async () => {
    const returned = await storage.saveItem('foo', {
      param: 'foo+bar+song+3',
      title: 'Song 3 - Some Other Name feat. Foo Bar',
      id: 'lasdkl3292',
      author: 'Some Other Name'
    });
    expect(returned.length).toEqual(3);
    const returned2 = await storage.saveItem('foo', {
      param: 'foo+bar+song+3',
      title: 'Song 3 - Some Other Name',
      id: 'lasdkl3292',
      author: 'Some Other Name'
    });
    expect(returned2.length).toEqual(4);
  });

});
