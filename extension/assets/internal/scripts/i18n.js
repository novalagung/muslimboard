const I18n = {
    mapping: {
        appName: 'Muslim Board',
        appShortName: 'muslimboard',
        appDescription: {
            en: 'Personal Dashboard for Muslim',
            id: 'Personal Dashboard untuk umat Islam'
        },
        prayerTimeTodaySchedule: {
            en: 'Prayer times today:',
            id: 'Jadwal sholat untuk hari ini:'
        },
        prayerTimeFajr: {
            en: 'Fajr',
            id: 'Subuh',
        },
        prayerTimeSunrise: {
            en: 'Sunrise',
            id: 'Dhuha',
        },
        prayerTimeDhuhr: {
            en: 'Dhuhr',
            id: 'Dzuhur',
        },
        prayerTimeAsr: {
            en: 'Asr',
            id: 'Ashar',
        },
        prayerTimeMaghrib: {
            en: 'Maghrib',
            id: 'Maghrib',
        },
        prayerTimeIsha: {
            en: 'Isha',
            id: `Isya'`,
        },
        menuAutomaticLocationDetection: {
            en: 'Auto detect location',
            id: 'Deteksi lokasi otomatis'
        },
        menuManua
    },

    getSelectedLocale: () => {
        const locale = localStorage.getItem(`selected-locale-${Constant.meta.version}`)
        if (locale) {
            return locale
        }
        return 'en'
    },
    setSelectedLocale: (selectedLocale) => {
        localStorage.setItem(`selected-locale-${Constant.meta.version}`, selectedLocale)
    },
    getText: (key) => {
        const locale = I18n.getSelectedLocale()
        const item = I18n.mapping[key]
        if (!item) {
            return ''
        } else if (item[locale]) {
            return item[locale]
        } else if (typeof item === 'object' && item !== null) {
            return item[Object.keys(item).find(() => true)] || ''
        } else {
            return item
        }
    },
    init: () => {
        const locale = localStorage.getItem(`selected-locale-${Constant.meta.version}`)
        if (!locale) {
            I18n.setSelectedLocale('en')
        }

        $('[data-i18n]').each((i, e) => {
            const $e = $(e)
            const key = $e.attr('data-i18n')
            console.log(key, e, I18n.getText(key), $e.text())
            $e.text(I18n.getText(key))
            console.log(key, e, I18n.getText(key), $e.text())
        })
    }
}
