$(document).ready(function () {

    console.log("DOCUMENT READY RIGHT SIUDE")


    // get width todo-main
    let todoMainWidth = $("#todo-main").width()

    $(".todo-show").click(function () {

        // if this has class todo-hide then close todo-main 
        if ($(this).hasClass("todo-hide")) {
            $("#todo-main").css("right", "-" + todoMainWidth + "px")
            $(this).css("right", "2rem")

            // remove todo-hide class
            $(this).removeClass("todo-hide")
            return
        }

        $("#todo-main").css("right", "0px")

        $(this).css("right", todoMainWidth + 32 + "px")

        $(this).addClass("todo-hide")

    })


    $(".todo-hide").click(function () {

        console.log("CLICKED")

        $("#todo-main").css("right", "-" + todoMainWidth + "px")

        $(this).css("right", "0px")

        $(this).addClass("todo-show")
        // remove todo show 
        $(this).removeClass("todo-hide")

    })

    let templateTodo = `
    <div class="item
        flex gap-x-1.5 text-xl w-full border-b-2 border-slate-800 p-4 relative group 
    ">
        <input type="checkbox" class="w-8 content-center accent-sky-400">
        <span
            class="flex-auto item-textbox w-2/3 text-base font-medium px-2 py-1 focus:outline-none"
            contenteditable="true" data-placeholder="Tulis sesuatu"></span>
        <i class="opacity-0 absolute right-4 fa fa-trash self-center text-red-500 transition-all duration-300 cursor-pointer group-hover:opacity-100"></i>
    </div>
    `

    // Register todo list 
    $("#todo-main .add-item").click(function () {

        // if there is one empty value in item, then return
        let emptyItem = false
        let debugRes = []
        $("#todo-main .items .item .item-textbox").each(function () {
            if ($(this).text().trim() == "") {
                emptyItem = true
                debugRes.push($(this).text().trim())
            }
        })

        console.log(debugRes)

        if (emptyItem) {
            console.log("There is one empty item")
            return
        }

        $("#todo-main .items").prepend(templateTodo)

        // add to local storage
        let todoItems = []

        $("#todo-main .items .item").each(function () {

            let item = {
                "text": $(this).find(".item-textbox").text(),
                "checked": $(this).find("input[type=checkbox]").prop("checked")
            }

            todoItems.push(item)

        })

        console.log(todoItems)

        localStorage.setItem("todoItems", JSON.stringify(todoItems))


    })

    // if has localStorage, clear item and render from local storage
    if (localStorage.getItem("todoItems")) {

        $("#todo-main .items").html("")

        let todoItems = JSON.parse(localStorage.getItem("todoItems"))

        todoItems.forEach(item => {

            let templateTodo = `
                <div class="item
                    flex gap-x-1.5 text-xl w-full border-b-2 border-slate-800 p-4 relative group 
                ">
                    <input type="checkbox" class="w-8 content-center accent-sky-400">
                    <span
                        class="flex-auto item-textbox w-2/3 text-base font-medium px-2 py-1 focus:outline-none"
                        contenteditable="true" data-placeholder="Tulis sesuatu"></span>
                    <i class="opacity-0 absolute right-4 fa fa-trash self-center text-red-500 transition-all duration-300 cursor-pointer group-hover:opacity-100"></i>
                </div>
                `

            $("#todo-main .items").append(templateTodo)

            $("#todo-main .items .item").last().find(".item-textbox").text(item.text)
            $("#todo-main .items .item").last().find("input[type=checkbox]").prop("checked", item.checked)

        })

    }

    // Item save to local storage realtime
    $("#todo-main .items .item").on("input", function () {

        let todoItems = []

        $("#todo-main .items .item").each(function () {

            let item = {
                "text": $(this).find(".item-textbox").text(),
                "checked": $(this).find("input[type=checkbox]").prop("checked")
            }

            todoItems.push(item)

        })

        console.log(todoItems)

        localStorage.setItem("todoItems", JSON.stringify(todoItems))

    })


    // Delete item
    $("#todo-main .items").on("click", ".item .fa-trash", function () {

        $(this).parent().remove()

        // add to local storage
        let todoItems = []

        $("#todo-main .items .item").each(function () {

            let item = {
                "text": $(this).find(".item-textbox").text(),
                "checked": $(this).find("input[type=checkbox]").prop("checked")
            }

            todoItems.push(item)

        })

        console.log(todoItems)

        localStorage.setItem("todoItems", JSON.stringify(todoItems))

    })

    // if status checked, make text line-through
    $("#todo-main .items").on("change", ".item input[type=checkbox]", function () {

        if ($(this).prop("checked")) {
            $(this).parent().find(".item-textbox").css("text-decoration", "line-through")
        } else {
            $(this).parent().find(".item-textbox").css("text-decoration", "none")
        }

        // add to local storage
        let todoItems = []

        $("#todo-main .items .item").each(function () {

            let item = {
                "text": $(this).find(".item-textbox").text(),
                "checked": $(this).find("input[type=checkbox]").prop("checked")
            }

            todoItems.push(item)

        })

        console.log(todoItems)

        localStorage.setItem("todoItems", JSON.stringify(todoItems))

    })

});