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
    _textEncoder: new TextEncoder(),
    _textDecoder: new TextDecoder(),
    _bytesToBase64: (bytes) => btoa(String.fromCharCode(...bytes)),
    _base64ToBytes: (base64) => Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)),
    getCoordinateCacheCryptoKey: async () => {
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            Utility._textEncoder.encode('coordinate-cache-key-v1'),
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        )
        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: Utility._textEncoder.encode('extension-coordinate-cache-salt-v1'),
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        )
    },
    encryptCoordinateCache: async (plainText) => {
        const key = await Utility.getCoordinateCacheCryptoKey()
        const iv = crypto.getRandomValues(new Uint8Array(12))
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            Utility._textEncoder.encode(plainText)
        )
        return JSON.stringify({
            iv: Utility._bytesToBase64(iv),
            data: Utility._bytesToBase64(new Uint8Array(encrypted))
        })
    },
    decryptCoordinateCache: async (cipherPayload) => {
        const payload = JSON.parse(cipherPayload)
        const key = await Utility.getCoordinateCacheCryptoKey()
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: Utility._base64ToBytes(payload.iv) },
            key,
            Utility._base64ToBytes(payload.data)
        )
        return Utility._textDecoder.decode(decrypted)
    },
    getCurrentLocationCoordinate: () => new Promise(async (resolve, reject) => {
        const useCoordinateCache = async () => {
            try {
                const rawCache = localStorage.getItem('data-coordinate-cache')
                if (!rawCache) throw new Error('empty cache')

                let coordinateCache = {}
                try {
                    const decryptedCache = await Utility.decryptCoordinateCache(rawCache)
                    coordinateCache = JSON.parse(decryptedCache || '{}')
                } catch (decryptErr) {
                    coordinateCache = JSON.parse(rawCache || '{}')
                }

                Utility.log('timeout. use last cached location', coordinateCache)
                if (Object.keys(coordinateCache).length > 0) {
                    resolve(coordinateCache)
                    return
                }
            } catch (e) {}

            localStorage.removeItem('data-coordinate-cache')
            reject(new Error(I18n.getText('promptErrorFailToGetLocationInfo')))
        }

        if (!navigator.geolocation) {
            useCoordinateCache()
            return
        }

        navigator.geolocation.clearWatch(this.geoLocationWatchObject)
        navigator.geolocation.getCurrentPosition($.noop, $.noop, {})
        navigator.geolocation.getCurrentPosition(
            async (result) => {
                const coordinate = {
                    coords: {
                        latitude: result.coords.latitude,
                        longitude: result.coords.longitude,
                    }
                }
                Utility.log('current coordinate found at', coordinate.coords)
                const encryptedCoordinate = await Utility.encryptCoordinateCache(JSON.stringify(coordinate))
                localStorage.setItem('data-coordinate-cache', encryptedCoordinate)
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
    minutes: (n) => 60 * Utility.seconds(n),
    hours: (n) => 60 * Utility.minutes(n),
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
        if (browserUuid) {
            return browserUuid;
        }

        if (self.crypto.randomUUID) {
            browserUuid = `${self.crypto.randomUUID()}-${new Date().getTime()}`
            localStorage.setItem(key, browserUuid)
            return browserUuid
        }
        
        return '';
    },
    versionAsFloat: (s) => parseFloat(s.replace('v', '').replace('.', '')),
    now: () => moment()
}
