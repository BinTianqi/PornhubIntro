import { delay } from "./utils.js"
//const orange = "#FF9900"
const orange = "#88DD2080"

export function startAnimation(ctx, pText, hText, cText, singleFrame, singleFrameElapsed, debugMode) {
    let startTime
    ctx.textBaseline = "top"
    function frame(timestamp) {
        if(startTime == undefined) startTime = timestamp
        const elapsed = singleFrame ? singleFrameElapsed : timestamp - startTime
        ctx.clearRect(0, 0, 1920, 1080)
        if(debugMode) drawOriginalImage(ctx, elapsed)
        if(debugMode) drawReferentialLines(ctx)
        drawRec(ctx, elapsed)
        drawLaptop(ctx, elapsed)
        drawPlayCircle(ctx, elapsed)
        drawLaptopScreenContent(ctx, elapsed)
        drawText(ctx, elapsed, pText, hText, cText)
        if(elapsed < 3000 && !singleFrame) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
}

function drawRec(ctx, elapsed) {
    if(elapsed >= 600) return
    ctx.fillStyle = orange
    const downProgress = Math.max(Math.min((elapsed - 430) / 100, 1), 0) ** 3
    const upProgress = Math.max((elapsed - 530) / 70, 0)
    const recY = 463 + downProgress * 190 - upProgress * 60
    const circleY = 535 + downProgress * 170 - upProgress * 50
    if((elapsed >= 100 && elapsed < 300) || (elapsed >= 470 && elapsed < 600)) {
        ctx.beginPath()
        ctx.arc(795, circleY, 60, 0, 2 * Math.PI)
        ctx.fill()
    }
    ctx.font = "1000 160px roboto"
    ctx.letterSpacing = "2px"
    ctx.fillText("REC", 890 , recY)
}

function drawLaptop(ctx, elapsed) {
    if(elapsed >= 1200) return
    if(elapsed >= 570) drawLaptopScreen(ctx, elapsed)
    if(elapsed >= 530) drawLaptopBase(ctx, elapsed)
}

function drawLaptopScreen(ctx, elapsed) {
    const upProgress = 1 - (1 - Math.min((elapsed - 570) / 130, 1)) ** 5
    const downProgress = Math.max((elapsed - 900) / 300, 0)
    const screenOpenStage1Progress = 1 - (1 - Math.min((elapsed - 570) / 130, 1)) ** 2
    const screenOpenStage2Progress = Math.max(Math.min((elapsed - 700) / 100, 1), 0)
    const heightIncreaseProgress = 1 - (1 - Math.min((elapsed - 570) / 130, 1)) ** 3
    const heightDecreaseProgress = Math.max(Math.min((elapsed - 700) / 170, 1), 0)
    const halfTopWidth = 270 - screenOpenStage1Progress * 30 - screenOpenStage2Progress * 5
    const y = 700 - upProgress * 105 + downProgress * 30
    const height = 190 + heightIncreaseProgress * 100 - heightDecreaseProgress * 10
    ctx.lineWidth = 20
    ctx.strokeStyle = orange
    ctx.translate(960, y) // move matrix to bottom center of screen
    if(elapsed >= 570 && elapsed < 630) {
        const appearProgress = (elapsed - 570) / 60
        ctx.save()
        ctx.beginPath()
        ctx.rect(-300, -140 + appearProgress * -180, 600, 360)
        ctx.clip()
    }
    if(elapsed >= 1030) {
        ctx.save()
        const rad = Math.PI * (elapsed - 1030) / 170
        ctx.beginPath()
        ctx.moveTo(0, -height / 2)
        ctx.arc(0, -height / 2, 400, -Math.PI / 2 + rad, -Math.PI / 2 - rad)
        ctx.closePath()
        ctx.clip()
    }
    ctx.lineWidth = 20 //debug
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.arcTo(240, 0, halfTopWidth, -height / 2, 20)
    ctx.arcTo(halfTopWidth, -height, 0, -height, 20)
    ctx.arcTo(-halfTopWidth, -height, -240, -height / 2, 20)
    ctx.arcTo(-240, 0, 0, 0, 20)
    ctx.closePath()
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, -15)
    ctx.lineTo(225, -15)
    ctx.lineTo(halfTopWidth - 15, -height + 15)
    ctx.lineTo(-halfTopWidth + 15, -height + 15)
    ctx.lineTo(-225, -15)
    ctx.closePath()
    //ctx.fillStyle = "black"
    //ctx.fill()
    //ctx.strokeStyle = "red"
    ctx.strokeStyle = "black"
    ctx.lineWidth = 10
    ctx.stroke()
    if((elapsed >= 570 && elapsed < 630) || elapsed >= 1030) ctx.restore()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
}

