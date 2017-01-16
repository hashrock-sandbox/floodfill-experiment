import {BinaryImage} from "../src/BinaryImage"
import {floodFillWithGap} from "../src/FloodFill"
import * as lodash from "lodash"

const canvas = document.querySelector("#canvas") as HTMLCanvasElement
const context = canvas.getContext("2d")!

const floodfillCanvas = document.querySelector("#floodfill-canvas") as HTMLCanvasElement
const floodfillContext = floodfillCanvas.getContext("2d")!

const floodfillPreview = document.querySelector("#floodfill-preview") as HTMLCanvasElement
const floodfillPreviewContext = floodfillPreview.getContext("2d")!

context.strokeStyle = "black"
context.lineWidth = 2
context.lineCap = "round"

let dragging = false
let lastX = 0
let lastY = 0

let allowedGap = 20

function clearDrawing() {
  context.clearRect(0, 0, canvas.width, canvas.height)
}

function clearFloodFill() {
  floodfillContext.clearRect(0, 0, floodfillCanvas.width, floodfillCanvas.height)
}

canvas.addEventListener("pointerdown", e => {
  if (e.shiftKey) {
    const data = context.getImageData(0, 0, canvas.width, canvas.height)
    const src = BinaryImage.fromImageData(data, ([r, g, b, a]) => a === 0 ? 1 : 0)
    const dst = new BinaryImage(canvas.width, canvas.height)
    const x = Math.round(e.offsetX + 0.5)
    const y = Math.round(e.offsetY + 0.5)
    console.time("floodFill")
    floodFillWithGap(x, y, allowedGap, src, dst)
    console.timeEnd("floodFill")
    dst.toImageData(new Uint8ClampedArray([0,0,0,0]), new Uint8ClampedArray([0,0,255,255]), data)
    floodfillContext.putImageData(data, 0, 0)
  } else {
    //clearFloodFill()
    dragging = true
    lastX = e.offsetX
    lastY = e.offsetY
    canvas.setPointerCapture(e.pointerId)
  }
})

function preview(e: MouseEvent){
  floodfillPreviewContext.clearRect(0, 0, floodfillCanvas.width, floodfillCanvas.height)
  const data = context.getImageData(0, 0, canvas.width, canvas.height)
  const src = BinaryImage.fromImageData(data, ([r, g, b, a]) => a === 0 ? 1 : 0)
  const dst = new BinaryImage(canvas.width, canvas.height)
  const x = Math.round(e.offsetX + 0.5)
  const y = Math.round(e.offsetY + 0.5)
  console.time("floodFill")
  floodFillWithGap(x, y, allowedGap, src, dst)
  console.timeEnd("floodFill")
  dst.toImageData(new Uint8ClampedArray([0,0,0,0]), new Uint8ClampedArray([230,230,230,255]), data)
  floodfillPreviewContext.putImageData(data, 0, 0)

}

canvas.addEventListener("pointermove", e => {
  if (dragging) {
    context.beginPath()
    context.moveTo(lastX, lastY)
    context.lineTo(e.offsetX, e.offsetY)
    lastX = e.offsetX
    lastY = e.offsetY
    context.stroke()
  }
})
canvas.addEventListener("pointermove", lodash.throttle(preview, 500))

canvas.addEventListener("pointerup", e => {
  dragging = false
})

const allowedGapSpan = document.querySelector("#allowed-gap") as HTMLSpanElement
const allowedGapInput = document.querySelector("#allowed-gap-input") as HTMLInputElement
const clearDrawingButton = document.querySelector("#clear-drawing") as HTMLButtonElement
const clearFloodFillButton = document.querySelector("#clear-flood-fill") as HTMLButtonElement

allowedGapInput.addEventListener("change", () => {
  allowedGap = parseInt(allowedGapInput.value)
  allowedGapSpan.innerText = String(allowedGap)
})
clearDrawingButton.addEventListener("click", clearDrawing)
clearFloodFillButton.addEventListener("click", clearFloodFill)
