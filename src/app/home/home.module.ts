import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { HomePage } from './home.page';
import { HomeRoutingModule } from './home-routing.module';
import { MicrophoneComponent } from './microphone/microphone.component';
import { MusicPlayerComponent } from './music-player/music-player.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomeRoutingModule
  ],
  exports: [],
  declarations: [
    HomePage,
    MicrophoneComponent,
    MusicPlayerComponent
  ]
})
export class HomePageModule {}