function drawLaptopBase(ctx, elapsed) {
    const x = 632
    const appearStage1Progress = Math.min((elapsed - 530) / 70, 1)
    const appearStage2Progress = 1 - (1 -Math.min(Math.max((elapsed - 600) / 200, 0), 1)) ** 5
    const downProgress = Math.max((elapsed - 930) / 270, 0)
    //console.log("s1", appearStage1Progress, "s2", appearStage2Progress, "scale", scaleProgress, "down", downProgress)
    const y = 785 - appearStage1Progress * 155 - appearStage2Progress * 15 + downProgress * 30
    ctx.fillStyle = orange
    //ctx.fillStyle = orange + Math.floor(50 + 205 * appearProgress).toString(16)
    ctx.translate(x, y)
    ctx.scale(1, 0.4 + appearStage1Progress * 0.6)
    if(elapsed >= 1070) {
        ctx.save()
        const disappearProgress = (elapsed - 1070) / 130
        ctx.beginPath()
        ctx.rect(-10 + disappearProgress * 340, -10, 680 - disappearProgress * 680, 55)
        ctx.clip()
    }
    ctx.beginPath()
    ctx.moveTo(20, 0)
    ctx.arcTo(655, 0, 630, 35, 8)
    ctx.arcTo(630, 35, 25, 35, 20)
    ctx.arcTo(25, 35, 0, 0, 20)
    ctx.arcTo(0, 0, 20, 0, 8)
    ctx.closePath()
    ctx.fill()
    if(elapsed >= 1070) ctx.restore()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
}

function drawLaptopScreenContent(ctx, elapsed) {
    if(elapsed < 630 || elapsed >= 1230) return
    ctx.fillStyle = orange
    if(elapsed < 800) { // Draw in laptop screen
        ctx.save()
        ctx.beginPath()
        ctx.rect(740, 325, 440, 250)
        ctx.clip()
    }
    if(elapsed < 1200) drawUploadCircle(ctx, elapsed)
    if(elapsed >= 730) drawArrow(ctx, elapsed)
    if(elapsed < 800) ctx.restore()
}

function drawUploadCircle(ctx, elapsed) {
    const upProgress = 1 - (1 - Math.min((elapsed - 630) / 240, 1)) ** 3.2
    const downProgress = Math.max(Math.min((elapsed - 1000) / 170, 1), 0)
    const scaleProgress = 1 - (1 - Math.min((elapsed - 630) / 100, 1)) ** 1
    const disappearProgress = Math.max((elapsed - 1130) / 70, 0)
    const disappearUpProgress = 1 - (1 - disappearProgress) ** 3
    ctx.fillStyle = orange
    ctx.beginPath()
    ctx.arc(960, 660 - upProgress * 210 + downProgress * 65 - disappearUpProgress * 35, 60 + scaleProgress * 40 + disappearProgress * 25, 0, 2 * Math.PI)
    ctx.fill()
}

function drawArrow(ctx, elapsed) {
    const triangleUpProgress = 1 - (1 - Math.min((elapsed - 730) / 300, 1)) ** 2
    const triangleDisappearProgress = Math.max((elapsed - 1170) / 60, 0)
    ctx.translate(960, 590 - triangleUpProgress * 150)
    ctx.rotate(triangleDisappearProgress * Math.PI / 5)
    //ctx.fillStyle = "black"
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(70, 70)
    ctx.lineTo(-70, 70)
    ctx.closePath()
    ctx.fill()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    if(elapsed >= 870 && elapsed < 1170) {
        const rectUpProgress = Math.min((elapsed - 870) / 160, 1)
        const rectDownProgress = Math.max((elapsed - 1070) / 100, 0)
        ctx.fillRect(930, 540 - rectUpProgress * 50 + rectDownProgress * 80, 60, 80)
    }
}

