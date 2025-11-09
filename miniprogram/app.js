// app.js
App({
  globalData: {
    env: "",
    btDevices: [
      {
        id: 1,
        rssi: -40,
        name: 'BT986',
        devId: '0',
        img : '/images/scan/2.png',
      }
    ],
    platform: 'android',
  },
  onLaunch: function () {
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });
    }
  },
});
