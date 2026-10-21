type CanvasContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

export default class PHCanvasDrawer {
    static readonly PhOrange = "#FF9900"
    /** Default to that orange color, will change when debug mode is activated */
    ThemeColor = PHCanvasDrawer.PhOrange
    WhiteThemeColor = "white"


    static readonly LENGTH = 74 * (1000 / 24) // 74 frames of intro in a 24fps video

    constructor(private ctx: CanvasContext, pText: string, hText: string, cText: string) {
        this.measureText(ctx, pText, hText, cText)
    }

    drawFrame(elapsed: number, debug: boolean, debugTemplateImages: ImageBitmap[] | null) {
        const ctx = this.ctx
        ctx.fillStyle = "black"
        ctx.fillRect(0, 0, 1920, 1080)
        if (debug) {
            const img = debugTemplateImages![Math.floor(elapsed / PHCanvasDrawer.LENGTH * 74)]
            this.drawTemplateImage(ctx, img)
            this.drawReferentialLines(ctx)
        }
        this.drawRec(ctx, elapsed)
        this.drawUploadButton(ctx, elapsed)
        this.drawLaptop(ctx, elapsed)
        this.drawPlayButton(ctx, elapsed)
        this.drawText(ctx, elapsed)
    }

    drawRec(ctx: CanvasContext, elapsed: number) {
        if (elapsed >= 580) return
        ctx.fillStyle = this.ThemeColor
        const fallProgress = (elapsed < 420 ? 0 : (elapsed - 420) / (580 - 420)) ** 3
        if ((elapsed >= 90 && elapsed < 300) || (elapsed >= 420 && elapsed < 580)) {
            ctx.beginPath()
            ctx.arc(805, 1080 / 2 + fallProgress * 190, 60, 0, 2 * Math.PI)
            ctx.fill()
        }
        ctx.textBaseline = "middle"
        ctx.font = "1000 150px roboto" // I don't know what font they use
        ctx.letterSpacing = "2px"
        ctx.fillText("REC", 890, 550 + fallProgress * 190)
    }

    drawLaptop(ctx: CanvasContext, elapsed: number) {
        if (elapsed < 580 || elapsed >= 1200) return
        let y = 616 // top of the laptop base
        if (elapsed < 620) {
            const progress = (elapsed - 580) / (620 - 580)
            y = 767 - 135 * progress
        } else if (elapsed < 920) {
            const progress = clamp01((elapsed - 620) / (760 - 620))
            y = (767 - 135) - ((767 - 135) - 616) * easeOutCubic(progress)
        } else {
            const progress = (elapsed - 920) / (1200 - 920)
            y = 616 + (641 - 616) * progress
        }
        this.drawLaptopBase(ctx, y, elapsed)
        this.drawLaptopScreenFrame(ctx, y - 10, elapsed)
    }

    drawLaptopScreenFrame(ctx: CanvasContext, y: number, elapsed: number) {
        if (elapsed < 620) return
        const outerRadius = 22
        const innerRadius = 5
        const width = 1196 - 723 // constant bottom width
        const maxHeight = 607 - 312 // when the screen is a rectangle
        const thickness = 607 - 587
        let topWidth = 0, height = 0
        if (elapsed < 680) {
            const startWidth = 1208 - 712
            const startHeight = 622 - 368
            const progress = (elapsed - 620) / (680 - 620)
            topWidth = startWidth + (width - startWidth) * progress
            height = startHeight + (maxHeight - startHeight) * progress
        } else {
            const finalWidth = 1191 - 727
            const finalHeight = 616 - 333
            const progress = clamp01((elapsed - 680) / (800 - 680))
            topWidth = width - (width - finalWidth) * progress
            height = maxHeight - (maxHeight - finalHeight) * progress
        }

        ctx.save()
        if (elapsed > 1060) {
            const disappearProgress = (elapsed - 1060) / (1200 - 1060)
            const angle = Math.PI * disappearProgress
            ctx.beginPath()
            ctx.arc(1920 / 2, 1080 / 2, 500, -Math.PI / 2 + angle, -Math.PI / 2 - angle)
            ctx.lineTo(1920 / 2, 1080 / 2)
            ctx.closePath()
            ctx.clip()
        }

        ctx.beginPath()
        this.drawRoundedTrapezoidPath(ctx, 723, y, width, topWidth, height, outerRadius)
        this.drawRoundedTrapezoidPath(
            ctx,
            723 + thickness, y - thickness,
            width - 2 * thickness, topWidth - 2 * thickness,
            height - 2 * thickness, innerRadius
        )
        ctx.fillStyle = this.ThemeColor
        ctx.fill("evenodd")

        ctx.restore()
    }

