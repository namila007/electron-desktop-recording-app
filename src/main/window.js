const { BrowserWindow } = require('electron');

module.exports = window = {
    create(isDev,winUrl, size, options, methods) {
        const config = {
            height: size.height,
            width: size.width,
            useContentSize: true,
            webPreferences: {
                nodeIntegration: true,
                nodeIntegrationInWorker: false
            }
        };
        if(options && options.length > 0) {
            for(let i = 0; i < options.length; i++) {
                config[options[i].name] = options[i].value
            }
        }
        let windowId = new BrowserWindow(config);
        if(methods && methods.length > 0) {
            for(let i = 0; i < methods.length; i++) {
                windowId[methods[i].name](methods[i].value);
            }
        }
        if (isDev) windowId.loadURL(winUrl[0])
        else windowId.loadFile(winUrl[1])
        windowId.on('closed', () => windowId = null);
        return windowId;
    }
};