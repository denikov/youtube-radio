import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { HistoryModalPage } from './history-modal.page';

import { ModalController } from '@ionic/angular';

import { StorageService } from '../services/storage.service';
import { StreamSearchService } from '../services/stream-search.service';
import { GlobalsService } from '../services/globals.service';

import { SongHistory } from '../models/interfaces';

import { MockStorageData } from '../tests/data/mockStorageData';


class MockModalController {
  dismiss() {
    return new Promise((resolve, reject) => {
      resolve();
    });
  }
}

class MockStorageService {
  getItem(table: string): Promise<Array<SongHistory>> {
    return new Promise((resolve, reject) => {
      resolve(MockStorageData);
    });
  }
  removeItem() {}
}


class MockStreamSearchService {
  downloadAudio(id: string) {}
}


class MockGlobalService {
  updatePlayingStatus(val: boolean) {}
}


describe('HistoryModalPage', () => {
  let component: HistoryModalPage;
  let fixture: ComponentFixture<HistoryModalPage>;
  let songs: HTMLElement[];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoryModalPage ],
      providers: [
        { provide: ModalController, useClass: MockModalController },
        { provide: StorageService, useClass: MockStorageService },
        { provide: StreamSearchService, useClass: MockStreamSearchService },
        { provide: GlobalsService, useClass: MockGlobalService }
      ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HistoryModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));


  it('should create', () => {
    expect(component).toBeTruthy();
    fixture.detectChanges();
    const songs: HTMLElement[] = fixture.debugElement.nativeElement.querySelectorAll('.ion-text-wrap');
    expect(songs.length).toEqual(3);
  });


  it('should trigger downloadAudio function with first item ID', fakeAsync(() => {
    fixture.detectChanges();
    spyOn(component, 'play').and.callThrough();
    const myStreamSearch: StreamSearchService = fixture.debugElement.injector.get(StreamSearchService);
    spyOn(myStreamSearch, 'downloadAudio');
    fixture.debugElement.query(By.css('.ion-text-wrap')).parent.triggerEventHandler('click', null);
    tick();
    expect(component.play).toHaveBeenCalled();
    expect(myStreamSearch.downloadAudio).toHaveBeenCalled();
    expect(myStreamSearch.downloadAudio).toHaveBeenCalledWith('929238475');
  }));


  it('should remove first item and call storage save function', () => {
    fixture.detectChanges();
    spyOn(component, 'remove').and.callThrough();
    const myStorage: StorageService = fixture.debugElement.injector.get(StorageService);
    spyOn(myStorage, 'removeItem');
    component.remove(0);
    expect(component.remove).toHaveBeenCalled();
    expect(myStorage.removeItem).toHaveBeenCalled();
    expect(component.tracks.length).toEqual(2);
  });

});
