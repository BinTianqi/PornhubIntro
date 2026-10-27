const en = {
    site_title: "Pornhub-style intro generator",
    play: "Play",
    pause: "Pause",
    export: "Export",
    resolution: "Resolution",
    framerate: "Framerate",
    video_codecs: "Video codecs",
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
    resolution: "分辨率",
    framerate: "帧率",
    video_codecs: "视频编码器",
    cancel: "取消",
    render: "渲染",
    rendering: "渲染中...",
    disclaimer: "此工具不会上传任何数据",
    source_code: "源代码",
}

function applyI18n() {
    let i18nMap = en
    if (navigator.language.startsWith("zh")) i18nMap = zh_CN
    document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((elem) => {
        elem.textContent = i18nMap[elem.dataset.i18n! as keyof typeof i18nMap]
    })
}

export default function initI18n() {
    addEventListener("languagechange", applyI18n)
    applyI18n()
}
