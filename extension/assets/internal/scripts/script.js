(() => {
    const Utility = {
        chromeStorage: {
            set: (key, value) => new Promise((resolve) => {
                let item = {}
                item[key] = value
                chrome.storage.sync.set(item);
                resolve()
            }),
            get: (key) => new Promise((resolve) => {
                chrome.storage.sync.get([key], (result) => resolve(result[key]));
            }),
            remove: (key) => new Promise((resolve) => {
                chrome.storage.sync.remove([key], () => resolve());
            }),
        },
        selectElementContents: (el) => {
            let range = document.createRange();
            range.selectNodeContents(el);
            let sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        },
        getSelectedText: () => {
            let text = '';
            if (typeof window.getSelection != 'undefined') {
                text = window.getSelection().toString();
            } else if (typeof document.selection != 'undefined' && document.selection.type == 'Text') {
                text = document.selection.createRange().text;
            }
            return text;
        },
        debounce: function (func, wait, immediate) {
            let timeout;
            return function() {
                const context = this, args = arguments;
                const later = () => {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };

                clearTimeout(timeout);
                timeout = setTimeout(later, wait);

                const callNow = immediate && !timeout;
                if (callNow) func.apply(context, args);
            };
        },
        getCurrentPosition: () => new Promise((resolve, reject) => {
            const useCoordinateCache = () => {
                const coordinateCache = JSON.parse(localStorage.getItem('data-coordinate-cache') || '{}')
                Utility.log('timeout. use last cached location', coordinateCache)
                if (Object.keys(coordinateCache).length > 0) {
                    resolve(coordinateCache)
                } else {
                    localStorage.removeItem('data-coordinate-cache')
                    reject(new Error(`
                        <br />Gagal mendeteksi lokasi user secara otomatis.
                        <br />
                        <br />Pastikan "location permission" untuk ekstensi
                        <br />Muslim Board adalah "allowed" dan ada akses internet.
                        <br />
                        <br />Atau silakan gunakan fitur atur manual pilihan lokasi.
                    `))
                }
            }

            if (!navigator.geolocation) {
                useCoordinateCache()
                return
            }

            navigator.geolocation.clearWatch(this.geoLocationWatchObject)
            navigator.geolocation.getCurrentPosition($.noop, $.noop, {})
            navigator.geolocation.getCurrentPosition(
                (result) => {
                    const coordinate = {
                        coords: {
                            latitude: result.coords.latitude,
                            longitude: result.coords.longitude,
                        }
                    }
                    Utility.log('current coordinate found at', coordinate.coords)
                    localStorage.setItem('data-coordinate-cache', JSON.stringify(coordinate))
                    resolve(coordinate)
                }, 
                useCoordinateCache,
                {
                    enableHighAccuracy: true,
                    maximumAge: Infinity,
                    timeout: Constant.app.timeoutDuration
                }
            )
        }),
        getData: (key, updateCallback) => new Promise(async (resolve) => {
            const cacheKey = key
            const cacheData = localStorage.getItem(cacheKey)
            const nowYYYYMMDD = moment().format('YYYY-MM-DD')
            let data = {
                lastUpdated: nowYYYYMMDD,
                content: {}
            }
            if (cacheData) {
                data = JSON.parse(cacheData)
            }
            
            const isFirstTime = Object.keys(data.content).length == 0
            const isNotToday = data.lastUpdated != nowYYYYMMDD
            if (isFirstTime || isNotToday) {
                try {
                    await updateCallback((result, error) => {
                        if (error) {
                            resolve(false)
                            return
                        }

                        data.lastUpdated = nowYYYYMMDD
                        data.content = result
                        localStorage.setItem(cacheKey, JSON.stringify(data))
                        
                        resolve(data)
                    })
                } catch (err) {
                    Utility.log('error', err)
                    resolve(false)
                }
            } else {
                resolve(data)
            }
        }),
        removeLocalStorageData: (cond) => {
            Utility.log('remove local storage', cond)
            Object.keys(localStorage).filter(cond).forEach((d) => { localStorage.removeItem(d) })
        },
        randomFromArray(arr, exclusion) {
            const items = arr.filter((d) => exclusion ? (d != exclusion) : true)
            return items[Math.floor(Math.random()*items.length)]
        },
        sleep: (n) => new Promise((resolve) => { setTimeout(() => { resolve() }, Utility.seconds(n)) }),
        seconds: (n) => n * 1000,
        log: (...args) => (Constant.app.debug) ? console.log(...args) : $.noop(),
        toTitleCase: (str) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()),
        flattenString: (str, joiner = '') => str.split('\n').map((d) => d.trim()).filter((d) => d).join(joiner),
        getCurrentTimezoneAbbreviation: (countryCode) => {
            if (countryCode === 'id') {
                switch (new Date().toString().match(/([-\+][0-9]+)\s/)[1]) {
                    case '+0700': return 'WIB'
                    case '+0800': return 'WITA'
                    case '+0900': return 'WIT'
                }
            }

            return moment.tz(moment.tz.guess()).zoneAbbr()
        },
        distanceBetween(lat1, lon1, lat2, lon2) {
            const R = 6371 // km
            const dLat = (lat2-lat1) * Math.PI / 180
            const dLon = (lon2-lon1) * Math.PI / 180
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *  Math.sin(dLon/2) * Math.sin(dLon/2)
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
            const d = R * c

            if (d > 1) {
                return Math.round(d)
            } else if (d <= 1) {
                return Math.round(d * 1000)
            } else {
                return d
            }
        },
        fetch: (url) => {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), Constant.app.timeoutDuration)

            return fetch(url, { signal: controller.signal })
            
            // If you only wanted to timeout the request, not the response, add:
            // clearTimeout(timeoutId)
        }
    }
    
    const Constant = {
        meta: {
            version: (() => `v${chrome.runtime.getManifest().version}`)(),
            appName: 'Muslim Board',
            homepageLink: 'https://muslimboard.novalagung.com',
        },
        maintainer: {
            name: 'Noval Agung Prayogo',
            email: 'caknopal@gmail.com',
        },
        app: {
            baseUrl: 'https://asia-southeast2-muslim-board-ind-1472876095243.cloudfunctions.net',
            debug: (() => !('update_url' in chrome.runtime.getManifest()))(),
            timeoutDuration: Utility.seconds(5),
            updateBackgroundDelayDuration: Utility.seconds(40),
            updateContentDelayDuration: Utility.seconds(60),
            changelogs: [
                'Upgrade extension manifest version from v2 to v3',
                'Automatically clear local cache on failure when fetching prayer times information'
            ]
        },
    }

    const App = {
    
        // =========== CLOCK
    
        // render time to screen at start and every seconds
        renderDateTime() {
            const doRenderDateTime = () => {
                const hour = moment().format('HH')
                const minute = moment().format('mm')

                let dayName = ''
                switch (moment().format('dddd')) {
                    case 'Sunday': dayName = 'Ahad'; break;
                    case 'Monday': dayName = 'Senin'; break;
                    case 'Tuesday': dayName = 'Selasa'; break;
                    case 'Wednesday': dayName = 'Rabu'; break;
                    case 'Thursday': dayName = 'Kamis'; break;
                    case 'Friday': dayName = 'Jumat'; break;
                    case 'Saturday': dayName = 'Sabtu'; break;
                }

                let monthName = ''
                switch (moment().format('MM')) {
                    case '01': monthName = 'Januari'; break;
                    case '02': monthName = 'Februari'; break;
                    case '03': monthName = 'Maret'; break;
                    case '04': monthName = 'April'; break;
                    case '05': monthName = 'Mei'; break;
                    case '06': monthName = 'Juni'; break;
                    case '07': monthName = 'Juli'; break;
                    case '08': monthName = 'Agustus'; break;
                    case '09': monthName = 'September'; break;
                    case '10': monthName = 'Oktober'; break;
                    case '11': monthName = 'November'; break;
                    case '12': monthName = 'Desember'; break;
                }

                const tzAbbr = Utility.getCurrentTimezoneAbbreviation(this.geoLocationCountryCode)

                const dateFull = moment().format('$1, DD $2 YYYY HH:mm:ss $3')
                    .replace('$1', dayName)
                    .replace('$2', monthName)
                    .replace('$3', tzAbbr)

                $('.time .hour').text(hour)
                $('.time .minute').text(minute)
                $('.date .text').text(dateFull)
            }

            doRenderDateTime()
            setInterval(doRenderDateTime, Utility.seconds(1))
        },
    
        // =========== LOCATION

        // global geolocation watch object
        geoLocationWatchObject: null,
        geoLocationCountryCode: 'id',

        // get master location data.
        // if location data ever been loaded once, then the cache will be used on next call
        async getDataMasterLocation() {
            const key = `data-location-static-${Constant.meta.version}`
            const data = await Utility.getData(key, async (resolve) => {
                const url = `data/data-location.json`
                const response = await Utility.fetch(url)
                const result = await response.json()
                resolve(result)
            })
            return Promise.resolve(data)
        },

        // print location
        renderLocationText(text) {
            if (text.length > 80) {
                $('.location .text').text(`${text.slice(0, 80)}...`)
                $('.location .text').attr('title', text)
            } else {
                $('.location .text').text(text)
                $('.location .text').removeAttr('title')
            }
        },

        // return manual location data
        // if automatic location is currently active, then skip it
        getManualLocationData() {
            if (this.isUsingAutomaticLocation.call(this)) {
                return { province: '', kabko: '' }
            }

            const text = localStorage.getItem('data-manual-location') || ''
            const parts = text.split('|')
            return { province: parts[0], kabko: parts[1], id: parts[2] }
        },

        // detect whether automatic location is currently active, or not
        isUsingAutomaticLocation() {
            if (localStorage.getItem('data-manual-location')) {
                return false
            }
            
            return true
        },
    
        // =========== PRAYER TIME

        // render player time placeholder.
        // used on the screen during loading data process
        renderPrayerTimePlaceholder() {
            $('.location .text').text('Loading ...')
            $(`.prayer-time tbody`).css('visibility', 'hidden')

            Array(6).fill(0).forEach((each, i) => {
                $(`.prayer-time tbody tr:eq(${i})`).css('visibility', 'hidden')
                $(`.prayer-time tbody tr:eq(${i}) td:eq(0)`).html('')
                $(`.prayer-time tbody tr:eq(${i}) td:eq(1)`).html('')
                $(`.prayer-time tbody tr:eq(${i}) td:eq(2)`).html('')
            })
            
            $(`.prayer-time tbody tr:eq(0)`).css('visibility', 'visible')
            $(`.prayer-time tbody tr:eq(0) td:eq(0)`).html('<span class="placeholder">Loading ...</span>')
        },

        // get automatic prayer time
        async getPrayerTimesByCoordinate(latitude, longitude) {
            const key = `data-prayer-time-by-coordinate-${latitude}-${longitude}-${moment().format('YYYY-MM-DD')}`
            if (latitude == 0 && longitude == 0) {
                localStorage.removeItem(key)
            }

            const data = await Utility.getData(key, async (resolve) => {
                const method = 1
                const month = parseInt(moment().format('MM'), 10)
                const year = moment().year()
                const url = `${Constant.app.baseUrl}/muslimboard-api?v=${Constant.meta.version}&op=shalat-schedule-by-coordinate&latitude=${latitude}&longitude=${longitude}&method=${method}&month=${month}&year=${year}`
                const response = await Utility.fetch(url)
                const result = await response.json()
        
                resolve(result)
            })
            let isDataFound = true
            if (!data) {
                isDataFound = false
            } else if (!data.content) {
                isDataFound = false
            } else if (data.content.status_code != 200) {
                isDataFound = false
            } else if (!data.content.data) {
                isDataFound = false
            }
            if (!isDataFound) {
                localStorage.removeItem(key)
                return false
            }

            // construct prayer time data then render
            const schedules = data.content.data.schedules.find((d) => d.date.gregorian.date == moment().format('DD-MM-YYYY'))
            isDataFound = true
            if (!schedules) {
                isDataFound = false
            } else if (!schedules.timings) {
                isDataFound = false
            }
            if (!isDataFound) {
                localStorage.removeItem(key)
                return false
            }

            return data
        },

        // get prayer time by location id
        async getPrayerTimesByLocationID(province, kabko, locationID) {
            const key = `data-prayer-time-by-location-${locationID}-${moment().format('YYYY-MM-DD')}`
            if (!province && !kabko) {
                localStorage.removeItem(key)
            }

            const data = await Utility.getData(key, async (resolve) => {
                const method = 1
                const month = parseInt(moment().format('MM'), 10)
                const year = moment().year()
                const url = `${Constant.app.baseUrl}/muslimboard-api?v=${Constant.meta.version}&op=shalat-schedule-by-location&locationID=${locationID}&province=${province}&city=${kabko}&method=${method}&month=${month}&year=${year}`
                const response = await Utility.fetch(url)
                const result = await response.json()
        
                resolve(result)
            })
            let isDataFound = true
            if (!data) {
                isDataFound = false
            } else if (!data.content) {
                isDataFound = false
            } else if (data.content.status_code != 200) {
                isDataFound = false
            } else if (!data.content.data) {
                isDataFound = false
            }
            if (!isDataFound) {
                localStorage.removeItem(key)
                return false
            }

            // construct prayer time data then render
            const schedules = data.content.data.schedules.find((d) => d.date.gregorian.date == moment().format('DD-MM-YYYY'))
            isDataFound = true
            if (!schedules) {
                isDataFound = false
            } else if (!schedules.timings) {
                isDataFound = false
            }
            if (!isDataFound) {
                localStorage.removeItem(key)
                return false
            }

            return data
        },

        // remove prayer times cache
        clearPrayerTimesCache() {

            // remove coordinate cache
            localStorage.removeItem('data-coordinate-cache')

            // remove prayer time cache
            Utility.removeLocalStorageData((d) => d.indexOf('data-prayer-time') > -1)
        },

        // render prayer time to screen
        renderPrayerTime(schedule) {
            const tzAbbr = Utility.getCurrentTimezoneAbbreviation(this.geoLocationCountryCode)
            
            const times = [
                { value: schedule.Fajr, label: 'Subuh' },
                { value: schedule.Sunrise, label: 'Dhuha' },
                { value: schedule.Dhuhr, label: 'Dzuhur' },
                { value: schedule.Asr, label: 'Ashar' },
                { value: schedule.Maghrib, label: 'Maghrib' },
                { value: schedule.Isha, label: 'Isya' },
            ]
            times.forEach((each, i) => {
                $(`.prayer-time tbody tr:eq(${i})`).css('visibility', 'visible')
                $(`.prayer-time tbody tr:eq(${i}) td:eq(0)`).html(each.label)
                $(`.prayer-time tbody tr:eq(${i}) td:eq(1)`).html(each.value.slice(0, 5))
                $(`.prayer-time tbody tr:eq(${i}) td:eq(2)`).html(tzAbbr)
            })
            
            // set alaram once loaded
            let isAlarmEverSet = false
            setInterval(() => {
                const hmFormatter = (str) => parseInt(str.slice(0, 5).replace(':', ''), 10)
                const nowHM = parseInt(moment().add(-10, 'minutes').format('HHmm'), 10)
                const fajrHM = hmFormatter(schedule.Fajr)
                const sunriseHM = hmFormatter(schedule.Sunrise)
                const dhuhrHM = hmFormatter(schedule.Dhuhr)
                const asrHM = hmFormatter(schedule.Asr)
                const maghribHM = hmFormatter(schedule.Maghrib)
                const ishaHM = hmFormatter(schedule.Isha)

                const ymdhmFormatter = (str) => moment(`${moment().format('YYYY-MM-DD ')} ${str.slice(0, 5)}`, 'YYYY-MM-DD HH:mm').toDate().getTime()
                const fajrYMDHM = ymdhmFormatter(schedule.Fajr)
                const sunriseYMDHM = ymdhmFormatter(schedule.Sunrise)
                const dhuhrYMDHM = ymdhmFormatter(schedule.Dhuhr)
                const asrYMDHM = ymdhmFormatter(schedule.Asr)
                const maghribYMDHM = ymdhmFormatter(schedule.Maghrib)
                const ishaYMDHM = ymdhmFormatter(schedule.Isha)

                const nowYYYYMMDD = Date.now()
                
                $('.prayer-time tbody tr').removeClass('active')

                const createAlarm = (time, text) => {
                    if (!(!isAlarmEverSet || moment().seconds() % 10  == 0)) {
                        return
                    }

                    if (chrome.alarms) {
                        chrome.alarms.clear()
    
                        const exactTime = time
                        if (exactTime >= nowYYYYMMDD) {
                            const exactMessage = `exact|Waktunya sholat ${text}|Untuk daerah ${$('.location .text').text()}`
                            chrome.alarms.create(exactMessage, { when: exactTime })
                        }
    
                        const almostTime = moment(time).add(-10, 'minutes').toDate().getTime()
                        if (almostTime >= nowYYYYMMDD) {
                            const almostMessage = `almost|10 menit lagi adalah waktu sholat ${text}|Untuk daerah ${$('.location .text').text()}`
                            chrome.alarms.create(almostMessage, { when: almostTime })
                        }
    
                        isAlarmEverSet = true
                    }
                }

                if (nowHM >= ishaHM) {
                    // do nothing

                } else if (nowHM >= maghribHM) {
                    const $tr = $('.prayer-time tbody tr:eq(5)')
                    $tr.addClass('active')
                    createAlarm(ishaYMDHM, $tr.find('td:eq(0)').text())

                } else if (nowHM >= asrHM) {
                    const $tr = $('.prayer-time tbody tr:eq(4)')
                    $tr.addClass('active')
                    createAlarm(maghribYMDHM, $tr.find('td:eq(0)').text())
                    
                } else if (nowHM >= dhuhrHM) {
                    const $tr = $('.prayer-time tbody tr:eq(3)')
                    $tr.addClass('active')
                    createAlarm(asrYMDHM, $tr.find('td:eq(0)').text())

                } else if (nowHM >= sunriseHM) {
                    const $tr = $('.prayer-time tbody tr:eq(2)')
                    $tr.addClass('active')
                    createAlarm(dhuhrYMDHM, $tr.find('td:eq(0)').text())

                } else if (nowHM >= fajrHM) {
                    const $tr = $('.prayer-time tbody tr:eq(1)')
                    $tr.addClass('active')
                    createAlarm(sunriseYMDHM, $tr.find('td:eq(0)').text())

                } else {
                    const $tr = $('.prayer-time tbody tr:eq(0)')
                    $tr.addClass('active')
                    createAlarm(fajrYMDHM, $tr.find('td:eq(0)').text())
                }
            }, Utility.seconds(1))
        },
    
        // =========== BACKGROUND
        
        // store selected background image
        selectedBackground: false,

        // store next background image
        nextSelectedBackground: false,

        // get background image data then render it to screen.
        // if background image data ever been loaded once, then the cache will be used on next call
        async getDataBackgroundThenRender() {
            let data = {}

            // load data from remote url
            try {
                Utility.log('fetching remote data background')
                const key = `data-background-remote-${Constant.meta.version}-${moment().format('YYYYMMDD')}`
                data = await Utility.getData(key, async (resolve) => {
                    Utility.removeLocalStorageData((d) => d.indexOf('data-background-remote') > -1)
                    const url = `https://raw.githubusercontent.com/novalagung/muslimboard/master/extension/data/data-background.json?v=${Constant.meta.version}.${moment().format('YYYYMMDD')}`
                    const response = await Utility.fetch(url)
                    const result = await response.json()
                    resolve(result)
                })
            } catch (err) {
                Utility.log('error', err)
            }

            // in case of failure, use local data
            if (!data) {
                Utility.log('fetching local data background')
                const key = `data-background-local-${Constant.meta.version}`
                data = await Utility.getData(key, async (resolve) => {
                    const url = `data/data-background.json`
                    const response = await Utility.fetch(url)
                    const result = await response.json()
                    resolve(result)
                })
            }

            this.updateBackground.call(this, data)
        },

        // update background images randomly on every X interval
        async updateBackground(data) {

            // the doUpdateBackground below is used to manage the image and text transition
            const doUpdateBackground = () => {
                const preloader = new Image()
                preloader.src = this.nextSelectedBackground.url
                preloader.onload = () => {
                    Utility.log('image preloaded', preloader.src)
    
                    const background = this.nextSelectedBackground
                    if (background.hasOwnProperty('author')) {
                        $('.photographer').html(background.author.name)
                    } else {
                        $('.photographer').html(background.source.split('http://').reverse()[0])
                    }
                    $('.photographer').closest('a').attr('href', background.source)
    
                    setTimeout(() => {
                        this.updateBackground.call(this, data)
                    }, Constant.app.updateBackgroundDelayDuration)
                }
                preloader.onerror = (err) => {
                    this.nextSelectedBackground = Utility.randomFromArray(data.content.content, this.selectedBackground)
                    preloader.src = this.nextSelectedBackground.url
                }
            }
    
            // if certain image is currently appearing on screen,
            // then the transition need to be smooth.
            // meanwhile at first load, local image will be used to make the image loading process faster
            if (this.selectedBackground) {
                this.selectedBackground = this.nextSelectedBackground
                this.nextSelectedBackground = Utility.randomFromArray(data.content.content, this.selectedBackground)
    
                $('#transitioner .content')
                    .css('opacity', '0')
                    .css('background-image', `url("${this.selectedBackground.url}")`)
    
                const position = this.selectedBackground.position
                $('#transitioner .content')
                    .css('opacity', '0')
                    .css('background-position', position ? `${position.horizontal} ${position.vertical}` : '')
    
                await Utility.sleep(0.1)
    
                $('#transitioner .content').animate({
                    'opacity': 1,
                }, 'slow', async () => {
                    $('#background .content').css('background-image', `url("${this.selectedBackground.url}")`)
                    $('#background .content').css('background-position', position ? `${position.horizontal} ${position.vertical}` : '')
    
                    await Utility.sleep(0.1)
    
                    $('#transitioner .content').css('opacity', '0')
    
                    doUpdateBackground()
                })
            } else {
                const doUpdateBackgroundForTheFirstTime = () => {
                    $('#background .content').css('background-image', `url("${this.selectedBackground.url}")`)
        
                    const position = this.selectedBackground.position
                    if (position) {
                        $('#background .content').css('background-position', `${position.horizontal} ${position.vertical}`)
                    } else {
                        $('#background .content').css('background-position', '')
                    }
                    
                    this.nextSelectedBackground = this.selectedBackground
                    doUpdateBackground()
                }

                this.selectedBackground = Utility.randomFromArray(
                    data.content.content,
                    this.selectedBackground
                )

                // right after certain image loaded, trigger preload for next image,
                // this approach is to ensure when the next image transition is happening,
                // it's need to happen smoothly.
                // on rare occasion the preload might failing due to various reason such slow internet,
                // and if that situation is happening, use the local image
                const preloader = new Image()
                preloader.src = this.selectedBackground.url
                preloader.onload = () => {
                    Utility.log('image preloaded', preloader.src)
                    doUpdateBackgroundForTheFirstTime()
                }
                preloader.onerror = () => {
                    this.selectedBackground = Utility.randomFromArray(
                        data.content.content.filter((d) => d.url.indexOf('http') == -1),
                        this.selectedBackground
                    )
                    doUpdateBackgroundForTheFirstTime()
                }
            }
        },
    
        // =========== QUOTE CONTENT
        
        // store selected content
        selectedContent: false,

        // get data content then render it on screen.
        // if background image data ever been loaded once, then the cache will be used on next call
        async getDataContentThenRender() {
            let data = {}

            // load data from remote url
            try {
                Utility.log('fetching remote data content')
                const key = `data-content-remote-${Constant.meta.version}-${moment().format('YYYYMMDD')}`
                data = await Utility.getData(key, async (resolve) => {
                    Utility.removeLocalStorageData((d) => d.indexOf('data-content-remote') > -1)
                    const url = `https://raw.githubusercontent.com/novalagung/muslimboard/master/extension/data/data-content.json?v=${Constant.meta.version}.${moment().format('YYYYMMDD')}`
                    const response = await Utility.fetch(url)
                    const result = await response.json()
                    resolve(result)
                })
            } catch (err) {
                Utility.log('error', err)
            }

            // in case of failure, use local data
            if (!data) {
                Utility.log('fetching local data content')
                const key = `data-content-local-${Constant.meta.version}`
                data = await Utility.getData(key, async (resolve) => {
                    const url = `data/data-content.json`
                    const response = await Utility.fetch(url)
                    const result = await response.json()
                    resolve(result)
                })
            }
            
            this.updateContent.call(this, data)
        },

        // update content. it's the quote and other text related to it.
        updateContent(data) {
            this.selectedContent = Utility.randomFromArray(data.content.content, this.selectedContent)
            const content = this.selectedContent
            const author = data.content.author[content.author]
    
            $('#wise-word').attr('data-type', content.type)
            $('#wise-word').find('p.matan').html(`<div>${content.matan}</div>`)
            $('#wise-word').find('p.translation').html(`<div>${content.translation}</div>`)
    
            if (content.type.indexOf('verse') > -1) {
                $('#wise-word').find('p.reference').html(`<div>${content.reference}</div>`)
            } else if (author) {
                const text = content.reference
                    ? `<a href='${content.reference}' target='_blank'>${author.name}</a>`
                    : `<span>${author.name}</span>`
                    
                $('#wise-word').find('p.reference').html(`<div>${text}</div>`)
                $('#wise-word').find('p.reference *:first')
                    .addClass('tooltipster')
                    .attr('title', author.bio)
                    .tooltipster({
                        theme: 'tooltipster-custom-theme',
                        animation: 'grow',
                        delay: 0,
                        touchDevices: false,
                        trigger: 'hover',
                        position: 'bottom'
                    })
            } else if (content.reference) {
                const text = content.reference.indexOf('http') > -1
                    ? `<a href='${content.reference}' target='_blank'>${content.reference}</a>`
                    : `<span>${content.reference}</span>`

                $('#wise-word').find('p.reference').html(`<div>${text}</div>`)
            }
    
            setTimeout(() => {
                this.updateContent.call(this, data)
            }, Constant.app.updateContentDelayDuration)
        },
    
        // =========== PRAYER TIMES
    
        // load the location and prayer information whether on manual mode or automatic
        async loadLocationAndPrayerTimeThenRender() {
            this.renderPrayerTimePlaceholder.call(this)
            const isDetectModeAutomatic = this.isUsingAutomaticLocation.call(this)

            try {
                if (isDetectModeAutomatic) {
                    Utility.log('load location automatically, then render prayer times')

                    // handler definition
                    const getPrayerTimesByCoordinateThenRender = async (latitude, longitude, silent = false) => {
                        const data = await this.getPrayerTimesByCoordinate.call(this, latitude, longitude)
                        if (!data) {
                            if (silent) {
                                return
                            } else {
                                this.clearPrayerTimesCache.call(this)
                                throw new Error('Gagal mengambil jadwal sholat. Pastikan terhubung dengan internet lalu refresh halaman')
                            }
                        }

                        this.geoLocationCountryCode = (data.content.data.countryCode || 'id')
                
                        const address = data.content.data.address
                        this.renderLocationText.call(this, address)

                        const schedule = data.content.data.schedules.find((d) => d.date.gregorian.date == moment().format('DD-MM-YYYY')).timings
                        this.renderPrayerTime.call(this, schedule)
                    }

                    // on automatic mode, first get the current coordinate
                    const location = await Utility.getCurrentPosition()
                    const { latitude, longitude } = location.coords

                    // and then proceed with getting the prayer times
                    await getPrayerTimesByCoordinateThenRender.call(this, latitude, longitude)

                    // add some delay
                    await Utility.sleep(5)

                    // also monitor the possible movement
                    navigator.geolocation.clearWatch(this.geoLocationWatchObject)
                    this.geoLocationWatchObject = navigator.geolocation.watchPosition((position) => {

                        // if automatic location is NOT currently active, then skip it
                        if (!this.isUsingAutomaticLocation.call(this)) {
                            navigator.geolocation.clearWatch(this.geoLocationWatchObject)
                            return
                        }

                        const updatedLatitude = position.coords.latitude
                        const updatedLongitude = position.coords.longitude
                        
                        // refresh prayer time on movement
                        const distance = Utility.distanceBetween(latitude, longitude, updatedLatitude, updatedLongitude)
                        if (distance > 0) {
                            Utility.log('detecting geolocation change!', distance, position)
                            getPrayerTimesByCoordinateThenRender.call(this, updatedLatitude, updatedLongitude, true)
                        }
                    }, (error) => {
                        Utility.log(error)
                    })
                } else {
                    Utility.log('load location manually, then render prayer times')

                    // on manual mode, get the data from selected province and citym, then render it
                    const { province, kabko, id } = this.getManualLocationData.call(this)
                    const locationText = `${Utility.toTitleCase(kabko)}, ${Utility.toTitleCase(province)}`
                    this.renderLocationText.call(this, locationText)

                    // add some delay
                    await Utility.sleep(0.5)

                    // kemenag bimaislam website (proxied by our serverless backend) is used to get the prayer time on manual mode.
                    // if prayer time data ever been loaded once, then the cache will be used on next call
                    const data =  await this.getPrayerTimesByLocationID(province, kabko, id)
                    if (!data) {
                        this.clearPrayerTimesCache.call(this)
                        throw new Error('Gagal mengambil jadwal sholat. Pastikan terhubung dengan internet lalu refresh halaman')
                    }

                    this.geoLocationCountryCode = (data.content.data.countryCode || 'id')
                    const schedule = data.content.data.schedules.find((d) => d.date.gregorian.date == moment().format('DD-MM-YYYY')).timings
                    this.renderPrayerTime.call(this, schedule)
                }
            } catch (err) {
                Utility.log('error', err)
                Swal.fire({
                    type: 'error',
                    title: `Deteksi lokasi ${isDetectModeAutomatic ? 'otomatis' : 'manual'} gagal`,
                    html: err.message,
                    confirmButtonText: 'OK',
                    showConfirmButton: true,
                    allowOutsideClick: true
                });
            }
        },

        // this function containt many event definition for any location and prayer time related operation
        // for both manual mode and automatic mode
        async registerEventForForceLoadLocationAndPrayerTimes() {

            // get master location data
            const locationData = await this.getDataMasterLocation.call(this)
            const locations = locationData.content

            // function to render dropdown options
            const renderDropdownOption = (collections, keyValue, keyText, placeholder) => {
                const contentOptions = JSON.parse(JSON.stringify(collections))
                contentOptions.sort((a, b) => {
                    if (a[keyText] > b[keyText]) {
                        return 1
                    } else if (b[keyText] > a[keyText]) {
                        return -1
                    } else {
                        return 0
                    }
                })
    
                const options = contentOptions.map((each) => {
                    return `<option value='${each[keyValue]}'>${each[keyText]}</option>`
                })
                return [`<option value=''>---- ${placeholder.toUpperCase()} ----</option>`]
                    .concat(options)
                    .join('')
            };

            // register event handler for applying automatic location
            $('.detect-data-automatically').on('click', async () => {
                Utility.log('force load location & prayer times')

                let text = 'Anda yakin ingin mengaktifkan?'
                let buttonText = 'Ya, aktifkan'

                const isCachedCoordinateExists = localStorage.getItem('data-coordinate-cache') ? true : false
                if (this.isUsingAutomaticLocation.call(this) && isCachedCoordinateExists) {
                    text = 'Deteksi lokasi otomatis sudah aktif. Apakah anda ingin me-refresh lokasi?'
                    buttonText = 'Ya, refresh lokasi'
                }

                Swal.fire({
                    type: 'info',
                    title: 'Auto deteksi jadwal',
                    html: text,
					showConfirmButton: true,
					showCancelButton: true,
                    confirmButtonText: buttonText,
                    cancelButtonText: 'Batal'
                }).then(async (e) => {
                    if (!e.value) {
                        return
                    }

                    // remove automatic location cache
                    const location = await Utility.getCurrentPosition()
                    const { latitude, longitude } = location.coords
                    localStorage.removeItem(`data-prayer-time-by-coordinate-${latitude}-${longitude}-${moment().format('YYYY-MM-DD')}`)

                    // force to not use cached coordinate when refreshing finding coordinate.
                    // not really sure whether this one is good approach
                    localStorage.removeItem('data-coordinate-cache')

                    // remove data-manual-location to enable automatic detection on location
                    localStorage.removeItem('data-manual-location')

                    // reload prayer time
                    this.loadLocationAndPrayerTimeThenRender.call(this)
                })
            })
            
            // register event handler for applying manual location
            $('.set-data-manually').on('click', async () => {
                Utility.log('set location of prayer times manually')

                const text = `
                    <p>Silakan pilih nama provinsi dan kabupaten/kota tempat anda sekarang berada</p>
                    <form class='manual-geolocation'>
                        <div class="row">
                            <label>Provinsi</label>
                            <select required class="dropdown-province">
                                ${renderDropdownOption(locations, 'provinsi', 'provinsi', 'Pilih provinsi')}
                            </select>
                        </div>
                        <div class="row">
                            <label>Kota</label>
                            <select required class="dropdown-city">
                                <option value="">---- PILIH PROVINSI TERLEBIH DAHULU ----</option>
                            </select>
                        </div>
                    </form>
                `

                let province = ''
                let kabko = ''
                let locationID = ''

                // show the manual location picker
                Swal.fire({
                    type: 'info',
                    title: `Atur pilihan lokasi (manual)`,
                    html: text,
					showConfirmButton: true,
					showCancelButton: true,
                    confirmButtonText: "Simpan",
                    cancelButtonText: "Batal",
                    preConfirm: () => {
                        province = $('.dropdown-province').val()
                        kabko = $('.dropdown-city').children('option').filter(':selected').text()
                        locationID = $('.dropdown-city').val()

                        return Promise.resolve()
                    }
                }).then((e) => {
                    if (!e.value) {
                        return
                    }

                    if (!province) {
                        alert('Tidak bisa menyimpan perubahan karena provinsi kosong. Sementara diaktifkan kembali deteksi jadwal otomatis')
                        return
                    } else if (!kabko || (kabko || '').includes('----')) {
                        alert('Tidak bisa menyimpan perubahan karena kabupaten/kota kosong. Sementara diaktifkan kembali deteksi jadwal otomatis')
                        return
                    }

                    // delete previously cached selected location data.
                    // replace it with the newly selected location
                    const key = `data-prayer-time-by-location-${locationID}-${moment().format('YYYY-MM-DD')}`
                    localStorage.removeItem(key)
                    localStorage.setItem('data-manual-location', `${province}|${kabko}|${locationID}`)

                    // reload prayer time then render
                    this.loadLocationAndPrayerTimeThenRender.call(this)
                })

                // get manual location data then show it on modal
                const savedLocation = this.getManualLocationData.call(this)
				$('.dropdown-province').val(savedLocation.province);
				$('.dropdown-province').trigger('change');
				setTimeout(() => {
					$('.dropdown-city').val(savedLocation.id)
				}, 300);
            })
            
            // on manual popup/modal, when user select a province,
            // then proceed with showing cities under the particular province
            $('body').on('change', '.dropdown-province', async (e) => {
                const value = e.currentTarget.value
                if (!value) {
                    return
                }

                const found = locations.find((d) => d.provinsi == value)
                const cities = found ? found.children : []
                
                $('.dropdown-city').replaceWith($(
                    `<select required class="dropdown-city">
                        ${renderDropdownOption(cities, 'id', 'kabko', 'Pilih kabupaten/kota')}
                    </select>`
                ))
            })
        },
    
        // =========== FOOTER
    
        // perform detection on internet status, whether it's online or not
        registerEventForInternetAvailabilityStatus() {
            const internetStatus = (status) => () => {
                if (status == 'online') {
                    $('.connection-status')
                        .text('online')
                        .removeClass('sad')
                        .addClass('happy')
                } else {
                    $('.connection-status')
                        .text('offline')
                        .removeClass('happy')
                        .addClass('sad')
                }
            }
            
            $.ajax({
                type: 'GET',
                url: `${Constant.app.baseUrl}/muslimboard-api?v=${Constant.meta.version}&op=ping`,
                success: () => {
                    internetStatus(navigator.onLine ? 'online' : 'offline')()
                    window.addEventListener('online', internetStatus('online'))
                    window.addEventListener('offline', internetStatus('offline'))
                },
                error: (XMLHttpRequest, textStatus, errorThrown) => {
                    if (textStatus == 'timeout') {
                        internetStatus('offline')()
                    }
                },
                timeout: Constant.app.timeoutDuration
            });
        },

        // apply event handler for any clickable stuff on footer
        registerEventForFooter() {

            // on info button click, show the info modal
            $('.info').on('click', (e) => {
                e.preventDefault();
    
                const text = `
                    <div class='modal-info'>
                        <p>
                            <a href='${Constant.meta.homepageLink}' target='_blank'>${Constant.meta.appName}</a> adalah laman personal dashboard khusus untuk muslim yang berdomisili di Indonesia. Plugin ini terinspirasi dari Momentum, tersedia untuk browser Chrome & Firefox.
                        </p>
                        <p>
                            Informasi jadwal sholat dimunculkan sesuai lokasi pengguna.
                        </p>
                        <p>
                            Untuk pertanyaan, kritik & saran, maupun jika ingin berkontribusi foto atau quote, silakan kirim email ke <a href='mailto:${Constant.maintainer.email}?subject=${Constant.meta.appName} - Pertanyaan, kritik, dan saran'>${Constant.maintainer.email}</a> atau via submit PR di <a href='https://github.com/novalagung/muslimboard' target='_blank'>GitHub</a>.
                        </p>
                        <hr class='separator'>
                        <p class='copyright text-center'>
                            Maintained by <a href='https://www.linkedin.com/in/novalagung' target='_blank'>${Constant.maintainer.name}</a>
                            <br>
                            ${moment().format("YYYY")} | <a href='${Constant.meta.homepageLink}' target='_blank'>${Constant.meta.homepageLink}</a>
                            <br>
                        </p>
                    </div>
                `
                
                Swal.fire({
                    type: 'info',
                    title: [Constant.meta.appName, Constant.meta.version].join(" "),
                    html: text,
                    showConfirmButton: false,
                    allowOutsideClick: true
                });
            });
    
            // on share button click, show the share modal
            $('.share').on('click', () => {
                const title = `${Constant.meta.appName} Browser Extension/Plugin`;
                const text = `
                    <p>Bagikan extension/plugin ini ke sosial media,<br />agar yang lain juga bisa mendapat manfaat.</p>
                    <div class="space-top">
                        <a 
                            class="btn-share facebook" 
                            target="_blank" 
                            href="https://www.facebook.com/sharer/sharer.php?u=${encodeURI(Constant.meta.homepageLink)}&title=${encodeURI(title)}" 
                            title="Share ke facebook"
                        >
                            <i class="fa fa-facebook-square"></i>
                        </a>
                        <a 
                            class="btn-share twitter" 
                            target="_blank" 
                            href="https://twitter.com/home?status=${encodeURI([title, Constant.meta.homepageLink].join(" "))}" 
                            title="Share ke twitter"
                        >
                            <i class="fa fa-twitter"></i>
                        </a>
                    </div>
                `
    
                Swal.fire({
                    type: 'info',
                    title: 'Share ke Sosial Media',
                    html: text,
                    showConfirmButton: false,
                    allowOutsideClick: true
                });
            });
        },

        // =========== NOTIFICATION

        // manage notifications and alarms
        registerEventForAlarm() {
            Utility.log('clearing old alarms info')

            // clear any existing notifications data
            if (chrome.notifications) {
                chrome.notifications.getAll((notification) => {
                    Object.keys(notification).forEach((each) => {
                        chrome.notifications.clear(each, $.noop)
                    })
                })
            }

            // clear any existing alarms data then create new one.
            // also dispatch the notification on alarm
            if (chrome.alarms) {
                chrome.alarms.clearAll()
                chrome.alarms.onAlarm.addListener((alarm) => {
                    Utility.log('retrieve alarm', alarm)
    
                    chrome.alarms.clear(alarm.name, $.noop)
    
                    const info = alarm.name.split('|')
                    chrome.notifications.create(info[0], {
                        type: 'basic',
                        iconUrl: 'assets/internal/images/icon-clock.png',
                        title: info[1],
                        message: info[2]
                    }, $.noop)
                })
            }
        },

        // =========== TODO LIST

        // toggle TODO list visibility based on previously cached state
        async ensureTodoListBoxVisibility() {
            const value = localStorage.getItem('todo-list-status') || 'false'
            if (value === 'true') {
                $('body').addClass('show-todo-list')
            } else {
                $('body').removeClass('show-todo-list')
            }
        },

        // this function contains several things:
        // - setup default TODO items data.
        // - ensure TODO list visibility baseed on previously cached state.
        // - and render TODO items
        async ensureTodoListBoxVisibilityOnPageActive() {

            // migrate chrome.storage.sync storage data to localStorage
            const localStorageUsed = localStorage.getItem('todo-list-box-ever-loaded') || 'false'
            Utility.log('local storage used', localStorageUsed)

            if (localStorageUsed === 'false') {
                // disabling chrome storage. refer to https://stackoverflow.com/questions/28465384/how-is-chrome-storage-affected-when-an-extension-is-updated
                // const rawItems = JSON.parse((await Utility.chromeStorage.get('todo-list-items')) || '[]')
                
                const rawItems = JSON.parse(localStorage.getItem('todo-list-items') || '[]')
                const items = rawItems.filter((d) => d.text)
                Utility.log('found cached sync storage todo list items', items)

                if (items.length > 0) {
                    localStorage.setItem('todo-list-items', JSON.stringify(items))
                } else {
                    localStorage.setItem('todo-list-items', JSON.stringify([{
                        text: 'Senantiasa bersyukur dan berbuat baik',
                        checked: true
                    }, {
                        text: '',
                        checked: false
                    }]))
                }

                localStorage.setItem('todo-list-status', 'true')
                localStorage.setItem('todo-list-box-ever-loaded', 'true')
            }
                
            this.ensureTodoListBoxVisibility.call(this)
            this.ensureTodoListItemsAppear.call(this)

            if (chrome.tabs) {
                chrome.tabs.onActivated.addListener(() => {
                    this.ensureTodoListBoxVisibility.call(this)
                    this.ensureTodoListItemsAppear.call(this)
                })
            }
        },

        // render TODO list items
        async ensureTodoListItemsAppear() {
            $('#todo-list .items .item').remove()

            const items = JSON.parse(localStorage.getItem('todo-list-items') || '[]')
            if (items.length == 0) {
                this.insertTodoListItem.call(this)
                this.ensureTodoListItemsAppear.call(this)
                return
            }

            items.forEach((each) => {
                $('#todo-list .items').prepend($(`
                    <div class="item ${each.checked ? 'checked' : ''}">
                        <input type="checkbox" class="item-checkbox" ${each.checked ? 'checked' : ''}>
                        <span class="item-textbox" contenteditable="true" data-placeholder="Tulis sesuatu">${each.text.replace(/\n/gi, '<br>')}</span>
                        <button class="delete"><i class="fa fa-close"></i></button>
                    </div>
                `))
            })
        },

        // ensure the TODO list items is always stored on cache
        async ensureTodoListItemsStored() {
            const items = $('#todo-list .items .item').toArray().reverse().map((each) => ({
                text: $(each).find('span[contenteditable]')[0].innerText,
                checked: $(each).find('input[type=checkbox]').prop('checked')
            }))
            localStorage.setItem('todo-list-items', JSON.stringify(items))

            // disabling chrome storage. refer to https://stackoverflow.com/questions/28465384/how-is-chrome-storage-affected-when-an-extension-is-updated
            // await Utility.chromeStorage.set('todo-list-items', JSON.stringify(items))
        },

        // insert new TODO item
        async insertTodoListItem() {
            let items = JSON.parse(localStorage.getItem('todo-list-items') || '[]')

            // ensure to have only one row of empty text on top
            if (items.length > 0) {
                if (!items[items.length - 1].text) {
                    return
                }
            }

            items.push({ checked: false, text: '' })
            localStorage.setItem('todo-list-items', JSON.stringify(items))

            // disabling chrome storage. refer to https://stackoverflow.com/questions/28465384/how-is-chrome-storage-affected-when-an-extension-is-updated
            // await Utility.chromeStorage.set('todo-list-items', JSON.stringify(items))
            
            this.ensureTodoListItemsAppear.call(this)
        },

        // contains event declarations for many TODO list operation
        async registerEventTodoList() {

            // event for hiding or showing the TODO list pane
            $('#todo-list .toggler').on('click', async () => {
                const value = localStorage.getItem('todo-list-status') || 'false'
                if (value === 'true') {
                    localStorage.setItem('todo-list-status', 'false')
                } else {
                    localStorage.setItem('todo-list-status', 'true')
                }
                
                this.ensureTodoListBoxVisibility.call(this)
            })

            // event for clicking add button
            $('#todo-list .add').on('click', (event) => {
                this.insertTodoListItem.call(this)
                $('#todo-list .items .item:eq(0) span[contenteditable]').focus()
                console.log('event', event)
            })
            
            // calculate TODO list item based on screen size
            $('#todo-list .items').height($(window).height() - 97 - 37)
            $('#todo-list .items').on('keyup', '.item span[contenteditable]', Utility.debounce(() => {
                this.ensureTodoListItemsStored.call(this)
            }, 300))
            
            // event for deleting TODO item
            $('#todo-list .items').on('click', '.item button', (event) => {
                $(event.currentTarget).closest('.item').remove()
                this.ensureTodoListItemsStored.call(this)
            })

            // event handler for textbox click
            let lastClickedElement = null
            $('#todo-list .items').on('click', '.item', (event) => {
                const $textbox = $(event.target).find('span[contenteditable]')
                if ($textbox.length) {
                    $textbox.focus()
                    lastClickedElement = $textbox[0]
                } else {
                    if (lastClickedElement !== event.target) {
                        $(event.currentTarget).focus()
                        Utility.selectElementContents(event.target)
                    }
                    lastClickedElement = event.target
                }
            })
            
            // // event for auto highlight/select text on TODO item click 
            // $('#todo-list .items').on('click', '.item span[contenteditable]', (event) => {
            //     Utility.selectElementContents(event.currentTarget)
            // })

            // event handler for checking/unchecking TODO item
            $('#todo-list .items').on('click', '.item-checkbox', (event) => {
                const $checkbox = $(event.currentTarget).find('input[type="checkbox"]')
                $checkbox.prop('checked', !$checkbox.prop('checked'))
                this.ensureTodoListItemsStored.call(this)
            })
        },

        // =========== UPDATE MESSAGE
    
        // show update message on extension/plugin update
        showExtensionUpdateAndChangelogsModal() {
            const keyOfUpdateMessage = `changelogs-message-${Constant.meta.version}`
            if (localStorage.getItem(keyOfUpdateMessage)) {
                return
            }

            const isUpdate = Object.keys(localStorage).filter((d) => d.indexOf('changelogs-message') > -1).length > 0
            const openingMessage = isUpdate
                ? `${Constant.meta.appName} anda telah di update ke versi ${Constant.meta.version}.`
                : `${Constant.meta.appName} ${Constant.meta.version} berhasil di-install.`

            const text = `
                <div class="modal-info">
                    <p>${openingMessage} Changelogs:</p>
                    <ul>
                        ${Constant.app.changelogs.map((d) => `<li>${d}</li>`).join('')}
                    </ul>
                </div>
            `
    
            Swal.fire({
                type: 'info',
                title: `Version Update ${Constant.meta.version}`,
                html: text,
                showConfirmButton: false,
                allowOutsideClick: true
            });
    
            localStorage.setItem(keyOfUpdateMessage, true)
        },
    
        // =========== INIT
        
        // orchestrate everything
        init() {
            console.log(`${Constant.meta.appName} ${Constant.meta.version}`)

            this.renderPrayerTimePlaceholder.call(this)
            this.renderDateTime.call(this)
            this.getDataBackgroundThenRender.call(this)
            this.getDataContentThenRender.call(this)
            this.loadLocationAndPrayerTimeThenRender.call(this)
            this.registerEventForForceLoadLocationAndPrayerTimes.call(this)
            this.registerEventForInternetAvailabilityStatus.call(this)
            this.registerEventForFooter.call(this)
            this.registerEventForAlarm.call(this)
            this.registerEventTodoList.call(this)
            this.ensureTodoListBoxVisibilityOnPageActive.call(this)
            this.ensureTodoListItemsAppear.call(this)
            this.showExtensionUpdateAndChangelogsModal.call(this)
        }
    }
    
    window.onload = function () {
        App.init()
    }
})()