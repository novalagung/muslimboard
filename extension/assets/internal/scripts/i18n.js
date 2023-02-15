const I18n = {
    mapping: {
        appDescription: {
            en: 'Personal Dashboard for Muslim',
            id: 'Personal Dashboard untuk umat Islam',
            ar: 'لوحة التحكم الشخصية للمسلم'
        },

        daySunday: { ar: 'الأحد', en: 'Sunday', id: 'Ahad', 'zh-tw': '星期日'},
        dayMonday: { ar: 'الأثنين', en: 'Monday', id: 'Senin', 'zh-tw': '星期一'},
        dayTuesday: { ar: 'الثلاثاء', en: 'Tuesday', id: 'Selasa', 'zh-tw': '星期二'},
        dayWednesday: { ar: 'الأربعاء', en: 'Wednesday', id: 'Rabu', 'zh-tw': '星期三'},
        dayThursday: { ar: 'الخميس', en: 'Thursday', id: 'Kamis', 'zh-tw': '星期四'},
        dayFriday: { ar: 'الجمعة', en: 'Friday', id: 'Jumat', 'zh-tw': '星期五'},
        daySaturday: { ar: 'السبت', en: 'Saturday', id: 'Sabtu', 'zh-tw': '星期六'},

        monthJanuary: { ar:'يناير', en: 'January', id: 'Januari', 'zh-tw': '一月'},
        monthFebruary: { ar:'فبراير', en: 'February', id: 'Februari', 'zh-tw': '二月'},
        monthMarch: { ar:'مارس', en: 'March', id: 'Maret', 'zh-tw': '三月'},
        monthApril: { ar:'أبريل', en: 'April', id: 'April', 'zh-tw': '四月'},
        monthMay: { ar:'مايو', en: 'May', id: 'Mei', 'zh-tw': '五月'},
        monthJune: { ar:'يونيو', en: 'June', id: 'Juni', 'zh-tw': '六月'},
        monthJuly: { ar:'يوليو', en: 'July', id: 'July', 'zh-tw': '七月'},
        monthAugust: { ar:'أغسطس', en: 'August', id: 'Agustus', 'zh-tw': '八月'},
        monthSeptember: { ar:'سبتمبر', en: 'September', id: 'September', 'zh-tw': '九月'},
        monthOctober: { ar:'أكتوبر', en: 'October', id: 'Oktober', 'zh-tw': '十月'},
        monthNovember: { ar:'نوفمبر', en: 'November', id: 'November', 'zh-tw': '十一月'},
        monthDecember: { ar:'ديسمبر', en: 'December', id: 'Desember', 'zh-tw': '十二月'},

        prayerTimeTodaySchedule: {
            en: 'Today prayer times:',
            ar: 'مواعيد صلوات اليوم:',
            id: 'Jadwal sholat untuk hari ini:',
            'zh-tw': '今日祈禱時間：'
        },

        prayerTimeFajr: {ar:'الفجر', en: 'Fajr', id: 'Subuh', 'zh-tw': '晨禮'},
        prayerTimeSunrise: {ar:'الشروق', en: 'Sunrise', id: 'Dhuha', 'zh-tw': '日出'},
        prayerTimeDhuhr: {ar:'الظهر', en: 'Dhuhr', id: 'Dzuhur', 'zh-tw': '晌禮'},
        prayerTimeAsr: {ar:'العصر', en: 'Asr', id: 'Ashar', 'zh-tw': '晡禮'},
        prayerTimeMaghrib: {ar:'المغرب', en: 'Maghrib', id: 'Maghrib', 'zh-tw': '昏禮'},
        prayerTimeIsha: {ar:'العشاء', en: 'Isha', id: `Isya'`, 'zh-tw': '宵禮'},

        todoListHeaderShow: {
            ar: 'إظهار لائحة المهام',
            en: 'Show TODO list panel',
            id: 'Tampilkan TODO list',
            'zh-tw': '顯示待辦事項清單'
        },
        todoListHeaderHide: {
            ar: 'إخفاء لائحة المهام',
            en: 'Hide TODO list panel',
            id: 'Sembunyikan TODO list',
            'zh-tw': '隱藏待辦事項清單'
        },
        todoListEntryPlaceholder: {
            ar: 'أكتب شيئاً',
            en: 'Write something',
            id: 'Tulis sesuatu',
            'zh-tw': '寫點什麼'
        },
        todoListPlaceholder: {
            ar: 'كن شاكراً دوماً وانشر البهجة',
            en: 'Always be grateful and spread kindness',
            id: 'Senantiasa bersyukur dan berbuat baik',
            'zh-tw': '永遠感恩，並傳播善意'
        },

        footerMenuAutomaticLocationDetection: {
            ar: 'تحديد المكان تلقائياً (حول العالم)',
            en: 'Auto detect location (Worldwide)',
            id: 'Deteksi lokasi otomatis',
            'zh-tw': '自動偵測位置'
        },
        footerMenuManualLocationSelection: {
            ar: 'حدد مكان بعينه (اندونيسيا)',
            en: 'Choose specific location (Indonesia)',
            id: 'Atur manual pilihan lokasi (Indonesia)',
            'zh-tw': '手動選擇位置 (印尼)'
        },
        footerMenuInternetAvailability: {
            ar: 'انترنت',
            en: 'Internet:',
            id: 'Internet:',
            'zh-tw': '網路：'
        },
        footerMenuImageAuthor: {
            ar: 'الصورة من',
            en: 'Image from',
            id: 'Foto dari',
            'zh-tw': '圖片來自'
        },
        footerMenuChangeLanguage: {
            ar: 'غير اللغة',
            en: 'Change language',
            id: 'Ubah bahasa',
            'zh-tw': '改變語言'
        },
        footerMenuSourceCode: {
            ar: 'مصدر الكود',
            en: 'Source code',
            id: 'Source code',
            'zh-tw': '原始碼'
        },
        footerMenuShare: {
            ar: 'مشاركة',
            en: 'Share',
            id: 'Share',
            'zh-tw': '分享'
        },
        footerMenuAboutUs: {
            ar: 'عنا',
            en: 'About us',
            id: 'Informasi',
            'zh-tw': '關於我們'
        },

        alarmExactPrayerTimeMessageTemplate: {
            ar: `exact|انه وقت صلاة $1 |في $2`,
            en: `exact|It is time for $1 pray|In $2`,
            id: 'exact|Waktunya sholat $1|Untuk daerah $2',
            'zh-tw': 'exact|是時候進行 $1 祈禱|在 $2'
        },
        alarmAlmostPrayerTimeMessageTemplate: {
            ar: `almost|10 دقائق على صلاة $1|في $2`,
            en: `almost|10 minutes until $1 pray|In $2`,
            id: `almost|10 menit lagi adalah waktu sholat $1|Untuk daerah $2`,
            'zh-tw': `almost|距離 $1 祈禱還有 10 分鐘|在 $2`
        },

        promptErrorFailToGetDataTitle: {
            ar: 'مشكلة في جلب البيانات',
            en: 'Error koneksi pengambilan data',
            id: 'Fetch data error',
            'zh-tw': '取得資料錯誤'
        },
        promptErrorFailToGetPrayerTimesMessage: {
            ar: 'تعذر الحصول على مواقيت الصلاة بسبب خطأ. يرجى التأكد من توفر اتصال بالإنترنت ثم قم بتحديث الصفحة',
            en: 'Unable to get prayer times due to error. Please ensure internet connection is available and then refresh the page',
            id: 'Gagal mengambil jadwal sholat. Pastikan terhubung dengan internet lalu refresh halaman',
            'zh-tw': '無法取得祈禱時間，請確保網路連線正常，然後重新整理頁面'
        },

        promptConfirmationCancel: {
            ar: 'إلغاء',
            en: 'Cancel',
            id: 'Batal',
            'zh-tw': '取消'
        },
        promptConfirmationSave: {
            ar: 'حفظ',
            en: 'Save',
            id: 'Simpan',
            'zh-tw': '儲存'
        },

        promptConfirmationMessageToActivateAutoDetectLocation: {
            ar: 'هل أنت متأكد من أنك تريد تمكين الكشف التلقائي عن الموقع للحصول على أوقات الصلاة؟',
            en: 'Are you sure want to enable auto detect location for getting prayer times?',
            id: 'Anda yakin ingin mengaktifkan deteksi lokasi otomatis untuk pengambilan jadwal shalat?',
            'zh-tw': '您確定要啟用自動偵測位置以取得祈禱時間嗎？'
        },
        promptConfirmationYesToActivateAutoDetectLocation: {
            ar: 'نعم، فعّلها',
            en: 'Yes, enable it',
            id: 'Ya, aktifkan',
            'zh-tw': '是的，啟用它'
        },
        promptConfirmationMessageToRefreshAutoDetectLocation: {
            ar: 'تحديد الموقع التلقائي مفعّل، هل تريد تحديث الموقع؟',
            en: 'Auto detect location is enabled. Do you want to refresh the location detection?',
            id: 'Deteksi lokasi otomatis sudah aktif. Apakah anda ingin me-refresh lokasi?',
            'zh-tw': '自動偵測位置已啟用。您要重新整理偵測位置嗎？'
        },
        promptConfirmationYesToRefreshAutoDetectLocation: {
            ar: 'نعم، حدّث الموقع',
            en: 'Yes, refresh location detection',
            id: 'Ya, refresh lokasi',
            'zh-tw': '是的，重新整理偵測位置'
        },

        promptManualLocationSelectionTitle: {
            ar: 'حدد المقاطعة والمدينة التي ترغب في استخدامهما للحصول على أوقات الصلاة',
            en: 'Select the province and city you would like to use for getting the prayer times',
            id: 'Silakan pilih nama provinsi dan kabupaten/kota tempat anda sekarang berada',
            'zh-tw': '請選擇您想要使用的省份和城市，以取得祈禱時間'
        },
        promptManualLocationProvinceTitle: {
            ar: 'مقاطعة',
            en: 'Province',
            id: 'Provinsi',
            'zh-tw': '省份'
        },
        promptManualLocationCityTitle: {
            ar: 'مدينة',
            en: 'City',
            id: 'Kota',
            'zh-tw': '城市'
        },
        promptManualLocationProvinceSelectionLabel: {
            ar: 'اختر مقاطعة',
            en: 'Select province',
            id: 'Pilih provinsi',
            'zh-tw': '選擇省份'
        },
        promptManualLocationProvinceOptionPlaceholderLabel: {
            ar: 'اختر مقاطعة أولاً',
            en: 'SELECT PROVINCE FIRST',
            id: 'PILIH PROVINSI TERLEBIH DAHULU',
            'zh-tw': '先選擇省份'
        },
        promptManualLocationCitySelectionLabel: {
            ar: 'اختر مدينة',
            en: 'Select city',
            id: 'Pilih kabupaten/kota',
            'zh-tw': '選擇城市'
        },
        promptErrorUnableToSaveDueToEmptyProvince: {
            ar: 'تعذر حفظ التغييرات بسبب عدم اختيار مقاطعة',
            en: 'Unable to save changes due to no province selected',
            id: 'Tidak bisa menyimpan perubahan karena provinsi kosong',
            'zh-tw': '無法儲存變更，因為沒有選擇省份'
        },
        promptErrorUnableToSaveDueToEmptyCity: {
            ar: 'تعذر حفظ التغييرات بسبب عدم اختيار مدينة',
            en: 'Unable to save changes due to no city selected',
            id: 'Tidak bisa menyimpan perubahan karena kabupaten/kota kosong',
            'zh-tw': '無法儲存變更，因為沒有選擇城市'
        },

        modalAboutUsText1: {
            ar: '$ 1 هي لوحة تحكم شخصية للمسلمين ، وهي متوفرة على جميع المتصفحات الحديثة. هذا الامتداد مستوحى من Momentum.',
            en: '$1 is personal dashboard for muslim, available on all modern browsers. This extension was inspired by Momentum.',
            id: '$1 adalah laman personal dashboard khusus untuk muslim, tersedia untuk semua browser modern. Plugin ini terinspirasi dari Momentum.',
            'zh-tw': '$1 是一個為穆斯林個人設計的儀表板，適用於所有現代瀏覽器。這個擴充功能受到 Momentum 的啟發。'
        },
        modalAboutUsText2: {
            ar: `يتم جلب أوقات الصلاة حسب موقع المستخدم.`,
            en: `Prayer times is fetched as per user's location.`,
            id: 'Informasi jadwal sholat dimunculkan sesuai lokasi pengguna.',
            'zh-tw': '祈禱時間是根據使用者的位置顯示。'
        },
        modalAboutUsText3: {
            ar: 'للتعليق أو المساهمة ، يرجى إرسال بريد إلكتروني إلى $ 1 أو إرسال PR إلى $2.',
            en: 'For feedback or contribution, please email to $1 or submit a PR to $2.',
            id: 'Untuk pertanyaan, kritik & saran, maupun jika ingin berkontribusi foto atau quote, silakan kirim email ke $1 atau via submit PR di $2.',
            'zh-tw': '如有任何意見或建議，或想要貢獻照片或名言，請發送電子郵件至 $1 或提交 PR 到 $2。'
        },

        modalShareHeader: {
            ar: 'شارك على وسائل التواصل',
            en: 'Share to social media',
            id: 'Share ke sosial media',
            'zh-tw': '分享到社交媒體'
        },
        modalShareText: {
            ar: 'شارك ملحق مسلمبورد على وسائل التواصل:',
            en: 'Share the muslimboard browser extension to socials:',
            id: 'Bagikan ekstensi browser muslimboard ke sosial media:',
            'zh-tw': '分享 muslimboard 瀏覽器擴充功能到社交媒體：'
        },

        modalChangeLanguageHeader: {
            ar: 'اختر لغة',
            en: 'Select language',
            id: 'Select language / Pilih bahasa',
            'zh-tw': '選擇語言'
        },

        modalInstallMuslimboardNotification: {
            ar: '$1 تم التسطيب بنجاح.',
            en: '$1 is successfully installed.',
            id: '$1 berhasil di-install.',
            'zh-tw': '$1 已成功安裝。'
        },
        modalUpdateMuslimboardNotification: {
            ar: '$1 تم تحديثه إلى نسخة $2.',
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
        console.log('hi =================.', selectedLocale);
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
