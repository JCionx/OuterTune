var mouseDownSlider = false;
var hamMenuOpen = false;
var playlist = [];
var playlistIndex = 0;

var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    var player;
    function onYouTubeIframeAPIReady() {
    player = new YT.Player('yt-player', {
    height: '390',
    width: '640',
    videoId: '',
    playerVars: {
        'playsinline': 1
    },
    events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
    }
    });
}

function onPlayerReady(event) {
    console.log("Player ready");

    document.getElementById("thumbnail").src = "https://img.youtube.com/vi/" + player.getVideoData().video_id + "/maxresdefault.jpg";
    fetch(`https://noembed.com/embed?dataType=json&url=https://www.youtube.com/watch?v=${player.getVideoData().video_id}`)
        .then(res => res.json())
        .then(data => document.getElementById("video-title").innerHTML = data.title)
    fetch(`https://noembed.com/embed?dataType=json&url=https://www.youtube.com/watch?v=${player.getVideoData().video_id}`)
        .then(res => res.json())
        .then(data => document.getElementById("video-channel").innerHTML = data.author_name)
    fetch(`https://noembed.com/embed?dataType=json&url=https://www.youtube.com/watch?v=${player.getVideoData().video_id}`)
        .then(res => res.json())
        .then(data => document.getElementById("video-channel").setAttribute("href", data.author_url))
}

function onPlayerStateChange(event) {

}

function togglePlay() {
    if (document.getElementById("play_btn").hasAttribute("selected")) {
        console.log("Pausing")
        player.pauseVideo();
    } else {
        console.log("Playing")
        player.playVideo();
    }
    var slider = document.getElementById("player_slider");
    slider.value = player.getCurrentTime() / player.getDuration() * 100;
}

function updateVideoTime() {
    var slider = document.getElementById("player_slider");
    player.seekTo(slider.value / 100 * player.getDuration());
}

function updateSlider() {
    // so not change the slider if the user is dragging it
    if (mouseDownSlider) {
        return;
    }
    var slider = document.getElementById("player_slider");
    // check idf value is NaN
    if (player.getCurrentTime() !== player.getCurrentTime() || player.getCurrentTime() == 0) {
        slider.value = 0;
        return;
    }
    
    if (slider.value >= 100) {
        console.log("Video finished")
        nextVideo();
    }

    slider.value = player.getCurrentTime() / player.getDuration() * 100;
}

setInterval(updateSlider, 500);

function changeVideo(id) {
    player.loadVideoById(id);
    var slider = document.getElementById("player_slider");
    if (document.getElementById("play_btn").hasAttribute("selected")) {
        document.getElementById("play_btn").click();
    }
    slider.value = 0;
    player.seekTo(0);
    setTimeout(function() {
        onPlayerReady();
    }, 400);

    if (playlist.includes(id)) {
        playlistIndex = index;
    }
}

function onMouseDownSlider() {
    mouseDownSlider = true;
    console.log("Mouse down");
}

function onMouseUpSlider() {
    mouseDownSlider = false;
    console.log("Mouse up");
}

function hamMenu() {
    hamMenuOpen = !hamMenuOpen;
    if (hamMenuOpen) {
        document.getElementById("ham-menu-icn").innerHTML = "close";
        if (window.innerWidth < 800) {
            document.getElementById("menu").style.animation = "smallOpenMenu 0.3s ease-in-out";
        } else {
            document.getElementById("menu").style.animation = "openMenu 0.3s ease-in-out";
        }
        setTimeout(function() {
            document.getElementById("menu").style.left = "0";
        }, 280);
    } else {
        document.getElementById("ham-menu-icn").innerHTML = "menu";
        if (window.innerWidth < 800) {
            document.getElementById("menu").style.animation = "smallCloseMenu 0.3s ease-in-out";
        } else {
            document.getElementById("menu").style.animation = "closeMenu 0.3s ease-in-out";
        }
        setTimeout(function() {
            document.getElementById("menu").style.left = "-100vw";
        }, 280);
    }
}

function addToPlaylist(id) {
    if (playlist.includes(id)) {
        return;
    }
    playlist.push(id);
    console.log(playlist);
    // clone the playlist-item template
    var template = document.getElementById("playlist-item");
    var clone = template.cloneNode(true);
    clone.setAttribute("onclick", `changeVideo("${id}")`);
    clone.querySelector("img").src = "https://img.youtube.com/vi/" + id + "/maxresdefault.jpg";
    fetch(`https://noembed.com/embed?dataType=json&url=https://www.youtube.com/watch?v=${id}`)
        .then(res => res.json())
        .then(data => clone.querySelector("span").innerHTML = data.title)
    clone.setAttribute("id", id);
    document.getElementById("playlists").appendChild(clone);

    localStorage.setItem("playlistIndex", playlistIndex);
    localStorage.setItem("playlist", JSON.stringify(playlist));
}

function removeFromPlaylist(el) {
    el.remove();
    var id = el.getAttribute("id");
    var index = playlist.indexOf(id);
    if (index > -1) {
        playlist.splice(index, 1);
    }
    console.log(playlist);

    localStorage.setItem("playlistIndex", playlistIndex);
    localStorage.setItem("playlist", JSON.stringify(playlist));
}

function nextVideo() {
    changeVideo(playlist[playlistIndex]);
    playlistIndex++;
    localStorage.setItem("playlistIndex", playlistIndex);
    localStorage.setItem("playlist", JSON.stringify(playlist));
}

function prevVideo() {
    playlistIndex--;
    changeVideo(playlist[playlistIndex]);
    localStorage.setItem("playlistIndex", playlistIndex);
    localStorage.setItem("playlist", JSON.stringify(playlist));
}

function startup() {
    if (localStorage.getItem("playlist") !== null) {
        var tmpPlaylist = JSON.parse(localStorage.getItem("playlist"));
        playlistIndex = parseInt(localStorage.getItem("playlistIndex"));
        console.log(playlist);
        tmpPlaylist.forEach(id => {
            addToPlaylist(id);
        });
        setTimeout(function() {
            changeVideo(playlist[playlistIndex]);
        }, 1300);
    }
}

startup();

if ("serviceWorker" in navigator) {
    // register service worker
    navigator.serviceWorker.register("service-worker.js");
}