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
    getLatestData: (key, callback, useCacheAsFailover = false) => new Promise(async (resolve) => {
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
                if (useCacheAsFailover) {
                    Utility.log('use cached data instead')
                    resolve(data)
                } else {
                    resolve(false)
                }
            }
        }

        resolve(data)
    }),
    getLatestDataAndUseCacheAsFailover: async (key, callback) => {
        return await Utility.getLatestData(key, callback, true)
    },
    removeLocalStorageItemsByPrefix: (cond) => {
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
    error: (...args) => (Constant.app.debug) ? console.error(...args) : $.noop(),
    toTitleCase: (str) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()),
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

        // If the purpose is to timeout the request only (not including the response), then enable the code below
        // const timeoutId = setTimeout(() => controller.abort(), Constant.app.timeoutDuration)
        // clearTimeout(timeoutId)

        return fetch(url, { signal: controller.signal })
    }
}
