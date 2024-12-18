import { startAnimation } from "./animation.js"

let debugElapsed = JSON.parse(localStorage.getItem("debug_elapsed"))

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
    document.getElementById("start").addEventListener("click", () => { startOnscreenAnimation(false, false) })
    document.getElementById("prev-frame").addEventListener("click", () => { debugElapsed -= 33; startOnscreenAnimation(true, true) })
    document.getElementById("next-frame").addEventListener("click", () => { debugElapsed += 33; startOnscreenAnimation(true, true) })
    document.getElementById("export").addEventListener("click", exportAnimation)
}

document.addEventListener("DOMContentLoaded", initialize)
