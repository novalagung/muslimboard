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
        baseUrlWebService: 'http://localhost:8012',
        baseUrlGithub: 'https://muslimboard.novalagung.com/extension/data',
        feedbackOrBugReportUrl: 'https://forms.gle/ZDATLmKNntdXBBt58',
        debug: (() => !('update_url' in chrome.runtime.getManifest()))(),
        timeoutDuration: Utility.seconds(5),
        updateBackgroundDelayDuration: Utility.seconds(40),
        updateContentDelayDuration: Utility.seconds(60),
        changelogs: [
            'Use your own image with local IndexedDB storage',
            'Smoother background loading with softer startup state',
            'Search and set prayer location worldwide by city, province, or postal code',
            'Optional prayer calculation methods for primary API, fallback, and Asr madhab',
            'Clearer auto-detect and manual location setup with improved confirmations',
            'Postal codes in location search results when available',
            'Improved offline handling for cached prayer times and backgrounds',
            'Refined modal copy, labels, and UI details across languages'
        ]
    },
}
