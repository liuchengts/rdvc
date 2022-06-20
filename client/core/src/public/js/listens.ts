const SCREEN_ID = "screen"

export function screenData(buffer: Buffer) {
    let images = document.getElementById(SCREEN_ID)
    if (images == null) {
        images = document.createElement("img")
        images.setAttribute("id", SCREEN_ID)
    }
    images.setAttribute("src", buffer.toString("base64"))
}