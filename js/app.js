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
const instagramInput = document.querySelector(".instagram_handle_input")

const context = canvas.getContext("2d")
const resizeContext = resizeCanvas.getContext("2d")

const imgLight = new Image()
imgLight.src = "./images/VENDOR-FRAME.png"

const imgDark = new Image()
imgDark.src = "./images/ATTENDEE-FRAME.png"

const IMAGE_WIDTH = 425.25 // 567
const IMAGE_HEIGHT = 465 // 633
const MAX_NAME_LENGTH = 21

let MODE_DARK = false

let imageFile

let cropImgHeight, cropImgWidth

let activeImage, originalWidthToHeightRatio

modeCheck.addEventListener("change", () => {
  document.body.classList.toggle("attendee")

  MODE_DARK = modeCheck.checked
})

form.addEventListener("submit", (e) => {
  e.preventDefault()

  if (displayNameInput.value.trim().length < 3) {
    new Toast({
      message: "Name characters length should be more than 3.",
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

  const DIV_PERCENT = 0.75
  canvas.height = 2048 * DIV_PERCENT
  canvas.width = 1639 * DIV_PERCENT

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

function roundedImage(ctx, x, y, width, height, radius) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
  ctx.clip()
}

function resize() {
  if (activeImage) {
    context.fillStyle = "white"
    context.fillRect(141, 820, IMAGE_WIDTH, IMAGE_HEIGHT)
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

  const radius = 10
  const x = 0
  const y = 0
  const width = Math.floor(widthValue)
  const height = Math.floor(heightValue)

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
    sourceWidth = cropImgHeight * (IMAGE_WIDTH / IMAGE_HEIGHT)
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
  const destX = 141
  const destY = 820

  drawRoundedRect(context, destX, destY, destWidth, destHeight, 50)


  cropImg.onload = () => {
    // drawRoundedRect(context, 0, 0, destWidth, destHeight, 20);

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
  if (displayNameInput.value.trim().length < 3) {
    return;
  }

  context.save(); // Save current state
  context.font = "bold 42px Space Grotesk";
  context.fillStyle = "#0F2F3A";
  context.textAlign = "left";
  context.fillText(displayNameInput.value.trim().substring(0, 18), 630, 1240);
  context.restore(); // Restore previous state

  if (!mode && instagramInput.value.trim().length > 3) {
    console.log(instagramInput.value.trim())
    context.save(); // Save current state
    context.font = "italic 34px Plus Jakarta Sans";
    context.fillStyle = "#0F2F3A";
    context.textAlign = "center";
    context.fillText(instagramInput.value.trim().substring(0, 18), 350, 1370);
    context.restore(); // Restore previous state
  }
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
