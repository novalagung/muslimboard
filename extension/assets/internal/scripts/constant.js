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
        backgroundPreloadTimeoutDuration: Utility.seconds(20),
        updateBackgroundDelayDuration: Utility.seconds(40),
        updateContentDelayDuration: Utility.seconds(60),
        changelogs: [
            'Search and set prayer location worldwide by city, province, or postal code',
            'Optional prayer calculation methods for primary API, fallback, and Asr madhab',
            'Clearer auto-detect and manual location setup with improved confirmations',
            'Postal codes in location search results when available',
            'Prayer times from cached monthly schedules when offline, with refresh when back online',
            'More reliable background images on slow or offline connections',
            'Refined modal copy, labels, and UI details across languages'
        ]
    },
}
