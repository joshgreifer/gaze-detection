export async function exitFullscreen() {
    if (document.fullscreenElement)  {
        await document.exitFullscreen();
    }
}

export async function enterFullscreen(el:any) {
    const requestFullscreen =
        el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen || el.requestFullscreen;

    if (el && requestFullscreen)
        await requestFullscreen.call(el);
}