

// require svg.js
// 需设置 html,body{width:100%;height:100%;margin:0;padding:0;}

function Grid(iw,ih) {
    var svgElem = document.createElementNS(SVG.SVG_NS, 'svg'),
        ctx = new SVGContext(svgElem);
    svgElem.style.position = "absolute";
    svgElem.style.top = 0;
    svgElem.style.left = 0;
    svgElem.style.zIndex = -1;
    document.body.appendChild(svgElem);

    ctx.group(function () {
        var width = window.innerWidth,
            height = window.innerHeight,
            countH = height / ih,
            countW = width / iw,
            i = 0;
        ctx.strokeStyle = ctx.fillStyle = "Gray";
        ctx.lineWidth = 1;
        ctx.translate(0.5, 0.5);
        // horizontal
        for (i = 1; i < countH; ++i) {
            ctx.line(0, i * ih, width, i * ih);
            ctx.fillText(i * ih, width - 50, i * ih);
        }
        // vertical
        for (i = 1; i < countW; ++i) {
            ctx.line(i * iw, 0, i * iw, height);
            ctx.fillText(i * iw, i * iw, height - 20);
        }
    });
}