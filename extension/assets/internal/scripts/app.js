(() => {
    const App = {
    
        // =========== CLOCK
    
        // render time to screen at start and every seconds
        renderDateTimeInterval: undefined,
        renderDateTime() {
            const doRenderDateTime = () => {
                const hour = Utility.now().format('HH')
                const minute = Utility.now().format('mm')
                const dayName = I18n.getText(`day${Utility.now().format('dddd')}`)
                const monthName = I18n.getText(`month${Utility.now().format('MMMM')}`)
                const tzAbbr = Utility.getCurrentTimezoneAbbreviation(this.geoLocationCountryCode)
                const dateFull = Utility.now().format('$1, DD $2 YYYY HH:mm:ss $3')
                    .replace('$1', dayName)
                    .replace('$2', monthName)
                    .replace('$3', tzAbbr)

                $('.time .hour').text(hour)
                $('.time .minute').text(minute)
                $('.date .text').text(dateFull)

                const monthHijr = I18n.getText(`monthHijr${Utility.now().format('iM')}`)
                const dateHijr = Utility.now().format('iD $1 iYYYY')
                    .replace('$1', monthHijr) + ' AH'
                $('.date-hijr .text').text(dateHijr)
            }

            doRenderDateTime()
            clearInterval(this.renderDateTimeInterval)
            this.renderDateTimeInterval = setInterval(doRenderDateTime, Utility.seconds(1))
        },
    
        // =========== LOCATION

        // global geolocation watch object
        geoLocationWatchObject: null,
        geoLocationCountryCode: 'id',

        // get master location data.
        // if location data ever been loaded once, then the cache will be used on next call
        async getDataMasterLocation() {
            const url = `data/data-location-id.json`
            const response = await Utility.fetch(url)
            const result = await response.json()
            return result
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

        activePrayerTimeDurationInMinute: 10,
        isLocationAndPrayerTimeError: false,

        // render player time placeholder.
        // used on the screen during loading data process
        renderPrayerTimePlaceholder() {
            this.isLocationAndPrayerTimeError = false
            $('.location .text').text('Loading ...')
            // $(`.prayer-time tbody`).css('visibility', 'hidden')

            Array(6).fill(0).forEach((each, i) => {
                // $(`.prayer-time tbody tr.prayer-time-row:eq(${i})`).css('visibility', 'hidden')
                $(`.prayer-time tbody tr.prayer-time-row:eq(${i}) td:eq(0)`).html('')
                $(`.prayer-time tbody tr.prayer-time-row:eq(${i}) td:eq(1)`).html('')
                $(`.prayer-time tbody tr.prayer-time-row:eq(${i}) td:eq(2)`).html('')
            })
            
            // $(`.prayer-time tbody tr.prayer-time-row:eq(0)`).css('visibility', 'visible')
            $(`.prayer-time tbody tr.prayer-time-row:eq(0) td:eq(0)`).html('<span class="placeholder">&nbsp;Loading ...</span>')

            $(`.prayer-time tbody tr.prayer-time-row.active`).removeClass('active')
            
            $('.prayer-time tbody tr.remaining-time td').html('');
            $('.prayer-time tbody tr.remaining-time').hide();
        },

        // render player time error.
        renderPrayerTimeError(err) {
            this.isLocationAndPrayerTimeError = true
            $('.location .text').text('Error ❌')

            Array(6).fill(0).forEach((each, i) => {
                $(`.prayer-time tbody tr.prayer-time-row:eq(${i}) td:eq(0)`).html('')
                $(`.prayer-time tbody tr.prayer-time-row:eq(${i}) td:eq(1)`).html('')
                $(`.prayer-time tbody tr.prayer-time-row:eq(${i}) td:eq(2)`).html('')
            })
            
            $(`.prayer-time tbody tr.prayer-time-row:eq(0) td:eq(0)`).html(`<span class="placeholder">&nbsp;Error ❌</span>`)
        },

        // get automatic prayer time
        prayerCoordinateCacheIndexKey: 'data-prayer-time-by-coordinate-index',
        prayerCoordinateCachePrefix: 'data-prayer-time-by-coordinate-',
        prayerCoordinateCacheLimit: 20,
        normalizePrayerCoordinateCacheIndex() {
            const allCoordinateKeys = Object.keys(localStorage)
                .filter((each) => each.indexOf(this.prayerCoordinateCachePrefix) == 0)
            let indexedKeys = []
            try {
                indexedKeys = JSON.parse(localStorage.getItem(this.prayerCoordinateCacheIndexKey) || '[]')
            } catch (err) {
                indexedKeys = []
            }

            const normalized = indexedKeys.filter((each) => allCoordinateKeys.includes(each))
            allCoordinateKeys.forEach((each) => {
                if (!normalized.includes(each)) {
                    normalized.push(each)
                }
            })

            return normalized
        },
        retainLastPrayerCoordinateCaches(latestKey = '') {
            const normalized = this.normalizePrayerCoordinateCacheIndex.call(this)
            const ordered = normalized.filter((each) => each != latestKey)
            if (latestKey) {
                ordered.push(latestKey)
            }

            const removeCount = Math.max(0, ordered.length - this.prayerCoordinateCacheLimit)
            const keysToRemove = ordered.slice(0, removeCount)
            keysToRemove.forEach((each) => localStorage.removeItem(each))

            const retained = ordered.slice(removeCount)
            localStorage.setItem(this.prayerCoordinateCacheIndexKey, JSON.stringify(retained))
        },
        removePrayerCoordinateCacheIndexItem(key) {
            const normalized = this.normalizePrayerCoordinateCacheIndex.call(this)
            const retained = normalized.filter((each) => each != key)
            localStorage.setItem(this.prayerCoordinateCacheIndexKey, JSON.stringify(retained))
        },
        async getPrayerTimesByCoordinate(latitude, longitude) {
            const key = `data-prayer-time-by-coordinate-${latitude}-${longitude}`
            if (latitude == 0 && longitude == 0) {
                localStorage.removeItem(key)
                this.removePrayerCoordinateCacheIndexItem.call(this, key)
            }

            this.retainLastPrayerCoordinateCaches.call(this, key)

            const data = await Utility.getLatestData(key, async (resolve) => {
                const month = parseInt(Utility.now().format('MM'), 10)
                const year = Utility.now().year()
                const url = `${Constant.app.baseUrlWebService}/muslimboard-api?v=${Constant.meta.version}&op=shalat-schedule-by-coordinate&latitude=${latitude}&longitude=${longitude}&month=${month}&year=${year}&browserID=${Utility.getBrowserUuid()}`
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
                this.removePrayerCoordinateCacheIndexItem.call(this, key)
                return false
            }

            // construct prayer time data then render
            const schedules = data.content.data.schedules.find((d) => d.date.gregorian.date == Utility.now().format('DD-MM-YYYY'))
            isDataFound = true
            if (!schedules) {
                isDataFound = false
            } else if (!schedules.timings) {
                isDataFound = false
            }
            if (!isDataFound) {
                localStorage.removeItem(key)
                this.removePrayerCoordinateCacheIndexItem.call(this, key)
                return false
            }

            this.retainLastPrayerCoordinateCaches.call(this, key)
            return data
        },

        // get prayer time by location id
        async getPrayerTimesByLocationID(province, kabko, locationID) {
            const key = `data-prayer-time-by-location-${locationID}`
            if (!province && !kabko) {
                localStorage.removeItem(key)
            }

            const data = await Utility.getLatestData(key, async (resolve) => {
                const month = parseInt(Utility.now().format('MM'), 10)
                const year = Utility.now().year()
                const url = `${Constant.app.baseUrlWebService}/muslimboard-api?v=${Constant.meta.version}&op=shalat-schedule-by-location&locationID=${locationID}&province=${province}&city=${kabko}&month=${month}&year=${year}&browserID=${Utility.getBrowserUuid()}`
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
            const schedules = data.content.data.schedules.find((d) => d.date.gregorian.date == Utility.now().format('DD-MM-YYYY'))
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
            localStorage.removeItem(this.prayerCoordinateCacheIndexKey)

            // remove prayer time cache
            Utility.removeLocalStorageItemsByPrefix((d) => d.indexOf('data-prayer-time') > -1)
        },

        // render prayer time to screen
        renderPrayerTimeInterval: undefined,
        renderPrayerTime(schedule) {
            let tzAbbr = Utility.getCurrentTimezoneAbbreviation(this.geoLocationCountryCode)
            
            const times = [
                { value: schedule.Fajr, label: I18n.getText('prayerTimeFajr') },
                { value: schedule.Sunrise, label: I18n.getText('prayerTimeSunrise') },
                { value: schedule.Dhuhr, label: I18n.getText('prayerTimeDhuhr') },
                { value: schedule.Asr, label: I18n.getText('prayerTimeAsr') },
                { value: schedule.Maghrib, label: I18n.getText('prayerTimeMaghrib') },
                { value: schedule.Isha, label: I18n.getText('prayerTimeIsha') },
            ]
            times.forEach((each, i) => {

                // use the returned tz from prayer times api
                if (each.value.indexOf(' ') > -1) {
                    tzAbbr = Utility.getFormattedTzAbbr(
                        each.value.split(' ').slice(1).join(' ')
                            .replace('(', '')
                            .replace(')', '')
                    )
                }

                $(`.prayer-time tbody tr.prayer-time-row:eq(${i})`).css('visibility', 'visible')
                $(`.prayer-time tbody tr.prayer-time-row:eq(${i}) td:eq(0)`).html(each.label)
                $(`.prayer-time tbody tr.prayer-time-row:eq(${i}) td:eq(1)`).html(each.value.slice(0, 5))
                $(`.prayer-time tbody tr.prayer-time-row:eq(${i}) td:eq(2)`).html(tzAbbr)
            })
            
            // set alaram once loaded
            let isAlarmEverSet = false

            const doRenderPrayerTime = () => {
                if (this.isLocationAndPrayerTimeError) {
                    return
                }

                const hmFormatter = (str) => parseInt(str.slice(0, 5).replace(':', ''), 10)
                const nowHM = parseInt(Utility.now().add(-1 * this.activePrayerTimeDurationInMinute, 'minutes').format('HHmm'), 10)
                const fajrHM = hmFormatter(schedule.Fajr)
                const sunriseHM = hmFormatter(schedule.Sunrise)
                const dhuhrHM = hmFormatter(schedule.Dhuhr)
                const asrHM = hmFormatter(schedule.Asr)
                const maghribHM = hmFormatter(schedule.Maghrib)
                const ishaHM = hmFormatter(schedule.Isha)

                const ymdhmFormatter = (str) => moment(`${Utility.now().format('YYYY-MM-DD ')} ${str.slice(0, 5)}`, 'YYYY-MM-DD HH:mm').toDate().getTime()
                const fajrYMDHM = ymdhmFormatter(schedule.Fajr)
                const sunriseYMDHM = ymdhmFormatter(schedule.Sunrise)
                const dhuhrYMDHM = ymdhmFormatter(schedule.Dhuhr)
                const asrYMDHM = ymdhmFormatter(schedule.Asr)
                const maghribYMDHM = ymdhmFormatter(schedule.Maghrib)
                const ishaYMDHM = ymdhmFormatter(schedule.Isha)

                const nowYYYYMMDD = Date.now()
                
                $('.prayer-time tbody tr').removeClass('active')

                const createAlarm = (time, text) => {
                    if (!(!isAlarmEverSet || Utility.now().seconds() % 10  == 0)) {
                        return
                    }

                    if (chrome.alarms) {
                        chrome.alarms.clear()
    
                        const exactTime = time
                        if (exactTime >= nowYYYYMMDD) {
                            const exactMessage = I18n.getText('alarmExactPrayerTimeMessageTemplate')
                                .replace('$1', text)
                                .replace('$2', $('.location .text').text())
                            chrome.alarms.create(exactMessage, { when: exactTime })
                        }
    
                        const almostTime = moment(time).add(-1 * this.activePrayerTimeDurationInMinute, 'minutes').toDate().getTime()
                        if (almostTime >= nowYYYYMMDD) {
                            const almostMessage = I18n.getText('alarmAlmostPrayerTimeMessageTemplate')
                                .replace('$1', text)
                                .replace('$2', $('.location .text').text())
                            chrome.alarms.create(almostMessage, { when: almostTime })
                        }
    
                        isAlarmEverSet = true
                    }
                }

                if (nowHM >= ishaHM) {
                    // do nothing

                } else if (nowHM >= maghribHM) {
                    const $tr = $('.prayer-time tbody tr.prayer-time-row:eq(5)')
                    $tr.addClass('active')
                    createAlarm(ishaYMDHM, $tr.find('td:eq(0)').text())

                } else if (nowHM >= asrHM) {
                    const $tr = $('.prayer-time tbody tr.prayer-time-row:eq(4)')
                    $tr.addClass('active')
                    createAlarm(maghribYMDHM, $tr.find('td:eq(0)').text())
                    
                } else if (nowHM >= dhuhrHM) {
                    const $tr = $('.prayer-time tbody tr.prayer-time-row:eq(3)')
                    $tr.addClass('active')
                    createAlarm(asrYMDHM, $tr.find('td:eq(0)').text())

                } else if (nowHM >= sunriseHM) {
                    const $tr = $('.prayer-time tbody tr.prayer-time-row:eq(2)')
                    $tr.addClass('active')
                    createAlarm(dhuhrYMDHM, $tr.find('td:eq(0)').text())

                } else if (nowHM >= fajrHM) {
                    const $tr = $('.prayer-time tbody tr.prayer-time-row:eq(1)')
                    $tr.addClass('active')
                    createAlarm(sunriseYMDHM, $tr.find('td:eq(0)').text())

                } else {
                    const $tr = $('.prayer-time tbody tr:eq(0)')
                    $tr.addClass('active')
                    createAlarm(fajrYMDHM, $tr.find('td:eq(0)').text())
                }

                this.renderRemainingPrayerTime.call(this);
            }

            doRenderPrayerTime()
            clearInterval(this.renderPrayerTimeInterval)
            this.renderPrayerTimeInterval = setInterval(doRenderPrayerTime, Utility.seconds(1))
        },

        // render remaining time until the next prayer time
        // re-render title to add remaining time until the next prayer time
        renderRemainingPrayerTimeInterval: undefined,
        renderRemainingPrayerTime() {

            const doRenderRemainingPrayerTime = () => {
                $('.prayer-time tbody tr.remaining-time td').html('');
                $('.prayer-time tbody tr.remaining-time').hide();

                // skip if no upcoming prayer detected
                const $activeTr = $('.prayer-time tbody tr.active');
                if ($activeTr.length === 0) {
                    return
                }
            
                // claculate remaining time

                const dateTimeFormat = Utility.now().format("YYYY-MM-DD $1")

                const activePrayerTimeStr = $activeTr.find('td:eq(1)').text();
                const activePrayerDateTime = dateTimeFormat.replace("$1", activePrayerTimeStr);
                const activePrayerDateTimeUnix = moment(activePrayerDateTime).unix();
                
                const currentTimeStr = Utility.now().format("HH:mm")
                const currentDateTime = dateTimeFormat.replace("$1", currentTimeStr);
                const currentDateTimeUnix = moment(currentDateTime).unix();

                const prayerName = $activeTr.find('td:eq(0)').text();

                const offset = Utility.now().utcOffset() * 60
                let timeDifference = activePrayerDateTimeUnix - currentDateTimeUnix;
                const remainingTime = moment.unix(timeDifference - offset);

                // generate remaining time info in friendly format accordingly
                let remainingTimeText = ""
                if (timeDifference < 60 && timeDifference >= (-60 * this.activePrayerTimeDurationInMinute)) {
                    remainingTimeText = I18n.getText('prayerTimeNextRemainingTextNow')
                        .replace('$1', prayerName)
                } else if (parseInt(remainingTime.format('H'), 10) > 0 && parseInt(remainingTime.format('m'), 10) > 0) {
                    remainingTimeText = I18n.getText('prayerTimeNextRemainingTextHM')
                        .replace('$1', remainingTime.format('H'))
                        .replace('$2', remainingTime.format('m'))
                } else if (parseInt(remainingTime.format('m'), 10) > 0) {
                    remainingTimeText = I18n.getText('prayerTimeNextRemainingTextM')
                        .replace('$1', remainingTime.format('m'))
                }

                // skip displaying remaining time info if there nothing needs to be displayed
                if (!remainingTimeText) {
                    return
                }

                // render the info to screen
                $('.prayer-time tbody tr.active + tr.remaining-time').show()
                $('.prayer-time tbody tr.active + tr.remaining-time td').html(`<div>${remainingTimeText}</div>`);
                document.title = `${Constant.meta.appName} - ${prayerName} ${remainingTimeText}`
            }
            
            doRenderRemainingPrayerTime()
            clearInterval(this.renderRemainingPrayerTimeInterval)
            this.renderRemainingPrayerTimeInterval = setInterval(doRenderRemainingPrayerTime, Utility.seconds(1))
        },
    
        // =========== BACKGROUND
        
        // store selected background image
        selectedBackground: false,

        // store next background image
        nextSelectedBackground: false,
        backgroundImageCacheInFlight: new Set(),
        backgroundImageCacheUrlMap: {},
        revokeCachedBackgroundImageUrl(url) {
            if (!url || String(url).indexOf('blob:') !== 0) {
                return
            }

            try {
                URL.revokeObjectURL(url)
            } catch (err) {
                Utility.error(err)
            }
        },
        isRemoteBackground(background) {
            return String(background?.url || '').indexOf('http') === 0 && !background.urlLocal
        },
        async hydrateCachedBackgroundImages(data) {
            const content = Array.isArray(data?.content) ? data.content : []
            const hydratedContent = await Promise.all(content.map(async (background) => {
                if (!this.isRemoteBackground.call(this, background)) {
                    return background
                }

                const cached = await Utility.indexedDb.get(background.url)
                if (!cached?.blob) {
                    return background
                }

                try {
                    const cacheKey = background.url
                    const urlLocal = this.backgroundImageCacheUrlMap[cacheKey] || URL.createObjectURL(cached.blob)
                    this.backgroundImageCacheUrlMap[cacheKey] = urlLocal
                    return {
                        ...background,
                        urlLocal,
                    }
                } catch (err) {
                    Utility.error(err)
                    return background
                }
            }))

            return {
                ...data,
                content: hydratedContent,
            }
        },
        async cacheBackgroundImages(backgrounds) {
            const content = Array.isArray(backgrounds) ? backgrounds : []
            for (const background of content) {
                if (!this.isRemoteBackground.call(this, background)) {
                    continue
                }

                const cacheKey = background.url
                if (this.backgroundImageCacheInFlight.has(cacheKey)) {
                    continue
                }

                this.backgroundImageCacheInFlight.add(cacheKey)
                try {
                    const urlObject = new URL(background.url)
                    if (urlObject.origin !== window.location.origin && urlObject.origin !== new URL(Constant.app.baseUrlGithub).origin) {
                        continue
                    }

                    const cached = await Utility.indexedDb.get(cacheKey)
                    if (cached?.blob) {
                        continue
                    }

                    Utility.log('caching background image', background.id)
                    const response = await Utility.fetch(background.url)
                    if (!response.ok) {
                        throw new Error(`background image fetch failed: ${background.url}`)
                    }
                    const blob = await response.blob()
                    await Utility.indexedDb.set(cacheKey, blob)
                } catch (err) {
                    Utility.error(err)
                } finally {
                    this.backgroundImageCacheInFlight.delete(cacheKey)
                }
            }
        },

        preloadBackgroundImage(url) {
            return new Promise((resolve, reject) => {
                const preloader = new Image()
                const timeout = setTimeout(() => {
                    preloader.onload = null
                    preloader.onerror = null
                    reject(new Error(`background image load timeout: ${url}`))
                }, Constant.app.timeoutDuration)

                preloader.onload = () => {
                    clearTimeout(timeout)
                    resolve(url)
                }
                preloader.onerror = () => {
                    clearTimeout(timeout)
                    reject(new Error(`background image failed to load: ${url}`))
                }
                preloader.src = url
            })
        },

        // get background image data then render it to screen.
        // if background image data ever been loaded once, then the cache will be used on next call
        async getDataBackgroundThenRender() {

            // load local data first so the first paint can use packaged images immediately.
            // remote data is then merged in the background for the next cycle.
            try {
                Utility.log('fetching local data background')
                const url = `data/data-background.json`
                const response = await Utility.fetch(url)
                const data = await response.json()
                const hydratedData = await this.hydrateCachedBackgroundImages.call(this, data)
                this.updateBackground.call(this, hydratedData)
                this.cacheBackgroundImages.call(this, hydratedData.content)

                ;(async () => {
                    try {
                        Utility.log('fetching remote data background')
                        const key = `data-background-remote-${Constant.meta.version}`
                        const remoteData = await Utility.getLatestData(key, async (resolve) => {
                            const remoteUrl = `${Constant.app.baseUrlGithub}/data-background.json?v=${Constant.meta.version}.${Utility.now().format('YYYY-MM-DD')}`
                            const remoteResponse = await Utility.fetch(remoteUrl)
                            const result = await remoteResponse.json()
                            resolve(result)
                        })

                        if (Object.keys(remoteData?.content || {}).length > 0) {
                            const hydratedRemoteData = await this.hydrateCachedBackgroundImages.call(this, remoteData)
                            const currentSelectedBackgroundId = this.selectedBackground?.id
                            const currentNextSelectedBackgroundId = this.nextSelectedBackground?.id
                            const nextBackgroundUrls = new Set((hydratedRemoteData.content || []).map((each) => each.url))

                            data.version = hydratedRemoteData.version || data.version
                            data.content = hydratedRemoteData.content

                            Object.keys(this.backgroundImageCacheUrlMap).forEach((cacheKey) => {
                                const cachedUrl = this.backgroundImageCacheUrlMap[cacheKey]
                                if (!nextBackgroundUrls.has(cacheKey)) {
                                    this.revokeCachedBackgroundImageUrl.call(this, cachedUrl)
                                    delete this.backgroundImageCacheUrlMap[cacheKey]
                                }
                            })

                            if (currentSelectedBackgroundId) {
                                const currentSelectedBackground = data.content.find((each) => each.id == currentSelectedBackgroundId)
                                if (currentSelectedBackground) {
                                    this.selectedBackground = currentSelectedBackground
                                }
                            }

                            if (currentNextSelectedBackgroundId) {
                                const currentNextSelectedBackground = data.content.find((each) => each.id == currentNextSelectedBackgroundId)
                                if (currentNextSelectedBackground) {
                                    this.nextSelectedBackground = currentNextSelectedBackground
                                }
                            }

                            this.cacheBackgroundImages.call(this, hydratedRemoteData.content)
                        }
                    } catch (err) {
                        Utility.error(err)
                    }
                })()
                return
            } catch (err) {
                Utility.error(err)
            }

            // in case of failure, use remote data
            try {
                Utility.log('fetching remote data background')
                const key = `data-background-remote-${Constant.meta.version}`
                        const data = await Utility.getLatestData(key, async (resolve) => {
                    const remoteUrl = `${Constant.app.baseUrlGithub}/data-background.json?v=${Constant.meta.version}.${Utility.now().format('YYYY-MM-DD')}`
                    const remoteResponse = await Utility.fetch(remoteUrl)
                    const result = await remoteResponse.json()
                    resolve(result)
                })
                if (Object.keys(data?.content || {}).length > 0) {
                    const hydratedData = await this.hydrateCachedBackgroundImages.call(this, data)
                    this.updateBackground.call(this, hydratedData)
                    this.cacheBackgroundImages.call(this, hydratedData.content)
                    return
                }
            } catch (err) {
                Utility.error(err)
            }
        },

        // update background images randomly on every X interval
        async updateBackground(data) {

            // get background url. use local image if exists
            const doGetBackgroundURL = (bg) => (bg.urlLocal) ? bg.urlLocal : bg.url

            // update author name
            const updateBackgroundAthorName = (background) => {
                if (background.hasOwnProperty('author')) {
                    $('.photographer').html(background.author.name)
                } else {
                    $('.photographer').html(background.source.split('http://').reverse()[0])
                }
                $('.photographer').closest('a').attr('href', background.source)
            }

            // the doUpdateBackgroundAndPreloadNextImage below is used to manage the image and text transition
            const doUpdateBackgroundAndPreloadNextImage = () => {
                Utility.log('preparing next image')

                this.preloadBackgroundImage.call(this, doGetBackgroundURL(this.nextSelectedBackground))
                    .then(() => {
                        Utility.log('next image preloaded', doGetBackgroundURL(this.nextSelectedBackground))

                        setTimeout(() => {
                            this.updateBackground.call(this, data)
                        }, Constant.app.updateBackgroundDelayDuration)
                    })
                    .catch((err) => {
                        Utility.error(err)
                        this.nextSelectedBackground = Utility.randomFromArray('background', data.content, this.selectedBackground)
                        doUpdateBackgroundAndPreloadNextImage()
                    })
            }

            // if certain image is currently appearing on screen,
            // then the transition need to be smooth.
            // meanwhile at first load, local image will be used to make the image loading process faster
            if (this.selectedBackground) {
                this.selectedBackground = this.nextSelectedBackground
                    this.nextSelectedBackground = Utility.randomFromArray('background', data.content, this.selectedBackground)
    
                $('#transitioner .content')
                    .css('opacity', '0')
                    .css('background-image', `url("${doGetBackgroundURL(this.selectedBackground)}")`)
    
                const position = this.selectedBackground.position
                $('#transitioner .content')
                    .css('opacity', '0')
                    .css('background-position', position ? `${position.horizontal} ${position.vertical}` : '')
    
                await Utility.sleep(0.1)
    
                $('#transitioner .content').animate({
                    'opacity': 1,
                }, 'slow', async () => {
                    $('#background .content').css('background-image', `url("${doGetBackgroundURL(this.selectedBackground)}")`)
                    $('#background .content').css('background-position', position ? `${position.horizontal} ${position.vertical}` : '')
    
                    await Utility.sleep(0.1)
    
                    $('#transitioner .content').css('opacity', '0')
    
                    doUpdateBackgroundAndPreloadNextImage()
                    updateBackgroundAthorName(this.selectedBackground)
                })
            } else {
                const localBackgrounds = data.content.filter((d) => doGetBackgroundURL(d).indexOf('http') == -1)
                const doUpdateBackgroundForTheFirstTime = () => {
                    $('#background .content').css('background-image', `url("${doGetBackgroundURL(this.selectedBackground)}")`)
        
                    const position = this.selectedBackground.position
                    if (position) {
                        $('#background .content').css('background-position', `${position.horizontal} ${position.vertical}`)
                    } else {
                        $('#background .content').css('background-position', '')
                    }

                    doUpdateBackgroundAndPreloadNextImage()
                    updateBackgroundAthorName(this.selectedBackground)
                }

                if (localBackgrounds.length > 0) {
                    // Show a local background immediately on the first load.
                    // The remote background will be preloaded in the background and used for the next transition.
                    this.selectedBackground = Utility.randomFromArray('background', localBackgrounds)
                    this.nextSelectedBackground = Utility.randomFromArray('background', data.content, this.selectedBackground)
                    doUpdateBackgroundForTheFirstTime()
                } else {
                    this.selectedBackground = Utility.randomFromArray('background', data.content)
                    if (!this.selectedBackground) {
                        return
                    }
                    this.nextSelectedBackground = Utility.randomFromArray('background', data.content, this.selectedBackground)

                    // right after certain image loaded, trigger preload for next image,
                    // this approach is to ensure when the next image transition is happening,
                    // it's need to happen smoothly.
                    // on rare occasion the preload might failing due to various reason such slow internet,
                    // and if that situation is happening, use the local image when one exists.
                    this.preloadBackgroundImage.call(this, doGetBackgroundURL(this.selectedBackground))
                        .then(() => {
                            Utility.log('next image preloaded', doGetBackgroundURL(this.selectedBackground))
                            doUpdateBackgroundForTheFirstTime()
                        })
                        .catch((err) => {
                            Utility.error(err)

                            const fallbackBackground = Utility.randomFromArray(
                                'background',
                                data.content.filter((d) => doGetBackgroundURL(d).indexOf('http') == -1),
                                this.selectedBackground
                            )

                            if (fallbackBackground) {
                                this.selectedBackground = fallbackBackground
                                this.nextSelectedBackground = Utility.randomFromArray('background', data.content, this.selectedBackground)
                            }

                            doUpdateBackgroundForTheFirstTime()
                        })
                }
            }
        },
    
        // =========== QUOTE CONTENT
        
        // store selected content
        selectedContent: false,

        // get data content then render it on screen.
        // if background image data ever been loaded once, then the cache will be used on next call
        async getDataContentThenRender() {

            // load data from remote url
            try {
                Utility.log(`fetching remote data (${I18n.getSelectedLocale()}) content`)
                const key = `data-content-${I18n.getSelectedLocale()}-remote-${Constant.meta.version}`
                const data = await Utility.getLatestData(key, async (resolve) => {
                    const url = `${Constant.app.baseUrlGithub}/data-content-${I18n.getSelectedLocale()}.json?v=${Constant.meta.version}.${Utility.now().format('YYYY-MM-DD')}`
                    const response = await Utility.fetch(url)
                    const result = await response.json()
                    resolve(result)
                })
                if (Object.keys(data?.content || {}).length > 0) {
                    this.updateContent.call(this, data.content)
                    return
                } 
            } catch (err) {
                Utility.error(err)
            }

            // in case of failure, use local data
            try {
                Utility.log(`fetching local data (${I18n.getSelectedLocale()}) content`)
                const url = `data/data-content-${I18n.getSelectedLocale()}.json`
                const response = await Utility.fetch(url)
                const data = await response.json()
                this.updateContent.call(this, data)
                return
            } catch (err) {
                Utility.error(err)
            }

            // in case of failure (due to missing localized content or other reason), use english local content
            Utility.log('fetching local data (en) content')
            const url = `data/data-content-en.json`
            const response = await Utility.fetch(url)
            const data = await response.json()
            this.updateContent.call(this, data)
        },

        // update content. it's the quote and other text related to it.
        updateContent(data) {
            this.selectedContent = Utility.randomFromArray('content', data.content, this.selectedContent)
            const content = this.selectedContent
            const author = data.author[content.author]
    
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
                                throw new Error(I18n.getText('promptErrorFailToGetPrayerTimesMessage'))
                            }
                        }

                        this.geoLocationCountryCode = (data.content.data.countryCode || 'id')
                
                        const address = data.content.data.address
                        this.renderLocationText.call(this, address)

                        const schedule = data.content.data.schedules.find((d) => d.date.gregorian.date == Utility.now().format('DD-MM-YYYY')).timings
                        this.renderPrayerTime.call(this, schedule)
                    }

                    // on automatic mode, first get the current coordinate
                    const location = await Utility.getCurrentLocationCoordinate()
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

                    // kemenag bimaislam website (proxied by our serverless backend) is used to get the prayer time on manual mode.
                    // if prayer time data ever been loaded once, then the cache will be used on next call
                    const data =  await this.getPrayerTimesByLocationID(province, kabko, id)
                    if (!data) {
                        this.clearPrayerTimesCache.call(this)
                        throw new Error(I18n.getText('promptErrorFailToGetPrayerTimesMessage'))
                    }

                    this.geoLocationCountryCode = (data.content.data.countryCode || 'id')
                    const schedule = data.content.data.schedules.find((d) => d.date.gregorian.date == Utility.now().format('DD-MM-YYYY')).timings
                    this.renderPrayerTime.call(this, schedule)
                }
            } catch (err) {
                if (err instanceof Error) {
                    err = err.message
                }
                Utility.error(err)
                this.renderPrayerTimeError.call(this, err)
                $.toast({
                    heading: 'Error',
                    text: err,
                    showHideTransition: 'fade',
                    icon: 'error',
                    position: 'top-center',
                    hideAfter: 10000
                })
            }
        },

        // this function containt many event definition for any location and prayer time related operation
        // for both manual mode and automatic mode
        async registerEventForForceLoadLocationAndPrayerTimes() {

            // get master location data
            const locations = await this.getDataMasterLocation.call(this)

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

                let text = I18n.getText('promptConfirmationMessageToActivateAutoDetectLocation')
                let buttonText = I18n.getText('promptConfirmationYesToActivateAutoDetectLocation')

                const isCachedCoordinateExists = localStorage.getItem('data-coordinate-cache') ? true : false
                if (this.isUsingAutomaticLocation.call(this) && isCachedCoordinateExists) {
                    text = I18n.getText('promptConfirmationMessageToRefreshAutoDetectLocation')
                    buttonText = I18n.getText('promptConfirmationYesToRefreshAutoDetectLocation')
                }

                Swal.fire({
                    icon: 'info',
                    title: I18n.getText('footerMenuAutomaticLocationDetection'),
                    html: text,
                    showConfirmButton: true,
                    showCancelButton: true,
                    confirmButtonText: buttonText,
                    cancelButtonText: I18n.getText('promptConfirmationCancel')
                }).then(async (result) => {
                    if (!result.isConfirmed) {
                        return
                    }

                    // remove automatic location cache
                    const location = await Utility.getCurrentLocationCoordinate()
                    const { latitude, longitude } = location.coords
                    localStorage.removeItem(`data-prayer-time-by-coordinate-${latitude}-${longitude}`)

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
                    <p>${I18n.getText('promptManualLocationSelectionTitle')}</p>
                    <form class='manual-geolocation'>
                        <div class="row">
                            <label>${I18n.getText('promptManualLocationProvinceTitle')}</label>
                            <select required class="dropdown-province">
                                ${renderDropdownOption(locations, 'provinsi', 'provinsi', I18n.getText('promptManualLocationProvinceSelectionLabel'))}
                            </select>
                        </div>
                        <div class="row">
                            <label>${I18n.getText('promptManualLocationCityTitle')}</label>
                            <select required class="dropdown-city">
                                <option value="">---- ${I18n.getText('promptManualLocationProvinceOptionPlaceholderLabel')} ----</option>
                            </select>
                        </div>
                    </form>
                `

                let province = ''
                let kabko = ''
                let locationID = ''

                // show the manual location picker
                Swal.fire({
                    icon: 'info',
                    title: I18n.getText('footerMenuManualLocationSelection'),
                    html: text,
                    showConfirmButton: true,
                    showCancelButton: true,
                    confirmButtonText: I18n.getText('promptConfirmationSave'),
                    cancelButtonText: I18n.getText('promptConfirmationCancel'),
                    preConfirm: () => {
                        province = $('.dropdown-province').val()
                        kabko = $('.dropdown-city').children('option').filter(':selected').text()
                        locationID = $('.dropdown-city').val()

                        return Promise.resolve()
                    }
                }).then((result) => {
                    if (!result.isConfirmed) {
                        return
                    }

                    if (!province) {
                        alert(I18n.getText('promptErrorUnableToSaveDueToEmptyProvince'))
                        return
                    } else if (!kabko || (kabko || '').includes('----')) {
                        alert(I18n.getText('promptErrorUnableToSaveDueToEmptyCity'))
                        return
                    }

                    // delete previously cached selected location data.
                    // replace it with the newly selected location
                    const key = `data-prayer-time-by-location-${locationID}`
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
                        ${renderDropdownOption(cities, 'id', 'kabko', I18n.getText('promptManualLocationCitySelectionLabel'))}
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
                url: `${Constant.app.baseUrlWebService}/muslimboard-api?v=${Constant.meta.version}&op=ping&browserID=${Utility.getBrowserUuid()}`,
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

        // apply event handler for change language
        registerEventForChangeLanguageButton() {

            let swalChangeLanguage = null

            // on info button click, show the info modal
            $('.change-language').on('click', (e) => {
                e.preventDefault();

                const items = Object.keys(I18n.mapping.languageName).filter((d) => d !== 'en' && d !== 'id').map((d) => {
                    const lang = I18n.mapping.languageName[d]
                    if (lang.native) {
                        return `<li><a href='#' data-locale='${d}'><span>${lang.english} - ${lang.native}</span></a></li>`
                    } else {
                        return `<li><a href='#' data-locale='${d}'><span>${lang.english}</span></a></li>`
                    }
                })

                const text = `
                    <div class='modal-change-language'>
                        <ul>
                            <li><a href='#' data-locale='en'>English Language</a></li>
                            <li><hr /></li>
                            <li><a href='#' data-locale='id'>Bahasa Indonesia</a></li>
                            ${items.join('')}
                        </ul>
                    </div>
                `

                const langCode = I18n.getSelectedLocale().toUpperCase()
                const modalTitle = (langCode === 'EN')
                    ? `Change language`
                    : `Change language\n${I18n.getText('modalChangeLanguageHeader')}`
                swalChangeLanguage = Swal.fire({
                    icon: 'info',
                    title: modalTitle,
                    html: text,
                    showConfirmButton: false,
                    allowOutsideClick: false
                });
            });
            
            // handle change language event
            $('body').on('click', '.modal-change-language a', async (e) => {
                const locale = $(e.currentTarget).attr('data-locale')
                I18n.setSelectedLocale(locale)
                await swalChangeLanguage.close()
                location.reload()
            })

            if (I18n.getSelectedLocale(false)) {
                const langCode = I18n.getSelectedLocale().toUpperCase()
                const activeLanguage = (langCode === 'EN' || langCode === 'ID')
                    ? `${I18n.getText('languageName').english} ${langCode}`
                    : `${I18n.getText('languageName').native} ${langCode}`
                const text = `Change language (${activeLanguage})`
                // const text = I18n.getText('footerMenuChangeLanguage')
                $('.change-language span').text(text)
            }
        },

        // apply event handler for about us button
        registerEventForAboutUsButton() {

            // on info button click, show the info modal
            $('.info').on('click', (e) => {
                e.preventDefault();
                const shareText = `${Constant.meta.appName} - ${I18n.getText('appDescription')}`;
                const shareUrl = Constant.meta.homepageLink
                const encodedShareText = encodeURIComponent(shareText)
                const encodedShareUrl = encodeURIComponent(shareUrl)
                const shareTargets = [{
                    className: 'facebook',
                    title: 'Facebook share',
                    icon: 'fa-facebook-square',
                    href: `https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}&quote=${encodedShareText}`
                }, {
                    className: 'x-twitter',
                    title: 'X share',
                    icon: 'fa-twitter',
                    href: `https://twitter.com/intent/tweet?text=${encodedShareText}&url=${encodedShareUrl}`
                }, {
                    className: 'linkedin',
                    title: 'LinkedIn share',
                    icon: 'fa-linkedin',
                    href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}`
                }, {
                    className: 'whatsapp',
                    title: 'WhatsApp share',
                    icon: 'fa-whatsapp',
                    href: `https://wa.me/?text=${encodedShareText}%20${encodedShareUrl}`
                }, {
                    className: 'telegram',
                    title: 'Telegram share',
                    icon: 'fa-telegram',
                    href: `https://t.me/share/url?url=${encodedShareUrl}&text=${encodedShareText}`
                }]
                const shareButtons = shareTargets.map((target) => `
                    <a
                        class="btn-share ${target.className}"
                        target="_blank"
                        rel="noopener noreferrer"
                        href="${target.href}"
                        title="${target.title}"
                    >
                        <i class="fa ${target.icon}"></i>
                    </a>
                `).join('')

                const keyOfNewVersionMessage = `new-version-${Constant.meta.version}}`
                const newVersion = localStorage.getItem(keyOfNewVersionMessage) || ''
                const newVersionText = Utility.versionAsFloat(newVersion) > Utility.versionAsFloat(Constant.meta.version) ? `
                    <hr class='separator'>
                    <p>
                        ${I18n.getText('modalUpdateAvailableMuslimboardNotification')
                            .replace('$1', `<b>${newVersion}</b>`)}
                    </p>
                ` : ''

                const text = `
                    <div class='modal-info'>
                        <p>
                            ${I18n.getText('modalAboutUsText1').replace('$1', `
                                <a href='${Constant.meta.homepageLink}' target='_blank'>
                                    ${Constant.meta.appName}
                                </a>
                            `)}
                        </p>
                        <p>
                            ${I18n.getText('modalAboutUsText2')}
                        </p>
                        <p>
                            ${I18n.getText('modalAboutUsText3')
                                .replace('$1', `<a href='mailto:${Constant.maintainer.email}?subject=${Constant.meta.appName} ${Constant.meta.version} feedback'>${Constant.maintainer.email}</a>`)
                                .replace('$2', `<a href='https://github.com/novalagung/muslimboard' target='_blank'>GitHub</a>`)}
                        </p>
                        ${newVersionText}
                        <hr class='separator'>
                        <p>${I18n.getText('modalShareText')}</p>
                        <div class="share-container">
                            <div>
                                ${shareButtons}
                            </div>
                        </div>
                        <hr class='separator'>
                        <p class='copyright text-center'>
                            Maintained by <a href='https://www.linkedin.com/in/novalagung' target='_blank'>${Constant.maintainer.name}</a>
                            <br>
                            ${Utility.now().format("YYYY")} | <a href='${Constant.meta.homepageLink}' target='_blank'>${Constant.meta.homepageLink}</a>
                            <br>
                        </p>
                    </div>
                `

                Swal.fire({
                    icon: 'info',
                    title: [Constant.meta.appName, Constant.meta.version].join(" "),
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

        // =========== Todo List

        // toggle todo list visibility based on previously cached state
        ensureTodoListBoxVisibility() {
            const value = localStorage.getItem('todo-list-status') || 'false'
            if (value === 'true') {
                $('body').addClass('show-todo-list')
            } else {
                $('body').removeClass('show-todo-list')
            }
        },

        parseTodoListItems(rawItems) {
            try {
                const items = Array.isArray(rawItems) ? rawItems : JSON.parse(rawItems || '[]')
                if (!Array.isArray(items)) {
                    return []
                }

                return items
                    .filter((each) => each && typeof each === 'object')
                    .map((each) => ({
                        text: String(each.text || ''),
                        checked: !!each.checked
                    }))
            } catch (err) {
                Utility.error('failed to parse todo list items', err)
                return []
            }
        },

        parseTodoListImportItems(rawContent) {
            const content = String(rawContent || '').replace(/^\uFEFF/, '')
            const lines = content.split(/\r?\n/g)

            const unescapeTodoText = (text) => String(text || '')
                .replace(/\\\\/g, '\\')
                .replace(/\\n/g, '\n')
                .replace(/\\r/g, '\r')

            return lines.map((line) => String(line || '')).filter((line) => line.trim() !== '').map((line) => {
                const checkedMatch = line.match(/^\[(x|X)\]\s*(.*)$/)
                if (checkedMatch) {
                    return {
                        checked: true,
                        text: unescapeTodoText(checkedMatch[2])
                    }
                }

                const uncheckedMatch = line.match(/^\[\s*\]\s*(.*)$/)
                if (uncheckedMatch) {
                    return {
                        checked: false,
                        text: unescapeTodoText(uncheckedMatch[1])
                    }
                }

                return {
                    checked: false,
                    text: unescapeTodoText(line)
                }
            }).filter((each) => !!String(each.text || '').trim())
        },

        async promptTodoListImportAction(itemCount) {
            const title = I18n.getText('todoListImportPromptTitle')
            const text = I18n.getText('todoListImportPromptText').replace('$1', itemCount)
            const replaceText = I18n.getText('todoListImportReplaceAll')
            const insertText = I18n.getText('todoListImportInsert')
            const cancelText = I18n.getText('promptConfirmationCancel')

            const result = await Swal.fire({
                icon: 'question',
                title,
                text,
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: replaceText,
                denyButtonText: insertText,
                cancelButtonText: cancelText,
                confirmButtonColor: '#7066e0',
                denyButtonColor: '#7066e0'
            })

            if (result.isConfirmed) {
                return 'replace'
            }
            if (result.isDenied) {
                return 'insert'
            }
            return 'cancel'
        },

        hasTodoListContent: (items) => items.some((d) => String(d.text || '').trim()),

        isSafeTodoListLink(text) {
            try {
                const url = new URL(String(text || '').trim())
                return url.protocol === 'http:' || url.protocol === 'https:'
            } catch (err) {
                return false
            }
        },

        normalizeTodoListLink(text) {
            const raw = String(text || '').trim()
            if (!raw) {
                return null
            }

            const href = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
            if (!this.isSafeTodoListLink.call(this, href)) {
                return null
            }

            return {
                href,
                text: raw
            }
        },

        renderTodoListTextboxViewMode($textbox, rawText) {
            const text = String(rawText || '')
            $textbox
                .attr('contenteditable', 'false')
                .attr('data-raw-text', text)
                .removeClass('is-editing')
                .empty()

            const lines = text.split(/\n/g)
            const linkRegex = /((?:https?:\/\/|www\.)[^\s<]+)/gi
            const strictLinkChunkRegex = /^(?:https?:\/\/|www\.)[^\s<]+$/i
            lines.forEach((line, lineIndex) => {
                if (lineIndex > 0) {
                    $textbox.append('<br>')
                }

                const chunks = line.split(linkRegex)
                chunks.forEach((chunk) => {
                    if (!chunk) {
                        return
                    }

                    if (!strictLinkChunkRegex.test(chunk)) {
                        $textbox.append(document.createTextNode(chunk))
                        return
                    }

                    const normalizedLink = this.normalizeTodoListLink.call(this, chunk)
                    if (normalizedLink) {
                        const $link = $('<a></a>')
                            .attr('href', normalizedLink.href)
                            .attr('target', '_blank')
                            .attr('rel', 'noopener noreferrer')
                            .text(normalizedLink.text)
                        $textbox.append($link)
                        return
                    }

                    $textbox.append(document.createTextNode(chunk))
                })
            })
        },

        enableTodoListTextboxEditMode($textbox) {
            const pendingLinkTimer = $textbox.data('link-open-timer')
            if (pendingLinkTimer) {
                clearTimeout(pendingLinkTimer)
                $textbox.removeData('link-open-timer')
            }

            const rawText = String($textbox.attr('data-raw-text') || $textbox.text() || '')
            $textbox
                .attr('contenteditable', 'true')
                .addClass('is-editing')
                .text(rawText)

            const element = $textbox[0]
            if (element) {
                element.focus()
                const selection = window.getSelection()
                if (selection && document.createRange) {
                    const range = document.createRange()
                    range.selectNodeContents(element)
                    range.collapse(false)
                    selection.removeAllRanges()
                    selection.addRange(range)
                }
            }
        },

        // this function contains several things:
        // - setup default todo items data.
        // - ensure todo list visibility baseed on previously cached state.
        // - and render todo items
        async ensureTodoListBoxVisibilityOnPageActive() {
            // migrate chrome.storage.sync storage data to localStorage
            const localStorageUsed = localStorage.getItem('todo-list-box-ever-loaded') || 'false'
            Utility.log('local storage used', localStorageUsed)

            if (localStorageUsed === 'false') {
                let items = this.parseTodoListItems.call(this, localStorage.getItem('todo-list-items'))

                if (!this.hasTodoListContent(items)) {
                    // Migrate old todo data from chrome.storage.sync when localStorage is still empty.
                    let syncedItems = []
                    try {
                        syncedItems = this.parseTodoListItems.call(this, await Utility.chromeStorage.get('todo-list-items'))
                    } catch (err) {
                        Utility.error('failed to migrate todo list items from chrome storage', err)
                    }
                    if (this.hasTodoListContent(syncedItems)) {
                        items = syncedItems
                    }
                }

                Utility.log('found cached todo list items', items)

                if (!this.hasTodoListContent(items)) {
                    items = [{
                        text: I18n.mapping.todoListPlaceholder.id,
                        checked: true
                    }, {
                        text: I18n.getText('todoListLinkExample'),
                        checked: false
                    }, {
                        text: '',
                        checked: false
                    }]
                }

                localStorage.setItem('todo-list-items', JSON.stringify(items))
                localStorage.setItem('todo-list-status', 'true')
                localStorage.setItem('todo-list-box-ever-loaded', 'true')
            }

            this.ensureTodoListBoxVisibility.call(this)
            this.ensureTodoListItemsAppear.call(this)

            if (chrome.tabs && chrome.tabs.onActivated) {
                chrome.tabs.onActivated.addListener(() => {
                    this.ensureTodoListBoxVisibility.call(this)
                    this.ensureTodoListItemsAppear.call(this)
                })
            }
        },

        // render todo list items
        ensureTodoListItemsAppear() {
            $('#todo-list .items .item').remove()

            this.insertTodoListItem.call(this)

            const items = this.parseTodoListItems.call(this, localStorage.getItem('todo-list-items'))
            items.forEach((each) => {
                if (each.text === I18n.mapping.todoListPlaceholder.id) {
                    each.text = I18n.getText('todoListPlaceholder')
                }

                const $item = $('<div class="item"></div>')
                if (each.checked) {
                    $item.addClass('checked')
                }

                const $checkbox = $('<input type="checkbox" class="item-checkbox">').prop('checked', !!each.checked)
                const $textbox = $('<span class="item-textbox" contenteditable="false"></span>')
                    .attr('data-placeholder', I18n.getText('todoListEntryPlaceholder'))
                this.renderTodoListTextboxViewMode.call(this, $textbox, each.text)

                const $moveButton = $('<button class="move" title="Reorder todo item"><i class="fa fa-arrows"></i></button>')
                const $deleteButton = $('<button class="delete" title="Delete todo item"><i class="fa fa-close"></i></button>')

                $item.append($checkbox, $textbox, $moveButton, $deleteButton)
                $('#todo-list .items').prepend($item)
            })

            this.registerTodoListTooltips.call(this)
        },

        // ensure the todo list items is always stored on cache
        ensureTodoListItemsStored() {
            const items = $('#todo-list .items .item').toArray().reverse().map((each) => ({
                text: $(each).find('span[contenteditable]')[0].innerText,
                checked: $(each).find('input[type=checkbox]').prop('checked')
            }))
            localStorage.setItem('todo-list-items', JSON.stringify(items))

            // disabling chrome storage. refer to https://stackoverflow.com/questions/28465384/how-is-chrome-storage-affected-when-an-extension-is-updated
            // await Utility.chromeStorage.set('todo-list-items', JSON.stringify(items))
        },

        // insert new todo item
        insertTodoListItem() {
            const items = this.parseTodoListItems.call(this, localStorage.getItem('todo-list-items'))

            // ensure to have only one row of empty text on top
            if (items.length > 0 && !items[items.length - 1].text.trim()) {
                return
            }

            items.push({ checked: false, text: '' })
            localStorage.setItem('todo-list-items', JSON.stringify(items))

            // disabling chrome storage. refer to https://stackoverflow.com/questions/28465384/how-is-chrome-storage-affected-when-an-extension-is-updated
            // await Utility.chromeStorage.set('todo-list-items', JSON.stringify(items))
        },

        exportTodoListItems() {
            this.ensureTodoListItemsStored.call(this)

            const escapeTodoText = (text) => String(text || '')
                .replace(/\\/g, '\\\\')
                .replace(/\r/g, '\\r')
                .replace(/\n/g, '\\n')

            const exportedAt = Utility.now()
            const items = this.parseTodoListItems.call(this, localStorage.getItem('todo-list-items'))
                .filter((each) => each.text.trim())
            const lines = items.map((each) => {
                const text = escapeTodoText(each.text)
                return `${each.checked ? '[x]' : '[ ]'} ${text}`
            })
            const content = `${lines.join('\n')}\n`
            const blob = new Blob([content], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const $link = $('<a></a>')
                .attr('href', url)
                .attr('download', `muslimboard-todo-list-${exportedAt.format('YYYY-MM-DD-HH-mm-ss')}.txt`)

            $('body').append($link)
            $link[0].click()
            $link.remove()
            setTimeout(() => { URL.revokeObjectURL(url) }, 0)
        },

        readTodoListImportFile(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve(String(reader.result || ''))
                reader.onerror = () => reject(reader.error || new Error('failed to read todo list file'))
                reader.readAsText(file)
            })
        },

        async importTodoListItems(file) {
            try {
                const content = await this.readTodoListImportFile.call(this, file)
                const items = this.parseTodoListImportItems.call(this, content)

                if (!this.hasTodoListContent(items)) {
                    await Swal.fire({
                        icon: 'error',
                        title: I18n.getText('todoListImportFailedTitle'),
                        text: I18n.getText('todoListImportFailedText')
                    })
                    return false
                }

                const action = await this.promptTodoListImportAction.call(this, items.length)
                if (action === 'replace') {
                    localStorage.setItem('todo-list-items', JSON.stringify(items))
                } else if (action === 'insert') {
                    const existingItems = this.parseTodoListItems.call(this, localStorage.getItem('todo-list-items'))
                    const merged = existingItems
                        .concat(items)
                        .filter((each) => String(each.text || '').trim())
                    localStorage.setItem('todo-list-items', JSON.stringify(merged))
                } else {
                    return false
                }

                localStorage.setItem('todo-list-box-ever-loaded', 'true')
                this.ensureTodoListItemsAppear.call(this)
                this.ensureTodoListBoxVisibility.call(this)
                return true
            } catch (err) {
                Utility.error('failed to import todo list items', err)
                await Swal.fire({
                    icon: 'error',
                    title: I18n.getText('todoListImportFailedTitle'),
                    text: I18n.getText('todoListImportReadErrorText')
                })
                return false
            }
        },

        registerTodoListTooltips() {
            if (!$.fn.tooltipster) {
                return
            }

            $('#todo-list button[title]')
                .not('.tooltipstered')
                .tooltipster({
                    theme: 'tooltipster-custom-theme',
                    animation: 'grow',
                    delay: 0,
                    touchDevices: false,
                    trigger: 'hover',
                    position: 'bottom'
                })
        },

        // contains event declarations for many todo list operation
        registerEventTodoList() {

            // event for hiding or showing the todo list pane
            $('#todo-list .toggler').on('click', () => {
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
                this.ensureTodoListItemsAppear.call(this)
                const $textbox = $('#todo-list .items .item:eq(0) .item-textbox')
                this.enableTodoListTextboxEditMode.call(this, $textbox)
            })

            const $todoListImportInput = $('<input type="file" accept=".txt,text/plain" />').css('display', 'none')
            $('body').append($todoListImportInput)
            $todoListImportInput.on('change', async (event) => {
                const file = event.currentTarget.files && event.currentTarget.files[0]
                $todoListImportInput.val('')
                if (!file) {
                    return
                }

                await this.importTodoListItems.call(this, file)
            })

            // event for importing todo list items
            $('#todo-list .import').on('click', () => {
                $todoListImportInput[0].click()
            })

            // event for exporting todo list items
            $('#todo-list .export').on('click', () => {
                this.exportTodoListItems.call(this)
            })

            // calculate todo list item based on screen size
            $('#todo-list .items').height($(window).height() - 97 - 37 - 9)
            $('#todo-list .items').on('input', '.item span[contenteditable]', Utility.debounce(() => {
                this.ensureTodoListItemsStored.call(this)
            }, 300))
            $('#todo-list .items').on('blur', '.item span[contenteditable="true"]', (event) => {
                this.ensureTodoListItemsStored.call(this)
                const $textbox = $(event.currentTarget)
                this.renderTodoListTextboxViewMode.call(this, $textbox, $textbox[0].innerText)
            })
            // event for deleting todo item
            $('#todo-list .items').on('click', '.item button.delete', (event) => {
                event.stopPropagation()
                $(event.currentTarget).closest('.item').remove()
                this.ensureTodoListItemsStored.call(this)
            })

            // open todo links immediately in view mode
            $('#todo-list .items').on('click', '.item .item-textbox a', (event) => {
                event.stopPropagation()
            })

            // click outside links to edit todo item
            $('#todo-list .items').on('click', '.item', (event) => {
                if ($(event.target).closest('button, input, a').length > 0) {
                    return
                }

                const $textbox = $(event.currentTarget).find('.item-textbox')
                this.enableTodoListTextboxEditMode.call(this, $textbox)
            })

            // // event for auto highlight/select text on todo item click
            // $('#todo-list .items').on('click', '.item span[contenteditable]', (event) => {
            //     Utility.selectElementContents(event.currentTarget)
            // })

            // event handler for checking/unchecking todo item
            $('#todo-list .items').on('change', '.item-checkbox', () => {
                this.ensureTodoListItemsStored.call(this)
            })

            // handle sortable
            const sortable = new Draggable.Sortable(document.querySelectorAll('#todo-list .items'), {
                draggable: '.item',
                handle: '.move'
            });
            sortable.on('sortable:stop', () => {
                // add delay to ensure DOM completelly finished it's process before updating the local storage
                setTimeout(() => { this.ensureTodoListItemsStored.call(this) }, 300)
            });

            this.registerTodoListTooltips.call(this)
        },

        // =========== UPDATE MESSAGE

        // show update message on extension/plugin update
        showExtensionWelcomeModal() {
            const keyOfUpdateMessage = `changelogs-message-${Constant.meta.version}`
            if (localStorage.getItem(keyOfUpdateMessage)) {
                if (!I18n.getSelectedLocale(false)) {
                    $('.change-language').trigger('click')
                }
                return
            }

            const isUpdate = Object.keys(localStorage).filter((d) => d.indexOf('changelogs-message') > -1).length > 0
            const openingMessage = isUpdate
                ? I18n.getText('modalUpdateInstalledMuslimboardNotification')
                    .replace('$1', Constant.meta.appName)
                    .replace('$2', Constant.meta.version)
                : I18n.getText('modalInstallMuslimboardNotification')
                    .replace('$1', `${Constant.meta.appName} ${Constant.meta.version}`)

            const text = `
                <div class="modal-info">
                    <p>${openingMessage}</p>
                    <p>Changelogs:</p>
                    <ul>
                        ${Constant.app.changelogs.map((d) => `<li>${d}</li>`).join('')}
                    </ul>
                </div>
            `

            Swal.fire({
                icon: 'info',
                title: `${Constant.meta.appName} ${Constant.meta.version}`,
                html: text,
                showConfirmButton: false,
                allowOutsideClick: true
            }).then(() => {
                if (!I18n.getSelectedLocale(false)) {
                    $('.change-language').trigger('click')
                }
            })

            localStorage.setItem(keyOfUpdateMessage, true)

            setTimeout(() => {
                // remove new version cache keys
                Object.keys(localStorage)
                    .filter((d) => d.indexOf('new-version') > -1)
                    .forEach((k) => {
                        localStorage.removeItem(k)
                    })
            }, 1000)
        },

        async checkNewVersion() {
            const keyOfNewVersionMessage = `new-version-${Constant.meta.version}}`
            if (localStorage.getItem(keyOfNewVersionMessage)) {
                return
            }
            localStorage.setItem(keyOfNewVersionMessage, 'true')

            const url = `https://api.github.com/repos/novalagung/muslimboard/releases`
            const response = await Utility.fetch(url)
            const result = await response.json()
            if (!result[0]) {
                return
            }
            if (Utility.versionAsFloat(result[0].tag_name) <= Utility.versionAsFloat(Constant.meta.version)) {
                return
            }
            localStorage.setItem(keyOfNewVersionMessage, result[0].tag_name)

            Utility.log('new version', result[0].tag_name, Constant.meta.version)

            const message = I18n.getText('modalUpdateAvailableMuslimboardNotification')
                .replace('$1', `<b>${result[0].tag_name}</b>`)

            const text = `
                <div class="modal-info">
                    <p style="text-align: center;">${message}</p>
                </div>
            `

            Swal.fire({
                icon: 'info',
                title: `New version! ${result[0].tag_name}`,
                html: text,
                showConfirmButton: false,
                allowOutsideClick: true
            })
        },

        // =========== INIT

        // orchestrate everything
        async init() {
            const t0 = performance.now()
            Utility.log(`${Constant.meta.appName} ${Constant.meta.version}`)

            this.renderDateTime.call(this)
            this.getDataBackgroundThenRender.call(this)
            this.getDataContentThenRender.call(this)
            this.loadLocationAndPrayerTimeThenRender.call(this)
            this.registerEventForForceLoadLocationAndPrayerTimes.call(this)
            this.registerEventForInternetAvailabilityStatus.call(this)
            this.registerEventForChangeLanguageButton.call(this)
            this.registerEventForAboutUsButton.call(this)
            this.registerEventForAlarm.call(this)
            this.registerEventTodoList.call(this)
            await this.ensureTodoListBoxVisibilityOnPageActive.call(this)
            this.showExtensionWelcomeModal.call(this)
            this.checkNewVersion.call(this)

            const t1 = performance.now()
            Utility.log(`init() took ${t1 - t0} milliseconds.`)
        }
    }

    window.onload = function () {
        I18n.init()
        App.init()
    }
})()
