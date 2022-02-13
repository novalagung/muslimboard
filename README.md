# Muslim Board

Personal Dashboard for Muslims in Indonesia.

Muslim Board is a personal dashboard for Muslims. This plugin is inspired by Momentum. For now, we only support Bahasa Indonesia.

## Table of Content

- Folder `extension` is where the chrome extension source code lies.
- Folder `resources` contains few resource files (it's used by the extension or website directly).
- Folder `webservices` contains the backend serverless code.
- Folder `website` contains the source code web/landing page, https://muslimboard.novalagung.com.

## Contribution

Anyone should be able to contribute to this project. Bug fixes, improvements, feature requests, you name it! Let's maintain this project.

However, before you start doing anything especially on anything within the `extension` folder, please keep in mind:

- First thing, you need to understand how browser extension work.
- Any browser addons marketplace has strict rules over a lot of things! especially Google. Not every approach is allowed, especially if it is risky from the security perspective.
- Muslim Board extension needs to work well across any computers, any browsers, on any condition: slow internet, offline mode, low-spec computer, etc.

    - Certain images are loaded locally. These images will boost the performance during the first load and it's very useful when it's offline mode (no internet).

- Performance is one of few key points in the development of Muslim Board.
- External requests are strictly monitored and controlled.

    - See on `manifest.json` on the `content_security_policy`.
    - This is one reason why libraries like `jQuery`, `font-awesome` are physically copied to the project directory.
    - Whitelisting any domains (`*`) will result in rejection during the submission to addons marketplace (been there).

- It would be nice to have some cutting-edge technology applied here, but if it's resulting in rejection during submission, well I will not approve it.

    - I suggest to open a discussion/issue first, before start doing any PRs, except if it's bug fixing.

- To contribute, simply fork → commit your changes → submit PR.
- Navigate to `CONTRIBUTING.md` if you want to see the list of names who maintain and contribute to this project.

## Local Installation

Use chrome → open up extension menu → click **Load unpacked** and navigate to the `extension` directory. Other browser has similar way to onload unpacked extension.

## Author

Noval Agung Prayogo
