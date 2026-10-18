import { startAnimation } from "./animation.js"

let debugElapsed = 0

function startOnscreenAnimation(debugMode, singleFrame) {
    const canvas = document.querySelector("canvas")
    const ctx = canvas.getContext("2d")
    const pText = document.getElementById("input-text-p").value
    const hText = document.getElementById("input-text-h").value
    const cText = document.getElementById("input-text-c").value
    const singleFrameElapsed = debugMode ? debugElapsed : 2600
    startAnimation(ctx, pText, hText, cText, singleFrame, singleFrameElapsed, debugMode)
}

function exportAnimation() {
    const canvas = document.querySelector("canvas")
    const stream = canvas.captureStream(60)
    const recorder = new MediaRecorder(stream, {  })
    recorder.addEventListener("dataavailable", (e) => {
        const blob = e.data
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "pornhub-intro"
        a.click()
    })
    recorder.start()
    setTimeout(() => { recorder.stop() }, 3000)
    startOnscreenAnimation(false, false)
}

function initialize() {
    debugElapsed = JSON.parse(localStorage.getItem("debug_elapsed"))
    document.getElementById("start").addEventListener("click", () => { startOnscreenAnimation(false, false) })
    document.getElementById("minus5").addEventListener("click", () => { debugElapsed -= 5; startOnscreenAnimation(true, true) })
    document.getElementById("prev-frame").addEventListener("click", () => { debugElapsed -= 33.3; startOnscreenAnimation(true, true) })
    document.getElementById("draw").addEventListener("click", () => { startOnscreenAnimation(true, true) })
    document.getElementById("next-frame").addEventListener("click", () => { debugElapsed += 33.3; startOnscreenAnimation(true, true) })
    document.getElementById("plus5").addEventListener("click", () => { debugElapsed += 5; startOnscreenAnimation(true, true) })
    document.getElementById("export").addEventListener("click", exportAnimation)
    loadImages()
}

function loadImages() {
    for(let i = 0; i <= 91; i++) {
        const img = new Image()
        const id = i < 10 ? "0" + i : i.toString()
        img.src = "PHIntro/Pornhub" + id + ".jpg"
        img.id = "img-" + id
        document.getElementById("images").appendChild(img)
    }
}

document.addEventListener("DOMContentLoaded", initialize)
