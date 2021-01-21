let vm = {}

vm.second = 1000
vm.urlContent = 'extension/data/data-content.json'

vm.getContent = (callback = $.noop) => {
    $.getJSON(vm.urlContent, (res) => {
        let text = res.content
            .filter((d) => d.type === 'word of wisdom')
            .map((d) => {
                let suffix = ''
                if (res.author.hasOwnProperty(d.author)) {
                    suffix = `<br /><br />~ <a href="${d.reference}" target="_blank">${res.author[d.author].name}</a>`
                }

                return `${d.translation}${suffix}`
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