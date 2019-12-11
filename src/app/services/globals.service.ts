import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class GlobalsService {

  private playingStatus: BehaviorSubject<boolean> = new BehaviorSubject(false);
  _playingStatus = this.playingStatus.asObservable();

  private audioSrc: BehaviorSubject<object> = new BehaviorSubject({});
  _audioSrc = this.audioSrc.asObservable();

  private repeatOn: BehaviorSubject<boolean> = new BehaviorSubject(false);
  _repeatOn = this.repeatOn.asObservable();


  constructor() {}


  public setRepeat(val: boolean) {
    this.repeatOn.next(val);
  }


  public updatePlayingStatus(val: boolean) {
    this.playingStatus.next(val);
  }


  public updateAudioSrc(val: object) {
    this.audioSrc.next(val);
  }

}
