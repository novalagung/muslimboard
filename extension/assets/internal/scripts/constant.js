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
        feedbackOrBugReportUrl: 'https://forms.gle/ZDATLmKNntdXBBt58',
        debug: (() => !('update_url' in chrome.runtime.getManifest()))(),
        timeoutDuration: Utility.seconds(5),
        updateBackgroundDelayDuration: Utility.seconds(40),
        backgroundPreloadTimeoutDuration: Utility.seconds(10),
        updateContentDelayDuration: Utility.seconds(60),
        changelogs: [
            'Support for 26 new languages, bringing the total to 34',
            'Right-to-left layout for Arabic, Persian, Urdu, and Pashto',
            'Redesigned language picker with flags, alphabetical order, and the current language marked',
            'Bug fixes'
        ]
    },
}