function drawPlayCircle(ctx, elapsed) {
    if(elapsed < 1200 || elapsed >= 1730) return
    ctx.strokeStyle = orange
    const circleAppearProgress = 1 - (1 - Math.min((elapsed - 1220) / 150, 1)) ** 3
    const circleDownProgress = Math.min((elapsed - 1200) / 100, 1)
    ctx.beginPath()
    ctx.arc(960, 475 + circleDownProgress * 12, 90 + circleAppearProgress * 42, 0, 2 * Math.PI)
    ctx.lineWidth = 100 - circleAppearProgress * 90
    ctx.stroke()
    if(elapsed >= 1270) {
        const rotateProgress = 1 - (1 - Math.min((elapsed - 1270) / 70, 1)) ** 2
        const rotateBackProgress = Math.min(Math.max((elapsed - 1400) / 60, 0), 1)
        ctx.translate(955, 487)
        ctx.rotate(-Math.PI / 22 + rotateProgress * Math.PI / 16 - rotateBackProgress * Math.PI / 59)
        ctx.fillStyle = orange
        ctx.beginPath()
        ctx.moveTo(-40, -70)
        ctx.lineTo(70, 0)
        ctx.lineTo(-40, 70)
        ctx.closePath()
        ctx.fill()
        ctx.setTransform(1, 0, 0, 1, 0, 0)
    }
    if(elapsed >= 1300) {
        const linearCursorProgress = Math.min((elapsed - 1300) / 300, 1)
        const cursorXProgress = 1 - (1 - linearCursorProgress) ** 1.4
        const cursorYProgress = 1 - (1 - linearCursorProgress) ** 2
        drawCursor(ctx, 1075 - cursorXProgress * 120, 620 - cursorYProgress * 120)
    }
}

function drawCursor(ctx, x, y) {
    ctx.translate(x, y)
    ctx.rotate(-45 * Math.PI / 180)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(40, 40)
    ctx.lineTo(20, 40)
    ctx.lineTo(20, 100)
    ctx.lineTo(-20, 100)
    ctx.lineTo(-20, 40)
    ctx.lineTo(-40, 40)
    ctx.closePath()
    ctx.fillStyle = "black"
    ctx.fill()
    ctx.strokeStyle = orange
    ctx.lineWidth = 7
    ctx.stroke()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
}

