export default class PHCanvas {
    static Orange = "#FF9900"

    static drawRec(ctx: CanvasRenderingContext2D, elapsed: number) {
        if (elapsed >= 600) return
        ctx.fillStyle = PHCanvas.Orange
        const fallProgress = Math.max((elapsed - 420) / 180, 0)
        if ((elapsed >= 100 && elapsed < 300) || (elapsed >= 420 && elapsed < 600)) {
            ctx.beginPath()
            ctx.arc(865, 540 + fallProgress * 100, 35, 0, 2 * Math.PI)
            ctx.fill()
        }
        ctx.font = "1000 100px roboto"
        ctx.letterSpacing = "0px"
        ctx.fillText("REC", 905, 575 + fallProgress * 100)
    }

    static drawLaptop(ctx: CanvasRenderingContext2D, elapsed: number) {
        if (elapsed < 590 || elapsed >= 1190) return
        ctx.lineWidth = 10
        ctx.strokeStyle = PHCanvas.Orange
        ctx.beginPath()
        ctx.roundRect(810, 450, 300, 180, 20)
        ctx.stroke()
        ctx.lineJoin = "round"
        ctx.lineWidth = 10
        ctx.beginPath()
        ctx.moveTo(780, 650)
        ctx.lineTo(1140, 650)
        ctx.lineTo(1130, 660)
        ctx.lineTo(790, 660)
        ctx.closePath()
        ctx.stroke()
    }

    static drawUploadCircle(ctx: CanvasRenderingContext2D, elapsed: number) {
        if (elapsed < 700 || elapsed >= 1190) return
        const circleProgress = Math.min((elapsed - 700) / 160, 1)
        ctx.fillStyle = PHCanvas.Orange
        ctx.beginPath()
        ctx.arc(960, 680 - circleProgress * 140, 60, 0, 2 * Math.PI)
        ctx.fill()
        ctx.clearRect(900, 615, 120, 120)
        ctx.fillStyle = "black"
        if (elapsed >= 790) {
            const triangleProgress = (elapsed - 790) / 400
            ctx.beginPath()
            ctx.moveTo(960, 620 - triangleProgress * 120)
            ctx.lineTo(1000, 660 - triangleProgress * 120)
            ctx.lineTo(920, 660 - triangleProgress * 120)
            ctx.closePath()
            ctx.fill()
        }
        if (elapsed < 1150) {
            const rectProgress = (elapsed - 700) / 390
            ctx.fillRect(945, 660 - rectProgress * 90, 30, 60)
        }
    }

    static drawPlayCircle(ctx: CanvasRenderingContext2D, elapsed: number) {
        if (elapsed < 1190 || elapsed >= 1750) return
        ctx.strokeStyle = PHCanvas.Orange
        const circleProgress = Math.min((elapsed - 1220) / 100, 1)
        ctx.beginPath()
        ctx.arc(960, 540, 45 + circleProgress * 20, 0, 2 * Math.PI)
        ctx.lineWidth = 40 - circleProgress * 34
        ctx.stroke()
        if (elapsed >= 1290) {
            ctx.lineJoin = "miter"
            ctx.fillStyle = PHCanvas.Orange
            ctx.beginPath()
            ctx.moveTo(935, 505)
            ctx.lineTo(935, 575)
            ctx.lineTo(995, 540)
            ctx.closePath()
            ctx.fill()
        }
        if (elapsed >= 1320) {
            const cursorProgress = (elapsed - 1320) / 430
            PHCanvas.drawCursor(ctx, 1020 - cursorProgress * 60, 600 - cursorProgress * 60)
        }
    }

    static drawCursor(ctx: CanvasRenderingContext2D, x: number, y: number) {
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
        ctx.strokeStyle = PHCanvas.Orange
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.setTransform(1, 0, 0, 1, 0, 0)
    }

    static drawText(
        ctx: CanvasRenderingContext2D,
        elapsed: number,
        pText: string,
        hText: string,
        cText: string,
    ) {
        if (elapsed < 1750) return
        ctx.fillStyle = "white"
        ctx.letterSpacing = "0px"
        ctx.font = "900 150px roboto"
        const pMetrics = ctx.measureText(pText)
        const hMetrics = ctx.measureText(hText)
        const phWidth = pMetrics.width + hMetrics.width + 60
        let pStartX = 960 - phWidth / 2
        for (let i = 0; i < pText.length; i++) {
            const charStartTime = i * (200 / pText.length) + 1750
            if (charStartTime > elapsed) continue
            const charProgress = Math.min((elapsed - charStartTime) / 100, 1)
            const charMetrics = ctx.measureText(pText[i])
            const charWidth = charMetrics.width
            const gradient = ctx.createLinearGradient(pStartX, 500, pStartX + charWidth, 500)
            gradient.addColorStop(0, "white")
            gradient.addColorStop(Math.max(charProgress - 0.05, 0), "white")
            gradient.addColorStop(charProgress, PHCanvas.Orange)
            gradient.addColorStop(Math.min(charProgress + 0.2, 1), PHCanvas.Orange)
            gradient.addColorStop(Math.min(charProgress + 0.25, 1), "black")
            gradient.addColorStop(1, "black")
            ctx.fillStyle = gradient
            ctx.fillText(pText[i], pStartX, 500)
            pStartX += charWidth
        }
        if (elapsed >= 2010) {
            const hTextStartX = 960 - phWidth / 2 + pMetrics.width + 40
            const hCenterX = hTextStartX + hMetrics.width / 2
            const hProgress = Math.min((elapsed - 2010) / 200, 1)
            ctx.translate(hCenterX, 445)
            ctx.rotate((-40 + 40 * hProgress) * Math.PI / 180)
            ctx.scale(0.6 + 0.4 * hProgress, 0.6 + 0.4 * hProgress)
            ctx.fillStyle = PHCanvas.Orange
            ctx.beginPath()
            ctx.roundRect(-hMetrics.width / 2 - 20, -80, hMetrics.width + 40, 160, 10)
            ctx.fill()
            ctx.fillStyle = "black"
            ctx.fillText(hText, -hMetrics.width / 2, 55)
            ctx.setTransform(1, 0, 0, 1, 0, 0)
        }
        ctx.fillStyle = "white"
        ctx.font = "60px roboto"
        const cMetrics = ctx.measureText(cText)
        const cCharSpacing = (phWidth - cMetrics.width) / (cText.length - 1)
        if (elapsed >= 1850) { // until 2150
            let cStartX = 960 - phWidth / 2
            for (let i = 0; i < cText.length; i++) {
                const charStartTime = 1850 + i * (300 / cText.length)
                if (charStartTime > elapsed) break
                const charMetrics = ctx.measureText(cText[i])
                const charProgress = Math.min((elapsed - charStartTime) / 130, 1)
                const degree = (charProgress < 0.5 ? 40 : -20) + (charProgress < 0.5 ? charProgress * -60 : charProgress * 20)
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

    static drawReferentialLines(ctx: CanvasRenderingContext2D) {
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
        for (let i = 60; i <= 1860; i += 100) {
            ctx.moveTo(i, 0)
            ctx.lineTo(i, 1080)
        }
        for (let i = 40; i <= 1040; i += 100) {
            ctx.moveTo(0, i)
            ctx.lineTo(1920, i)
        }
        ctx.stroke()
    }
}
