import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
import { Subscription } from 'rxjs';

import { StreamSearchService} from '../../services/stream-search.service';
import { GlobalsService } from '../../services/globals.service';

@Component({
  selector: 'app-microphone',
  templateUrl: './microphone.component.html',
  styleUrls: ['./microphone.component.scss'],
})

export class MicrophoneComponent implements OnInit {

  @ViewChild('mic', { static: false }) mic: ElementRef;

//binding variable in order to set the "pulse" class on the microphone icon
  isListening: boolean = false;

  loading: boolean = false;
  isPlayingObserver: Subscription;


  constructor(private plt: Platform, private speech: SpeechRecognition, private globals: GlobalsService, private streamSearch: StreamSearchService, private zone: NgZone) { }


  ngOnInit() {
// get user permision for speech recognition
    this.plt.ready().then(() => {
      this.speech.hasPermission().then((hasPermission: boolean) => {
        if (!hasPermission) {
          this.speech.requestPermission().then(
            () => console.log('granted'),
            () => console.log('denied')
          )
        }
      });
    });

    this.isPlayingObserver = this.globals._playingStatus.subscribe(playing => {
      if (playing && this.loading) {
        this.loading = false;
      }
    });

  }


  public processSpeech(matches: string[]): void {
    if (matches.length > 0) {
      const phrase = matches[0].trim().toLowerCase();
      if (/next song/gi.test(phrase)) {

      }else if (/repeat song/gi.test(phrase)) {
        this.globals.setRepeat(true);
      }else if (phrase.substring(0, phrase.indexOf(' ')) === 'play') {
        this.streamSearch.openBrowser(
          phrase
            .replace('play', '')
            .trim()
            .replace(/\s/g, '+')
        );

      }else {
        this.loading = false;
      }
    }
  }


  public listen(): void {

//update playing status so music player Observer will get notified to pause the player
    this.globals.updatePlayingStatus(false);

//if currently listening, stop
    if (this.isListening && this.plt.is('ios')) {
      this.speech.stopListening();
      this.isListening = !this.isListening;
      return;
    }else if (this.isListening) {
      return;
    }

    this.isListening = !this.isListening;

    let finishedSpeaking: any;
    let sentToProcess: boolean = false;

    this.speech.startListening({
      //matches: 5,
      language: 'en-US',
      showPartial: true
    }).subscribe((matches: string[]) => {
      clearTimeout(finishedSpeaking);

//test this reasoning
      finishedSpeaking = setTimeout(() => {
        this.zone.run(() => {
          this.speech.stopListening();
          if (!sentToProcess) {
            this.isListening = !this.isListening;
            this.loading = true;
            sentToProcess = true;
            this.processSpeech(matches);
          }
        });
      }, 2000);
    }, error => {
      console.log(error);
      this.isListening = !this.isListening;
    });
  }

}
