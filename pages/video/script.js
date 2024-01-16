const content = document.querySelector(".content");

function main() {
    loadVideo(new URLSearchParams(window.location.search).get("id"));
}
main();

function loadVideo(id) {
    fetch("./api/video?id="+id).then(e => e.json()).then(e => {
        let video = document.createElement("div");
        console.log(e.desc);
        for(let m of e.desc.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/)) {
            if(m==null || !m.includes("http")) continue;
            let t = m.replace(/(https|http):\/\//, "");
            e.desc = e.desc.replaceAll(m, `<a href="${m}" target="_blank">${t}</a>`);
        };
        video.innerHTML = `
            <iframe src="${e.player}" frameborder="0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
            <div class="right">
                <div class="title">${e.title}</div>
                <div class="desc">${e.desc.replaceAll("\n", "<br>")}</div>
                <div class="info">
                    <div class="views">${format(e.views)}</div>
                    <div class="ratings">${format(e.rating.likes)}<i class="fa-solid fa-thumbs-up rating"></i> | ${format(e.rating.dislikes)}<i class="fa-solid fa-thumbs-down rating"></i> (${parseInt(e.rating.likes/(e.rating.likes+e.rating.dislikes)*1000)/10}% positive)</div>
                </div>
            </div>
        `;
        content.appendChild(video);
    });
}
function format(int) {
    int = int+"";
    let v = "", a = 0;
    for(let i = int.length-1; i >= 0; i--) {
        let el = int[i]+(a%3==0&&a!=0?",":"");
        v = el+v;
        a++;
    }
    return v;
}