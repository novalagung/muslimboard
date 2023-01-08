let vm = {}

vm.second = 1000
vm.urlContent = 'extension/data/data-content-en.json'

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

    // init lazy loader
    // $('img').unveil()
}

$(() => {
    vm.init()
})