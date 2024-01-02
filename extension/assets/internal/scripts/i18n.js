const I18n = {
    mapping: {
        appDescription: {
            ar: 'لوحة التحكم الشخصية للمسلم',
            en: 'Personal Dashboard for Muslim',
            ru: 'Личное расписание для мусульманина',
            id: 'Personal Dashboard untuk umat Islam',
            // 'zh-tw': '',
        },

        daySunday:    { ar: 'الأحد', en: 'Sunday', ru: 'Воскресенье', id: 'Ahad', 'zh-tw': '星期日' },
        dayMonday:    { ar: 'الأثنين', en: 'Monday', ru: 'Понедельник', id: 'Senin', 'zh-tw': '星期一' },
        dayTuesday:   { ar: 'الثلاثاء', en: 'Tuesday', ru: 'Вторник', id: 'Selasa', 'zh-tw': '星期二' },
        dayWednesday: { ar: 'الأربعاء', en: 'Wednesday', ru: 'Среда', id: 'Rabu', 'zh-tw': '星期三' },
        dayThursday:  { ar: 'الخميس', en: 'Thursday', ru: 'Четверг', id: 'Kamis', 'zh-tw': '星期四' },
        dayFriday:    { ar: 'الجمعة', en: 'Friday', ru: 'Пятница', id: 'Jumat', 'zh-tw': '星期五' },
        daySaturday:  { ar: 'السبت', en: 'Saturday', ru: 'Суббота', id: 'Sabtu', 'zh-tw': '星期六' },

        monthJanuary:   { ar:'يناير', en: 'January', ru: 'Январь', id: 'Januari', 'zh-tw': '一月' },
        monthFebruary:  { ar:'فبراير', en: 'February', ru: 'Февраль', id: 'Februari', 'zh-tw': '二月' },
        monthMarch:     { ar:'مارس', en: 'March', ru: 'Март', id: 'Maret', 'zh-tw': '三月' },
        monthApril:     { ar:'أبريل', en: 'April', ru: 'Апрель', id: 'April', 'zh-tw': '四月' },
        monthMay:       { ar:'مايو', en: 'May', ru: 'Май', id: 'Mei', 'zh-tw': '五月' },
        monthJune:      { ar:'يونيو', en: 'June', ru: 'Июнь', id: 'Juni', 'zh-tw': '六月' },
        monthJuly:      { ar:'يوليو', en: 'July', ru: 'Июль', id: 'July', 'zh-tw': '七月' },
        monthAugust:    { ar:'أغسطس', en: 'August', ru: 'Август', id: 'Agustus', 'zh-tw': '八月' },
        monthSeptember: { ar:'سبتمبر', en: 'September', ru: 'Сентябрь', id: 'September', 'zh-tw': '九月' },
        monthOctober:   { ar:'أكتوبر', en: 'October', ru: 'Октябрь', id: 'Oktober', 'zh-tw': '十月' },
        monthNovember:  { ar:'نوفمبر', en: 'November', ru: 'Ноябрь', id: 'November', 'zh-tw': '十一月' },
        monthDecember:  { ar:'ديسمبر', en: 'December', ru: 'Декабрь', id: 'Desember', 'zh-tw': '十二月' },

        monthMuharram: 		{ ar: 'محرم', en: 'Muḥarram', ru: 'Мухаррам', id: 'Muharram', 'zh-tw': '穆哈兰姆月' },
        monthShafar: 		{ ar: 'صفر', en: 'Ṣafar', ru: 'Сафар', id: 'Shafar', 'zh-tw': '色法尔月' },
        monthRabiulAwwal:	{ ar: 'ربيع الأول', en: 'Rabīʿ al-Awwal', ru: 'Раби аль-авваль', id: 'Rabiul Awwal', 'zh-tw': '赖比尔·敖外鲁月' },
        monthRabiulAkhir:	{ ar: 'ربيع الآخر', en: 'Rabīʿ al-Thānī', ru: 'Раби ас-сани', id: 'Rabiul Akhir', 'zh-tw': '赖比尔·阿色尼月' },
        monthJumadilAwwal:	{ ar: 'جمادى الأول', en: 'Jumādā al-Awwal', ru: 'Джумада аль-уля', id: 'Jumadil Awwal', 'zh-tw': '主马达·敖外鲁月' },
        monthJumadilAkhir:	{ ar: 'جمادى الآخر', en: 'Jumādā al-Thānī', ru: 'Джумада ас-сани', id: 'Jumadil Akhir', 'zh-tw': '主马达·阿色尼月' },
        monthRajab:			{ ar: 'رجب', en: 'Rajab', ru: 'Раджаб', id: 'Rajab', 'zh-tw': '赖哲卜月' },
        monthSyaban:		{ ar: 'شعبان', en: 'Shaʿbān', ru: 'Шабан', id: 'Sya`ban', 'zh-tw': '舍爾邦月' },
        monthRamadhan:		{ ar: 'رمضان', en: 'Ramaḍān', ru: 'Рамадан', id: 'Ramadhan', 'zh-tw': '賴買丹月' },
        monthSyawwal:		{ ar: 'شوال', en: 'Shawwāl', ru: 'Шавваль', id: 'Syawwal', 'zh-tw': '閃瓦魯月' },
        monthDzulqodah:		{ ar: 'ذو القعدة', en: 'Dhū al-Qaʿdah', ru: 'Зу-ль-када', id: 'Dzulqo`dah', 'zh-tw': '都尔喀尔德月' },
        monthDzulhijjah:	{ ar: 'ذو الحجة', en: 'Dhū al-Ḥijjah', ru: 'Зу-ль-хиджа', id: 'Dzulhijjah', 'zh-tw': '都爾黑哲月' },

        month1: 	{ ar: 'محرم', en: 'Muḥarram', ru: 'Мухаррам', id: 'Muharram', 'zh-tw': '穆哈兰姆月' },
        month2: 	{ ar: 'صفر', en: 'Ṣafar', ru: 'Сафар', id: 'Shafar', 'zh-tw': '色法尔月' },
        month3:	    { ar: 'ربيع الأول', en: 'Rabīʿ al-Awwal', ru: 'Раби аль-авваль', id: 'Rabiul Awwal', 'zh-tw': '赖比尔·敖外鲁月' },
        month4:	    { ar: 'ربيع الآخر', en: 'Rabīʿ al-Thānī', ru: 'Раби ас-сани', id: 'Rabiul Akhir', 'zh-tw': '赖比尔·阿色尼月' },
        month5:	    { ar: 'جمادى الأول', en: 'Jumādā al-Awwal', ru: 'Джумада аль-уля', id: 'Jumadil Awwal', 'zh-tw': '主马达·敖外鲁月' },
        month6:	    { ar: 'جمادى الآخر', en: 'Jumādā al-Thānī', ru: 'Джумада ас-сани', id: 'Jumadil Akhir', 'zh-tw': '主马达·阿色尼月' },
        month7:		{ ar: 'رجب', en: 'Rajab', ru: 'Раджаб', id: 'Rajab', 'zh-tw': '赖哲卜月' },
        month8:		{ ar: 'شعبان', en: 'Shaʿbān', ru: 'Шабан', id: 'Sya`ban', 'zh-tw': '舍爾邦月' },
        month9:		{ ar: 'رمضان', en: 'Ramaḍān', ru: 'Рамадан', id: 'Ramadhan', 'zh-tw': '賴買丹月' },
        month10:	{ ar: 'شوال', en: 'Shawwāl', ru: 'Шавваль', id: 'Syawwal', 'zh-tw': '閃瓦魯月' },
        month11:	{ ar: 'ذو القعدة', en: 'Dhū al-Qaʿdah', ru: 'Зу-ль-када', id: 'Dzulqo`dah', 'zh-tw': '都尔喀尔德月' },
        month12:	{ ar: 'ذو الحجة', en: 'Dhū al-Ḥijjah', ru: 'Зу-ль-хиджа', id: 'Dzulhijjah', 'zh-tw': '都爾黑哲月' },

        prayerTimeTodaySchedule: {
            ar: 'مواعيد صلوات اليوم:',
            en: 'Today prayer times:',
            ru: 'Время молитв сегодня:',
            id: 'Jadwal sholat untuk hari ini:',
            'zh-tw': '今日祈禱時間：'
        },

        prayerTimeFajr:    { ar:'الفجر', en: 'Fajr', ru: 'Фаджр', id: 'Subuh', 'zh-tw': '晨禮' },
        prayerTimeSunrise: { ar:'الشروق', en: 'Sunrise', ru: 'Рассвет', id: 'Dhuha', 'zh-tw': '日出' },
        prayerTimeDhuhr:   { ar:'الظهر', en: 'Dhuhr', ru: 'Зухр', id: 'Dzuhur', 'zh-tw': '晌禮' },
        prayerTimeAsr:     { ar:'العصر', en: 'Asr', ru: 'Аср', id: 'Ashar', 'zh-tw': '晡禮' },
        prayerTimeMaghrib: { ar:'المغرب', en: 'Maghrib', ru: 'Магриб', id: 'Maghrib', 'zh-tw': '昏禮' },
        prayerTimeIsha:    { ar:'العشاء', en: 'Isha', id: `Isya'`, ru: 'Иша', 'zh-tw': '宵禮' },

        prayerTimeNextRemainingTextHM: {
            ar: 'في ساعات $1 ودقائق $2',
            en: 'in $1 hour(s) and $2 minute(s)',
            ru: 'через $1 час(а) and $2 минут(ы)',
            id: 'sekitar $1 jam $2 menit lagi',
            'zh-tw': '$1 小時 $2 分鐘內'
        },
        prayerTimeNextRemainingTextM: {
            ar: 'في $1 دقيقة',
            en: 'in $1 minute(s)',
            ru: 'через $1 минут(ы)',
            id: 'sekitar $1 menit lagi',
            'zh-tw': '$1 分鐘內'
        },
        prayerTimeNextRemainingTextNow: {
            ar: 'وقت صلاة $1',
            en: 'time for $1 pray',
            ru: 'время для молитвы $1',
            id: 'masuk waktu sholat $1',
            'zh-tw': '$1祈禱的時間'
        },

        todoListHeaderShow: {
            ar: 'إظهار لائحة المهام',
            en: 'Show TODO list panel',
            ru: 'Показать панель списка дел',
            id: 'Tampilkan TODO list',
            'zh-tw': '顯示待辦事項清單'
        },
        todoListHeaderHide: {
            ar: 'إخفاء لائحة المهام',
            en: 'Hide TODO list panel',
            ru: 'Скрыть панель списка дел',
            id: 'Sembunyikan TODO list',
            'zh-tw': '隱藏待辦事項清單'
        },
        todoListEntryPlaceholder: {
            ar: 'أكتب شيئاً',
            en: 'Write something',
            ru: 'Напишите что-нибудь',
            id: 'Tulis sesuatu',
            'zh-tw': '寫點什麼'
        },
        todoListPlaceholder: {
            ar: 'كن شاكراً دوماً وانشر البهجة',
            en: 'Always be grateful and spread kindness',
            ru: 'Будьте всегда благодарными и распространяйте доброту',
            id: 'Senantiasa bersyukur dan berbuat baik',
            'zh-tw': '永遠感恩，並傳播善意'
        },

        footerMenuAutomaticLocationDetection: {
            ar: 'تحديد المكان تلقائياً (حول العالم)',
            en: 'Auto-detect location (Worldwide)',
            ru: 'Автоматически определить местоположение',
            id: 'Deteksi lokasi otomatis',
            'zh-tw': '自動偵測位置'
        },
        footerMenuManualLocationSelection: {
            ar: 'حدد مكان بعينه (إندونيسيا)',
            en: 'Choose specific location (Indonesia only)',
            ru: 'Выберите конкретное местоположение (только в Индонезии)',
            id: 'Atur manual pilihan lokasi (Indonesia)',
            'zh-tw': '手動選擇位置 (印尼)'
        },
        footerMenuInternetAvailability: {
            ar: 'انترنت',
            en: 'Internet:',
            ru: 'Интернет:',
            id: 'Internet:',
            'zh-tw': '網路：'
        },
        footerMenuImageAuthor: {
            ar: 'الصورة من',
            en: 'Image from',
            ru: 'Фотография из',
            id: 'Foto dari',
            'zh-tw': '圖片來自'
        },
        footerMenuChangeLanguage: {
            ar: 'غير اللغة',
            en: 'Change language',
            ru: 'Изменить язык',
            id: 'Ubah bahasa',
            'zh-tw': '改變語言'
        },
        footerMenuSourceCode: {
            ar: 'مصدر الكود',
            en: 'Source code',
            ru: 'Исходный код',
            id: 'Source code',
            'zh-tw': '原始碼'
        },
        footerMenuShare: {
            ar: 'مشاركة',
            en: 'Share',
            ru: 'Поделиться',
            id: 'Share',
            'zh-tw': '分享'
        },
        footerMenuInfo: {
            ar: 'عنا',
            en: 'Info',
            ru: 'Информация',
            id: 'Informasi',
            'zh-tw': '關於我們'
        },

        alarmExactPrayerTimeMessageTemplate: {
            ar: `exact|انه وقت صلاة $1 |في $2`,
            en: `exact|It is time for $1 pray|In $2`,
            ru: `exact|Время для молитвы $1|Через $2`,
            id: 'exact|Waktunya sholat $1|Untuk daerah $2',
            'zh-tw': 'exact|是時候進行 $1 祈禱|在 $2'
        },
        alarmAlmostPrayerTimeMessageTemplate: {
            ar: `almost|10 دقائق على صلاة $1|في $2`,
            en: `almost|10 minutes until $1 pray|In $2`,
            ru: `almost|10 минут до молитвы $1|Через $2`,
            id: `almost|10 menit lagi adalah waktu sholat $1|Untuk daerah $2`,
            'zh-tw': `almost|距離 $1 祈禱還有 10 分鐘|在 $2`
        },

        promptErrorFailToGetDataTitle: {
            ar: 'مشكلة في جلب البيانات',
            en: 'Error fetching data',
            ru: 'Ошибка при получении данных',
            id: 'Error koneksi pengambilan data',
            'zh-tw': '取得資料錯誤'
        },
        promptErrorFailToGetPrayerTimesMessage: {
            ar: 'تعذر الحصول على مواقيت الصلاة بسبب خطأ. يرجى التأكد من توفر اتصال بالإنترنت ثم قم بتحديث الصفحة',
            en: 'Unable to get prayer times due to error. Please ensure an internet connection is available and then refresh the page',
            ru: 'Невозможно получить время молитвы из-за ошибки. Пожалуйста, убедитесь в наличии подключения к сети Интернет и затем обновите страницу',
            id: 'Gagal mengambil jadwal sholat. Pastikan terhubung dengan internet lalu refresh halaman',
            'zh-tw': '無法取得祈禱時間，請確保網路連線正常，然後重新整理頁面'
        },

        promptConfirmationCancel: {
            ar: 'إلغاء',
            en: 'Cancel',
            ru: 'Отменить',
            id: 'Batal',
            'zh-tw': '取消'
        },
        promptConfirmationSave: {
            ar: 'حفظ',
            en: 'Save',
            ru: 'Сохранить',
            id: 'Simpan',
            'zh-tw': '儲存'
        },

        promptConfirmationMessageToActivateAutoDetectLocation: {
            ar: 'هل أنت متأكد من أنك تريد تمكين الكشف التلقائي عن الموقع للحصول على أوقات الصلاة؟',
            en: 'Are you sure want to enable auto-detect location for getting prayer times?',
            ru: 'Вы уверены, что хотите включить автоматическое определение местоположения для получения информации о времени молитв?',
            id: 'Anda yakin ingin mengaktifkan deteksi lokasi otomatis untuk pengambilan jadwal shalat?',
            'zh-tw': '您確定要啟用自動偵測位置以取得祈禱時間嗎？'
        },
        promptConfirmationYesToActivateAutoDetectLocation: {
            ar: 'نعم، فعّلها',
            en: 'Yes, enable it',
            ru: 'Да, включить',
            id: 'Ya, aktifkan',
            'zh-tw': '是的，啟用它'
        },
        promptConfirmationMessageToRefreshAutoDetectLocation: {
            ar: 'تحديد الموقع التلقائي مفعّل، هل تريد تحديث الموقع؟',
            en: 'Auto-detect location is enabled. Do you want to refresh it?',
            ru: 'Включено автоматическое определение местоположения. Вы хотите его обновить?',
            id: 'Deteksi lokasi otomatis sudah aktif. Apakah anda ingin me-refresh lokasi?',
            'zh-tw': '自動偵測位置已啟用。您要重新整理偵測位置嗎？'
        },
        promptConfirmationYesToRefreshAutoDetectLocation: {
            ar: 'نعم، حدّث الموقع',
            en: 'Yes, refresh location',
            ru: 'Да, обновить местоположение',
            id: 'Ya, refresh lokasi',
            'zh-tw': '是的，重新整理偵測位置'
        },

        promptManualLocationSelectionTitle: {
            ar: 'حدد المقاطعة والمدينة التي ترغب في استخدامهما للحصول على أوقات الصلاة',
            en: 'Select the province and city you would like to use for getting prayer times',
            ru: 'Выберите провинцию и город, который вы хотите использовать для получения информации о времени молитв',
            id: 'Silakan pilih nama provinsi dan kabupaten/kota tempat anda sekarang berada',
            'zh-tw': '請選擇您想要使用的省份和城市，以取得祈禱時間'
        },
        promptManualLocationProvinceTitle: {
            ar: 'مقاطعة',
            en: 'Province',
            ru: 'Провинция',
            id: 'Provinsi',
            'zh-tw': '省份'
        },
        promptManualLocationCityTitle: {
            ar: 'مدينة',
            en: 'City',
            ru: 'Город',
            id: 'Kota',
            'zh-tw': '城市'
        },
        promptManualLocationProvinceSelectionLabel: {
            ar: 'اختر مقاطعة',
            en: 'Select province',
            ru: 'Выберите провинцию',
            id: 'Pilih provinsi',
            'zh-tw': '選擇省份'
        },
        promptManualLocationProvinceOptionPlaceholderLabel: {
            ar: 'اختر مقاطعة أولاً',
            en: 'SELECT PROVINCE FIRST',
            ru: 'СНАЧАЛА ВЫБЕРИТЕ ПРОВИНЦИЮ',
            id: 'PILIH PROVINSI TERLEBIH DAHULU',
            'zh-tw': '先選擇省份'
        },
        promptManualLocationCitySelectionLabel: {
            ar: 'اختر مدينة',
            en: 'Select city',
            ru: 'Выберите город',
            id: 'Pilih kabupaten/kota',
            'zh-tw': '選擇城市'
        },
        promptErrorUnableToSaveDueToEmptyProvince: {
            ar: 'تعذر حفظ التغييرات بسبب عدم اختيار مقاطعة',
            en: 'Unable to save changes due to no province selected',
            ru: 'Невозможно сохранить изменения, поскольку не выбрана провинция',
            id: 'Tidak bisa menyimpan perubahan karena provinsi kosong',
            'zh-tw': '無法儲存變更，因為沒有選擇省份'
        },
        promptErrorUnableToSaveDueToEmptyCity: {
            ar: 'تعذر حفظ التغييرات بسبب عدم اختيار مدينة',
            en: 'Unable to save changes due to no city selected',
            ru: 'Невозможно сохранить изменения, поскольку не выбран город',
            id: 'Tidak bisa menyimpan perubahan karena kabupaten/kota kosong',
            'zh-tw': '無法儲存變更，因為沒有選擇城市'
        },

        modalAboutUsText1: {
            ar: '$1 هي لوحة تحكم شخصية للمسلمين ، وهي متوفرة على جميع المتصفحات الحديثة. هذا الامتداد مستوحى من Momentum.',
            en: '$1 is a personal dashboard for Muslims, available on all modern browsers. This browser extension was inspired by Momentum.',
            ru: '$1 это личное расписание для мусульман, которое может использоваться со всеми современными браузерами. Это расширение браузера было вдохновлено Momentum.',
            id: '$1 adalah laman personal dashboard khusus untuk muslim, tersedia untuk semua browser modern. Plugin ini terinspirasi dari Momentum.',
            'zh-tw': '$1 是一個為穆斯林個人設計的儀表板，適用於所有現代瀏覽器。這個擴充功能受到 Momentum 的啟發。'
        },
        modalAboutUsText2: {
            ar: `يتم جلب أوقات الصلاة حسب موقع المستخدم.`,
            en: `Prayer times are fetched as per the user's location.`,
            ru: `Время молитвы рассчитывается на основе местоположения пользователя.`,
            id: 'Informasi jadwal sholat dimunculkan sesuai lokasi pengguna.',
            'zh-tw': '祈禱時間是根據使用者的位置顯示。'
        },
        modalAboutUsText3: {
            ar: 'للتعليق أو المساهمة ، يرجى إرسال بريد إلكتروني إلى $1 أو إرسال PR إلى $2.',
            en: 'For feedback or contribution, please email to $1 or submit a PR to $2.',
            ru: 'Предложения или замечания, пожалуйста, направляйте на электронный адресу $1 или непосредственно на $2.',
            id: 'Untuk pertanyaan, kritik & saran, maupun jika ingin berkontribusi foto atau quote, silakan kirim email ke $1 atau via submit PR di $2.',
            'zh-tw': '如有任何意見或建議，或想要貢獻照片或名言，請發送電子郵件至 $1 或提交 PR 到 $2。'
        },

        modalShareHeader: {
            ar: 'شارك على وسائل التواصل',
            en: 'Share to social media',
            ru: 'Поделиться в социальных сетях',
            id: 'Share ke sosial media',
            'zh-tw': '分享到社交媒體'
        },
        modalShareText: {
            ar: 'شارك ملحق مسلمبورد على وسائل التواصل:',
            en: 'Share Muslim Board browser extension to socials:',
            ru: 'Поделиться расширением для браузера Muslim Board в социальных сетях:',
            id: 'Bagikan ekstensi browser Muslim Board ke sosial media:',
            'zh-tw': '分享 muslimboard 瀏覽器擴充功能到社交媒體：'
        },

        modalChangeLanguageHeader: {
            ar: 'اختر لغة',
            en: 'Select language',
            ru: 'Выбрать язык',
            id: 'Select language / Pilih bahasa',
            'zh-tw': '選擇語言'
        },

        modalInstallMuslimboardNotification: {
            ar: '$1 تم التسطيب بنجاح.',
            en: '$1 is successfully installed.',
            ru: '$1 успешно установлено.',
            id: '$1 berhasil di-install.',
            'zh-tw': '$1 已成功安裝。'
        },
        modalUpdateInstalledMuslimboardNotification: {
            ar: '$1 تم تحديثه إلى نسخة $2.',
            en: '$1 is successfully updated to version $2.',
            ru: '$1 успешно обновлено до версии $2.',
            id: '$1 anda telah di update ke versi $2.',
            'zh-tw': '$1 已成功更新至版本 $2。'
        },
        modalUpdateAvailableMuslimboardNotification: {
            ar: 'يتوفر إصدار جديد، $1. تأكد من تثبيت أحدث إصدار.',
            en: 'A new version is available, $1. Ensure to get the latest version installed.',
            ru: 'Доступна новая версия, $1. Убедитесь, что у вас установлена последняя версия.',
            id: 'Versi terbaru sudah tersedia, $1. Silakan lakukan update.',
            'zh-tw': '有新版本可用，$1。 確保安裝最新版本。'
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
