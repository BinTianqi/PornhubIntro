import "./index.css"
import PHCanvas from "./canvas.ts"

const DEBUG = false // Do not submit with true

let progress = 0.0
let debugMode = false

const LENGTH = 74 * (1000 / 24) // 74 frames of intro in a 24fps video

class App extends HTMLElement {
    audio = this.querySelector("audio")!
    canvas = this.querySelector("canvas")!
    ctx = this.canvas.getContext("2d")!
    slider = this.querySelector("input.slider") as HTMLInputElement
    static SliderMax = 1000
    progressDiv = this.querySelector("div.progress")!
    progressPercent = this.progressDiv.querySelector(".percent")!
    progressTime = this.progressDiv.querySelector(".time")!
    startButton = this.querySelector("button.start") as HTMLButtonElement
    exportButton = this.querySelector("button.export")!
    customTextDiv = this.querySelector("div.custom-text")!
    pTextInput = this.customTextDiv.querySelector("input.p-text") as HTMLInputElement
    hTextInput = this.customTextDiv.querySelector("input.h-text") as HTMLInputElement
    cTextInput = this.customTextDiv.querySelector("input.c-text") as HTMLInputElement
    debugCheckbox = this.querySelector("#debug-checkbox") as HTMLInputElement

    animPlaying = false
    animId = 0

    connectedCallback() {
        this.startButton.addEventListener("click", async () => {
            if (this.animPlaying) {
                cancelAnimationFrame(this.animId)
                this.audio.pause()
            } else {
                this.startButton.disabled = true
                this.audio.currentTime = 0
                await this.audio.play()
                this.startAnimation(this.ctx)
                this.startButton.disabled = false
            }
            this.updatePlayButton(!this.animPlaying)
        })
        this.exportButton.addEventListener("click", () => {
            this.exportAnimation()
        })
        if (DEBUG) this.debugCheckbox.addEventListener("change", async () => {
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
        this.customTextDiv.addEventListener("input", () => {
            PHCanvas.measureText(
                this.ctx, this.pTextInput.value, this.hTextInput.value, this.cTextInput.value
            )
            if (!this.animPlaying) {
                progress = 0.9
                App.drawFrame(this.ctx, progress)
                this.updateProgressText(progress)
                this.slider.valueAsNumber = App.SliderMax * progress
            }
        })
        PHCanvas.measureText(this.ctx, "Porn", "hub", "community")
        App.drawFrame(this.ctx, 0)
        if (DEBUG) this.querySelector("div.debug")!.classList.remove("hidden")
    }

    updateProgressText(percent: number) {
        this.progressPercent.textContent = percent.toFixed(4).toString()
        this.progressTime.textContent = Math.round(LENGTH * percent).toString() + "ms"
    }

    updatePlayButton(playing: boolean) {
        this.startButton.textContent = playing ? "Stop" : "Play"
        this.animPlaying = playing
    }

    static drawFrame(ctx: CanvasRenderingContext2D, percent: number) {
        const elapsed = LENGTH * percent
        ctx.clearRect(0, 0, 1920, 1080)
        if (DEBUG && debugMode) {
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
        this.animId = requestAnimationFrame(function frame(timestamp: number) {
            if (startTime == 0) startTime = timestamp
            progress = Math.min((timestamp - startTime) / LENGTH, 1)
            cls.updateProgressText(progress)
            cls.slider.valueAsNumber = progress * App.SliderMax
            App.drawFrame(ctx, progress)
            if (progress < 1) {
                cls.animId = requestAnimationFrame(frame)
            } else {
                cls.updatePlayButton(false)
            }
        })
    }

    exportAnimation() {
        const stream = this.canvas.captureStream(60)
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
