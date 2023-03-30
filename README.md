# Muslim Board

Personal Dashboard for Muslims anywhere in the world.

Muslim Board is a personal dashboard for Muslims. This plugin is inspired by Momentum. Currently we support English language, Bahasa Indonesia, Arabic, and Traditional Chinese.

<a href="https://www.producthunt.com/products/muslim-board?utm_source=badge-follow&utm_medium=badge&utm_souce=badge-muslim&#0045;board" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/follow.svg?product_id=498580&theme=light" alt="Muslim&#0032;Board - Personal&#0032;Dashboard&#0032;for&#0032;Muslim | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

![preview](resources/guide/preview-1.png)

## Installation via Official Page

- MacOS **Safari** via [App Store](https://apps.apple.com/us/app/muslim-board/id1659445206)
- Google **Chrome** & **Opera** Browser via official [Chrome Web Store](https://chrome.google.com/webstore/detail/muslim-board/lmnhjilamobdmdihfkofgiejgokabfad) 
- Microsoft **Edge** via official [Edge Add-ons Marketplace](https://microsoftedge.microsoft.com/addons/detail/muslim-board/dfmgmbngjpmbbpgibmdfegilbfckkgli)
- Mozilla **Firefox** via official [Firefox Add-ons Marketplace](https://addons.mozilla.org/en-US/firefox/addon/muslimboard/)

## Local Installation

Use chrome → open up extension menu → click **Load unpacked** and navigate to the `extension` directory. Other browser has similar way to load unpacked extensions.

## Project Structure

- Folder `extension` is where the chrome extension source code lies.
- Folder `macos` is the MacOS safari extension project directory. It is used for maintaining AppStore submission.
- Folder `resources` contains a few resource files (it's used by the extension or website directly).
- Folder `webservices` contains the backend webservice API code.
- Folder `website` contains the source code web/landing page, https://muslimboard.novalagung.com.

## Contribution

Anyone is allowed to contribute to this project. Bug fixes, improvements, feature requests, you name it!

However, before we start doing anything, especially on stuff within the `extension` folder, please keep in mind that:

- First, you need to understand how browser extensions work.
- Browser addons marketplaces have strict rules over a lot of things! Not every cool tech or approach is allowed, especially if it could bring vulnerability risk (from a security perspective).

    - External requests are strictly monitored and controlled. See the `content_security_policy` field on `manifest.json`.
    - This is one reason why libraries such as `jQuery` and `font-awesome` are physically copied to the source code.
    - It would be nice to have some cutting-edge technology applied here, but if it's resulting in rejection during submission, well ... I will not approve it.
    - I suggest opening a discussion/issue first, before doing any PRs, except if it's about code refactoring or bug fixing.

- Performance aspect is one primary key point in the development of Muslim Board.

    - Muslim Board extension needs to work well across many computers, any browsers, on any condition: slow internet, offline mode, low-spec computer, etc.
    - Certain images are loaded locally. These images will bring a performance boost during the initial load and also it's very useful when offline mode (no internet).

- To contribute, simply fork → commit your changes → submit PR.
- Navigate to [CONTRIBUTING.md](https://github.com/novalagung/muslimboard/blob/master/CONTRIBUTING.md) to see the list of amazing contributor of this project.

## Author

Noval Agung Prayogo