function drawText(ctx, elapsed, pText, hText, cText) {
    if(elapsed < 1730) return
    //ctx.textBaseline = "top"
    //ctx.letterSpacing = "20px"
    ctx.textAlign = "start"
    ctx.letterSpacing = "0px"
    ctx.textBaseline = "middle"
    ctx.font = "800 235px roboto"
    const pMetrics = ctx.measureText(pText)
    const pWidth = pMetrics.width
    //const pWidth = pMetrics.actualBoundingBoxLeft + pMetrics.actualBoundingBoxRight + (pText.length - 1) * 20
    ctx.letterSpacing = "2px"
    ctx.font = "700 220px roboto"
    const hMetrics = ctx.measureText(hText)
    const hWidth = hMetrics.width
    //const hWidth = hMetrics.actualBoundingBoxLeft + hMetrics.actualBoundingBoxRight
    //const phWidth = pMetrics.width + hMetrics.width + 60
    const phWidth = pWidth + 70 + hWidth
    let pStartX = 960 - phWidth / 2
    //drawVerticalLine(ctx, pStartX, 540)
    //drawVerticalLine(ctx, pStartX + phWidth, 540)
    //drawVerticalLine(ctx, pStartX + pWidth, 540)
    ctx.font = "800 235px roboto"
    ctx.letterSpacing = "0px"
    for(const i in pText) {
        const charStartTime = i * (200 / pText.length) + 1750
        if(charStartTime > elapsed) continue
        const charProgress = Math.min((elapsed - charStartTime) / 100, 1)
        const charMetrics = ctx.measureText(pText[i])
        const charWidth = charMetrics.width
        const gradient = ctx.createLinearGradient(pStartX - 10, 480, pStartX + charWidth + 20, 480)
        gradient.addColorStop(0, "white")
        gradient.addColorStop(Math.max(charProgress - 0.05, 0), "white")
        gradient.addColorStop(charProgress, orange)
        gradient.addColorStop(Math.min(charProgress + 0.2, 1), orange)
        gradient.addColorStop(Math.min(charProgress + 0.25, 1), "black")
        gradient.addColorStop(1, "black")
        ctx.fillStyle = gradient
        ctx.fillText(pText[i], pStartX - 10, 480)
        pStartX += charWidth + 2
    }
    if(elapsed >= 1970) {
        ctx.font = "700 220px roboto"
        ctx.fillStyle = "black"
        ctx.textAlign = "center"
        const hCenterX = 960 + phWidth / 2 - 30 - hWidth / 2
        //drawVerticalLine(ctx, hCenterX, 540)
        const hLinearProgress = Math.min((elapsed - 1970) / 230, 1)
        const hRotateProgress = 1 - (1 - hLinearProgress) ** 3
        const hScale1Progress = 1 - (1 - Math.min((elapsed - 1970) / 130, 1)) ** 2
        const hScale2Progress = 1 - (1 - Math.max(Math.min((elapsed - 2100) / 100, 1), 0)) ** 2
        const scale = 0.4 + hScale1Progress * 0.7 - hScale2Progress * 0.1
        ctx.translate(hCenterX - 60 + hRotateProgress * 60, 445 + 50 - hRotateProgress * 50)
        ctx.scale(scale, scale)
        ctx.translate(-100, 0)
        ctx.rotate((-60 + 60 * hRotateProgress) * Math.PI / 180)
        ctx.translate(100, 0)
        ctx.fillStyle = orange // debug only
        ctx.beginPath()
        //ctx.roundRect(-hMetrics.width / 2 - 20, -95, hMetrics.width + 40, 255, 15)
        ctx.roundRect(-hWidth / 2 - 20, -95, hWidth + 50, 255, 15)
        ctx.fill()
        ctx.fillText(hText, 0, 40)
        ctx.setTransform(1, 0, 0, 1, 0, 0)
    }
    ctx.fillStyle = "white"
    ctx.letterSpacing = "0px"
    ctx.font = "600 100px roboto"
    ctx.textAlign = "start"
    const cMetrics = ctx.measureText(cText)
    const cWidth = cMetrics.width
    //const cWidth = cMetrics.actualBoundingBoxLeft + cMetrics.actualBoundingBoxRight
    //const cCharSpacing = (phWidth - cMetrics.width - 10) / (cText.length - 1)
    const cCharSpacing = (phWidth - cWidth - 10) / (cText.length - 1)
    if(elapsed >= 1830) {
        ctx.textBaseline = "middle"
        const cProgress = Math.min((elapsed - 1830) / 300, 1)
        const rotateProgress = 1 - (1 - cProgress) ** 3
        let cStartX = 960 - phWidth / 2
        for(const i in cText) {
            const charStartTime = 1830 + i * (300 / cText.length)
            if(charStartTime > elapsed) break
            const charMetrics = ctx.measureText(cText[i])
            const charProgress = Math.min((elapsed - charStartTime) / 100, 1)
            const degree = (charProgress < 0.5 ? 30 : -20) + (charProgress < 0.5 ? charProgress * -50 : rotateProgress * 20)
            ctx.translate(cStartX - 20, 705)
            ctx.save()
            ctx.rotate(degree * Math.PI / 180)
            ctx.scale(1, 0.95)
            ctx.fillText(cText[i], 20, 0)
            ctx.restore()
            ctx.clearRect(0, charMetrics.actualBoundingBoxDescent, 100, 60)
            ctx.setTransform(1, 0, 0, 1, 0, 0)
            cStartX += charMetrics.width + cCharSpacing
            //cStartX += charMetrics.actualBoundingBoxLeft + charMetrics.actualBoundingBoxRight + cCharSpacing
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

function drawVerticalLine(ctx, x, y) {
    const originColor = ctx.strokeStyle
    ctx.beginPath()
    ctx.moveTo(x, y - 10)
    ctx.lineTo(x, y + 10)
    ctx.strokeStyle = "red"
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.strokeStyle = originColor
}

function drawOriginalImage(ctx, elapsed) {
    const frame = Math.floor(elapsed / 33.3)
    const frameId = (frame < 10 ? "0" : "") + frame
    const img = document.getElementById("img-" + frameId)
    ctx.drawImage(img, 0, 246, 406, 228, -60, -40, 2052, 1148)
    ctx.fillStyle = "#FF9900"
    ctx.font = "50px roboto"
    ctx.fillText(`Elapsed ${Math.floor(elapsed)}, Frame ${frame}`, 750, 0)
}

