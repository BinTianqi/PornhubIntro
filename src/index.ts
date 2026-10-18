import "./index.css"
import PHCanvas from "./canvas.ts"

let progress = 0.0
let debugMode = false

const LENGTH = 74 * (1000 / 24) // 74 frames of intro in a 24fps video

class App extends HTMLElement {
    canvas = this.querySelector("canvas")!
    ctx = this.canvas.getContext("2d")!
    slider = this.querySelector("input.slider") as HTMLInputElement
    static SliderMax = 1000
    progressDiv = this.querySelector("div.progress")!
    progressPercent = this.progressDiv.querySelector(".percent")!
    progressTime = this.progressDiv.querySelector(".time")!
    startButton = this.querySelector("button.start")!
    exportButton = this.querySelector("button.export")!
    debugCheckbox = this.querySelector("#debug-checkbox") as HTMLInputElement

    connectedCallback() {
        this.startButton.addEventListener("click", () => {
            this.startAnimation(this.ctx)
        })
        this.exportButton.addEventListener("click", () => {
            this.exportAnimation()
        })
        this.debugCheckbox.addEventListener("change", async () => {
            debugMode = this.debugCheckbox.checked
            PHCanvas.ThemeColor = debugMode ? "#3aff0091" : PHCanvas.PhOrange
            PHCanvas.WhiteThemeColor = debugMode ? "#ff000091" : "white"
            if (debugMode && App.templateImages.length == 0) {
                await this.loadTemplateImages()
            }
            App.drawFrame(this.ctx, progress)
        })
        this.slider.addEventListener("input", () => {
            progress = this.slider.valueAsNumber / App.SliderMax
            App.drawFrame(this.ctx, progress)
            this.updateProgressText(progress)
        })
        PHCanvas.measureText(this.ctx, "Porn", "hub", "community")
    }

    updateProgressText(percent: number) {
        this.progressPercent.textContent = percent.toString()
        this.progressTime.textContent = ((LENGTH / 1000) * percent).toString()
    }

    static drawFrame(ctx: CanvasRenderingContext2D, percent: number) {
        const elapsed = LENGTH * percent
        ctx.clearRect(0, 0, 1920, 1080)
        if (debugMode) {
            const img = this.templateImages[Math.floor(74 * percent)]
            PHCanvas.drawTemplateImage(ctx, img)
            PHCanvas.drawReferentialLines(ctx)
        }
        PHCanvas.drawRec(ctx, elapsed)
        PHCanvas.drawUploadButton(ctx, elapsed)
        PHCanvas.drawLaptop(ctx, elapsed)
        PHCanvas.drawPlayButton(ctx, elapsed)
        PHCanvas.drawText(ctx, elapsed)
    }

    startAnimation(ctx: CanvasRenderingContext2D) {
        let startTime = 0
        // Make an alias because we can't use `this` in the lambda function below
        const cls = this
        requestAnimationFrame(function frame(timestamp: number) {
            if (startTime == 0) startTime = timestamp
            progress = (timestamp - startTime) / LENGTH
            cls.updateProgressText(progress)
            cls.slider.valueAsNumber = progress * App.SliderMax
            App.drawFrame(ctx, progress)
            if (progress < 1) requestAnimationFrame(frame)
        })
    }

    exportAnimation() {
        const canvas = document.querySelector("canvas")!
        const stream = canvas.captureStream(60)
        const recorder = new MediaRecorder(stream, {})
        recorder.addEventListener("dataavailable", (e) => {
            const blob = e.data
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = "phintro"
            a.click()
        })
        recorder.start()
        setTimeout(() => {
            recorder.stop()
        }, LENGTH)
        this.startAnimation(this.ctx)
    }

    static templateImages: ImageBitmap[] = []

    async loadTemplateImages() {
        const promises: Promise<void>[] = []
        for (let i = 1; i <= 74; i++) {
            const imgId = i.toString().padStart(3, "0")
            const promise = fetch(`/frames/${imgId}.webp`)
                .then((response) => response.blob())
                .then((blob) => createImageBitmap(blob))
                .then((image) => {
                    App.templateImages[i - 1] = image
                })
            promises.push(promise)
        }
        await Promise.all(promises)
    }
}

customElements.define("ph-app", App)
