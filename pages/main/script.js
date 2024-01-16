const mid = document.querySelector(".mid");

function main() {
    loadMain();
}
main();

function loadMain() {
    fetch("./api/search").then(e => e.json()).then(e=> {
        let j = e.items;
        for(let i of j) {
            let el = document.createElement("div");
            el.className = "video "+(i.live?"live":"");
            el.setAttribute("video-id", i.id);
            el.style.setProperty("--video-thumb", "url("+i.thumbnail+")");
            el.innerHTML = `
                <div class="thumbnail"></div>
                <div class="title">${i.title}</div>
                <div class="channel">${i.channelTitle}</div>
            `;
            el.addEventListener("click", (e) => {
                window.location.href = "./video?id="+i.id;
            });
            mid.appendChild(el);
        }
    });
}