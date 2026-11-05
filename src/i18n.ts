const en = {
    site_title: "Pornhub-style intro generator",
    play: "Play",
    pause: "Pause",
    export: "Export",
    type: "Type",
    video: "Video",
    current_frame: "Current frame",
    resolution: "Resolution",
    framerate: "Framerate",
    video_encoder: "Video encoder",
    format: "Format",
    cancel: "Cancel",
    render: "Render",
    rendering: "Rendering...",
    disclaimer: "This tool doesn't upload any data",
    source_code: "Source code",
}

const zh_CN = {
    site_title: "Pornhub风格片头生成器",
    play: "播放",
    pause: "暂停",
    export: "导出",
    type: "类型",
    video: "视频",
    current_frame: "当前帧",
    resolution: "分辨率",
    framerate: "帧率",
    video_encoder: "视频编码器",
    format: "格式",
    cancel: "取消",
    render: "渲染",
    rendering: "渲染中...",
    disclaimer: "此工具不会上传任何数据",
    source_code: "源代码",
}

export let i18nMap = en

function applyI18n() {
    if (navigator.language.startsWith("zh")) i18nMap = zh_CN
    document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((elem) => {
        elem.textContent = i18nMap[elem.dataset.i18n! as keyof typeof i18nMap]
    })
}

export function init() {
    addEventListener("languagechange", applyI18n)
    applyI18n()
}

export function getText(key: keyof typeof en) {
    return i18nMap[key]
}
