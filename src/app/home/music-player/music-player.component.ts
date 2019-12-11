import { Component, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';
import { Platform } from '@ionic/angular';

import { GlobalsService } from '../../services/globals.service'
import { StreamSearchService } from '../../services/stream-search.service';
import { StorageService } from '../../services/storage.service';

import { NextSong, AudioInfo } from '../../models/interfaces';


@Component({
  selector: 'app-music-player',
  templateUrl: './music-player.component.html',
  styleUrls: ['./music-player.component.scss'],
})


export class MusicPlayerComponent implements AfterViewInit, OnDestroy {

  @ViewChild('audio', { static: false }) audioPlayer: any;
  @ViewChild('source', { static: false }) audioSource: any;

  audioData: Subscription;
  isPlayingObserver: Subscription;
  repeat: Subscription;

  titlePresent: boolean = false;
  currentTitle: string;
  playToggleIcon: string = "play";
  isPlaying: boolean = false;

  previousSongs: Array<AudioInfo> = [];
  nextSong: NextSong;

  songDuration: string = '00:00';
  songDurationSeconds: number;
  timeElapsed: number = 0;
  amountBuffered: number = 0;

  saved: boolean = false;
  repeatOn: boolean = false;


  constructor(private globals: GlobalsService, private tts: TextToSpeech, private plt: Platform, private streamSearch: StreamSearchService, private storage: StorageService) { }


  ngAfterViewInit() {
//new audio data has been set
    this.audioData = this.globals._audioSrc.subscribe((data: AudioInfo) => {
      if (data && Object.keys(data).length > 0) {
        this.setPlayer(data);
      }
    });

//should only happen when microphone gets triggered...pause the audio
    this.isPlayingObserver = this.globals._playingStatus.subscribe(playing => {
      if (this.isPlaying !== playing) {
        this.isPlaying = playing;
        this.playPause(playing);
      }
    });

//user triggers repeat by voice
    this.repeat = this.globals._repeatOn.subscribe(repeat => {
      this.repeatOn = repeat;
      this.toggleRepeat(repeat);
    });
  }


  public setNextSong(relatedSongs: Array<AudioInfo>): void {
    if (this.previousSongs.length === 0) {
      return;
    }
    const currentSongAuthor = this.previousSongs[this.previousSongs.length - 1].author;
    const currAuthExp = new RegExp(currentSongAuthor, 'gi');

    for (let i = 0; i < relatedSongs.length; i++) {
      const relatedSong = relatedSongs[i];
      //console.log(relatedSong.author);
      //console.log(relatedSong.title);


//check if video...could be playlist
      if (!relatedSong.title) {
        continue;
      }

//first related videos are usually from the same artist...skip those
//the last this.previousSongs entry is the current song
//skip full albums: <length>
      if (relatedSong.author == currentSongAuthor || currAuthExp.test(relatedSong.title) || parseInt(relatedSong.length) > 500) {
        continue;
      }

//rough check..could be same video with different title ie: audio only video
      const foundPrevious = this.previousSongs.filter(entry => {
        return entry.title == relatedSong.title;
      });

      if (foundPrevious.length === 0) {
//tts call out next song when current ends
        console.log(`next song: ${relatedSong.title}`);
        this.nextSong = {
          id: relatedSong.id,
          name: relatedSong.title
        };
        break;
      }
    }
  }


  public setPlayer(info: AudioInfo): void {
    this.currentTitle = info.title.split('(')[0].split('[')[0].trim();

//delay...let page render so width gets set and marquee in correct direction
    setTimeout(() => {
      this.titlePresent = !this.titlePresent;
    }, 500);

    this.songDurationSeconds = parseInt(info.length);
    this.songDuration = (() => {
      const time = this.songDurationSeconds;
      return Math.floor(time / 60)+':'+('0'+Math.floor(time % 60)).slice(-2);
    })();

//keep the url and info in case clicking back
//set active to specify which track is being played
    info['active'] = true;

    this.previousSongs.push(info);

//get next video...check if previously played
    this.setNextSong(info.related);

    this.audioSource.nativeElement.src = info.sources[0].url;
    this.audioPlayer.nativeElement.load();
    this.audioPlayer.nativeElement.play();

    this.isPlaying = true;
    this.togglePlayIcon();
    this.globals.updatePlayingStatus(true);
  }


  public playPause(playing?: boolean): void {
//initial Observer calls this function...if no title, return
    if (!this.currentTitle) {
      return;
    }
    if (this.isPlaying) {
      this.audioPlayer.nativeElement.pause();
    }else {
      this.audioPlayer.nativeElement.play();
    }

//parameter passed in from Observer only...otherwise from user clicking button
    if (playing === undefined) {
      this.isPlaying = !this.isPlaying;
    }
    this.togglePlayIcon();
  }


  public findPrevSong(): AudioInfo {
    let prevSong;
    this.previousSongs.forEach((song, index) => {
      if (song.active) {
        prevSong = this.previousSongs[index - 1];
        return;
      }
    });
    this.removeActiveTracks();

//remove current track from previousSongs
    this.previousSongs.length = this.previousSongs.length - 1;
    return prevSong;
  }


  public playPrevious(): void {
//check if previous songs available and if the first song isn't the active one
    if (this.previousSongs.length > 0 && !this.previousSongs[this.previousSongs.length - 2].active) {
      if (this.isPlaying) {
        this.audioPlayer.nativeElement.pause();
        this.isPlaying = false;
      }
      this.togglePlayIcon();

      this.setPlayer(this.findPrevSong());
    }
  }


  public playNext(): void {
    this.isPlaying = false;
    this.togglePlayIcon();

    this.removeActiveTracks();

    this.audioPlayer.nativeElement.pause();
    this.ttsSpeak('next song: ' + this.nextSong.name);
  }


  public ttsSpeak(text: string): void {
    this.tts.speak({
      text: text,
      locale: 'en-US',
      rate: this.plt.is('ios') ? 1.5 : 0.75
    }).then(() => {
      this.streamSearch.downloadAudio(this.nextSong.id);
    }).catch((error: any) => console.log(error));
  }


  public togglePlayIcon(): void {
    this.playToggleIcon = this.isPlaying ? 'pause' : 'play';
  }


/* *
* TODO: save current song ID;
* YTDL would still need to download and reverse engineer player signature to extract URL
* YouTube player signatures are only active for several hours
* */
  public toggleSave(): void {
    this.saved = !this.saved;
  }


  public toggleRepeat(repeat?: boolean): void {
    if (repeat === undefined) {
      this.repeatOn = !this.repeatOn;
    }
    this.audioPlayer.nativeElement.loop = true;
  }


  public bufferProgress(evt): void {
    if (evt.target.buffered.length) {
      let percent = Math.round((evt.target.buffered.end(0) / this.songDurationSeconds) * 100) / 100;
      if (percent > 2) {
        percent = 1;
      }
      this.amountBuffered = percent;
    }
  }


  public removeActiveTracks(): void {
//remove active from current song
    this.previousSongs.map(track => track.active = false);
  }


  public timeUpdate(evt): void {
    this.timeElapsed = evt.target.currentTime / this.songDurationSeconds;

//song finished
    if (evt.target.currentTime >= this.songDurationSeconds) {
      if (this.repeatOn === false) {
        this.audioPlayer.nativeElement.pause();

        this.removeActiveTracks();

        this.isPlaying = false;
        this.togglePlayIcon();

        this.ttsSpeak('next song: ' + this.nextSong.name);
      }else {
        this.audioPlayer.nativeElement.currentTime = 0;
        this.audioPlayer.nativeElement.play();
      }

    }
  }


  public trackEnded(evt): void {}


  public playbackError(evt): void {
    console.log(evt);
    this.isPlaying = false;
    this.togglePlayIcon();
    this.ttsSpeak('Something went wrong with this audio.  Please try another one.');
  }


  ngOnDestroy() {
    this.audioData.unsubscribe();
    this.isPlayingObserver.unsubscribe();
  }

}
