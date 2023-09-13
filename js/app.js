WebFont.load({
  google: {
    families: ["Plus Jakarta Sans", "Space Grotesk"],
  },
  active: function () {
    console.log("Fonts are active!")
  },
})

const form = document.getElementById("app-form")
const imagesContainer = document.getElementById("images")
const imagesDummy = document.getElementById("nothing")
const canvas = document.getElementById("canvas")
const resizeCanvas = document.getElementById("resizer-canvas")
const fileInput = document.getElementById("image-upload")
const modeCheck = document.getElementById("mode-check")

const displayNameInput = document.querySelector(".display-name")

const context = canvas.getContext("2d")
const resizeContext = resizeCanvas.getContext("2d")

const imgLight = new Image()
imgLight.src = "./images/NGDX_LIGHT.png"

const imgDark = new Image()
imgDark.src = "./images/NGDX_DARK.png"

const IMAGE_WIDTH = 457
const IMAGE_HEIGHT = 590
const MAX_NAME_LENGTH = 21

let MODE_DARK = false

let imageFile

let cropImgHeight, cropImgWidth

let activeImage, originalWidthToHeightRatio

modeCheck.addEventListener("change", () => {
  MODE_DARK = modeCheck.checked
})

form.addEventListener("submit", (e) => {
  e.preventDefault()

  if (displayNameInput.value.trim().length < 3) {
    new Toast({
      message: "Name characters length should be more than 3 abeg.",
      type: "danger",
    })

    return
  }

  drawImage(MODE_DARK)
  addText(MODE_DARK)

  if (!imageFile) {
    saveFile()

    return
  }

  const reader = new FileReader()

  reader.addEventListener("load", () => {
    openImage(reader.result)
  })

  reader.readAsDataURL(imageFile)
})

//   context.fillStyle = "red"
//   context.fillRect(90, 238, 457, 590)

fileInput.addEventListener("change", (e) => {
  const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"]

  if (!IMAGE_TYPES.includes(e.target.files[0].type)) {
    new Toast({
      message: "Image type should be jpg or png",
      type: "danger",
    })

    return
  }

  imageFile = e.target.files[0]
})

function drawImage(mode) {
  const img = mode ? imgDark : imgLight

  console.log(img)

  const DIV_PERCENT = 0.3
  canvas.height = 3544 * DIV_PERCENT
  canvas.width = 3544 * DIV_PERCENT

  context.fillStyle = "#FFF"
  context.fillRect(0, 0, canvas.width, canvas.height)

  //   img.onload = () =>
  context.drawImage(
    img,
    0,
    0,
    img.width * DIV_PERCENT,
    img.height * DIV_PERCENT
  )

  //   context.fillStyle = "red"
  //   context.fillRect(548, 506, 410, 64)
}

function openImage(imageSrc) {
  activeImage = new Image()

  activeImage.addEventListener("load", () => {
    originalWidthToHeightRatio = activeImage.width / activeImage.height

    resize()
  })

  activeImage.src = imageSrc
}

function resize() {
  if (activeImage) {
    context.fillStyle = "white"
    context.fillRect(90, 238, 457, 590)
  }

  let heightValue, widthValue

  if (activeImage.width > activeImage.height) {
    widthValue = IMAGE_HEIGHT * originalWidthToHeightRatio
    heightValue = IMAGE_HEIGHT
  } else {
    widthValue = IMAGE_WIDTH
    heightValue = IMAGE_WIDTH / originalWidthToHeightRatio
  }

  cropImgHeight = heightValue
  cropImgWidth = widthValue

  resizeCanvas.width = widthValue
  resizeCanvas.height = heightValue

  resizeContext.drawImage(
    activeImage,
    0,
    0,
    Math.floor(widthValue),
    Math.floor(heightValue)
  )

  cropImage()
}

function cropImage() {
  const cropImg = new Image()

  let sourceX, sourceY
  let sourceWidth, sourceHeight

  cropImg.src = resizeCanvas.toDataURL()

  if (cropImgHeight === IMAGE_HEIGHT && cropImgWidth > IMAGE_WIDTH) {
    sourceY = 0
    sourceX = (cropImgWidth - IMAGE_WIDTH) / 2
  } else if (cropImgWidth === IMAGE_WIDTH && cropImgHeight > IMAGE_HEIGHT) {
    sourceX = 0
    sourceY = (cropImgHeight - IMAGE_HEIGHT) / 2
  } else {
    sourceX = 0
    sourceY = 0
  }

  if (Math.abs(activeImage.width - activeImage.height) < 133) {
    sourceWidth = cropImgHeight * (457 / 590)
    sourceHeight = cropImgHeight

    sourceX = (cropImgWidth - sourceWidth) / 2
    sourceY = 0
  } else {
    sourceWidth = IMAGE_WIDTH
    sourceHeight = IMAGE_HEIGHT
  }

  // const sourceWidth = IMAGE_WIDTH
  // const sourceHeight = IMAGE_HEIGHT
  const destWidth = IMAGE_WIDTH
  const destHeight = IMAGE_HEIGHT
  const destX = 90
  const destY = 238

  cropImg.onload = () => {
    context.drawImage(
      cropImg,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      destX,
      destY,
      destWidth,
      destHeight
    )
    saveFile()
  }
}

function addText(mode) {
  context.fillStyle = mode ? "#23454f" : "#45b175"
  context.fillRect(548, 506, 410, 64)

  if (displayNameInput.value.trim().length < 3) {
    return
  }

  context.font = "bold 32px Space Grotesk"
  context.fillStyle = "#fff"
  context.textAlign = "center"
  context.fillText(
    displayNameInput.value.trim().substring(0, 21),
    755,
    canvas.height / 2 + 20
  )
}

async function saveFile() {
  const div = document.createElement("div")
  const downloadEl = document.createElement("a")
  const img = document.createElement("img")

  div.className = "gen-image"

  img.src = canvas.toDataURL()
  img.alt = displayNameInput.value.trim()

  downloadEl.textContent = "Download Image"

  const filename = `NGDX_${new Date().toISOString()}.png`

  downloadEl.download = filename
  downloadEl.href = canvas.toDataURL()

  div.appendChild(img)
  div.appendChild(downloadEl)

  imagesDummy.insertAdjacentElement("afterend", div)
}
