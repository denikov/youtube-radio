import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Brightness } from '@ionic-native/brightness/ngx';

import { ModalController } from '@ionic/angular';
import { HistoryModalPage } from '../history-modal/history-modal.page';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})


export class HomePage implements OnInit {

  constructor(private plt: Platform, private brightness: Brightness, public modalController: ModalController) { }


  ngOnInit() {
    this.plt.ready().then(() => {
      this.brightness.setKeepScreenOn(true);
    });
  }


  public async openHistory() {
    const modal = await this.modalController.create({
      component: HistoryModalPage,
      componentProps: {

      }
    });

    modal.onDidDismiss().then(dataReturned => {
      if (dataReturned.data) {
      }
    });

    return await modal.present();
  }

}
