addEventListener('DOMContentLoaded', () => {

    const liItem = document.querySelectorAll("li");
    let liValue = "web";
    let input = document.getElementById("search-value");
    let inputValue = input.value;
    let searchURL = "https://www.google.com/search?q=";
    let searchTerm = "";

    liItem.forEach(li => li.addEventListener("click", function () {

        const remove = document.querySelectorAll(".search-active");
        remove.forEach(r => r.classList.remove("search-active"));
        remove.forEach(r => r.classList.remove("text-slate-50"));

        this.classList.add("search-active")
        this.classList.add("text-slate-50")

        // get list value
        liValue = this.textContent;
        
        liValue = liValue.toLowerCase();

        changeSelection(liValue);
        inputValue = encodeURIComponent(inputValue);
        

        
    }));

    input.addEventListener("input", function () {

        changeSelection(liValue);

        // Encoding value to URL
        inputValue = encodeURIComponent(inputValue);

        let myForm = document.getElementById("search-form");
        myForm.action = searchURL + inputValue + searchTerm;

        

        
    });

    input.addEventListener("keyup", function (event) {

        if (event.keyCode === 13) {

            if(inputValue === "") {
                return;
            }

            event.preventDefault();
            goToLink(searchURL + inputValue + searchTerm);
        }
    });

    function changeSelection(liValue) {

        if (liValue === "web") {
            inputValue = input.value;
    
        } else if (liValue === "images") {
            inputValue = input.value;
            searchTerm = "&tbm=isch"
    
        } else if (liValue === "videos") {
            inputValue = input.value;
            searchTerm = "&tbm=vid"
    
        } else if (liValue === "news") {
            inputValue = input.value;
            searchTerm = "&tbm=nws"
    
        } else if (liValue === "shopping") {
            inputValue = input.value;
            searchTerm = "&tbm=shop"
    
        }
    
    }

    function goToLink(finalLink) {
        let googleSearchUrl = finalLink;
        window.location.href = googleSearchUrl;
    }

    // clear input 
    const clearInput = document.getElementById("clear-input");
    clearInput.addEventListener("click", function () {
        input.value = "";
        input.focus();
    });

});



