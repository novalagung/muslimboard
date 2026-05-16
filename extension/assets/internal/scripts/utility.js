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
    indexedDb: {
        dbName: 'muslimboard',
        dbVersion: 1,
        storeNames: {
            customBackgroundImages: 'custom-background-images',
        },
        open() {
            if (typeof indexedDB === 'undefined') {
                return Promise.resolve(false)
            }

            return new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, this.dbVersion)

                request.onupgradeneeded = () => {
                    const db = request.result
                    if (!db.objectStoreNames.contains(this.storeNames.customBackgroundImages)) {
                        db.createObjectStore(this.storeNames.customBackgroundImages, { keyPath: 'id' })
                    }
                }

                request.onsuccess = () => resolve(request.result)
                request.onerror = () => reject(request.error || new Error('indexedDB open failed'))
            })
        },
        requestToPromise(request) {
            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result)
                request.onerror = () => reject(request.error || new Error('indexedDB request failed'))
            })
        },
        async withStore(storeName, mode, callback) {
            const db = await this.open()
            if (!db) {
                return false
            }

            return new Promise((resolve, reject) => {
                let result
                let tx
                try {
                    tx = db.transaction(storeName, mode)
                    const store = tx.objectStore(storeName)
                    result = callback(store)
                } catch (err) {
                    db.close()
                    reject(err)
                    return
                }

                tx.oncomplete = () => {
                    db.close()
                    resolve(result)
                }
                tx.onerror = () => {
                    db.close()
                    reject(tx.error || new Error(`indexedDB transaction failed: ${storeName}`))
                }
                tx.onabort = () => {
                    db.close()
                    reject(tx.error || new Error(`indexedDB transaction aborted: ${storeName}`))
                }
            })
        },
        async getAll(storeName) {
            const db = await this.open()
            if (!db) {
                return []
            }

            return new Promise((resolve, reject) => {
                try {
                    const tx = db.transaction(storeName, 'readonly')
                    const store = tx.objectStore(storeName)
                    const request = store.getAll()
                    request.onsuccess = () => {
                        db.close()
                        resolve(request.result || [])
                    }
                    request.onerror = () => {
                        db.close()
                        reject(request.error || new Error(`indexedDB getAll failed: ${storeName}`))
                    }
                } catch (err) {
                    db.close()
                    reject(err)
                }
            })
        },
        async put(storeName, value) {
            return this.withStore(storeName, 'readwrite', (store) => store.put(value))
        },
        async delete(storeName, key) {
            return this.withStore(storeName, 'readwrite', (store) => store.delete(key))
        },
        async clear(storeName) {
            return this.withStore(storeName, 'readwrite', (store) => store.clear())
        },
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
    isFirefoxBrowser: () => {
        const ua = navigator.userAgent || ''
        return /Firefox/i.test(ua) && !/Seamonkey/i.test(ua)
    },
    isSafariBrowser: () => {
        const ua = navigator.userAgent || ''
        return /Safari/i.test(ua) && !/(Chrome|Chromium|CriOS|FxiOS|Edg|OPR)/i.test(ua)
    },
    getCurrentLocationCoordinate: () => new Promise((resolve, reject) => {
        const useCoordinateCache = () => {
            const coordinateCache = JSON.parse(localStorage.getItem('data-coordinate-cache') || '{}')
            Utility.log('use last cached location', coordinateCache)
            if (Object.keys(coordinateCache).length > 0) {
                resolve(coordinateCache)
            } else {
                localStorage.removeItem('data-coordinate-cache')
                reject(new Error(I18n.getText('promptErrorFailToGetLocationInfo')))
            }
        }

        if (Utility.isOffline()) {
            useCoordinateCache()
            return
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
    unwrapLatestDataContent(data) {
        if (!data || typeof data !== 'object') {
            return null
        }

        const inner = data.content
        if (inner && typeof inner === 'object' && Array.isArray(inner.content)) {
            return inner
        }

        if (Array.isArray(inner)) {
            return {
                version: data.version || '',
                content: inner,
                author: data.author || {}
            }
        }

        if (Array.isArray(data.content) && (data.version || data.author)) {
            return data
        }

        return data
    },
    normalizeBackgroundDataFile(data) {
        const doc = Utility.unwrapLatestDataContent(data) || {}
        return {
            version: doc.version || '',
            content: Array.isArray(doc.content) ? doc.content : []
        }
    },
    isOffline() {
        return typeof navigator !== 'undefined' && navigator.onLine === false
    },
    isNetworkFetchError(err) {
        if (!err) {
            return false
        }

        const message = String(err.message || err).toLowerCase()
        return message.indexOf('failed to fetch') > -1
            || message.indexOf('networkerror') > -1
            || message.indexOf('network error') > -1
            || message.indexOf('internet_disconnected') > -1
            || message.indexOf('err_internet_disconnected') > -1
    },
    normalizeCoordinate(value) {
        const number = Number(value)
        if (!Number.isFinite(number)) {
            return 0
        }

        return Math.round(number * 10000) / 10000
    },
    buildPrayerCoordinateCacheKey(latitude, longitude) {
        const lat = Utility.normalizeCoordinate(latitude)
        const lon = Utility.normalizeCoordinate(longitude)
        return `data-prayer-time-by-coordinate-${lat}-${lon}`
    },
    readPrayerTimeCacheEntry(key) {
        const raw = localStorage.getItem(key)
        if (!raw) {
            return null
        }

        try {
            const data = JSON.parse(raw)
            if (!Utility.getTodayPrayerSchedule(data)?.timings) {
                return null
            }

            return { key, data }
        } catch (err) {
            Utility.error(err)
            return null
        }
    },
    readPrayerCoordinateCacheEntry(key) {
        return Utility.readPrayerTimeCacheEntry(key)
    },
    findPrayerLocationCache(locationID) {
        const preferredKey = `data-prayer-time-by-location-${locationID}`
        const preferred = Utility.readPrayerTimeCacheEntry(preferredKey)
        if (preferred) {
            return preferred
        }

        const prefix = 'data-prayer-time-by-location-'
        return Object.keys(localStorage)
            .filter((key) => key.indexOf(prefix) === 0)
            .map((key) => Utility.readPrayerTimeCacheEntry(key))
            .find((entry) => entry) || null
    },
    findPrayerCoordinateCache(latitude, longitude) {
        const preferredKey = Utility.buildPrayerCoordinateCacheKey(latitude, longitude)
        const preferred = Utility.readPrayerTimeCacheEntry(preferredKey)
        if (preferred) {
            return preferred
        }

        const prefix = 'data-prayer-time-by-coordinate-'
        const targetLat = Utility.normalizeCoordinate(latitude)
        const targetLon = Utility.normalizeCoordinate(longitude)
        let nearest = null
        let nearestDistance = Infinity

        Object.keys(localStorage).forEach((key) => {
            if (key.indexOf(prefix) !== 0 || key === preferredKey) {
                return
            }

            const coordsPart = key.slice(prefix.length)
            const separatorIndex = coordsPart.indexOf('-', 1)
            if (separatorIndex < 1) {
                return
            }

            const cachedLat = parseFloat(coordsPart.slice(0, separatorIndex))
            const cachedLon = parseFloat(coordsPart.slice(separatorIndex + 1))
            if (!Number.isFinite(cachedLat) || !Number.isFinite(cachedLon)) {
                return
            }

            const entry = Utility.readPrayerTimeCacheEntry(key)
            if (!entry) {
                return
            }

            const distance = Utility.distanceBetween(targetLat, targetLon, cachedLat, cachedLon)
            if (distance < nearestDistance) {
                nearestDistance = distance
                nearest = entry
            }
        })

        if (nearest) {
            return nearest
        }

        return Object.keys(localStorage)
            .filter((key) => key.indexOf(prefix) === 0)
            .map((key) => Utility.readPrayerTimeCacheEntry(key))
            .find((entry) => entry) || null
    },
    resolveValidPrayerTimeCache(data, options = {}) {
        if (Utility.getTodayPrayerSchedule(data)?.timings) {
            return data
        }

        if (typeof options.resolveFallbackCache === 'function') {
            return options.resolveFallbackCache() || null
        }

        return null
    },
    isRemoteResourceUrl(url) {
        return /^https?:\/\//i.test(String(url || ''))
    },
    getTodayPrayerSchedule(cacheWrapper) {
        const content = cacheWrapper?.content
        if (!content || content.status_code != 200 || !content.data?.schedules) {
            return null
        }

        return content.data.schedules.find(
            (each) => each.date.gregorian.date == Utility.now().format('DD-MM-YYYY')
        ) || null
    },
    formatSourceLabel(source) {
        return String(source || '').replace(/^https?:\/\//i, '')
    },
    async fetchJsonDataFile(url) {
        const response = await Utility.fetch(url)
        if (!response || !response.ok) {
            throw new Error(`data fetch failed (${response?.status || 'no response'}): ${url}`)
        }

        const result = await response.json()
        if (!result || typeof result !== 'object') {
            throw new Error(`data fetch returned invalid json: ${url}`)
        }

        return result
    },
    getLatestData: (key, callback, options = {}) => new Promise(async (resolve) => {
        const nowYYYYMMDD = moment().format('YYYY-MM-DD')
        let data = {
            lastUpdated: nowYYYYMMDD,
            content: {}
        }

        const cacheData = localStorage.getItem(key)
        if (cacheData) {
            data = JSON.parse(cacheData)
        }

        const isContentEmpty = options.isContentEmpty || ((payload) => {
            if (!payload || typeof payload !== 'object') {
                return true
            }
            if (Array.isArray(payload)) {
                return payload.length === 0
            }
            return Object.keys(payload).length === 0
        })

        const forceRefresh = options.forceRefresh === true
        const isFirstTime = isContentEmpty(data.content)
        const isNotToday = data.lastUpdated != nowYYYYMMDD
        const hasCachedContent = !isContentEmpty(data.content)
        const cacheHasTodaySchedule = !!Utility.getTodayPrayerSchedule(data)?.timings
        const preferValidTodayCache = options.preferValidTodayCache === true

        Utility.log(
            'isFirstTime:', isFirstTime,
            'isNotToday:', isNotToday,
            'forceRefresh:', forceRefresh,
            'offline:', Utility.isOffline(),
            'hasCachedContent:', hasCachedContent,
            'cacheHasTodaySchedule:', cacheHasTodaySchedule,
            'preferValidTodayCache:', preferValidTodayCache
        )

        if (preferValidTodayCache && !forceRefresh && Utility.isOffline()) {
            const validCache = Utility.resolveValidPrayerTimeCache(data, options)
            if (validCache) {
                Utility.log('offline, use month prayer cache with today schedule', key, 'lastUpdated:', validCache.lastUpdated)
                resolve(validCache)
                return
            }
        }

        const shouldAttemptFetch = forceRefresh || isFirstTime || isNotToday

        if (shouldAttemptFetch) {
            try {
                await callback((result) => {
                    data.lastUpdated = nowYYYYMMDD
                    data.content = result
                    localStorage.setItem(key, JSON.stringify(data))
                    resolve(data)
                })
                return
            } catch (err) {
                Utility.error(err)
                Utility.log('use cached data instead')
                const validCache = preferValidTodayCache
                    ? Utility.resolveValidPrayerTimeCache(data, options)
                    : (cacheHasTodaySchedule ? data : null)
                if (validCache) {
                    resolve(validCache)
                    return
                }
                resolve(data)
                return
            }
        }

        if (preferValidTodayCache && !forceRefresh) {
            const validCache = Utility.resolveValidPrayerTimeCache(data, options)
            if (validCache) {
                resolve(validCache)
                return
            }
        }

        resolve(data)
    }),
    removeLocalStorageItemsByPrefix: (cond) => {
        Utility.log('remove local storage', cond)
        Object.keys(localStorage).filter(cond).forEach((d) => { localStorage.removeItem(d) })
    },
    randomFromArray(key, arr, exclusion, didReset = false) {
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
            if (didReset || (arr || []).length == 0) {
                return false
            }
            return Utility.randomFromArray(key, arr, exclusion, true)
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
    escapeHtml: (text = '') => String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;'),
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
