const Constant = {
    meta: {
        version: (() => `v${chrome.runtime.getManifest().version}`)(),
        appName: chrome.runtime.getManifest().name,
        homepageLink: 'https://muslimboard.novalagung.com',
    },
    maintainer: {
        name: 'Noval Agung Prayogo',
        email: 'hello@novalagung.com',
    },
    app: {
        baseUrlWebService: 'https://muslimboard-api.novalagung.com',
        baseUrlGithub: 'https://muslimboard.novalagung.com/extension/data',
        debug: (() => !('update_url' in chrome.runtime.getManifest()))(),
        timeoutDuration: Utility.seconds(5),
        updateBackgroundDelayDuration: Utility.seconds(40),
        updateContentDelayDuration: Utility.seconds(60),
        changelogs: [
            'Enable sortable TODO list items',
            'New contents',
        ]
    },
}
