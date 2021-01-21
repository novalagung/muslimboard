# Muslim Board

Personal Dashboard for Muslim in Indonesia.

Muslim Board is a personal dashboard specifically for Muslims who understand Bahasa Indonesia. This plugin is inspired by Momentum.

## Table of Content

- Folder `chrome-extension` is where the chrome extension source code lies.
- Folder `website` contains the source code web/landing page, https://muslimboard.novalagung.com/.
- Folder `resources` contains few resource files that are not used by the extension or website directly.

## Contribution

Anyone should be able to contribute to this project. Bug fixes, improvements, feature requests, you name it! Let's maintain this project.

But, before you start doing anything, please keep in mind:

- That first you need to understand about how Chrome Extension work.
- Google has strict rules over anything! Not every approach is allowed, especially if it potentially bring any risk from security prespective.
- It would be nice to have some cutting-edge technology applied here, but if it's resulting a rejection during submission then I will not approve it. 
- This extension need to work well across any computers on any condition: slow internet, low-spec computer, etc.
- Performance is one of few key points on development of this extension.
- External request are strictly monitored and controlled.

    - See on `manifest.json` on the `content_security_policy`.
    - This is one reason why lot of libraries like `jQuery`, `font-awesome` are physically copied to the project directory.
    - Whitelisting any domains will result rejection on Chrome Webstore (been there).

- I control the direction of where this extension is going. I will review any PRs.

## Webstore URL

https://chrome.google.com/webstore/detail/muslim-board/lmnhjilamobdmdihfkofgiejgokabfad?hl=id

## Author

Noval Agung Prayogo
