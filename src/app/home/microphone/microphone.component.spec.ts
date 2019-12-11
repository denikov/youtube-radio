import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { of, asyncScheduler, Observable } from 'rxjs';

import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';

import { StreamSearchService} from '../../services/stream-search.service';
import { GlobalsService } from '../../services/globals.service';

import { MicrophoneComponent } from './microphone.component';

class MockStreamSearchService {
  openBrowser() {}
}

class MockGlobalsService {
  setRepeat() {}
  updatePlayingStatus() {}
}

class MockSpeechRecognition {
  startListening(options?): Observable<Array<string>>{
    const matches = ['foo', 'foob', 'foo bar'];
    return of(matches, asyncScheduler);
  }
  stopListening() {}
}


describe('MicrophoneComponent', () => {
  let component: MicrophoneComponent;
  let fixture: ComponentFixture<MicrophoneComponent>;

  beforeEach(async () => {

    TestBed.configureTestingModule({
      declarations: [ MicrophoneComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        { provide: SpeechRecognition, useClass: MockSpeechRecognition },
        { provide: StreamSearchService, useClass: MockStreamSearchService },
        { provide: GlobalsService, useClass: MockGlobalsService }
      ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MicrophoneComponent);
    component = fixture.componentInstance;

    spyOn(component, 'ngOnInit');

    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.ngOnInit).toHaveBeenCalled();
  });


  it('should call StreamSearchService openBrowser function', () => {
    const myStreamSearch = fixture.debugElement.injector.get(StreamSearchService);
    spyOn(myStreamSearch, 'openBrowser');
    component.processSpeech([
      'play hey there',
      'play hey three',
      'play hey here',
    ]);
    expect(myStreamSearch.openBrowser).toHaveBeenCalled();
    expect(myStreamSearch.openBrowser).toHaveBeenCalledWith('hey+there');
  });


  it('should call GlobalsService setRepeat function', () => {
    const myGlobal = fixture.debugElement.injector.get(GlobalsService);
    spyOn(myGlobal, 'setRepeat');
    component.processSpeech([
      'repeat song again',
      'repeat song'
    ]);
    expect(myGlobal.setRepeat).toHaveBeenCalled();
  });


  it('should trigger listen and processSpeech functions', fakeAsync(() => {
    spyOn(component, 'listen').and.callThrough();
    spyOn(component, 'processSpeech');
    fixture.debugElement.nativeElement.querySelector('#mic').click();
    fixture.detectChanges();
    expect(component.listen).toHaveBeenCalled();
    expect(component.isListening).toBe(true);
    tick(2000);
    fixture.detectChanges();
    expect(component.loading).toBe(true);
    expect(component.isListening).toBe(false);
    expect(component.processSpeech).toHaveBeenCalled();
  }));
});
