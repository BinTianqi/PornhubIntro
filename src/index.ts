import "./index.css"
import PHCanvasDrawer from "./canvas.ts"
import soundUrl from "./sound.aac"
import { RenderConfig, render } from "./renderer.ts"
import * as i18n from "./i18n.ts"

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
        i18n.init()
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
            this.renderDialog.showModal()
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
        this.initializeRenderDialog()
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

    renderDialog = this.querySelector("dialog.render") as HTMLDialogElement
    dFramerateMenu = DropdownMenu.createFromTemplate()
    dVideoCodecMenu = DropdownMenu.createFromTemplate()
    dCancalButton = this.renderDialog.querySelector("button.cancel")!
    dRenderButton = this.renderDialog.querySelector("button.render") as HTMLButtonElement

    initializeRenderDialog() {
        const optionsDiv = this.renderDialog.querySelector("div.options")!
        optionsDiv.append(this.dFramerateMenu, this.dVideoCodecMenu)
        this.dFramerateMenu.setLabel("framerate")
        VideoCodecs.forEach((codec) => {
            this.dVideoCodecMenu.addOption(
                codec.label, codec.value, "codec-selection", codec.value == "avc"
            )
        })
        this.dVideoCodecMenu.setLabel("video_encoder")
        for (let i = 0; i < FrameRateOptions.length; i++) {
            this.dFramerateMenu.addOption(
                FrameRateOptions[i].label, i.toString(), "framerate-selection", i == 4
            )
        }
        this.dCancalButton.addEventListener("click", () => {
            this.renderDialog.close()
        })
        this.dRenderButton.addEventListener("click", this.exportAnimation.bind(this))
    }

    async exportAnimation() {
        this.dRenderButton.disabled = true
        const checkedCodec = this.dVideoCodecMenu.getInputValue()
        const checkedFramerate = this.dFramerateMenu.getInputValue()
        const framerateOption = FrameRateOptions[parseInt(checkedFramerate)]
        const config: RenderConfig = {
            text: {
                p: this.pTextInput.value,
                h: this.hTextInput.value,
                c: this.cTextInput.value
            },
            frameRate: framerateOption.value,
            vCodec: checkedCodec as RenderConfig["vCodec"]
        }
        try {
            const blobUrl = await render(config)
            const a = document.createElement("a")
            a.download = `pornhub-intro-${framerateOption.label}fps-${checkedCodec}.mp4`
            a.href = blobUrl
            a.click()
        } catch (e) {
            if (e instanceof Error) alert("Error:\n" + e.message)
            console.warn(e)
        }
        this.dRenderButton.disabled = false
    }
}

const VideoCodecs: { label: string, value: RenderConfig["vCodec"] }[] = [
    { label: "AVC (H.264)", value: "avc" },
    { label: "HEVC (H.265)", value: "hevc" },
    { label: "VP9", value: "vp9" },
    { label: "AV1", value: "av1" }
]

const FrameRateOptions: { label: string, value: number }[] = [
    { label: "23.976", value: 24000 / 1001 },
    { label: "29.97", value: 30000 / 1001 },
    { label: "30", value: 30 },
    { label: "59.94", value: 60000 / 1001 },
    { label: "60", value: 60 },
    { label: "120", value: 120 }
]

class DropdownMenu extends HTMLElement {
    labelSpan = this.querySelector("span")!
    field = this.querySelector(".field")!
    fieldSpan = this.field.querySelector("span")!
    menu = this.querySelector(".menu")!

    optionTemplate = document.querySelector("template.menu-option") as HTMLTemplateElement

    connectedCallback() {
        this.field.addEventListener("click", () => {
            this.classList.toggle("active")
        })
        this.menu.addEventListener("input", (e) => {
            const target = e.target as HTMLInputElement
            this.fieldSpan.textContent = target.parentElement!.querySelector("span")!.textContent
        })
        document.addEventListener("click", (e) => {
            const target = e.target as Element
            if (!this.field.contains(target)) {
                this.classList.remove("active")
            }
        })
    }

    addOption(labelText: string, value: string, inputName: string, checked: boolean) {
        const df = this.optionTemplate.content.cloneNode(true) as DocumentFragment
        const label = df.querySelector("label")!
        const input = label.querySelector("input")!
        input.value = value
        input.name = inputName
        if (checked) {
            input.checked = true
            this.fieldSpan.textContent = labelText
        }
        const span = label.querySelector("span")!
        span.textContent = labelText
        this.menu.append(label)
    }

    setLabel(i18nKey: keyof typeof i18n.i18nMap) {
        this.labelSpan.dataset.i18n = i18nKey
        this.labelSpan.textContent = i18n.getText(i18nKey)
    }

    getInputValue() {
        return this.menu.querySelector<HTMLInputElement>("input:checked")!.value
    }

    static createFromTemplate() {
        const template = document.querySelector("template.dropdown-menu") as HTMLTemplateElement
        const df = template.content.cloneNode(true) as DocumentFragment
        return df.querySelector("dropdown-menu") as DropdownMenu
    }
}

customElements.define("dropdown-menu", DropdownMenu)
customElements.define("ph-app", App)
