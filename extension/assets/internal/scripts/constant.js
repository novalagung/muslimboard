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
        updateBackgroundDelayDuration: Utility.seconds(5),
        updateContentDelayDuration: Utility.seconds(60),
        changelogs: [
            'Todo list import/export support',
            'Clickable links in todo items',
            'Improved todo editing and tooltips',
            'New share options and UI refinements'
        ]
    },
}
