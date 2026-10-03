import "./index.css"
import PHCanvas from "./canvas.ts"

let debugMode = false
let debugElapsed = 1900
let pText = "Porn"
let hText = "hub"
let cText = "community"

function startOnscreenAnimation() {
    const canvas = document.querySelector("canvas")!
    const ctx = canvas.getContext("2d")!
    startAnimation(ctx)
}

function startAnimation(ctx: CanvasRenderingContext2D) {
    let startTime = 0
    function frame(timestamp: number) {
        if (startTime == 0) startTime = timestamp
        const elapsed = debugMode ? debugElapsed : timestamp - startTime
        ctx.clearRect(0, 0, 1920, 1080)
        if(debugMode) PHCanvas.drawReferentialLines(ctx)
        PHCanvas.drawRec(ctx, elapsed)
        PHCanvas.drawUploadCircle(ctx, elapsed)
        PHCanvas.drawLaptop(ctx, elapsed)
        PHCanvas.drawPlayCircle(ctx, elapsed)
        PHCanvas.drawText(ctx, elapsed, pText, hText, cText)
        if(elapsed < 3000 && !debugMode) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
}


function exportAnimation() {
    const canvas = document.querySelector("canvas")!
    const stream = canvas.captureStream(60)
    const recorder = new MediaRecorder(stream, {  })
    recorder.addEventListener("dataavailable", (e) => {
        const blob = e.data
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "phintro"
        a.click()
    })
    recorder.start()
    setTimeout(() => { recorder.stop() }, 3000)
    startAnimation(canvas.getContext("2d")!)
}

function initialize() {
    document.getElementById("start")!.addEventListener("click", startOnscreenAnimation)
    document.getElementById("debug")!.addEventListener("click", () => { debugMode = true })
    document.getElementById("prev-frame")!.addEventListener("click", () => { debugElapsed -= 33; startOnscreenAnimation() })
    document.getElementById("next-frame")!.addEventListener("click", () => { debugElapsed += 33; startOnscreenAnimation() })
    document.getElementById("export")!.addEventListener("click", exportAnimation)
    
}

document.addEventListener("DOMContentLoaded", initialize)
