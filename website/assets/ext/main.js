let vm = {}

vm.second = 1000
vm.urlContent = 'extension/data/data-content-en.json'
vm.urlBackgrounds = 'extension/data/data-background.json'

vm.shuffleArray = (arr) => {
    const out = arr.slice()
    for (let i = out.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1))
        const t = out[i]
        out[i] = out[j]
        out[j] = t
    }
    return out
}

vm.resolveBackgroundThumbUrl = (item) => {
    if (item.urlLocal) {
        const path = String(item.urlLocal).replace(/^\//, '')
        return `extension/${path}`
    }
    let u = item.url || ''
    if (!u) {
        return ''
    }
    if (/images\.unsplash\.com/i.test(u)) {
        if (/[?&]w=\d+/i.test(u)) {
            return u.replace(/([?&]w=)\d+/i, (_, prefix) => `${prefix}400`)
        }
        const join = u.indexOf('?') === -1 ? '?' : '&'
        return `${u}${join}w=400&fit=max`
    }
    return u
}

vm.scheduleBackgroundGalleryLoad = () => {
    const start = () => {
        vm.buildBackgroundGallery()
    }
    if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(start, { timeout: 2500 })
    } else {
        window.setTimeout(start, 0)
    }
}

vm.buildBackgroundGallery = () => {
    const $root = $('#background-gallery')
    $.getJSON(vm.urlBackgrounds, (res) => {
        const items = vm.shuffleArray(res.content || [])
        const rows = [[], [], []]
        items.forEach((item, i) => {
            rows[i % 3].push(item)
        })
        $root.empty()
        rows.forEach((rowItems) => {
            const $row = $('<div class="background-gallery__row" />')
            rowItems.forEach((item) => {
                const src = vm.resolveBackgroundThumbUrl(item)
                const href = item.source || item.url || '#'
                const author = (item.author && item.author.name) ? item.author.name : 'Photo'
                const alt = `Muslim Board background — ${author}`
                const $a = $('<a class="background-gallery__link" target="_blank" rel="noopener noreferrer" />').attr('href', href)
                $a.append($('<img />').attr({ loading: 'lazy', decoding: 'async', src, alt }))
                $row.append($a)
            })
            $root.append($row)
        })
    }).fail(() => {
        $root.html('<p class="align-center">Could not load the background image list.</p>')
    })
}

vm.getContent = (callback = $.noop) => {
    $.getJSON(vm.urlContent, (res) => {
        const text = res.content.map((d) => {
            let content = `${d.matan} &nbsp;&nbsp;~&nbsp;&nbsp; ${d.translation}`
            if (d.reference) {
                content += ` &nbsp;&nbsp;~&nbsp;&nbsp; ${d.reference}`
            }

            return content
        })

        callback(text)
    })
}

vm.init = () => {
    // init events
    $('.go-to-contribution').on('click', () => {
        $('[href="#contribution"]').trigger('click')
    })

    // init image slider
    $('.slider').slippry()

    // get content
    vm.getContent((data) => {
        // init the text transition
        $('.wise-word').html(data.join('|')).Morphext({
            speed: 10 * vm.second,
            separator: '|',
            animation: 'bounceIn',
        })
    })

    // Bundled backgrounds: deferred so slider / quotes init and first paint are not delayed.
    vm.scheduleBackgroundGalleryLoad()

    // init lazy loader
    // $('img').unveil()
}

$(() => {
    vm.init()
})