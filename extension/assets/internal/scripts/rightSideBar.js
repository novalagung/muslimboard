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



});