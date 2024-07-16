const Component = {
    Toast: (text, type, heading) => {
        return $.toast({
            heading: heading,
            text: text,
            showHideTransition: 'fade',
            icon: type,
            position: 'top-right',
        })
    }
}