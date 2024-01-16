const fs = require('fs');
const yt = require("youtube-search-api");
const cheerio = require("cheerio");

const express = require('express');
const app = express();

const port = 420;

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/pages/main/index.html");
});
app.get('/video', (req, res) => {
    res.sendFile(__dirname + "/pages/video/index.html");
});
app.get('/api/:key/', async (req, res) => {
    let key = req.params.key;
    let search = req.query;
    if(key=="search") {
        yt.GetListByKeyword(search.q||"", search.playlist||false, search.limit||40, [{type:"video"}]).then(a => res.send(processSearch(a)));
    } else if(key=="video") {
        let additional;
        await yt.GetVideoDetails(search.id).then(e => additional = e);
        console.log(additional);
        fetch("https://www.youtube.com/watch?v="+search.id).then(e => e.text()).then(async function(html) { //http://127.0.0.1:420/api/video?id=SAhAXu8kizY
            let $ = cheerio.load(html);
            
            let author = $('span[itemprop="author"]');
            let authorName = author.children('link[itemprop="name"]').attr("content");
            let authorData;
            await fetch(author.children('link[itemprop="url"]').attr("href")).then(e => e.text()).then(e => authorData = cheerio.load(e));
            let authorImage = authorData('link[itemprop="thumbnailUrl"]').attr("href");

            let title = $('meta[property="og:title"]').attr('content');
            let thumb = $('meta[property="og:image"]').attr("content");
            let keywords = $('meta[name="keywords"]').attr("content");
            let videoData;
            await fetch("https://returnyoutubedislikeapi.com/votes?videoId="+search.id).then(e => e.json()).then(e => videoData = e);
            
            res.send({
                title: title,
                desc: additional.description,
                thumb: thumb,
                keywords: keywords,
                created: new Date(videoData.dateCreated).getTime(),
                views: videoData.viewCount,
                rating: {
                    likes: videoData.likes,
                    dislikes: videoData.dislikes
                },
                live: additional.isLive,
                creator: {
                    img: authorImage,
                    name: authorName
                },
                player: "https://youtube.com/embed/"+search.id
            });
        });
        if(search.id==null) res.send("{\"error\":true}");
    } else {

    }
});

app.get('*', (req, res) => {
    let u = req.url;

    let file = false;
    for(let suff of ".css .scss .js .html".split(" ")) {
        if(u.endsWith(suff)) file = true;
    }
    let exists = fs.existsSync(__dirname+u);
    res.sendFile(__dirname+(file&&exists?u:"/pages/error/index.html"));
});

app.listen(port, () => {
    console.log(`App listening at http://127.0.0.1:${port}`);
});

function processSearch(j) {
    for(let item of j.items) {
        delete item.shortBylineText;
        item.length = item.length.simpleText;
        item.live = item.isLive;
        delete item.isLive;
        item.thumbnail = item.thumbnail.thumbnails[0].url;
    }
    return j;
}
function processVideo(j) {
    for(let item of j.suggestion) {
        item.length = item.length.simpleText;
        item.thumbnail = item.thumbnail[0].url;
        item.live = item.isLive;
        delete item.isLive;
        delete item.shortBylineText;
    }
    return j;
}