#!/usr/bin/env node
/**
 * Headless smoke tests for prayer-calculation and location-search helpers.
 * Run: node extension/utility/scripts/smoke-test.mjs
 */
import fs from 'fs'
import path from 'path'
import vm from 'vm'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const scriptsDir = path.resolve(__dirname, '../../assets/internal/scripts')
const repoRoot = path.resolve(__dirname, '../../..')

const storage = {}
const sandbox = {
    console,
    localStorage: {
        getItem: (k) => (Object.prototype.hasOwnProperty.call(storage, k) ? storage[k] : null),
        setItem: (k, v) => {
            storage[k] = String(v)
        },
        removeItem: (k) => {
            delete storage[k]
        },
        key: (i) => Object.keys(storage)[i] ?? null,
        get length() {
            return Object.keys(storage).length
        },
        clear: () => {
            Object.keys(storage).forEach((k) => delete storage[k])
        },
    },
    chrome: {
        runtime: {
            getManifest: () => ({ version: '2.15.0', name: 'Muslim Board' }),
        },
        storage: {
            sync: {
                get: (_keys, cb) => cb({}),
                set: (_item, cb) => cb && cb(),
                remove: (_keys, cb) => cb && cb(),
            },
        },
    },
    document: {
        documentElement: {
            attributes: {},
            setAttribute(key, value) {
                this.attributes[key] = value
            },
            getAttribute(key) {
                return Object.prototype.hasOwnProperty.call(this.attributes, key) ? this.attributes[key] : null
            },
        },
    },
    performance: { now: () => 0 },
    setInterval: () => 0,
    clearInterval: () => {},
    navigator: {
        geolocation: { clearWatch: () => {}, watchPosition: () => {} },
    },
    Utility: {
        log: () => {},
        error: () => {},
        seconds: (n) => n * 1000,
        now: () => ({
            format: () => '',
            year: () => 2026,
        }),
        fetch: async () => ({ json: async () => ({}) }),
        getBrowserUuid: () => 'smoke-test-browser',
        indexedDb: {
            storeNames: { customBackgroundImages: 'custom-background-images' },
            getAll: async () => [],
            put: async () => ({}),
            delete: async () => true,
        },
    },
}
sandbox.globalThis = sandbox
sandbox.window = sandbox

function makeJqueryStub() {
    const stub = function () {
        return stub
    }
    const chain = ['on', 'off', 'each', 'find', 'text', 'attr', 'removeAttr', 'prop', 'toggleClass', 'empty', 'append', 'html', 'show', 'hide']
    chain.forEach((name) => {
        stub[name] = () => stub
    })
    Object.defineProperty(stub, 'length', { value: 0, writable: true })
    stub.not = () => stub
    return stub
}
sandbox.$ = makeJqueryStub

const ctx = vm.createContext(sandbox)
vm.runInContext(fs.readFileSync(path.join(scriptsDir, 'i18n.js'), 'utf8'), ctx)

let appSource = fs.readFileSync(path.join(scriptsDir, 'app.js'), 'utf8')
appSource = appSource.replace(
    '    window.onload = function () {',
    `    globalThis.__smokeApp = App;
    window.onload = function () {`
)
appSource = appSource.replace(
    '        App.init()',
    '        /* App.init() skipped in smoke test */'
)
vm.runInContext(appSource, ctx)

const App = sandbox.__smokeApp
if (!App) {
    console.error('FAIL: could not load App from app.js')
    process.exit(1)
}

const I18n = vm.runInContext('I18n', ctx)

const SUPPORTED_LOCALES = [
    'ar', 'en', 'ru', 'bn', 'hi', 'id', 'zh-tw', 'zh-cn', 'tr', 'fa', 'ur', 'fr', 'ms', 'ha', 'sw',
    'ps', 'uz', 'ku', 'so', 'kk', 'az', 'de', 'tl', 'th', 'sq', 'it', 'bs', 'es', 'nl', 'bg', 'sv', 'el', 'ko', 'ja',
]

const tests = []
let passed = 0
let failed = 0

function test(name, fn) {
    tests.push({ name, fn })
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'assertion failed')
    }
}

function resetStorage() {
    sandbox.localStorage.clear()
}

test('default values are MWL + KEMENAG + shafii', () => {
    const defaults = App.getPrayerCalculationDefaultValues.call(App)
    assert(defaults.aladhanMethod === '3', `aladhan expected 3 got ${defaults.aladhanMethod}`)
    assert(defaults.goPrayerMethod === 'KEMENAG', `goPrayer expected KEMENAG got ${defaults.goPrayerMethod}`)
    assert(defaults.asrMadhab === 'shafii', `asr expected shafii got ${defaults.asrMadhab}`)
})

