import path from 'path'
import BrowserWinHandler from './BrowserWinHandler'
const { dialog, ipcMain,BrowserWindow } = require('electron')
const window = require("./window")
const isDev = process.env.NODE_ENV === 'development'

const INDEX_PATH = path.join(__dirname, '..', 'renderer', 'index.html')
const DEV_SERVER_URL = process.env.DEV_SERVER_URL // eslint-disable-line prefer-destructuring

const winHandler = new BrowserWinHandler({
  height: 600,
  width: 1000
})
let mainWindow, transparentWindow, recordingWindow;
//let savePath;
winHandler.onCreated(browserWindow => {
  if (isDev) browserWindow.loadURL(DEV_SERVER_URL)
  else browserWindow.loadFile(INDEX_PATH)
})

winHandler.created().then(win => {mainWindow=win});


ipcMain.on('pick::path', async (event, arg) => {
  const spath = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  console.log(spath.filePaths[0])
  //this.savePath=spath.filePaths[0];
  event.reply('path::chosen', spath.filePaths[0])
})

ipcMain.on('start::record', async () => {
  mainWindow.minimize();
  const urlTransparent = [];
  const urlRecording = [];
  urlTransparent[0] = DEV_SERVER_URL + '/transparent';
  urlTransparent[1] = path.join(__dirname, '..', 'renderer', 'transparent', 'index.html')
  urlRecording[0] = DEV_SERVER_URL + '/recording';
  urlRecording[1] = path.join(__dirname, '..', 'renderer', 'recording', 'index.html')

  console.log(urlTransparent[0],urlTransparent[1])

  transparentWindow = window.create(
    isDev,
    urlTransparent, 
    {width: 1000, height: 500},
    [
        {name: 'transparent', value: true},
        {name: 'frame', value: false},
        {name: 'parent', value: mainWindow}
        //{name: 'alwaysOnTop', value: true},
    ],
    [
        {name: 'setMenu', value: null},
        {name: 'setIgnoreMouseEvents', value: true},
        {name: 'setFocusable', value: false},
        {name: 'setFullScreen', value: true}
    ]
);

recordingWindow = window.create(
  isDev,
  urlRecording,
  {width: 250, height: 120},
  [{name: 'parent', value: mainWindow}],
  [{name: 'setMenu', value: null}]
);
 
  
});

ipcMain.on('stop::record', (event, args) => {
  transparentWindow.close();
  recordingWindow.close();
  mainWindow.show();
  event.send('video::finish');
});


export default winHandler
