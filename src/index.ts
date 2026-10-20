import "./index.css"
import PHCanvasDrawer from "./canvas.ts"
import soundUrl from "./sound.aac"
import { render } from "./renderer.ts"

const DEBUG = false // Do not submit with true

let progress = 0.0
let debugMode = false

class App extends HTMLElement {
    audio = new Audio(soundUrl)
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

    drawer = new PHCanvasDrawer(this.ctx, "Porn", "hub", "community")
    //renderer = new Worker(new URL("renderer.ts", import.meta.url))
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
                this.startAnimation()
                this.startButton.disabled = false
            }
            this.updatePlayButton(!this.animPlaying)
        })
        this.exportButton.addEventListener("click", () => {
            this.exportAnimation()
        })
        if (DEBUG) this.debugCheckbox.addEventListener("change", async () => {
            debugMode = this.debugCheckbox.checked
            this.drawer.ThemeColor = debugMode ? "#3aff0091" : PHCanvasDrawer.PhOrange
            this.drawer.WhiteThemeColor = debugMode ? "#ff000091" : "white"
            if (debugMode && this.templateImages.length == 0) {
                await this.loadTemplateImages()
            }
            this.drawFrame(progress)
        })
        this.slider.addEventListener("input", () => {
            progress = this.slider.valueAsNumber / App.SliderMax
            this.drawFrame(progress)
            this.updateProgressText(progress)
        })
        this.customTextDiv.addEventListener("input", () => {
            this.drawer.measureText(
                this.ctx, this.pTextInput.value, this.hTextInput.value, this.cTextInput.value
            )
            if (!this.animPlaying) {
                progress = 0.9
                this.drawFrame(progress)
                this.updateProgressText(progress)
                this.slider.valueAsNumber = App.SliderMax * progress
            }
        })
        this.drawFrame(0)
        if (DEBUG) this.querySelector("div.debug")!.classList.remove("hidden")
    }

    updateProgressText(percent: number) {
        this.progressPercent.textContent = percent.toFixed(4).toString()
        this.progressTime.textContent = Math.round(PHCanvasDrawer.LENGTH * percent).toString() + "ms"
    }

    updatePlayButton(playing: boolean) {
        this.startButton.textContent = playing ? "Stop" : "Play"
        this.animPlaying = playing
    }

    drawFrame(percent: number) {
        this.drawer.drawFrame(percent, DEBUG && debugMode, this.templateImages)
    }

    startAnimation() {
        let startTime = 0
        // Make an alias because we can't use `this` in the lambda function below
        const cls = this
        this.animId = requestAnimationFrame(function frame(timestamp: number) {
            if (startTime == 0) startTime = timestamp
            progress = Math.min((timestamp - startTime) / PHCanvasDrawer.LENGTH, 1)
            cls.updateProgressText(progress)
            cls.slider.valueAsNumber = progress * App.SliderMax
            cls.drawFrame(progress)
            if (progress < 1) {
                cls.animId = requestAnimationFrame(frame)
            } else {
                cls.updatePlayButton(false)
            }
        })
    }

    async exportAnimation() {
        const a = document.createElement("a")
        a.download = "ph-intro.mp4"
        const blobUrl = await render()
        a.href = blobUrl
        a.click()
    }

    templateImages: ImageBitmap[] = []

    async loadTemplateImages() {
        const promises: Promise<void>[] = []
        for (let i = 1; i <= 74; i++) {
            const imgId = i.toString().padStart(3, "0")
            const promise = fetch(`/frames/${imgId}.webp`)
                .then((response) => response.blob())
                .then((blob) => createImageBitmap(blob))
                .then((image) => {
                    this.templateImages[i - 1] = image
                })
            promises.push(promise)
        }
        await Promise.all(promises)
    }
}

customElements.define("ph-app", App)
