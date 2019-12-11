import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { StorageService } from '../services/storage.service';
import { StreamSearchService } from '../services/stream-search.service';
import { GlobalsService } from '../services/globals.service';

import { SongHistory } from '../models/interfaces';


@Component({
  selector: 'app-history-modal',
  templateUrl: './history-modal.page.html',
  styleUrls: ['./history-modal.page.scss']
})


export class HistoryModalPage implements OnInit {

  tracks: Array<SongHistory> = [];  

  constructor(private modalController: ModalController, private storage: StorageService, private streamSearch: StreamSearchService, private globals: GlobalsService) { }


  ngOnInit() {
    this.storage.getItem('history').then(data => {
      this.tracks = data;
    });
  }


  public async closeModal(): Promise<void> {
    await this.modalController.dismiss();
  }


  public async play(trackId: string): Promise<void> {
    await this.modalController.dismiss();
    this.globals.updatePlayingStatus(false);
    this.streamSearch.downloadAudio(trackId);
  }


  public remove(index: number): void {
    this.tracks.splice(index, 1);
    this.storage.removeItem('history', index);
  }

}
