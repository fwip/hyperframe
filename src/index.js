//require('require-rebuild')();
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const diff = require('deep-diff')

app.allowRendererProcessReuse = false;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const { RepoBackend } = require('hypermerge')
const Hyperswarm = require('hyperswarm')
const hyperswarm = Hyperswarm()

//const pth = '.data'

//const repo = new Repo({ pth })


//repo.setSwarm(Hyperswarm())

//let docUrl = repo.create()

/*
ipcMain.on('content-update', (event, arg) => {
  console.log('---')
  // console.log(event)
  //console.log(arg.attrdiff)

  repo.change(docUrl, (state) => {
    state = state || {}
    let node = state[arg.node] || {}
    arg.attrdiff.forEach((change) => {
      diff.applyChange(node, '', change)
    })
    state[arg.node] = node
  })
})
*/

const createWindow = (storagePath = ".pth2", port = 12049, url = undefined) => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: true,
    }
  });

  const back = new RepoBackend({ path: storagePath })
  back.setSwarm(Hyperswarm())
  back.subscribe((msg) => {
    // console.log("sending to frontend", msg)
    mainWindow.webContents.send('toFront', msg)
  })
  ipcMain.on('toBack', (event, message) => {
    // console.log("updating backend", message)
    back.receive(message)
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    setTimeout(() => {
      mainWindow.webContents.send('scene-change', { 'url': url })
    },
      1000)
  })
  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  let url = "hypermerge:/FwevzvpExWvujDndgYPmxchLGTmgAyz5GdDfecvYgijT"
  url = null
  createWindow(".pth8", 0, url)
  return
  ipcMain.on('scene-loaded', (event, message) => {
    console.log("loaded scene: ", message.url)

    setTimeout(() => {
      console.log("making new window")
      createWindow(".pth1", 0, message.url)
    },
      3000
    )

  })

});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/*
app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
*/

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
