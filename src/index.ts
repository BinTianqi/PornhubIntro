import "./index.css"
import PHCanvasDrawer from "./canvas.ts"
import soundUrl from "./sound.aac"
import { render } from "./renderer.ts"

const DEBUG = false // Do not submit with true

class App extends HTMLElement {
    audio = new Audio(soundUrl)
    canvas = this.querySelector("canvas")!
    ctx = this.canvas.getContext("2d")!
    slider = this.querySelector("input.slider") as HTMLInputElement
    progressDiv = this.querySelector("div.progress")!
    progressPercent = this.progressDiv.querySelector(".percent")!
    progressTime = this.progressDiv.querySelector(".time")!
    playButton = this.querySelector("button.play") as HTMLButtonElement
    playButtonDiv = this.playButton.querySelector("div")!
    exportButton = this.querySelector("button.export")!
    customTextDiv = this.querySelector("div.custom-text")!
    pTextInput = this.customTextDiv.querySelector("input.p-text") as HTMLInputElement
    hTextInput = this.customTextDiv.querySelector("input.h-text") as HTMLInputElement
    cTextInput = this.customTextDiv.querySelector("input.c-text") as HTMLInputElement
    debugCheckbox = this.querySelector("#debug-checkbox") as HTMLInputElement

    elapsed = 0
    debugMode = false
    drawer = new PHCanvasDrawer(this.ctx, "Porn", "hub", "community")
    animPlaying = false
    animId = 0

    connectedCallback() {
        this.playButton.addEventListener("click", async () => {
            if (this.animPlaying) {
                cancelAnimationFrame(this.animId)
                this.audio.pause()
            } else {
                this.playButton.disabled = true
                this.audio.currentTime = 0
                await this.audio.play()
                this.startAnimation()
                this.playButton.disabled = false
            }
            this.updatePlayButton(!this.animPlaying)
        })
        this.exportButton.addEventListener("click", () => {
            this.exportAnimation()
        })
        if (DEBUG) this.debugCheckbox.addEventListener("change", async () => {
            this.debugMode = this.debugCheckbox.checked
            this.drawer.ThemeColor = this.debugMode ? "#3aff0091" : PHCanvasDrawer.PhOrange
            this.drawer.WhiteThemeColor = this.debugMode ? "#ff000091" : "white"
            if (this.debugMode && this.templateImages.length == 0) {
                await this.loadTemplateImages()
            }
            this.drawFrame()
        })
        this.slider.max = PHCanvasDrawer.LENGTH.toString()
        this.slider.addEventListener("input", () => {
            if (!this.animPlaying) {
                this.elapsed = this.slider.valueAsNumber
                this.drawFrame()
                this.updateProgressText()
            }
        })
        this.customTextDiv.addEventListener("input", () => {
            this.drawer.measureText(
                this.ctx, this.pTextInput.value, this.hTextInput.value, this.cTextInput.value
            )
            if (!this.animPlaying) {
                this.elapsed = PHCanvasDrawer.LENGTH
                this.drawFrame()
                this.updateProgressText()
                this.slider.valueAsNumber = this.elapsed
            }
        })
        this.drawFrame()
        if (DEBUG) this.querySelector("div.debug")!.classList.remove("hidden")
    }

    updateProgressText() {
        const percent = Math.round(this.elapsed / PHCanvasDrawer.LENGTH * 100)
        this.progressPercent.textContent = `${percent}%`
        this.progressTime.textContent = `${Math.round(this.elapsed)}ms`
    }

    updatePlayButton(playing: boolean) {
        if (playing) {
            this.playButton.classList.add("playing")
        } else {
            this.playButton.classList.remove("playing")
        }
        this.animPlaying = playing
    }

    drawFrame() {
        this.drawer.drawFrame(this.elapsed, DEBUG && this.elapsed, this.templateImages)
    }

    startAnimation() {
        let startTime = 0
        const animateFrame = (timestamp: number) => {
            if (startTime == 0) startTime = timestamp
            this.elapsed = Math.min(timestamp - startTime, PHCanvasDrawer.LENGTH)
            this.updateProgressText()
            this.slider.valueAsNumber = this.elapsed
            this.drawFrame()
            if (this.elapsed < PHCanvasDrawer.LENGTH) {
                this.animId = requestAnimationFrame(animateFrame)
            } else {
                this.updatePlayButton(false)
            }
        }
        this.animId = requestAnimationFrame(animateFrame)
    }

    async exportAnimation() {
        const a = document.createElement("a")
        a.download = "pornhub-intro.mp4"
        const blobUrl = await render(
            this.pTextInput.value, this.hTextInput.value, this.cTextInput.value
        )
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
