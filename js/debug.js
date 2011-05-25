(function () {
    var console = document.createElement("div");
    console.style.position = "absolute";
    console.style.top = "50px";
    console.style.left = "50px";
    console.style.width = "300px";
    console.style.backgroundColor = "White";
    document.body.appendChild(console);

    function Trace(str) {
        var elem = document.createElement("p");
        if (!str) {
            str = typeof str;
        }
        elem.innerHTML = str.toString();
        console.appendChild(elem);
    }
    window.Trace = Trace;
})();