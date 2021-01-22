# Muslim Board

Personal Dashboard for Muslims in Indonesia.

Muslim Board is a personal dashboard specifically for Muslims who understand Bahasa Indonesia. This plugin is inspired by Momentum.

## Table of Content

- Folder `chrome-extension` is where the chrome extension source code lies.
- Folder `website` contains the source code web/landing page, https://muslimboard.novalagung.com/.
- Folder `resources` contains few resource files that are not used by the extension or website directly.

## Contribution

Anyone should be able to contribute to this project. Bug fixes, improvements, feature requests, you name it! Let's maintain this project.

But, before you start doing anything, please keep in mind:

- That first you need to understand how Chrome Extension work.
- Google has strict rules over anything! Not every approach is allowed, especially if it potentially bring any risk from the security perspective.
- This extension needs to work well across any computers on any condition: slow internet, offline mode, low-spec computer, etc.

    - Certain images are loaded locally. These images will boost the performance during the first installation and also will work fine on offline mode.

- Performance is one of few key points in the development of this extension.
- External requests are strictly monitored and controlled.

    - See on `manifest.json` on the `content_security_policy`.
    - This is one reason why a lot of libraries like `jQuery`, `font-awesome` are physically copied to the project directory.
    - Whitelisting any domains (`*`) will result in rejection on Chrome Webstore (been there).

- It would be nice to have some cutting-edge technology applied here, but if it's resulting in rejection during submission then I will not approve it. 
- I control the direction of where this extension is going. But I'm open to any constructive feedback or idea.
- To contribute, simply fork → commit your changes → submit PR.
- Go to `CONTRIBUTORS.md` if you want to see the list of names who maintain and contribute to this project

## Local Installation

Use chrome → open up extension menu → click **Load unpacked** and navigate to the `chrome-extension` directory.

## Webstore URL

https://chrome.google.com/webstore/detail/muslim-board/lmnhjilamobdmdihfkofgiejgokabfad?hl=id

## Author

Noval Agung Prayogo
