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
        async getPrayerTimesByCoordinate(latitude, longitude) {
            const key = `data-prayer-time-by-coordinate-${latitude}-${longitude}`
            if (latitude == 0 && longitude == 0) {
                localStorage.removeItem(key)
            }

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

        // get background image data then render it to screen.
        // if background image data ever been loaded once, then the cache will be used on next call
        async getDataBackgroundThenRender() {

            // load data from remote url
            try {
                Utility.log('fetching remote data background')
                const key = `data-background-remote-${Constant.meta.version}`
                const data = await Utility.getLatestData(key, async (resolve) => {
                    const url = `${Constant.app.baseUrlGithub}/data-background.json?v=${Constant.meta.version}.${Utility.now().format('YYYY-MM-DD')}`
                    const response = await Utility.fetch(url)
                    const result = await response.json()
                    resolve(result)
                })
                if (Object.keys(data?.content || {}).length > 0) {
                    this.updateBackground.call(this, data.content)
                    return
                } 
            } catch (err) {
                Utility.error(err)
            }

            // in case of failure, use local data
            Utility.log('fetching local data background')
            const url = `data/data-background.json`
            const response = await Utility.fetch(url)
            const data = await response.json()
            this.updateBackground.call(this, data)
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

                const preloader = new Image()
                preloader.src = doGetBackgroundURL(this.nextSelectedBackground)
                preloader.onload = () => {
                    Utility.log('next image preloaded', preloader.src)
    
                    setTimeout(() => {
                        this.updateBackground.call(this, data)
                    }, Constant.app.updateBackgroundDelayDuration)
                }
                preloader.onerror = (err) => {
                    this.nextSelectedBackground = Utility.randomFromArray('background', data.content, this.selectedBackground)
                    preloader.src = doGetBackgroundURL(this.nextSelectedBackground)
                }
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

                this.selectedBackground = Utility.randomFromArray('background', data.content)
                this.nextSelectedBackground = Utility.randomFromArray('background', data.content, this.selectedBackground)

                // right after certain image loaded, trigger preload for next image,
                // this approach is to ensure when the next image transition is happening,
                // it's need to happen smoothly.
                // on rare occasion the preload might failing due to various reason such slow internet,
                // and if that situation is happening, use the local image
                const preloader = new Image()
                preloader.src = doGetBackgroundURL(this.selectedBackground)
                preloader.onload = () => {
                    Utility.log('next image preloaded', preloader.src)
                    doUpdateBackgroundForTheFirstTime()
                }
                preloader.onerror = () => {
                    this.selectedBackground = Utility.randomFromArray(
                        'background', 
                        data.content.filter((d) => doGetBackgroundURL(d).indexOf('http') == -1),
                        this.selectedBackground
                    )
                    this.nextSelectedBackground = Utility.randomFromArray('background', data.content, this.selectedBackground)
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
                    type: 'info',
                    title: I18n.getText('footerMenuAutomaticLocationDetection'),
                    html: text,
                    showConfirmButton: true,
                    showCancelButton: true,
                    confirmButtonText: buttonText,
                    cancelButtonText: I18n.getText('promptConfirmationCancel')
                }).then(async (e) => {
                    if (!e.value) {
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
                    type: 'info',
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
                }).then((e) => {
                    if (!e.value) {
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
                        return `<li><a href='#' data-locale='${d}'><span>${lang.english}</span><br /><span>${lang.native}</span></a></li>`
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
                    type: 'info',
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
                                <a 
                                    class="btn-share facebook" 
                                    target="_blank" 
                                    href="https://www.facebook.com/sharer/sharer.php?u=${encodeURI(Constant.meta.homepageLink)}&title=${encodeURI(shareText)}" 
                                    title="Facebook share"
                                >
                                    <i class="fa fa-facebook-square"></i>
                                </a>
                                <a 
                                    class="btn-share twitter" 
                                    target="_blank" 
                                    href="http://twitter.com/share?text=${shareText}&url=${encodeURI(Constant.meta.homepageLink)}" 
                                    title="Twitter share"
                                >
                                    <i class="fa fa-twitter"></i>
                                </a>
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
                    type: 'info',
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

        // =========== TODO LIST

        // toggle TODO list visibility based on previously cached state
        ensureTodoListBoxVisibility() {
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
        ensureTodoListBoxVisibilityOnPageActive() {

            // migrate chrome.storage.sync storage data to localStorage
            const localStorageUsed = localStorage.getItem('todo-list-box-ever-loaded') || 'false'
            Utility.log('local storage used', localStorageUsed)

            if (localStorageUsed === 'false') {
                // disabling chrome storage. refer to https://stackoverflow.com/questions/28465384/how-is-chrome-storage-affected-when-an-extension-is-updated
                // const rawItems = JSON.parse((await Utility.chromeStorage.get('todo-list-items')) || '[]')

                let items = JSON.parse(localStorage.getItem('todo-list-items') || '[]').filter((d) => d.text)
                Utility.log('found cached sync storage todo list items', items)

                if (items.length === 0) {
                    items = [{
                        text: I18n.mapping.todoListPlaceholder.id,
                        checked: true
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

            if (chrome.tabs) {
                chrome.tabs.onActivated.addListener(() => {
                    this.ensureTodoListBoxVisibility.call(this)
                    this.ensureTodoListItemsAppear.call(this)
                })
            }
        },

        // render TODO list items
        ensureTodoListItemsAppear() {
            $('#todo-list .items .item').remove()

            this.insertTodoListItem.call(this)

            let items = JSON.parse(localStorage.getItem('todo-list-items') || '[]')
            items.forEach((each) => {
                if (each.text === I18n.mapping.todoListPlaceholder.id) {
                    each.text = I18n.getText('todoListPlaceholder')
                }

                $('#todo-list .items').prepend($(`
                    <div class="item ${each.checked ? 'checked' : ''}">
                        <input type="checkbox" class="item-checkbox" ${each.checked ? 'checked' : ''}>
                        <span class="item-textbox" contenteditable="true" data-placeholder="${I18n.getText('todoListEntryPlaceholder')}">${each.text.replace(/\n/gi, '<br>')}</span>
                        <button class="move"><i class="fa fa-arrows"></i></button>
                        <button class="delete"><i class="fa fa-close"></i></button>
                    </div>
                `))
            })
        },

        // ensure the TODO list items is always stored on cache
        ensureTodoListItemsStored() {
            const items = $('#todo-list .items .item').toArray().reverse().map((each) => ({
                text: $(each).find('span[contenteditable]')[0].innerText,
                checked: $(each).find('input[type=checkbox]').prop('checked')
            }))
            localStorage.setItem('todo-list-items', JSON.stringify(items))

            // disabling chrome storage. refer to https://stackoverflow.com/questions/28465384/how-is-chrome-storage-affected-when-an-extension-is-updated
            // await Utility.chromeStorage.set('todo-list-items', JSON.stringify(items))
        },

        // insert new TODO item
        insertTodoListItem() {
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
        },

        // contains event declarations for many TODO list operation
        registerEventTodoList() {

            // event for hiding or showing the TODO list pane
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
                $('#todo-list .items .item:eq(0) span[contenteditable]').focus()
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

            // handle sortable
            const sortable = new Draggable.Sortable(document.querySelectorAll('#todo-list .items'), {
                draggable: '.item',
                handle: '.move'
            });
            sortable.on('sortable:stop', () => {
                // add delay to ensure DOM completelly finished it's process before updating the local storage
                setTimeout(() => { this.ensureTodoListItemsStored.call(this) }, 300)
            });
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
                type: 'info',
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
                type: 'info',
                title: `New version! ${result[0].tag_name}`,
                html: text,
                showConfirmButton: false,
                allowOutsideClick: true
            })
        },

        // =========== INIT

        // orchestrate everything
        init() {
            console.log(`${Constant.meta.appName} ${Constant.meta.version}`)

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
            this.ensureTodoListBoxVisibilityOnPageActive.call(this)
            this.ensureTodoListItemsAppear.call(this)
            this.showExtensionWelcomeModal.call(this)
            this.checkNewVersion.call(this)
        }
    }

    window.onload = function () {
        I18n.init()
        App.init()
    }
})()
