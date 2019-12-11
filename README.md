# youtube-radio
Play audio streams from YouTube's videos directly on your phone with this Ionic Framework/Angular application.

## Description
Listening to specific songs while driving requires opening YouTube and searching for the videos, which is dangerous for the driver. Playing the videos also consume a lot of data.  This app was created as a proof of concept in order to solve those problems.  This is a serverless application, all of the processing is done on the device.

*Warning*: This app violates YouTube's Terms of Service which is why publishing to any app store was not attempted.  Advising to only use personally.

## How It Works
Press the microphone, say "play <song name> <artist>" or any other variation starting with the word "play".  The app does a search in the background for the video's YouTube ID.  Thanks to [ytdl-core](https://github.com/fent/node-ytdl-core) and their great work, the app uses Cordova's Advanced HTTP plugin to circumvent the CORS issue when downloading and reverse engineering YouTube's video player in order to create the signature and retrieve the separated video and audio sources.  The audio file is played using HTML5's audio element.  The app is called Radio because from the video information gathered by `ytdl-core`, the songs will continue playing based on the current song's "related_videos", just like YouTube's "Up next" section.

*Caveat*: In order for this app to work, it needs to stay on the entire time.  On iOS, background tasks are not allowed to run continuously when the screen is off, allowed only for certain situations (GPS, Push Notifications).  For continous play, at the end of each song, this app needs `ytdl-core` to download and process the next song's data.  So it uses the Brightness plugin to keep the screen and the phone awake.

## Requirements
- Ionic 4
- Cordova
- NPM

## Install

`git clone https://github.com/denikov/youtube-radio.git`

Install dependencies

`npm install`

## Test

`npm test`

*Modify src/test.ts file to specify directly which file you want to test and run npm test*

Tested only on a personal iOS device, would love feedback from other OS's and devices.

There are many gotchas and pitfalls when it comes to emulating/running on a real device.  Will gladly help and provide answers to any issues which may come up.

## TODOs:
- Dim the screen after some time of user inactivity.
- - Maybe add an lock/unlock overlay so no interactions will be triggered after that inactivity time.
- Each audio stream is active for ~6 hours before the signature becomes invalid: save the stream with a timestamp so the video player does not need to be downloaded and processed if stream is still valid.  Useful when clicking "Previous" button.
- Implement "Favorites" feature: add a segmented component to the Modal which will have "Favorites" and "History" tabs.
- - Favorites should be sortable using `ion-reorder-group` component to drag and organize the playing order.
- Internet connection checking
- Add `Platform` plugin's `pause` and `resume` methods inside `app.component.ts` subscribing to events when the app sent to foreground/background.