    private drawRoundedTrapezoidPath(
        ctx: CanvasContext,
        x: number, y: number,
        bottomWidth: number, topWidth: number,
        height: number, radius: number
    ) {
        const p2 = { x: x + bottomWidth, y: y }
        const p3 = { x: x + (bottomWidth + topWidth) / 2, y: y - height }
        const p4 = { x: x + (bottomWidth - topWidth) / 2, y: y - height }
        // order: bottom-left > bottom-right > top-right > top-left
        ctx.moveTo(x + radius, y)
        ctx.arcTo(p2.x, p2.y, p3.x, p3.y, radius)
        ctx.arcTo(p3.x, p3.y, p4.x, p4.y, radius)
        ctx.arcTo(p4.x, p4.y, x, y, radius)
        ctx.arcTo(x, y, p2.x, p2.y, radius)
    }

    drawLaptopBase(ctx: CanvasContext, y: number, elapsed: number) {
        const ellipseRx = 27
        const ellipseRy = 32 // thickness
        const startX = 656 // top-left
        const endX = 1263 // top-right
        ctx.save()
        if (elapsed > 1060) {
            const disappearProgress = (elapsed - 1060) / (1200 - 1060)
            const width = (endX - startX) * (1 - disappearProgress)
            ctx.beginPath()
            ctx.rect(1920 / 2 - width / 2, 0, width, 1080)
            ctx.clip()
        }
        ctx.beginPath()
        // order: top-left > top-right > (1/4 ellipse down) > bottom-right >
        // bottom-left > (1/4 ellipse up) > top-left
        ctx.moveTo(startX, y)
        ctx.lineTo(endX, y)
        ctx.ellipse(endX - ellipseRx, y, ellipseRx, ellipseRy, 0, 0, Math.PI / 2)
        ctx.lineTo(startX + ellipseRx, y + ellipseRy)
        ctx.ellipse(startX + ellipseRx, y, ellipseRx, ellipseRy, 0, Math.PI / 2, Math.PI)
        ctx.fillStyle = this.ThemeColor
        ctx.fill()
        ctx.restore()
    }

    drawUploadButton(ctx: CanvasContext, elapsed: number) {
        if (elapsed < 670 || elapsed >= 1170) return
        ctx.save()
        ctx.beginPath()
        ctx.rect(0, 0, 1920, elapsed < 1040 ? 582 : 606)
        ctx.clip() // There's a gap between the screen frame and the "upload button"

        this.drawUploadCircle(ctx, elapsed)

        if (elapsed > 750) {
            const riseProgress = clamp01((elapsed - 750) / (1120 - 750))
            const arrowTop = 556 - (556 - 451) * easeOutQuad(riseProgress)
            const triangleHeight = 522 - 458
            this.drawTrianglePath(ctx, 945, arrowTop, (945 - 880) * 2, triangleHeight)
            ctx.fillStyle = "black"
            ctx.fill()

            const gapProgress = clamp01((elapsed - 1040) / (1170 - 1040)) ** 2
            const rectGap = gapProgress * 80 // The rect starts to leave the circle somehow
            ctx.beginPath()
            ctx.rect(916, arrowTop + triangleHeight + rectGap, 971 - 916, 200)
            ctx.fill()
        }
        
        ctx.restore()
    }

    private drawUploadCircle(ctx: CanvasContext, elapsed: number) {
        const riseProgress = clamp01((elapsed - 670) / 160)
        const fallProgress = clamp01((elapsed - 1040) / (1160 - 1040))
        ctx.beginPath()
        // (1039 - 854) - (1012 - 878) = 51
        ctx.arc(
            (1012 + 878) / 2, 600 - easeOutQuad(riseProgress) * 140 + fallProgress * 55,
            ((1012 - 878) + 51 * easeOutCubic(riseProgress)) / 2,
            0, 2 * Math.PI
        )
        ctx.fillStyle = this.ThemeColor
        ctx.fill()
    }

    drawPlayButton(ctx: CanvasContext, elapsed: number) {
        if (elapsed < 1170 || elapsed >= 1750) return
        this.drawPlayCircle(ctx, elapsed)
        this.drawPlayTrianglePath(ctx, elapsed)
        if (elapsed >= 1290) this.drawCursor(ctx, elapsed)
    }

