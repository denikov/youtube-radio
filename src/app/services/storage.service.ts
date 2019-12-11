import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { SongHistory } from '../models/interfaces';


@Injectable({
  providedIn: 'root'
})


export class StorageService {

  constructor(private storage: Storage) {}


  public async getItem(table: string): Promise<Array<SongHistory>> {
    const val = await this.storage.get(table);
    //this.storage.clear();
    return val;
  }


  public async getSpecificItem(table: string, needle: string): Promise<Array<SongHistory> | undefined> {
    const val = await this.getItem(table);

    if (!val || val.length === 0) {
      return;
    }

//terrible way to compare
//implement a JS fuzzy search algorithm later
    return val.filter(item => item.param === needle);
  }


//checking if song already saved
  public checkDuplicates(val: Array<SongHistory>, value: SongHistory): boolean {
    let found: boolean = false;

    for (let i = 0; i < val.length; i++) {
//check whether new title exists in perviously saved titles
      if (value.title == val[i].title) {
        found = true;
        break;
      }
    }
    return found;
  }


  public async saveItem(table: string, value: SongHistory): Promise<Array<SongHistory>> {
    let val = await this.getItem(table);
    if (!val) {
      val = [];
    }

    const found: boolean = this.checkDuplicates(val, value);
    if (!found) {

      val.unshift(value);
      await this.storage.set(table, val);
    }
    return val;
  }


  public async removeItem(table: string, index: number): Promise<Array<SongHistory>> {
    let val = await this.getItem(table);
    val.splice(index, 1);
    await this.storage.set(table, val);
    return val;
  }

}
