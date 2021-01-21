# Muslim Board v2

Personal Dashboard for Muslim in Indonesia

## Description

Muslim Board is a personal dashboard specifically for Muslims who understand Bahasa Indonesia. This plugin is inspired by Momentum.

To use this extension:
- simply create a new tab on the chrome browser, just that! then the newly created tab will show the extension content.

By adding this extension, you'll get the benefits below:
- On the top left pane, the prayer schedule information by location is displayed automatically depending on which location the user currently active in.
- In the middle, there will be positive motivational quotes randomly displayed, and shuffled automatically every few seconds.
- On the right pane, there is a TODO list section. Users will be able to write or check certain items. It's very useful for the user to track few things so the particular user will not forget them.
- Also on the bottom, the internet availability status is displayed.

---

Muslim Board adalah laman personal dashboard khusus untuk muslim yang berbahasa Indonesia. Plugin ini terinspirasi dari Momentum.

Fitur:
- Menampilkan informasi jadwal sholat sesuai lokasi (deteksi lokasi otomatis)
- Menampilkan informasi jadwal sholat sesuai pilihan lokasi
- Menampilkan quote2 bermanfaat
- Fasilitas untuk TODO list, bisa dimanfaatkan untuk mencatat sesuatu agar tidak 
lupa
- Indikator penanda internet sedang offline/online

## Table of Content

- Folder `chrome-extension` is where the chrome extension source code lies.
- Folder `website` contains the source code web/landing page, https://muslimboard.novalagung.com/.
- Folder `resources` contains few resource files that are not used by the extension or website directly.

## Extension Permissions

1. Single purpose description

    To show Islamic prayer time information and some Islamic quotes. In general, this extension is used to improve the productivity of muslim.

2. Geolocation

    The geolocation data is required for getting the prayer time schedule based on location coordinate. because prayer time calculation in Islam depend to coordinate information

3. Alarms

    This extension provides prayer schedule information. the alarm feature will help the user to get notified when the prayer time is coming in few minutes

4. Notifications

    This extension provides prayer schedule information. the notification feature will help the user to get notified when the prayer time is coming in few minutes

5. Storage

    The storage is used to store cached information such as todo list data in the right sidebar

6. Background (optional)

    The background will help the geolocation tracker to keep running in the background

7. Remote Codes

    I am using the 3rd party OpenLayers.js and inside the file there is eval statement, but I'm not sure wheter it's executed or not. This openlayer is required for performing the geolocation-related operations.

    Other than that there are few jsons file fetched from external urls.

## Webstore URL

https://chrome.google.com/webstore/detail/muslim-board/lmnhjilamobdmdihfkofgiejgokabfad?hl=id

## Author

Noval Agung Prayogo
