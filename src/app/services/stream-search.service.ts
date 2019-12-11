import { Injectable } from '@angular/core';

import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { GlobalsService } from './globals.service';
import { StorageService } from './storage.service';

import { AudioInfo } from '../models/interfaces';

declare const ytdl: any;

@Injectable({
  providedIn: 'root'
})


export class StreamSearchService {

  browser: any;
  iabOptions: Object = {
    hidden: 'yes', //Or  'no'
    location: 'yes', //Or 'no'
    clearcache: 'yes',
    clearsessioncache: 'yes',
    zoom: 'yes',//Android only, shows browser zoom controls
    hardwareback: 'yes',
    mediaPlaybackRequiresUserAction: 'no',
    shouldPauseOnSuspend: 'no', //Android only
    closebuttoncaption: 'Close', //iOS only
    disallowoverscroll: 'no', //iOS only
    toolbar: 'yes', //iOS only
    enableViewportScale: 'yes', //iOS only
    allowInlineMediaPlayback: 'no', //iOS only
    presentationstyle: 'pagesheet', //iOS only
    fullscreen: 'yes', //Windows only
  };

  constructor(private iab: InAppBrowser, private globals: GlobalsService, private storage: StorageService) { }


  public downloadAudio(id: string, searchParams?: string): void {

    ytdl.getInfo(id, (err, info) => {
      if (err) {
        console.log(err);
        return err;
        throw err;
      }

      const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
      const filteredFormats = audioFormats.filter(item => item.container === 'mp4' || item.container === 'm4a');

      //console.log(info);
      const data: AudioInfo = {
        id: info.video_id,
        sources: filteredFormats,
        title: info.title,
        length: info.length_seconds,
        related: info.related_videos,
        author: info.author.name
      };

//if download successfull, save the song ID for future reference
      this.storage.saveItem('history', {
        param: searchParams,
        id: id,
        title: info.title,
        author: info.author.name
      });

//update global audio src to trigger play in music player Observer
      this.globals.updateAudioSrc(data);

    });
  }


  public async openBrowser(searchParams: string): Promise<void> {

//check if song ID saved in history...no need to open InAppBrowser and search for it
    const songInfo = await this.storage.getSpecificItem('history', searchParams);
    if (songInfo && songInfo.length === 1) {
      this.downloadAudio(songInfo[0].id);
      return;
    }

    let scriptInserted: boolean = false;
    let localStorageInterval: any;

//open browser with already structured search query
    this.browser = this.iab.create('https://www.google.com/search?gl=us&hl=en&q=youtube+' + searchParams, '_blank', this.iabOptions);
    
    const _this = this;
    this.browser.on('loadstart').subscribe(event => {

      if (!scriptInserted) {
        scriptInserted = true;

//let the page load a little bit
        setTimeout(() => {

          _this.browser.executeScript({
//scraper script
            code: "(function(){function init(){if(location.href.indexOf('google.com')>-1){var links=document.querySelectorAll('a[href*=\"youtube.com/watch?v\"]');localStorage.setItem('url',links[0].href.replace('//m.','//www.'))}}var interval=setInterval(function(){if(document.readyState=='complete'){clearInterval(interval);init();}},500);localStorage.setItem('url','');})()"
          }, params => {
            console.log('script inserted');

//interval sending to browser checking if localStorage item as been set
//localStorage will contain the url of the video
            localStorageInterval = setInterval(() => {

//send a commane to retrieve url
              _this.browser.executeScript({
                code: 'localStorage.getItem("url");'
              }, returned => {
                if (returned[0]) {
                  clearInterval(localStorageInterval);
                  _this.browser.close();
                  const audioId = returned[0].split('v=')[1];

//pass search params in order to save if download of audio successfull
                  _this.downloadAudio(audioId, searchParams);
                }
              });
            }, 300);
          });
        }, 5000);
      }

    });
  }

}