    private drawPlayCircle(ctx: CanvasContext, elapsed: number) {
        const x = (1012 + 878) / 2 // See `drawUploadCircle()`
        const riseProgress = clamp01((elapsed - 1170) / (1220 - 1170))
        const fallProgress = clamp01((elapsed - 1220) / (1300 - 1220))
        const y = 515 - (515 - (627 + 369) / 2 + 10) * riseProgress + 10 * fallProgress
        ctx.beginPath()
        const outerRadiusProgress = clamp01((elapsed - 1180) / (1220 - 1180))
        const outerDiameter = 185 + ((627 - 369) - 185) * outerRadiusProgress
        ctx.arc(x, y, outerDiameter / 2, 0, 2 * Math.PI)
        const innerRadiusProgress = clamp01((elapsed - 1170) / (1330 - 1170))
        const innerDiameter = (627 - 369 - 7 * 2) * easeOutQuad(innerRadiusProgress)
        ctx.arc(x, y, innerDiameter / 2, 0, 2 * Math.PI)
        ctx.fillStyle = this.ThemeColor
        ctx.fill("evenodd")
    }

    private drawPlayTrianglePath(ctx: CanvasContext, elapsed: number) {
        const progress1 = clamp01((elapsed - 1170) / (1340 - 1170))
        let rotateProgress = easeOutQuad(progress1) * 1.06
        if (elapsed > 1340) {
            rotateProgress -= clamp01((elapsed - 1340) / (1380 - 1340)) * 0.06
        }
        const rotateCenter = { x: 952, y: 506 }
        ctx.translate(rotateCenter.x, rotateCenter.y)
        ctx.rotate(rotateProgress * Math.PI / 2)
        ctx.translate(-rotateCenter.x, -rotateCenter.y)
        const width = (1008 - 880) + ((560 - 434) - (1008 - 880)) * progress1
        const height = (516 - 451) + ((1008 - 905) - (516 - 451)) * easeOutQuad(progress1)
        this.drawTrianglePath(ctx, 944, 451, width, height)
        if (elapsed < 1250) {
            ctx.fillStyle = "black"
        } else {
            ctx.fillStyle = this.ThemeColor
        }
        ctx.fill()
        ctx.setTransform({})
    }

    drawCursor(ctx: CanvasContext, elapsed: number) {
        const progress = clamp01((elapsed - 1290) / (1600 - 1290))
        ctx.translate(easeInOutSine(progress) * -115, easeInOutSine(progress) * -115)
        ctx.beginPath()
        // Clockwise order
        ctx.moveTo(1062, 618)
        ctx.lineTo(1123, 618)
        ctx.lineTo(1106, 636)
        ctx.lineTo(1146, 677)
        ctx.lineTo(1121, 701)
        ctx.lineTo(1081, 661)
        ctx.lineTo(1062, 678)
        ctx.closePath()
        ctx.fillStyle = "black"
        ctx.fill()
        ctx.strokeStyle = this.ThemeColor
        ctx.lineWidth = 4
        ctx.stroke()
        ctx.setTransform({})
    }

    tmc!: TextMetricsCache

    measureText(ctx: CanvasContext, pText: string, hText: string, cText: string) {
        ctx.letterSpacing = "6px"
        ctx.font = "900 210px roboto"
        const pA = ctx.measureText(pText)
        const pS: TextMetrics[] = []
        for (let i = 0; i < pText.length; i++) {
            pS.push(ctx.measureText(pText[i]))
        }
        ctx.letterSpacing = "0px"
        const hA = ctx.measureText(hText)
        ctx.font = "80px roboto"
        const cA = ctx.measureText(cText)
        const cS: TextMetrics[] = []
        for (let i = 0; i < cText.length; i++) {
            cS.push(ctx.measureText(cText[i]))
        }
        this.tmc = {
            pT: pText,
            hT: hText,
            cT: cText,
            pMA: pA,
            hMA: hA,
            cMA: cA,
            pMS: pS,
            cMS: cS,
            pF: "900 225px roboto",
            hF: "900 210px roboto",
            cF: "600 95px roboto"
        }
    }