test('default summary includes primary, fallback, and asr', () => {
    sandbox.localStorage.setItem('selected-locale', 'en')
    const settings = App.getPrayerCalculationDefaultValues.call(App)
    const summary = App.formatPrayerCalculationSummary.call(App, settings)
    assert(summary === 'Default method (MWL · KEMENAG · Shafii)', `summary: ${summary}`)
})

test('custom summary includes all three methods', () => {
    sandbox.localStorage.setItem('selected-locale', 'en')
    const settings = {
        aladhanMethod: '2',
        goPrayerMethod: 'MWL',
        asrMadhab: 'hanafi',
    }
    const summary = App.formatPrayerCalculationSummary.call(App, settings)
    assert(summary === 'ISNA · MWL · Hanafi', `summary: ${summary}`)
})

test('goPrayer picker resolves full label (not raw value only)', () => {
    const label = App.getPrayerCalculationOptionName.call(App, 'goPrayer', 'KEMENAG')
    assert(label.includes('KEMENAG'), `label: ${label}`)
    assert(label.includes('Kementerian'), `label: ${label}`)
})

test('query params omitted when nothing stored', () => {
    resetStorage()
    const q = App.getPrayerCalculationQueryParams.call(App, 'coordinate')
    assert(q === '', `expected empty query, got ${q}`)
})

test('query params sent after settings saved', () => {
    resetStorage()
    App.setPrayerCalculationSettings.call(App, {
        aladhanMethod: '3',
        goPrayerMethod: 'KEMENAG',
        asrMadhab: 'shafii',
    })
    const q = App.getPrayerCalculationQueryParams.call(App, 'coordinate')
    assert(q.includes('calc_primary=3'), q)
    assert(q.includes('calc_fallback=KEMENAG'), q)
    assert(q.includes('calc_asr=shafii'), q)
})

test('save skips localStorage write for first-time default selection', () => {
    resetStorage()
    const defaults = App.getPrayerCalculationDefaultValues.call(App)
    App.savePrayerCalculationSettingsFromSelection.call(App, 'coordinate', defaults)
    assert(sandbox.localStorage.getItem('data-prayer-calculation-method') === null, 'should not persist defaults on first save')
})

test('formatLocationSearchResult appends postal code', () => {
    const label = App.formatLocationSearchResult.call(App, {
        name: 'Bandung',
        admin1Name: 'West Java',
        countryName: 'Indonesia',
        postalCode: '40123',
    })
    assert(label === 'Bandung, West Java, Indonesia (40123)', `label: ${label}`)
})

test('isPrayerCalculationDefaultSelection is consistent across flow types', () => {
    const defaults = App.getPrayerCalculationDefaultValues.call(App)
    assert(App.isPrayerCalculationDefaultSelection.call(App, defaults) === true)
    assert(
        App.isPrayerCalculationDefaultSelection.call(App, {
            aladhanMethod: '2',
            goPrayerMethod: 'KEMENAG',
            asrMadhab: 'shafii',
        }) === false
    )
})

test('every i18n key covers every supported locale', () => {
    const gaps = []
    Object.keys(I18n.mapping).forEach((key) => {
        SUPPORTED_LOCALES.forEach((locale) => {
            if (!I18n.mapping[key][locale]) {
                gaps.push(`${key}.${locale}`)
            }
        })
    })
    assert(gaps.length === 0, `missing translations: ${gaps.join(', ')}`)
})

test('i18n translations keep the english placeholders and alarm prefixes', () => {
    const placeholders = (value) => (String(value).match(/\$[0-9]/g) || []).sort().join(',')
    const mismatches = []
    Object.keys(I18n.mapping).forEach((key) => {
        const source = I18n.mapping[key].en
        if (typeof source !== 'string') {
            return
        }

        const prefix = source.split('|')[0]
        SUPPORTED_LOCALES.forEach((locale) => {
            const value = String(I18n.mapping[key][locale])
            if (placeholders(value) !== placeholders(source)) {
                mismatches.push(`${key}.${locale} placeholders`)
            }
            if ((prefix === 'exact' || prefix === 'almost') && value.split('|')[0] !== prefix) {
                mismatches.push(`${key}.${locale} alarm prefix`)
            }
        })
    })
    assert(mismatches.length === 0, `mismatched: ${mismatches.join(', ')}`)
})

