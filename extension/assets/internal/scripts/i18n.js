const I18n = {
    mapping: {
        appDescription: {
            en: 'Personal Dashboard for Muslim',
            id: 'Personal Dashboard untuk umat Islam'
        },

        daySunday: { en: 'Sunday', id: 'Ahad', 'zh-tw': '星期日'},
        dayMonday: { en: 'Monday', id: 'Senin', 'zh-tw': '星期一'},
        dayTuesday: { en: 'Tuesday', id: 'Selasa', 'zh-tw': '星期二'},
        dayWednesday: { en: 'Wednesday', id: 'Rabu', 'zh-tw': '星期三'},
        dayThursday: { en: 'Thursday', id: 'Kamis', 'zh-tw': '星期四'},
        dayFriday: { en: 'Friday', id: 'Jumat', 'zh-tw': '星期五'},
        daySaturday: { en: 'Saturday', id: 'Sabtu', 'zh-tw': '星期六'},

        monthJanuary: { en: 'January', id: 'Januari', 'zh-tw': '一月'},
        monthFebruary: { en: 'February', id: 'Februari', 'zh-tw': '二月'},
        monthMarch: { en: 'March', id: 'Maret', 'zh-tw': '三月'},
        monthApril: { en: 'April', id: 'April', 'zh-tw': '四月'},
        monthMay: { en: 'May', id: 'Mei', 'zh-tw': '五月'},
        monthJune: { en: 'June', id: 'Juni', 'zh-tw': '六月'},
        monthJuly: { en: 'July', id: 'July', 'zh-tw': '七月'},
        monthAugust: { en: 'August', id: 'Agustus', 'zh-tw': '八月'},
        monthSeptember: { en: 'September', id: 'September', 'zh-tw': '九月'},
        monthOctober: { en: 'October', id: 'Oktober', 'zh-tw': '十月'},
        monthNovember: { en: 'November', id: 'November', 'zh-tw': '十一月'},
        monthDecember: { en: 'December', id: 'Desember', 'zh-tw': '十二月'},

        prayerTimeTodaySchedule: {
            en: 'Today prayer times:',
            id: 'Jadwal sholat untuk hari ini:',
            'zh-tw': '今日祈禱時間：'
        },

        prayerTimeFajr: { en: 'Fajr', id: 'Subuh', 'zh-tw': '晨禮'},
        prayerTimeSunrise: { en: 'Sunrise', id: 'Dhuha', 'zh-tw': '日出'},
        prayerTimeDhuhr: { en: 'Dhuhr', id: 'Dzuhur', 'zh-tw': '晌禮'},
        prayerTimeAsr: { en: 'Asr', id: 'Ashar', 'zh-tw': '晡禮'},
        prayerTimeMaghrib: { en: 'Maghrib', id: 'Maghrib', 'zh-tw': '昏禮'},
        prayerTimeIsha: { en: 'Isha', id: `Isya'`, 'zh-tw': '宵禮'},

        todoListHeaderShow: {
            en: 'Show TODO list panel',
            id: 'Tampilkan TODO list',
            'zh-tw': '顯示待辦事項清單'
        },
        todoListHeaderHide: {
            en: 'Hide TODO list panel',
            id: 'Sembunyikan TODO list',
            'zh-tw': '隱藏待辦事項清單'
        },
        todoListEntryPlaceholder: {
            en: 'Write something',
            id: 'Tulis sesuatu',
            'zh-tw': '寫點什麼'
        },
        todoListPlaceholder: {
            en: 'Always be grateful and spread kindness',
            id: 'Senantiasa bersyukur dan berbuat baik',
            'zh-tw': '永遠感恩，並傳播善意'
        },

        footerMenuAutomaticLocationDetection: {
            en: 'Auto detect location (Worldwide)',
            id: 'Deteksi lokasi otomatis',
            'zh-tw': '自動偵測位置'
        },
        footerMenuManualLocationSelection: {
            en: 'Choose specific location (Indonesia)',
            id: 'Atur manual pilihan lokasi (Indonesia)',
            'zh-tw': '手動選擇位置 (印尼)'
        },
        footerMenuInternetAvailability: {
            en: 'Internet:',
            id: 'Internet:',
            'zh-tw': '網路：'
        },
        footerMenuImageAuthor: {
            en: 'Image from',
            id: 'Foto dari',
            'zh-tw': '圖片來自'
        },
        footerMenuChangeLanguage: {
            en: 'Change language',
            id: 'Ubah bahasa',
            'zh-tw': '改變語言'
        },
        footerMenuSourceCode: {
            en: 'Source code',
            id: 'Source code',
            'zh-tw': '原始碼'
        },
        footerMenuShare: {
            en: 'Share',
            id: 'Share',
            'zh-tw': '分享'
        },
        footerMenuAboutUs: {
            en: 'About us',
            id: 'Informasi',
            'zh-tw': '關於我們'
        },

        alarmExactPrayerTimeMessageTemplate: {
            en: `exact|It is time for $1 pray|In $2`,
            id: 'exact|Waktunya sholat $1|Untuk daerah $2',
            'zh-tw': 'exact|是時候進行 $1 祈禱|在 $2'
        },
        alarmAlmostPrayerTimeMessageTemplate: {
            en: `almost|10 minutes until $1 pray|In $2`,
            id: `almost|10 menit lagi adalah waktu sholat $1|Untuk daerah $2`,
            'zh-tw': `almost|距離 $1 祈禱還有 10 分鐘|在 $2`
        },

        promptErrorFailToGetDataTitle: {
            en: 'Error koneksi pengambilan data',
            id: 'Fetch data error',
            'zh-tw': '取得資料錯誤'
        },
        promptErrorFailToGetPrayerTimesMessage: {
            en: 'Unable to get prayer times due to error. Please ensure internet connection is available and then refresh the page',
            id: 'Gagal mengambil jadwal sholat. Pastikan terhubung dengan internet lalu refresh halaman',
            'zh-tw': '無法取得祈禱時間，請確保網路連線正常，然後重新整理頁面'
        },

        promptConfirmationCancel: {
            en: 'Cancel',
            id: 'Batal',
            'zh-tw': '取消'
        },
        promptConfirmationSave: {
            en: 'Save',
            id: 'Simpan',
            'zh-tw': '儲存'
        },

        promptConfirmationMessageToActivateAutoDetectLocation: {
            en: 'Are you sure want to enable auto detect location for getting prayer times?',
            id: 'Anda yakin ingin mengaktifkan deteksi lokasi otomatis untuk pengambilan jadwal shalat?',
            'zh-tw': '您確定要啟用自動偵測位置以取得祈禱時間嗎？'
        },
        promptConfirmationYesToActivateAutoDetectLocation: {
            en: 'Yes, enable it',
            id: 'Ya, aktifkan',
            'zh-tw': '是的，啟用它'
        },
        promptConfirmationMessageToRefreshAutoDetectLocation: {
            en: 'Auto detect location is enabled. Do you want to refresh the location detection?',
            id: 'Deteksi lokasi otomatis sudah aktif. Apakah anda ingin me-refresh lokasi?',
            'zh-tw': '自動偵測位置已啟用。您要重新整理偵測位置嗎？'
        },
        promptConfirmationYesToRefreshAutoDetectLocation: {
            en: 'Yes, refresh location detection',
            id: 'Ya, refresh lokasi',
            'zh-tw': '是的，重新整理偵測位置'
        },

        promptManualLocationSelectionTitle: {
            en: 'Select the province and city you would like to use for getting the prayer times',
            id: 'Silakan pilih nama provinsi dan kabupaten/kota tempat anda sekarang berada',
            'zh-tw': '請選擇您想要使用的省份和城市，以取得祈禱時間'
        },
        promptManualLocationProvinceTitle: {
            en: 'Province',
            id: 'Provinsi',
            'zh-tw': '省份'
        },
        promptManualLocationCityTitle: {
            en: 'City',
            id: 'Kota',
            'zh-tw': '城市'
        },
        promptManualLocationProvinceSelectionLabel: {
            en: 'Select province',
            id: 'Pilih provinsi',
            'zh-tw': '選擇省份'
        },
        promptManualLocationProvinceOptionPlaceholderLabel: {
            en: 'SELECT PROVINCE FIRST',
            id: 'PILIH PROVINSI TERLEBIH DAHULU',
            'zh-tw': '先選擇省份'
        },
        promptManualLocationCitySelectionLabel: {
            en: 'Select city',
            id: 'Pilih kabupaten/kota',
            'zh-tw': '選擇城市'
        },
        promptErrorUnableToSaveDueToEmptyProvince: {
            en: 'Unable to save changes due to no province selected',
            id: 'Tidak bisa menyimpan perubahan karena provinsi kosong',
            'zh-tw': '無法儲存變更，因為沒有選擇省份'
        },
        promptErrorUnableToSaveDueToEmptyCity: {
            en: 'Unable to save changes due to no city selected',
            id: 'Tidak bisa menyimpan perubahan karena kabupaten/kota kosong',
            'zh-tw': '無法儲存變更，因為沒有選擇城市'
        },

        modalAboutUsText1: {
            en: '$1 is personal dashboard for muslim, available on all modern browsers. This extension was inspired by Momentum.',
            id: '$1 adalah laman personal dashboard khusus untuk muslim, tersedia untuk semua browser modern. Plugin ini terinspirasi dari Momentum.',
            'zh-tw': '$1 是一個為穆斯林個人設計的儀表板，適用於所有現代瀏覽器。這個擴充功能受到 Momentum 的啟發。'
        },
        modalAboutUsText2: {
            en: `Prayer times is fetched as per user's location.`,
            id: 'Informasi jadwal sholat dimunculkan sesuai lokasi pengguna.',
            'zh-tw': '祈禱時間是根據使用者的位置顯示。'
        },
        modalAboutUsText3: {
            en: 'For feedback or contribution, please email to $1 or submit a PR to $2.',
            id: 'Untuk pertanyaan, kritik & saran, maupun jika ingin berkontribusi foto atau quote, silakan kirim email ke $1 atau via submit PR di $2.',
            'zh-tw': '如有任何意見或建議，或想要貢獻照片或名言，請發送電子郵件至 $1 或提交 PR 到 $2。'
        },

        modalShareHeader: {
            en: 'Share to social media',
            id: 'Share ke sosial media',
            'zh-tw': '分享到社交媒體'
        },
        modalShareText: {
            en: 'Share the muslimboard browser extension to socials:',
            id: 'Bagikan ekstensi browser muslimboard ke sosial media:',
            'zh-tw': '分享 muslimboard 瀏覽器擴充功能到社交媒體：'
        },

        modalChangeLanguageHeader: {
            en: 'Select language',
            id: 'Select language / Pilih bahasa',
            'zh-tw': '選擇語言'
        },

        modalInstallMuslimboardNotification: {
            en: '$1 is successfully installed.',
            id: '$1 berhasil di-install.',
            'zh-tw': '$1 已成功安裝。'
        },
        modalUpdateMuslimboardNotification: {
            en: '$1 is successfully updated to version $2.',
            id: '$1 anda telah di update ke versi $2.',
            'zh-tw': '$1 已成功更新至版本 $2。'
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
