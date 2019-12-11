import { DebugElement, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { By } from '@angular/platform-browser';

import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';
import { Platform } from '@ionic/angular';

import { GlobalsService } from '../../services/globals.service'
import { StreamSearchService } from '../../services/stream-search.service';
import { StorageService } from '../../services/storage.service';

import { NextSong, AudioInfo } from '../../models/interfaces';

import { MusicPlayerComponent } from './music-player.component';

import { MockRelatedSongs } from '../../tests/data/mockRelatedSongs';

class platformMock {}

class StreamSearchServiceMock {}

class StorageServiceMock {}

interface TTSOptions {
  /** text to speak */
  text: string;
  /** a string like 'en-US', 'zh-CN', etc */
  locale?: string;
  /** speed rate, 0 ~ 1 */
  rate?: number;
}

class TextToSpeechMock {
  speak(textOrOptions: string | TTSOptions) {}
  stop() {}
}


describe('MusicPlayerComponent', () => {
  let component: MusicPlayerComponent;
  let fixture: ComponentFixture<MusicPlayerComponent>;
  let playButton: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MusicPlayerComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: Platform, useValue: platformMock },
        { provide: TextToSpeech, useClass: TextToSpeechMock },
        { provide: StreamSearchService, useClass: StreamSearchServiceMock },
        { provide: StorageService, useClass: StorageServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MusicPlayerComponent);
    component = fixture.componentInstance;

    playButton = fixture.debugElement.query(By.css('.large'));

    fixture.detectChanges();
  }));


  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should be undefined for nextSong variable', () => {
    expect(component.nextSong).toBeUndefined();
  });


  it('should match nextSong to first mock data entry', () => {
    let previousSongs = [...MockRelatedSongs];
    previousSongs.length = 1;
    component.previousSongs = previousSongs;
    component.setNextSong(MockRelatedSongs);
    expect(component.nextSong.name).toEqual(MockRelatedSongs[1].title);
  });


  it('should set up the audio player', fakeAsync(() => {
    spyOn(component, 'setNextSong');

    expect(playButton.nativeElement.name).toEqual('play');
    component.setPlayer(MockRelatedSongs[0]);
    expect(component.currentTitle).toEqual(MockRelatedSongs[0].title);

    tick(500);
    fixture.detectChanges();

    expect(component.setNextSong).toHaveBeenCalled();
    expect(component.isPlaying).toBe(true);
    expect(component.previousSongs.length).toEqual(1);
    expect(playButton.nativeElement.name).toEqual('pause');

    const songTitle = fixture.debugElement.query(By.css('.song-title')).nativeElement;
    expect(songTitle.textContent.trim()).toEqual(MockRelatedSongs[0].title);
    expect(songTitle.className).toContain('scroll-text');
  }));


  it('should return the first song find findPrevSong function', () => {
    let previousSongs = [...MockRelatedSongs];
    previousSongs.length = 2;
    previousSongs[1]['active'] = true;
    component.previousSongs = previousSongs;

    const returned = component.findPrevSong();
    expect(returned.title).toEqual(MockRelatedSongs[0].title);
  });


  it('should set player with first song when triggering previous button', () => {
    spyOn(component, 'playPrevious').and.callThrough();
    spyOn(component, 'setPlayer');

    let previousSongs = [...MockRelatedSongs];
    previousSongs.length = 2;
    previousSongs[1]['active'] = true;
    component.previousSongs = previousSongs;

    const previousButton = fixture.debugElement.query(By.css('[name="skip-backward"]'));
    previousButton.nativeElement.click();
    fixture.detectChanges();
    expect(component.playPrevious).toHaveBeenCalled();
    expect(component.previousSongs[1]).toBeUndefined();
    expect(component.setPlayer).toHaveBeenCalledWith(MockRelatedSongs[0]);
    expect(component.isPlaying).toBe(false);
  });


  it('should call text to speech function with second song title', () => {
    spyOn(component, 'ttsSpeak');
    spyOn(component, 'removeActiveTracks').and.callThrough();

    let previousSongs = [...MockRelatedSongs];
    previousSongs.length = 2;
    previousSongs[1]['active'] = true;
    component.previousSongs = previousSongs;
    component.nextSong = {id: MockRelatedSongs[2].id, name: MockRelatedSongs[2].title};

    const nextButton = fixture.debugElement.query(By.css('[name="skip-forward"]'));
    nextButton.nativeElement.click();
    fixture.detectChanges();

    expect(playButton.nativeElement.name).toEqual('play');
    expect(component.isPlaying).toBe(false);
    expect(component.removeActiveTracks).toHaveBeenCalled();
    expect(component.ttsSpeak).toHaveBeenCalled();
    expect(component.ttsSpeak).toHaveBeenCalledWith('next song: ' + MockRelatedSongs[2].title)
  });

});