test('rtl locales are flagged and every rtl locale is supported', () => {
    const rtl = I18n.rtlLocales
    assert(JSON.stringify(rtl) === JSON.stringify(['ar', 'fa', 'ur', 'ps']), `rtlLocales: ${JSON.stringify(rtl)}`)
    rtl.forEach((locale) => {
        assert(SUPPORTED_LOCALES.includes(locale), `${locale} flagged rtl but not supported`)
        assert(I18n.isRtlLocale(locale) === true, `${locale} should be rtl`)
    })
    SUPPORTED_LOCALES.filter((locale) => !rtl.includes(locale)).forEach((locale) => {
        assert(I18n.isRtlLocale(locale) === false, `${locale} should not be rtl`)
    })
})

test('init applies dir and lang from the selected locale', () => {
    const html = sandbox.document.documentElement

    sandbox.localStorage.setItem('selected-locale', 'ur')
    I18n.init()
    assert(html.getAttribute('lang') === 'ur', `lang: ${html.getAttribute('lang')}`)
    assert(html.getAttribute('dir') === 'rtl', `dir: ${html.getAttribute('dir')}`)

    sandbox.localStorage.setItem('selected-locale', 'fr')
    I18n.init()
    assert(html.getAttribute('lang') === 'fr', `lang: ${html.getAttribute('lang')}`)
    assert(html.getAttribute('dir') === 'ltr', `dir: ${html.getAttribute('dir')}`)

    resetStorage()
})

test('language picker lists en and id first, then the rest alphabetically', () => {
    const items = App.getLanguagePickerItems.call(App)

    assert(items.length === SUPPORTED_LOCALES.length - 2, `expected ${SUPPORTED_LOCALES.length - 2} items, got ${items.length}`)
    assert(!items.some((each) => each.locale === 'en' || each.locale === 'id'), 'en/id must be pinned, not listed')

    const labels = items.map((each) => each.label)
    const sorted = labels.slice().sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
    assert(JSON.stringify(labels) === JSON.stringify(sorted), `not alphabetical: ${labels.slice(0, 5).join(' | ')}`)

    items.forEach((each) => {
        const lang = I18n.mapping.languageName[each.locale]
        const expected = lang.native ? `${lang.english} - ${lang.native}` : lang.english
        assert(each.label === expected, `${each.locale} label: ${each.label}`)
    })
})

test('every locale has a flag entry and it renders as regional indicators', () => {
    SUPPORTED_LOCALES.forEach((locale) => {
        assert(locale in I18n.localeFlags, `${locale} has no localeFlags entry`)
    })

    Object.entries(I18n.localeFlags).forEach(([locale, country]) => {
        assert(country === '' || /^[A-Z]{2}$/.test(country), `${locale} country: ${country}`)
        const flag = I18n.getLocaleFlag(locale)
        if (country === '') {
            assert(flag === '', `${locale} should have no flag`)
            return
        }
        assert([...flag].length === 2, `${locale} flag should be 2 code points, got ${[...flag].length}`)
        assert([...flag].every((c) => c.codePointAt(0) >= 0x1F1E6 && c.codePointAt(0) <= 0x1F1FF), `${locale} flag: ${flag}`)
    })
})

async function runLiveApiSmoke(baseUrl) {
    const url = `${baseUrl}/muslimboard-api?v=v2.15.0&op=location-search&q=bandung&limit=3&browserID=smoke-test`
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
    }
    const body = await response.json()
    if (body.status_code !== 200 || !Array.isArray(body.data) || body.data.length === 0) {
        throw new Error(`unexpected payload: ${JSON.stringify(body).slice(0, 200)}`)
    }
    const first = body.data[0]
    if (!first.name) {
        throw new Error('missing location name')
    }
    if (!Object.prototype.hasOwnProperty.call(first, 'postalCode')) {
        throw new Error('missing postalCode field in API response')
    }
}

async function main() {
    console.log('Muslim Board extension smoke tests\n')

    for (const { name, fn } of tests) {
        try {
            fn()
            passed++
            console.log(`  ✓ ${name}`)
        } catch (err) {
            failed++
            console.log(`  ✗ ${name}`)
            console.log(`    ${err.message}`)
        }
    }

    const apiBases = [
        process.env.MUSLIMBOARD_API_URL,
        'http://localhost:8012',
    ].filter(Boolean)

    let apiTested = false
    for (const base of apiBases) {
        try {
            await runLiveApiSmoke(base)
            apiTested = true
            passed++
            console.log(`  ✓ live API location-search (${base})`)
            break
        } catch (err) {
            console.log(`  ○ live API skipped (${base}): ${err.message}`)
        }
    }

    if (!apiTested) {
        console.log('  ○ live API: no server reachable (optional)')
    }

    console.log(`\n${passed} passed, ${failed} failed`)
    process.exit(failed > 0 ? 1 : 0)
}

main()
