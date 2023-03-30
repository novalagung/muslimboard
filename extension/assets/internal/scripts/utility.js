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
    getCurrentLocationCoordinate: () => new Promise((resolve, reject) => {
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
    getLatestData: (key, callback) => new Promise(async (resolve) => {
        const nowYYYYMMDD = moment().format('YYYY-MM-DD')
        let data = {
            lastUpdated: nowYYYYMMDD,
            content: {}
        }

        const cacheData = localStorage.getItem(key)
        if (cacheData) {
            data = JSON.parse(cacheData)
        }
        
        const isFirstTime = Object.keys(data.content).length == 0
        const isNotToday = data.lastUpdated != nowYYYYMMDD
        Utility.log('isFirstTime:', isFirstTime, 'isNotToday:', isNotToday)
        if (isFirstTime || isNotToday) {
            try {
                await callback((result) => {
                    data.lastUpdated = nowYYYYMMDD
                    data.content = result
                    localStorage.setItem(key, JSON.stringify(data))
                    resolve(data)
                })
            } catch (err) {
                Utility.error(err)
                Utility.log('use cached data instead')
                resolve(data)
            }
        }

        resolve(data)
    }),
    removeLocalStorageItemsByPrefix: (cond) => {
        Utility.log('remove local storage', cond)
        Object.keys(localStorage).filter(cond).forEach((d) => { localStorage.removeItem(d) })
    },
    randomFromArray(key, arr, exclusion) {
        const cacheKey = `data-cache-${key}`
        
        let arrExcluded = JSON.parse(localStorage.getItem(cacheKey) || '[]')
        if (exclusion) {
            arrExcluded.push(exclusion.id)
        }
        if (key === 'background') {
            localStorage.setItem(cacheKey, JSON.stringify(arrExcluded))
            Utility.log('randomFromArray', cacheKey, 'arrExcluded:', arrExcluded)
        }

        const items = (arr || []).filter((d) => (arrExcluded.length > 0) ? (arrExcluded.indexOf(d.id) === -1) : true)
        Utility.log('randomFromArray', cacheKey, 'items:', items)
        if (items.length == 0) {
            localStorage.removeItem(cacheKey)
            return Utility.randomFromArray(key, arr, exclusion)
        }

        const nextItem = items[Math.floor(Math.random()*items.length)]
        if (key === 'content') {
            arrExcluded.push(nextItem.id)
            localStorage.setItem(cacheKey, JSON.stringify(arrExcluded))
            Utility.log('randomFromArray', cacheKey, 'arrExcluded:', arrExcluded)
        }

        return nextItem
    },
    sleep: (n) => new Promise((resolve) => { setTimeout(() => { resolve() }, Utility.seconds(n)) }),
    seconds: (n) => n * 1000,
    log: (...args) => (Constant.app.debug) ? console.log(...args) : $.noop(),
    error: (...args) => (Constant.app.debug) ? console.error(...args) : $.noop(),
    toTitleCase: (str) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()),
    getCurrentTimezoneAbbreviation: (countryCode) => {
        const tzAbbr = moment.tz(moment.tz.guess()).zoneAbbr()
        return Utility.getFormattedTzAbbr(tzAbbr)
    },
    getFormattedTzAbbr: (tzAbbr) => {
        if (tzAbbr.indexOf('-') === 0) {
            return `GMT${tzAbbr}`
        } else if (String(parseInt(tzAbbr)) === tzAbbr) {
            return `GMT+${tzAbbr}`
        } else {
            return tzAbbr
        }
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

        // If the purpose is to timeout the request only (not including the response), then enable the code below
        // const timeoutId = setTimeout(() => controller.abort(), Constant.app.timeoutDuration)
        // clearTimeout(timeoutId)

        return fetch(url, { signal: controller.signal })
    },
    getBrowserUuid() {
        let key = `browser-uuid-${Constant.meta.version}`
        let browserUuid = localStorage.getItem(key) || ''
        if (browserUuid.length < 50) {
            return browserUuid;
        }

        if (self.crypto.randomUUID) {
            browserUuid = `${self.crypto.randomUUID()}-${new Date().getTime()}`
        }
        if (browserUuid.length < 50) {
            return '';
        }

        localStorage.setItem(key, browserUuid)
        return browserUuid
    },
}
