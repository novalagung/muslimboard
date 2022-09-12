const I18n = {
    mapping: {
        appDescription: {
            en: 'Personal Dashboard for Muslim',
            id: 'Personal Dashboard untuk umat Islam'
        },

        daySunday: { en: 'Sunday', id: 'Ahad' },
        dayMonday: { en: 'Monday', id: 'Senin' },
        dayTuesday: { en: 'Tuesday', id: 'Selasa' },
        dayWednesday: { en: 'Wednesday', id: 'Rabu' },
        dayThursday: { en: 'Thursday', id: 'Kamis' },
        dayFriday: { en: 'Friday', id: 'Jumat' },
        daySaturday: { en: 'Saturday', id: 'Sabtu' },

        monthJanuary: { en: 'January', id: 'Januari' },
        monthFebruary: { en: 'February', id: 'Februari' },
        monthMarch: { en: 'March', id: 'Maret' },
        monthApril: { en: 'April', id: 'April' },
        monthMay: { en: 'May', id: 'Mei' },
        monthJune: { en: 'June', id: 'Juni' },
        monthJuly: { en: 'July', id: 'July' },
        monthAugust: { en: 'August', id: 'Agustus' },
        monthSeptember: { en: 'September', id: 'September' },
        monthOctober: { en: 'October', id: 'Oktober' },
        monthNovember: { en: 'November', id: 'November' },
        monthDecember: { en: 'December', id: 'Desember' },

        prayerTimeTodaySchedule: {
            en: 'Today prayer times:',
            id: 'Jadwal sholat untuk hari ini:'
        },

        prayerTimeFajr: { en: 'Fajr', id: 'Subuh', },
        prayerTimeSunrise: { en: 'Sunrise', id: 'Dhuha', },
        prayerTimeDhuhr: { en: 'Dhuhr', id: 'Dzuhur', },
        prayerTimeAsr: { en: 'Asr', id: 'Ashar', },
        prayerTimeMaghrib: { en: 'Maghrib', id: 'Maghrib', },
        prayerTimeIsha: { en: 'Isha', id: `Isya'`, },

        todoListHeaderShow: {
            en: 'Show TODO list panel',
            id: 'Tampilkan TODO list'
        },
        todoListHeaderHide: {
            en: 'Hide TODO list panel',
            id: 'Sembunyikan TODO list'
        },
        todoListEntryPlaceholder: {
            en: 'Write something',
            id: 'Tulis sesuatu'
        },
        todoListPlaceholder: {
            en: 'Always be grateful and spread kindness',
            id: 'Senantiasa bersyukur dan berbuat baik'
        },

        footerMenuAutomaticLocationDetection: {
            en: 'Auto detect location (Worldwide)',
            id: 'Deteksi lokasi otomatis'
        },
        footerMenuManualLocationSelection: {
            en: 'Choose specific location (Indonesia)',
            id: 'Atur manual pilihan lokasi (Indonesia)'
        },
        footerMenuInternetAvailability: {
            en: 'Internet:',
            id: 'Internet:',
        },
        footerMenuImageAuthor: {
            en: 'Image from',
            id: 'Foto dari'
        },
        footerMenuChangeLanguage: {
            en: 'Change language',
            id: 'Change language'
        },
        footerMenuSourceCode: {
            en: 'Source code',
            id: 'Source code'
        },
        footerMenuShare: {
            en: 'Share',
            id: 'Share'
        },
        footerMenuAboutUs: {
            en: 'About us',
            id: 'Informasi'
        },

        alarmExactPrayerTimeMessageTemplate: {
            en: `exact|It is time for $1 pray|In $2`,
            id: 'exact|Waktunya sholat $1|Untuk daerah $2'
        },
        alarmAlmostPrayerTimeMessageTemplate: {
            en: `almost|10 minutes until $1 pray|In $2`,
            id: `almost|10 menit lagi adalah waktu sholat $1|Untuk daerah $2`
        },

        promptErrorFailToGetDataTitle: {
            en: 'Error koneksi pengambilan data',
            id: 'Fetch data error'
        },
        promptErrorFailToGetPrayerTimesMessage: {
            en: 'Unable to get prayer times due to error. Please ensure internet connection is available and then refresh the page',
            id: 'Gagal mengambil jadwal sholat. Pastikan terhubung dengan internet lalu refresh halaman'
        },

        promptConfirmationCancel: {
            en: 'Cancel',
            id: 'Batal'
        },
        promptConfirmationSave: {
            en: 'Save',
            id: 'Simpan'
        },

        promptConfirmationMessageToActivateAutoDetectLocation: {
            en: 'Are you sure want to enable auto detect location for getting prayer times?',
            id: 'Anda yakin ingin mengaktifkan deteksi lokasi otomatis untuk pengambilan jadwal shalat?'
        },
        promptConfirmationYesToActivateAutoDetectLocation: {
            en: 'Yes, enable it',
            id: 'Ya, aktifkan'
        },
        promptConfirmationMessageToRefreshAutoDetectLocation: {
            en: 'Auto detect location is enabled. Do you want to refresh the location detection?',
            id: 'Deteksi lokasi otomatis sudah aktif. Apakah anda ingin me-refresh lokasi?'
        },
        promptConfirmationYesToRefreshAutoDetectLocation: {
            en: 'Yes, refresh location detection',
            id: 'Ya, refresh lokasi'
        },

        promptManualLocationSelectionTitle: {
            en: 'Select the province and city you would like to use for getting the prayer times',
            id: 'Silakan pilih nama provinsi dan kabupaten/kota tempat anda sekarang berada'
        },
        promptManualLocationProvinceTitle: {
            en: 'Province',
            id: 'Provinsi'
        },
        promptManualLocationCityTitle: {
            en: 'City',
            id: 'Kota'
        },
        promptManualLocationProvinceSelectionLabel: {
            en: 'Select province',
            id: 'Pilih provinsi'
        },
        promptManualLocationProvinceOptionPlaceholderLabel: {
            en: 'SELECT PROVINCE FIRST',
            id: 'PILIH PROVINSI TERLEBIH DAHULU'
        },
        promptManualLocationCitySelectionLabel: {
            en: 'Select city',
            id: 'Pilih kabupaten/kota'
        },
        promptErrorUnableToSaveDueToEmptyProvince: {
            en: 'Unable to save changes due to no province selected',
            id: 'Tidak bisa menyimpan perubahan karena provinsi kosong'
        },
        promptErrorUnableToSaveDueToEmptyCity: {
            en: 'Unable to save changes due to no city selected',
            id: 'Tidak bisa menyimpan perubahan karena kabupaten/kota kosong'
        },

        modalAboutUsText1: {
            en: '$1 is personal dashboard for muslim, available on all modern browsers. This extension was inspired by Momentum.',
            id: '$1 adalah laman personal dashboard khusus untuk muslim, tersedia untuk semua browser modern. Plugin ini terinspirasi dari Momentum.'
        },
        modalAboutUsText2: {
            en: `Prayer times is fetched as per user's location.`,
            id: 'Informasi jadwal sholat dimunculkan sesuai lokasi pengguna.'
        },
        modalAboutUsText3: {
            en: 'For feedback or contribution, please email to $1 or submit a PR to $2.',
            id: 'Untuk pertanyaan, kritik & saran, maupun jika ingin berkontribusi foto atau quote, silakan kirim email ke $1 atau via submit PR di $2.'
        },

        modalShareHeader: {
            en: 'Share to social media',
            id: 'Share ke sosial media'
        },
        modalShareText: {
            en: 'Share the muslimboard browser extension to socials:',
            id: 'Bagikan ekstensi browser muslimboard ke sosial media:'
        },

        modalChangeLanguageHeader: {
            en: 'Select language',
            id: 'Select language / Pilih bahasa'
        },

        modalInstallMuslimboardNotification: {
            en: '$1 is successfully installed.',
            id: '$1 berhasil di-install.'
        },
        modalUpdateMuslimboardNotification: {
            en: '$1 is successfully updated to version $s.',
            id: '$1 anda telah di update ke versi $2.'
        }
    },

    getSelectedLocale: (defaultLocale = 'en') => {
        const locale = localStorage.getItem(`selected-locale`)
        if (locale) {
            return locale
        }
        return defaultLocale
    },
    setSelectedLocale: (selectedLocale) => {
        localStorage.setItem(`selected-locale`, selectedLocale)
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
        $('[data-i18n]').each((i, e) => {
            const $e = $(e)
            const key = $e.attr('data-i18n')
            $e.text(I18n.getText(key))
        })
    }
}
