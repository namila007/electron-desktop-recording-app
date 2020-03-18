const fs = require('fs')
const { desktopCapturer, ipcRenderer } = require('electron')
const axios = require('axios')
let recorder; let blobs = []

export function startRecord () {
  desktopCapturer.getSources({ types: ['window', 'screen'] })
    .then(async () => {
      const stream = await navigator.webkitGetUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            minWidth: 1280,
            maxWidth: 1280,
            minHeight: 720,
            maxHeight: 720
          }
        },
        frameRate: {
          min: 50,
          ideal: 200,
          max: 600
        }
      }, handleStream, err => {
        console.log('error', err)
      })
    })
    .catch(error => console.log(error))
}
function handleStream (stream) {
  recorder = new MediaRecorder(stream)
  blobs = []
  recorder.ondataavailable = function (event) {
    blobs.push(event.data)
  }
  recorder.start()
}
function toArrayBuffer (blob, cb) {
  const fileReader = new FileReader()
  fileReader.onload = function () {
    const arrayBuffer = this.result
    cb(arrayBuffer)
  }
  fileReader.readAsArrayBuffer(blob)
}
function toBuffer (ab) {
  const buffer = Buffer.alloc(ab.byteLength)
  const arr = new Uint8Array(ab)
  for (let i = 0; i < arr.byteLength; i++) {
    buffer[i] = arr[i]
  }
  return buffer
}
export function stopRecord (userPath, saveOnline) {
  recorder.onstop = () => {
    this.toArrayBuffer(new Blob(blobs, { type: 'video/webm' }), chunk => {
      const buffer = this.toBuffer(chunk)
      const randomString = Math.random().toString(36).substring(7)
      const randomName = '/' + randomString + '-shot.webm'
      const path = userPath + randomName
      fs.writeFile(path, buffer, function (err) {
        if (!err) {
          console.log('Saved video: ' + path, 'do save online?', saveOnline)
          if (saveOnline) {
            console.log('save online')
            const buff = Buffer.from(buffer).toString('base64')
            axios({
              method: 'POST',
              url: 'https://api.cloudinary.com/v1_1/dyqhomagf/upload',
              data: {
                upload_preset: 'bsfgxm61',
                file: 'data:video/webm;base64,' + buff
              },
              uploadEventHandlers: {
                progress (e) {
                  console.log(e)
                  if (e && e.total && e.loaded) {
                    const progress = Math.floor(e.loaded / e.total * 100)
                    ipcRenderer.send('upload::progress', progress)
                  }
                }
              }
            })
              .then(function (res) {
                console.log('Saved online', res.data.secure_url)
                ipcRenderer.send('upload::finish', res.data.secure_url)
              })
              .catch(function (err) {
                console.log('Error saving online', err)
              })
          }
        } else {
          alert('Failed to save video ' + err)
        }
      })
    })
  }
  recorder.stop()
}