    drawText(ctx: CanvasContext, elapsed: number) {
        if (elapsed < 1750) return
        ctx.letterSpacing = "6px"
        ctx.textBaseline = "middle"
        ctx.font = this.tmc.pF
        const pEndSpace = 25
        const hHorizPad = 30 // hText horizontal padding
        const phWidth = this.tmc.pMA.width + this.tmc.hMA.width + pEndSpace + 2 * hHorizPad
        let pStartX = 960 - phWidth / 2
        const pY = 490
        for (let i = 0; i < this.tmc.pT.length; i++) {
            const charStartTime = i * (200 / this.tmc.pT.length) + 1750
            if (elapsed < charStartTime) break
            const progress1 = clamp01((elapsed - charStartTime) / 80)
            const progress2 = clamp01((elapsed - (charStartTime + 20)) / 80)
            const metrics = this.tmc.pMS[i]
            const charWidth = metrics.width
            const centerX = pStartX + metrics.width / 2
            const drawSingle = (progress: number, color: string) => {
                ctx.save()
                ctx.beginPath()
                ctx.moveTo(centerX, pY)
                ctx.lineTo(centerX, pY + 200)
                ctx.arc(centerX, pY, 200, Math.PI / 2, Math.PI / 2 + progress * Math.PI * 2)
                ctx.closePath()
                ctx.clip()
                ctx.fillStyle = color
                ctx.fillText(this.tmc.pT[i], pStartX, pY)
                ctx.restore()
            }
            drawSingle(progress1, this.ThemeColor)
            drawSingle(progress2, this.WhiteThemeColor)
            pStartX += charWidth
        }

        ctx.letterSpacing = "0px"
        ctx.font = this.tmc.hF
        const hBlockHeight = 611 - 364
        if (elapsed >= 2000) {
            const hTextStartX = 960 - phWidth / 2 + this.tmc.pMA.width + pEndSpace + hHorizPad
            const hCenterX = hTextStartX + this.tmc.hMA.width / 2
            const rotateProgress = clamp01((elapsed - 2000) / (2180 - 2000))
            let scaleProgress = easeOutQuad(clamp01((elapsed - 2000) / (2100 - 2000))) * 1.1
            if (elapsed > 2100) {
                scaleProgress -= clamp01((elapsed - 2100) / (2160 - 2000)) * 0.1
            }
            ctx.translate(hCenterX, 445)
            ctx.rotate((-40 + 40 * easeOutQuad(rotateProgress)) * Math.PI / 180)
            ctx.scale(0.6 + 0.4 * scaleProgress, 0.6 + 0.4 * scaleProgress)
            ctx.fillStyle = this.ThemeColor
            ctx.beginPath()
            ctx.roundRect(
                -this.tmc.hMA.width / 2 - hHorizPad, -hBlockHeight / 2 + 40,
                this.tmc.hMA.width + hHorizPad * 2 - 10, hBlockHeight,
                15
            )
            ctx.fill()
            ctx.fillStyle = "black"
            ctx.fillText(this.tmc.hT, -this.tmc.hMA.width / 2, 55)
            ctx.setTransform({})
        }

        ctx.fillStyle = this.WhiteThemeColor
        ctx.font = this.tmc.cF
        ctx.textBaseline = "bottom"
        const cCharSpacing = (phWidth - 20 - this.tmc.cMA.width) / (this.tmc.cT.length - 1)
        if (elapsed >= 1850) { // until 2150
            let cStartX = 960 - phWidth / 2
            for (let i = 0; i < this.tmc.cT.length; i++) {
                const charStartTime = 1850 + i * (270 / this.tmc.cT.length)
                if (elapsed < charStartTime) break
                const metrics = this.tmc.cMS[i]
                const progress = clamp01((elapsed - charStartTime) / 130)
                let degree = 0
                if (progress < 0.5) {
                    degree = 90 - easeOutQuad(progress * 2) * 100
                } else {
                    degree = -10 + ((progress - 0.5) * 2) * 10
                }
                ctx.save()
                ctx.translate(cStartX, 745)
                ctx.beginPath()
                ctx.rect(-200, 0, 400, -200)
                ctx.clip()
                ctx.rotate(degree * Math.PI / 180)
                ctx.fillText(this.tmc.cT[i], 0, 0)
                ctx.restore()
                cStartX += metrics.width + cCharSpacing
            }
        }
    }

    private drawTrianglePath(
        ctx: CanvasContext, x: number, y: number, width: number, height: number
    ) {
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + width / 2, y + height)
        ctx.lineTo(x - width / 2, y + height)
        ctx.closePath()
    }

    // Debug helper functions below

    drawReferentialLines(ctx: CanvasContext) {
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

    drawTemplateImage(ctx: CanvasContext, image: ImageBitmap) {
        ctx.drawImage(image, 0, 0)
    }
}

interface TextMetricsCache {
    // Text
    pT: string
    hT: string
    cT: string
    // Metrics (all)
    pMA: TextMetrics
    hMA: TextMetrics
    cMA: TextMetrics
    // Metrics (single)
    pMS: TextMetrics[]
    cMS: TextMetrics[]
    // Font
    pF: string
    hF: string
    cF: string
}

function easeInOutSine(x: number): number {
    return -(Math.cos(Math.PI * x) - 1) / 2;
}

function easeOutCubic(x: number): number {
    return 1 - Math.pow(1 - x, 3);
}

function easeOutQuad(x: number): number {
    return 1 - Math.pow(1 - x, 2);
}

function clamp01(value: number): number {
    return Math.min(Math.max(value, 0), 1)
}
