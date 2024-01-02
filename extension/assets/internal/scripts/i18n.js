const I18n = {
    mapping: {
        appDescription: {
            ar: 'لوحة التحكم الشخصية للمسلم',
            en: 'Personal Dashboard for Muslim',
            id: 'Personal Dashboard untuk umat Islam',
            // 'zh-tw': '',
            'zh-cn': '穆斯林个人仪表板'
        },

        daySunday:    { ar: 'الأحد', en: 'Sunday', id: 'Ahad', 'zh-tw': '星期日', 'zh-cn': '星期日' },
        dayMonday:    { ar: 'الأثنين', en: 'Monday', id: 'Senin', 'zh-tw': '星期一', 'zh-cn': '星期一' },
        dayTuesday:   { ar: 'الثلاثاء', en: 'Tuesday', id: 'Selasa', 'zh-tw': '星期二', 'zh-cn': '星期二' },
        dayWednesday: { ar: 'الأربعاء', en: 'Wednesday', id: 'Rabu', 'zh-tw': '星期三', 'zh-cn': '星期三' },
        dayThursday:  { ar: 'الخميس', en: 'Thursday', id: 'Kamis', 'zh-tw': '星期四', 'zh-cn': '星期四' },
        dayFriday:    { ar: 'الجمعة', en: 'Friday', id: 'Jumat', 'zh-tw': '星期五', 'zh-cn': '星期五' },
        daySaturday:  { ar: 'السبت', en: 'Saturday', id: 'Sabtu', 'zh-tw': '星期六', 'zh-cn': '星期六' },

        monthJanuary:   { ar:'يناير', en: 'January', id: 'Januari', 'zh-tw': '一月', 'zh-cn': '一月' },
        monthFebruary:  { ar:'فبراير', en: 'February', id: 'Februari', 'zh-tw': '二月', 'zh-cn': '二月' },
        monthMarch:     { ar:'مارس', en: 'March', id: 'Maret', 'zh-tw': '三月', 'zh-cn': '三月' },
        monthApril:     { ar:'أبريل', en: 'April', id: 'April', 'zh-tw': '四月', 'zh-cn': '四月' },
        monthMay:       { ar:'مايو', en: 'May', id: 'Mei', 'zh-tw': '五月', 'zh-cn': '五月' },
        monthJune:      { ar:'يونيو', en: 'June', id: 'Juni', 'zh-tw': '六月', 'zh-cn': '六月' },
        monthJuly:      { ar:'يوليو', en: 'July', id: 'July', 'zh-tw': '七月', 'zh-cn': '七月' },
        monthAugust:    { ar:'أغسطس', en: 'August', id: 'Agustus', 'zh-tw': '八月', 'zh-cn': '八月' },
        monthSeptember: { ar:'سبتمبر', en: 'September', id: 'September', 'zh-tw': '九月', 'zh-cn': '九月' },
        monthOctober:   { ar:'أكتوبر', en: 'October', id: 'Oktober', 'zh-tw': '十月', 'zh-cn': '十月' },
        monthNovember:  { ar:'نوفمبر', en: 'November', id: 'November', 'zh-tw': '十一月', 'zh-cn': '十一月' },
        monthDecember:  { ar:'ديسمبر', en: 'December', id: 'Desember', 'zh-tw': '十二月', 'zh-cn': '十二月' },

        monthMuharram: 		{ ar: 'محرم', en: 'Muḥarram', id: 'Muharram', 'zh-tw': '穆哈兰姆月', 'zh-cn': '穆哈兰姆月' },
        monthShafar: 		{ ar: 'صفر', en: 'Ṣafar', id: 'Shafar', 'zh-tw': '色法尔月', 'zh-cn': '色法尔月' },
        monthRabiulAwwal:	{ ar: 'ربيع الأول', en: 'Rabīʿ al-Awwal', id: 'Rabiul Awwal', 'zh-tw': '赖比尔·敖外鲁月', 'zh-cn': '赖比尔·敖外鲁月' },
        monthRabiulAkhir:	{ ar: 'ربيع الآخر', en: 'Rabīʿ al-Thānī', id: 'Rabiul Akhir', 'zh-tw': '赖比尔·阿色尼月', 'zh-cn': '赖比尔·阿色尼月' },
        monthJumadilAwwal:	{ ar: 'جمادى الأول', en: 'Jumādā al-Awwal', id: 'Jumadil Awwal', 'zh-tw': '主马达·敖外鲁月', 'zh-cn': '主马达·敖外鲁月' },
        monthJumadilAkhir:	{ ar: 'جمادى الآخر', en: 'Jumādā al-Thānī', id: 'Jumadil Akhir', 'zh-tw': '主马达·阿色尼月', 'zh-cn': '主马达·阿色尼月' },
        monthRajab:			{ ar: 'رجب', en: 'Rajab', id: 'Rajab', 'zh-tw': '赖哲卜月', 'zh-cn': '赖哲卜月' },
        monthSyaban:		{ ar: 'شعبان', en: 'Shaʿbān', id: 'Sya`ban', 'zh-tw': '舍爾邦月', 'zh-cn': '舍尔邦月' },
        monthRamadhan:		{ ar: 'رمضان', en: 'Ramaḍān', id: 'Ramadhan', 'zh-tw': '賴買丹月', 'zh-cn': '赖买丹月' },
        monthSyawwal:		{ ar: 'شوال', en: 'Shawwāl', id: 'Syawwal', 'zh-tw': '閃瓦魯月', 'zh-cn': '闪瓦鲁月' },
        monthDzulqodah:		{ ar: 'ذو القعدة', en: 'Dhū al-Qaʿdah', id: 'Dzulqo`dah', 'zh-tw': '都尔喀尔德月', 'zh-cn': '都尔喀尔德月' },
        monthDzulhijjah:	{ ar: 'ذو الحجة', en: 'Dhū al-Ḥijjah', id: 'Dzulhijjah', 'zh-tw': '都爾黑哲月', 'zh-cn': '都尔黑哲月' },

        month1: 	{ ar: 'محرم', en: 'Muḥarram', id: 'Muharram', 'zh-tw': '穆哈兰姆月', 'zh-cn': '穆哈兰姆月' },
        month2: 	{ ar: 'صفر', en: 'Ṣafar', id: 'Shafar', 'zh-tw': '色法尔月', 'zh-cn': '色法尔月' },
        month3:	    { ar: 'ربيع الأول', en: 'Rabīʿ al-Awwal', id: 'Rabiul Awwal', 'zh-tw': '赖比尔·敖外鲁月', 'zh-cn': '赖比尔·敖外鲁月' },
        month4:	    { ar: 'ربيع الآخر', en: 'Rabīʿ al-Thānī', id: 'Rabiul Akhir', 'zh-tw': '赖比尔·阿色尼月', 'zh-cn': '赖比尔·阿色尼月' },
        month5:	    { ar: 'جمادى الأول', en: 'Jumādā al-Awwal', id: 'Jumadil Awwal', 'zh-tw': '主马达·敖外鲁月', 'zh-cn': '主马达·敖外鲁月' },
        month6:	    { ar: 'جمادى الآخر', en: 'Jumādā al-Thānī', id: 'Jumadil Akhir', 'zh-tw': '主马达·阿色尼月', 'zh-cn': '主马达·阿色尼月' },
        month7:		{ ar: 'رجب', en: 'Rajab', id: 'Rajab', 'zh-tw': '赖哲卜月', 'zh-cn': '赖哲卜月' },
        month8:		{ ar: 'شعبان', en: 'Shaʿbān', id: 'Sya`ban', 'zh-tw': '舍爾邦月', 'zh-cn': '舍尔邦月' },
        month9:		{ ar: 'رمضان', en: 'Ramaḍān', id: 'Ramadhan', 'zh-tw': '賴買丹月', 'zh-cn': '赖买丹月' },
        month10:	{ ar: 'شوال', en: 'Shawwāl', id: 'Syawwal', 'zh-tw': '閃瓦魯月', 'zh-cn': '闪瓦鲁月' },
        month11:	{ ar: 'ذو القعدة', en: 'Dhū al-Qaʿdah', id: 'Dzulqo`dah', 'zh-tw': '都尔喀尔德月', 'zh-cn': '都尔喀尔德月' },
        month12:    { ar: 'ذو الحجة', en: 'Dhū al-Ḥijjah', id: 'Dzulhijjah', 'zh-tw': '都爾黑哲月', 'zh-cn': '都尔黑哲月' },

        prayerTimeTodaySchedule: {
            ar: 'مواعيد صلوات اليوم:',
            en: 'Today prayer times:',
            id: 'Jadwal sholat untuk hari ini:',
            'zh-tw': '今日祈禱時間：',
            'zh-cn': '今日祈祷时间：'
        },
        
        prayerTimeFajr:    { ar:'الفجر',  en: 'Fajr',    id: 'Subuh',   'zh-tw': '晨禮', 'zh-cn': '黎明' },
        prayerTimeSunrise: { ar:'الشروق', en: 'Sunrise', id: 'Dhuha',   'zh-tw': '日出', 'zh-cn': '日出' },
        prayerTimeDhuhr:   { ar:'الظهر',  en: 'Dhuhr',   id: 'Dzuhur',  'zh-tw': '晌禮', 'zh-cn': '中午' },
        prayerTimeAsr:     { ar:'العصر',  en: 'Asr',     id: 'Ashar',   'zh-tw': '晡禮', 'zh-cn': '下午' },
        prayerTimeMaghrib: { ar:'المغرب', en: 'Maghrib', id: 'Maghrib', 'zh-tw': '昏禮', 'zh-cn': '黄昏' },
        prayerTimeIsha:    { ar:'العشاء', en: 'Isha',    id: `Isya'`,   'zh-tw': '宵禮', 'zh-cn': '晚上' },
        

        prayerTimeNextRemainingTextHM: {
            ar: 'في ساعات $1 ودقائق $2',
            en: 'in $1 hour(s) and $2 minute(s)',
            id: 'sekitar $1 jam $2 menit lagi',
            'zh-tw': '$1 小時 $2 分鐘內',
            'zh-cn': '$1 小时 $2 分钟内'
        },
        prayerTimeNextRemainingTextM: {
            ar: 'في $1 دقيقة',
            en: 'in $1 minute(s)',
            id: 'sekitar $1 menit lagi',
            'zh-tw': '$1 分鐘內',
            'zh-cn': '$1 分钟内'
        },
        prayerTimeNextRemainingTextNow: {
            ar: 'وقت صلاة $1',
            en: 'time for $1 pray',
            id: 'masuk waktu sholat $1',
            'zh-tw': '$1祈禱的時間',
            'zh-cn': '$1祈祷的时间'
        },
        
        todoListHeaderShow: {
            ar: 'إظهار لائحة المهام',
            en: 'Show TODO list panel',
            id: 'Tampilkan TODO list',
            'zh-tw': '顯示待辦事項清單',
            'zh-cn': '显示待办事项清单'
        },
        todoListHeaderHide: {
            ar: 'إخفاء لائحة المهام',
            en: 'Hide TODO list panel',
            id: 'Sembunyikan TODO list',
            'zh-tw': '隱藏待辦事項清單',
            'zh-cn': '隐藏待办事项清单'
        },
        todoListEntryPlaceholder: {
            ar: 'أكتب شيئاً',
            en: 'Write something',
            id: 'Tulis sesuatu',
            'zh-tw': '寫點什麼',
            'zh-cn': '写点什么'
        },
        todoListPlaceholder: {
            ar: 'كن شاكراً دوماً وانشر البهجة',
            en: 'Always be grateful and spread kindness',
            id: 'Senantiasa bersyukur dan berbuat baik',
            'zh-tw': '永遠感恩，並傳播善意',
            'zh-cn': '永远感恩，传播善意'
        },

        footerMenuAutomaticLocationDetection: {
            ar: 'تحديد المكان تلقائياً (حول العالم)',
            en: 'Auto-detect location (Worldwide)',
            id: 'Deteksi lokasi otomatis',
            'zh-tw': '自動偵測位置',
            'zh-cn': '自动检测位置'
        },
        footerMenuManualLocationSelection: {
            ar: 'حدد مكان بعينه (إندونيسيا)',
            en: 'Choose specific location (Indonesia only)',
            id: 'Atur manual pilihan lokasi (Indonesia)',
            'zh-tw': '手動選擇位置',
            'zh-cn': '手动选择位置'
        },
        footerMenuInternetAvailability: {
            ar: 'انترنت',
            en: 'Internet:',
            id: 'Internet:',
            'zh-tw': '網路：',
            'zh-cn': '网络：'
        },
        footerMenuImageAuthor: {
            ar: 'الصورة من',
            en: 'Image from',
            id: 'Foto dari',
            'zh-tw': '圖片來自',
            'zh-cn': '图片来自'
        },
        footerMenuChangeLanguage: {
            ar: 'غير اللغة',
            en: 'Change language',
            id: 'Ubah bahasa',
            'zh-tw': '改變語言',
            'zh-cn': '改变语言'
        },
        footerMenuSourceCode: {
            ar: 'مصدر الكود',
            en: 'Source code',
            id: 'Source code',
            'zh-tw': '原始碼',
            'zh-cn': '源代码'
        },
        footerMenuShare: {
            ar: 'مشاركة',
            en: 'Share',
            id: 'Share',
            'zh-tw': '分享',
            'zh-cn': '分享'
        },
        footerMenuInfo: {
            ar: 'عنا',
            en: 'Info',
            id: 'Informasi',
            'zh-tw': '關於我們',
            'zh-cn': '关于我们'
        },        

        alarmExactPrayerTimeMessageTemplate: {
            ar: `exact|انه وقت صلاة $1 |في $2`,
            en: `exact|It is time for $1 pray|In $2`,
            id: 'exact|Waktunya sholat $1|Untuk daerah $2',
            'zh-tw': 'exact|是時候進行 $1 祈禱|在 $2',
            'zh-cn': 'exact|现在是 $1 祈祷的时间|在 $2'
        },
        alarmAlmostPrayerTimeMessageTemplate: {
            ar: `almost|10 دقائق على صلاة $1|في $2`,
            en: `almost|10 minutes until $1 pray|In $2`,
            id: `almost|10 menit lagi adalah waktu sholat $1|Untuk daerah $2`,
            'zh-tw': `almost|距離 $1 祈禱還有 10 分鐘|在 $2`,
            'zh-cn': `almost|距离 $1 祈祷还有 10 分钟|在 $2`
        },
        
        promptErrorFailToGetDataTitle: {
            ar: 'مشكلة في جلب البيانات',
            en: 'Error fetching data',
            id: 'Error koneksi pengambilan data',
            'zh-tw': '取得資料錯誤',
            'zh-cn': '获取数据错误'
        },
        promptErrorFailToGetPrayerTimesMessage: {
            ar: 'تعذر الحصول على مواقيت الصلاة بسبب خطأ. يرجى التأكد من توفر اتصال بالإنترنت ثم قم بتحديث الصفحة',
            en: 'Unable to get prayer times due to error. Please ensure an internet connection is available and then refresh the page',
            id: 'Gagal mengambil jadwal sholat. Pastikan terhubung dengan internet lalu refresh halaman',
            'zh-tw': '無法取得祈禱時間，請確保網路連線正常，然後重新整理頁面',
            'zh-cn': '由于错误无法获取祈祷时间。 请确保有可用的互联网连接，然后刷新页面'
        },

        promptConfirmationCancel: {
            ar: 'إلغاء',
            en: 'Cancel',
            id: 'Batal',
            'zh-tw': '取消',
            'zh-cn': '取消'
        },
        promptConfirmationSave: {
            ar: 'حفظ',
            en: 'Save',
            id: 'Simpan',
            'zh-tw': '儲存',
            'zh-cn': '保存'
        },
        
        promptConfirmationMessageToActivateAutoDetectLocation: {
            ar: 'هل أنت متأكد من أنك تريد تمكين الكشف التلقائي عن الموقع للحصول على أوقات الصلاة؟',
            en: 'Are you sure want to enable auto-detect location for getting prayer times?',
            id: 'Anda yakin ingin mengaktifkan deteksi lokasi otomatis untuk pengambilan jadwal shalat?',
            'zh-tw': '您確定要啟用自動偵測位置以取得祈禱時間嗎？',
            'zh-cn': '您确定要启用自动检测位置以获取祈祷时间吗？'
        },
        promptConfirmationYesToActivateAutoDetectLocation: {
            ar: 'نعم، فعّلها',
            en: 'Yes, enable it',
            id: 'Ya, aktifkan',
            'zh-tw': '是的，啟用它',
            'zh-cn': '是的，启用它'
        },
        promptConfirmationMessageToRefreshAutoDetectLocation: {
            ar: 'تحديد الموقع التلقائي مفعّل، هل تريد تحديث الموقع؟',
            en: 'Auto-detect location is enabled. Do you want to refresh it?',
            id: 'Deteksi lokasi otomatis sudah aktif. Apakah anda ingin me-refresh lokasi?',
            'zh-tw': '自動偵測位置已啟用。您要重新整理偵測位置嗎？',
            'zh-cn': '自动检测位置已启用。您要刷新它吗？'
        },
        promptConfirmationYesToRefreshAutoDetectLocation: {
            ar: 'نعم، حدّث الموقع',
            en: 'Yes, refresh location',
            id: 'Ya, refresh lokasi',
            'zh-tw': '是的，重新整理偵測位置',
            'zh-cn': '是的，刷新位置'
        },
        
        promptManualLocationSelectionTitle: {
            ar: 'حدد المقاطعة والمدينة التي ترغب في استخدامهما للحصول على أوقات الصلاة',
            en: 'Select the province and city you would like to use for getting prayer times',
            id: 'Silakan pilih nama provinsi dan kabupaten/kota tempat anda sekarang berada',
            'zh-tw': '請選擇您想要使用的省份和城市，以取得祈禱時間',
            'zh-cn': '请选择您想要用于获取祈祷时间的省份和城市'
        },
        promptManualLocationProvinceTitle: {
            ar: 'مقاطعة',
            en: 'Province',
            id: 'Provinsi',
            'zh-tw': '省份',
            'zh-cn': '省份'
        },
        promptManualLocationCityTitle: {
            ar: 'مدينة',
            en: 'City',
            id: 'Kota',
            'zh-tw': '城市',
            'zh-cn': '城市'
        },
        promptManualLocationProvinceSelectionLabel: {
            ar: 'اختر مقاطعة',
            en: 'Select province',
            id: 'Pilih provinsi',
            'zh-tw': '選擇省份',
            'zh-cn': '选择省份'
        },
        promptManualLocationProvinceOptionPlaceholderLabel: {
            ar: 'اختر مقاطعة أولاً',
            en: 'SELECT PROVINCE FIRST',
            id: 'PILIH PROVINSI TERLEBIH DAHULU',
            'zh-tw': '先選擇省份',
            'zh-cn': '先选择省份'
        },
        promptManualLocationCitySelectionLabel: {
            ar: 'اختر مدينة',
            en: 'Select city',
            id: 'Pilih kabupaten/kota',
            'zh-tw': '選擇城市',
            'zh-cn': '选择城市'
        },
        promptErrorUnableToSaveDueToEmptyProvince: {
            ar: 'تعذر حفظ التغييرات بسبب عدم اختيار مقاطعة',
            en: 'Unable to save changes due to no province selected',
            id: 'Tidak bisa menyimpan perubahan karena provinsi kosong',
            'zh-tw': '無法儲存變更，因為沒有選擇省份',
            'zh-cn': '由于未选择省份，无法保存更改'
        },
        promptErrorUnableToSaveDueToEmptyCity: {
            ar: 'تعذر حفظ التغييرات بسبب عدم اختيار مدينة',
            en: 'Unable to save changes due to no city selected',
            id: 'Tidak bisa menyimpan perubahan karena kabupaten/kota kosong',
            'zh-tw': '無法儲存變更，因為沒有選擇城市',
            'zh-cn': '由于未选择城市，无法保存更改'
        },
        
        modalAboutUsText1: {
            ar: '$1 هي لوحة تحكم شخصية للمسلمين ، وهي متوفرة على جميع المتصفحات الحديثة. هذا الامتداد مستوحى من Momentum.',
            en: '$1 is a personal dashboard for Muslims, available on all modern browsers. This browser extension was inspired by Momentum.',
            id: '$1 adalah laman personal dashboard khusus untuk muslim, tersedia untuk semua browser modern. Plugin ini terinspirasi dari Momentum.',
            'zh-tw': '$1 是一個為穆斯林個人設計的儀表板，適用於所有現代瀏覽器。這個擴充功能受到 Momentum 的啟發。',
            'zh-cn': '$1 是为穆斯林设计的个人仪表板，适用于所有现代浏览器。这个浏览器扩展受到 Momentum 的启发。'
        },
        modalAboutUsText2: {
            ar: `يتم جلب أوقات الصلاة حسب موقع المستخدم.`,
            en: `Prayer times are fetched as per the user's location.`,
            id: 'Informasi jadwal sholat dimunculkan sesuai lokasi pengguna.',
            'zh-tw': '祈禱時間是根據使用者的位置顯示。',
            'zh-cn': '祈祷时间根据用户的位置获取。'
        },
        modalAboutUsText3: {
            ar: 'للتعليق أو المساهمة ، يرجى إرسال بريد إلكتروني إلى $1 أو إرسال PR إلى $2.',
            en: 'For feedback or contribution, please email to $1 or submit a PR to $2.',
            id: 'Untuk pertanyaan, kritik & saran, maupun jika ingin berkontribusi foto atau quote, silakan kirim email ke $1 atau via submit PR di $2.',
            'zh-tw': '如有任何意見或建議，或想要貢獻照片或名言，請發送電子郵件至 $1 或提交 PR 到 $2。',
            'zh-cn': '如有任何意见或建议，或想要贡献照片或名言，请发送电子邮件至 $1 或提交 PR 到 $2。'
        },
        
        modalShareHeader: {
            ar: 'شارك على وسائل التواصل',
            en: 'Share to social media',
            id: 'Share ke sosial media',
            'zh-tw': '分享到社交媒體',
            'zh-cn': '分享到社交媒体'
        },
        modalShareText: {
            ar: 'شارك ملحق مسلمبورد على وسائل التواصل:',
            en: 'Share Muslim Board browser extension to socials:',
            id: 'Bagikan ekstensi browser Muslim Board ke sosial media:',
            'zh-tw': '分享 muslimboard 瀏覽器擴充功能到社交媒體：',
            'zh-cn': '分享 Muslim Board 浏览器扩展到社交媒体：'
        },
        
        modalChangeLanguageHeader: {
            ar: 'اختر لغة',
            en: 'Select language',
            id: 'Select language / Pilih bahasa',
            'zh-tw': '選擇語言',
            'zh-cn': '选择语言'
        },
        
        modalInstallMuslimboardNotification: {
            ar: '$1 تم التسطيب بنجاح.',
            en: '$1 is successfully installed.',
            id: '$1 berhasil di-install.',
            'zh-tw': '$1 已成功安裝。',
            'zh-cn': '$1 已成功安裝。'
        },
        modalUpdateInstalledMuslimboardNotification: {
            ar: '$1 تم تحديثه إلى نسخة $2.',
            en: '$1 is successfully updated to version $2.',
            id: '$1 anda telah di update ke versi $2.',
            'zh-tw': '$1 已成功更新至版本 $2。',
            'zh-cn': '$1 已成功更新到版本 $2。'
        },
        modalUpdateAvailableMuslimboardNotification: {
            // ar: '',
            en: 'A new version is available, $1. Ensure to get the latest version installed.',
            id: 'Versi terbaru sudah tersedia, $1. Silakan lakukan update.',
            // 'zh-tw': ''
            'zh-cn': '新版本可用，$1。请确保安装最新版本。'
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
