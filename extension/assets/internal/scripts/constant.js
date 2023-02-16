const Constant = {
    meta: {
        version: (() => `v${chrome.runtime.getManifest().version}`)(),
        appName: chrome.runtime.getManifest().name,
        homepageLink: 'https://muslimboard.novalagung.com',
    },
    maintainer: {
        name: 'Noval Agung Prayogo',
        email: 'caknopal@gmail.com',
    },
    app: {
        baseUrlWebService: 'https://asia-southeast2-muslim-board-ind-1472876095243.cloudfunctions.net',
        baseUrlGithub: 'https://muslimboard.novalagung.com/extension/data',
        debug: (() => !('update_url' in chrome.runtime.getManifest()))(),
        timeoutDuration: Utility.seconds(5),
        updateBackgroundDelayDuration: Utility.seconds(40),
        updateContentDelayDuration: Utility.seconds(60),
        changelogs: [
            'New language support: arabic localization'
        ]
    },
}
