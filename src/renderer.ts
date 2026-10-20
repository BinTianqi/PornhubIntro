import PHCanvasDrawer from "./canvas.ts"
import * as M from "mediabunny"
import soundUrl from "./sound.aac"

export async function render(pText: string, hText: string, cText: string) {
    const startTime = performance.now()
    const audioUrl = new M.UrlSource(soundUrl)
    const audioInput = new M.Input({
        formats: [M.ADTS],
        source: audioUrl
    })
    const audioTrack = (await audioInput.getPrimaryAudioTrack())!
    const audioSource = new M.EncodedAudioPacketSource("aac")

    const canvas = new OffscreenCanvas(1920, 1080)
    const ctx = canvas.getContext("2d")!
    const drawer = new PHCanvasDrawer(ctx, pText, hText, cText)
    const canvasSource = new M.CanvasSource(canvas, {
        codec: "avc",
        quality: new M.Quality("medium")
    })

    const output = new M.Output({
        format: new M.Mp4OutputFormat(),
        target: new M.BufferTarget()
    })
    output.addVideoTrack(canvasSource, { frameRate: 60 })
    output.addAudioTrack(audioSource)
    await output.start()
    const videoTask = addCanvasFrames(drawer, canvasSource)
    const audioTask = addAudioPackets(audioTrack, audioSource)
    await Promise.all([videoTask, audioTask])
    await output.finalize()
    const endTime = performance.now()
    const timeConsumed = (endTime - startTime).toFixed(2)
    console.log(`Video rendering took ${timeConsumed}ms`)
    const blob = new Blob([output.target.buffer!])
    return URL.createObjectURL(blob)
    // how to revoke
}

async function addCanvasFrames(drawer: PHCanvasDrawer, source: M.CanvasSource) {
    const frameTime = 1000 / 60
    const frames = Math.floor(PHCanvasDrawer.LENGTH / frameTime)
    for (let i = 0; i < frames; i++) {
        drawer.drawFrame(i * frameTime / PHCanvasDrawer.LENGTH, false, null)
        await source.add(i * frameTime / 1000)
    }
}

async function addAudioPackets(
    track: M.InputAudioTrack, source: M.EncodedAudioPacketSource
) {
    const audioSink = new M.EncodedPacketSink(track)
    let metadataAdded = false
    for await (const pkt of audioSink.packets()) {
        if (!metadataAdded) {
            await source.add(pkt, {
                decoderConfig: {
                    codec: (await track.getCodecParameterString())!,
                    numberOfChannels: await track.getNumberOfChannels(),
                    sampleRate: await track.getSampleRate()
                }
            })
            metadataAdded = true
        } else {
            await source.add(pkt)
        }
    }
}
