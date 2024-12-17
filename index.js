import { delay } from "./utils.js"
const orange = "#FF9900"
let debugMode = false
let debugElapsed = 590
let pText = "Porn"
let hText = "hub"
let cText = "community" 

function startOnscreenAnimation() {
    const canvas = document.querySelector("canvas")
    const ctx = canvas.getContext("2d")
    startAnimation(ctx)
}

function startAnimation(ctx) {
    let startTime
    function frame(timestamp) {
        if(startTime == undefined) startTime = timestamp
        const elapsed = debugMode ? debugElapsed : timestamp - startTime
        ctx.clearRect(0, 0, 1920, 1080)
        if(debugMode)drawReferentialLines(ctx)
        drawRec(ctx, elapsed)
        drawUploadCircle(ctx, elapsed)
        drawLaptop(ctx, elapsed)
        drawPlayCircle(ctx, elapsed)
        drawText(ctx, elapsed)
        if(elapsed < 3000 && !debugMode) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
}

function drawRec(ctx, elapsed) {
    if(elapsed >= 600) return
    ctx.fillStyle = orange
    const linearProgress = Math.max((elapsed - 420) / 180, 0)
    const progress = linearProgress ** 3
    if((elapsed >= 100 && elapsed < 300) || (elapsed >= 420 && elapsed < 600)) {
        ctx.beginPath()
        ctx.arc(865, 540 + progress * 100, 35, 0, 2 * Math.PI)
        ctx.fill()
    }
    ctx.font = "1000 100px roboto"
    ctx.letterSpacing = "0px"
    ctx.fillText("REC", 905 , 575 + progress * 100)
}

function drawLaptop(ctx, elapsed) {
    if(elapsed < 590 || elapsed >= 1220) return
    ctx.lineWidth = 10
    ctx.strokeStyle = orange
    if(elapsed < 660) {
        const appearProgress = (elapsed - 590) / 70
        ctx.save()
        ctx.beginPath()
        ctx.rect(770, 660 - 240 * appearProgress, 380, 240 * appearProgress)
        ctx.clip()
    }
    if(elapsed > 1060) {
        const disappearProgress = (elapsed - 1060) / 160
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(960, 540)
        ctx.arc(960, 540, 200, Math.PI * (-0.5 + disappearProgress * 1), Math.PI * (-0.5 - disappearProgress * 1))
        ctx.closePath()
        ctx.clip()
    }
    ctx.beginPath()
    ctx.roundRect(810, 450, 300, 180, 20)
    ctx.stroke()
    if(elapsed < 660 || elapsed > 1060) { ctx.restore() }
    ctx.lineJoin = "round"
    ctx.lineWidth = 10
    if(elapsed >= 1090) {
        const disappearProgress = (elapsed - 1090) / 130
        ctx.save()
        ctx.beginPath()
        ctx.rect(770 + disappearProgress * 190, 640, 380 - disappearProgress * 380, 30)
        ctx.clip()
    }
    ctx.beginPath()
    ctx.moveTo(780, 650)
    ctx.lineTo(1140, 650)
    ctx.lineTo(1130, 660)
    ctx.lineTo(790, 660)
    ctx.closePath()
    ctx.stroke()
    if(elapsed >= 1090) { ctx.restore() }
}

function drawUploadCircle(ctx, elapsed) {
    if(elapsed < 690 || elapsed >= 1190) return
    const linearCircleProgress = Math.min((elapsed - 690) / 200, 1)
    const circleProgress = 1 - (1 - linearCircleProgress) ** 3
    ctx.fillStyle = orange
    ctx.beginPath()
    ctx.arc(960, 640 - circleProgress * 100, 60, 0, 2 * Math.PI)
    ctx.fill()
    ctx.clearRect(900, 615, 120, 130)
    ctx.fillStyle = "black"
    if(elapsed >= 790) {
        const triangleProgress = (elapsed - 790) / 400
        ctx.beginPath()
        ctx.moveTo(960, 600 - triangleProgress * 100)
        ctx.lineTo(1000, 640 - triangleProgress * 100)
        ctx.lineTo(920, 640 - triangleProgress * 100)
        ctx.closePath()
        ctx.fill()
    }
    if(elapsed >= 930 && elapsed < 1190) {
        const rectProgress = Math.min((elapsed - 930) / 160, 1)
        ctx.fillRect(945, 600 - rectProgress * 35, 30, 60)
    }
}

function drawPlayCircle(ctx, elapsed) {
    if(elapsed < 1190 || elapsed >= 1750) return
    ctx.strokeStyle = orange
    const circleProgress = Math.min((elapsed - 1220) / 100, 1)
    ctx.beginPath()
    ctx.arc(960, 540, 45 + circleProgress * 20, 0, 2 * Math.PI)
    ctx.lineWidth = 40 - circleProgress * 34
    ctx.stroke()
    if(elapsed >= 1290) {
        ctx.lineJoin = "miter"
        ctx.fillStyle = orange
        ctx.beginPath()
        ctx.moveTo(935, 505)
        ctx.lineTo(935, 575)
        ctx.lineTo(995, 540)
        ctx.closePath()
        ctx.fill()
    }
    if(elapsed >= 1320) {
        const linearCursorProgress = (elapsed - 1320) / 430
        const cursorProgress = 1 - (1 - linearCursorProgress) ** 2
        drawCursor(ctx, 1020 - cursorProgress * 60, 600 - cursorProgress * 60)
    }
}

function drawCursor(ctx, x, y) {
    ctx.translate(x, y)
    ctx.rotate(-45 * Math.PI / 180)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(16, 16)
    ctx.lineTo(8, 16)
    ctx.lineTo(8, 40)
    ctx.lineTo(-8, 40)
    ctx.lineTo(-8, 16)
    ctx.lineTo(-16, 16)
    ctx.closePath()
    ctx.fillStyle = "black"
    ctx.fill()
    ctx.strokeStyle = orange
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
}

function drawText(ctx, elapsed) {
    if(elapsed < 1750) return
    ctx.fillStyle = "white"
    ctx.letterSpacing = "0px"
    ctx.font = "900 150px roboto"
    const pMetrics = ctx.measureText(pText)
    const hMetrics = ctx.measureText(hText)
    const phWidth = pMetrics.width + hMetrics.width + 60
    let pStartX = 960 - phWidth / 2
    for(const i in pText) {
        const charStartTime = i * (200 / pText.length) + 1750
        if(charStartTime > elapsed) continue
        const charProgress = Math.min((elapsed - charStartTime) / 100, 1)
        const charMetrics = ctx.measureText(pText[i])
        const charWidth = charMetrics.width
        const gradient = ctx.createLinearGradient(pStartX, 500, pStartX + charWidth + 10, 500)
        gradient.addColorStop(0, "white")
        gradient.addColorStop(Math.max(charProgress - 0.05, 0), "white")
        gradient.addColorStop(charProgress, orange)
        gradient.addColorStop(Math.min(charProgress + 0.2, 1), orange)
        gradient.addColorStop(Math.min(charProgress + 0.25, 1), "black")
        gradient.addColorStop(1, "black")
        ctx.fillStyle = gradient
        ctx.fillText(pText[i], pStartX, 500)
        pStartX += charWidth
    }
    if(elapsed >= 2010) {
        const hTextStartX = 960 - phWidth / 2 + pMetrics.width + 40
        const hCenterX = hTextStartX + hMetrics.width / 2
        const hLinearProgress = Math.min((elapsed - 2010) / 200, 1)
        const hProgress = 1 - (1 - hLinearProgress) ** 6
        ctx.translate(hCenterX, 445)
        ctx.rotate((-40 + 40 * hProgress) * Math.PI / 180)
        ctx.scale(0.6 + 0.4 * hProgress, 0.6 + 0.4 * hProgress)
        ctx.fillStyle = orange
        ctx.beginPath()
        ctx.roundRect(-hMetrics.width / 2 - 20, -90, hMetrics.width + 40, 180, 10)
        ctx.fill()
        ctx.fillStyle = "black"
        ctx.fillText(hText, -hMetrics.width / 2, 55)
        ctx.setTransform(1, 0, 0, 1, 0, 0)
    }
    ctx.fillStyle = "white"
    ctx.font = "60px roboto"
    const cMetrics = ctx.measureText(cText)
    const cCharSpacing = (phWidth - cMetrics.width - 10) / (cText.length - 1)
    if(elapsed >= 1850) {
        const cProgress = Math.min((elapsed - 1850) / 300, 1)
        const rotateProgress = 1 - (1 - cProgress) ** 3
        let cStartX = 965 - phWidth / 2
        for(const i in cText) {
            const charStartTime = 1850 + i * (300 / cText.length)
            if(charStartTime > elapsed) break
            const charMetrics = ctx.measureText(cText[i])
            const charProgress = Math.min((elapsed - charStartTime) / 130, 1)
            const degree = (charProgress < 0.5 ? 40 : -20) + (charProgress < 0.5 ? charProgress * -60 : rotateProgress * 20)
            ctx.translate(cStartX, 610)
            ctx.save()
            ctx.rotate(degree * Math.PI / 180)
            ctx.fillText(cText[i], 0, 0)
            ctx.restore()
            ctx.clearRect(-5, charMetrics.fontBoundingBoxDescent, charMetrics.width + 20, 30)
            ctx.setTransform(1, 0, 0, 1, 0, 0)
            cStartX += charMetrics.width + cCharSpacing
        }
    }
}

function drawRoundRectPath(cxt, width, height, radius) {
    cxt.beginPath()
    cxt.arc(width - radius, height - radius, radius, 0, Math.PI / 2)
    cxt.lineTo(radius, height)
    cxt.arc(radius, height - radius, radius, Math.PI / 2, Math.PI)
    cxt.lineTo(0, radius) 
    cxt.arc(radius, radius, radius, Math.PI, Math.PI * 3 / 2)
    cxt.lineTo(width - radius, 0)
    cxt.arc(width - radius, radius, radius, Math.PI * 3 / 2, Math.PI * 2)
    cxt.lineTo(width, height - radius)
    cxt.closePath()
}

function drawReferentialLines(ctx) {
    ctx.lineWidth = 3
    ctx.strokeStyle = "white"
    ctx.beginPath()
    ctx.moveTo(960, 0)
    ctx.lineTo(960, 1080)
    ctx.moveTo(0, 540)
    ctx.lineTo(1920, 540)
    ctx.stroke()
    ctx.lineWidth = 1
    ctx.beginPath()
    for(let i = 60; i <= 1860; i += 100) {
        ctx.moveTo(i, 0)
        ctx.lineTo(i, 1080)
    }
    for(let i = 40; i <= 1040; i += 100) {
        ctx.moveTo(0, i)
        ctx.lineTo(1920, i)
    }
    ctx.stroke()
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
        a.download = "phintro"
        a.click()
    })
    recorder.start()
    setTimeout(() => { recorder.stop() }, 3000)
    startAnimation(canvas.getContext("2d"))
}

function initialize() {
    document.getElementById("start").addEventListener("click", startOnscreenAnimation)
    document.getElementById("debug").addEventListener("click", () => { debugMode = true })
    document.getElementById("prev-frame").addEventListener("click", () => { debugElapsed -= 33; startOnscreenAnimation() })
    document.getElementById("next-frame").addEventListener("click", () => { debugElapsed += 33; startOnscreenAnimation() })
    document.getElementById("export").addEventListener("click", exportAnimation)
}

document.addEventListener("DOMContentLoaded", initialize)
