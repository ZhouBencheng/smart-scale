var app = getApp()

Page({
  data: {
    defaultAvatarUrl: app.globalData.defaultAvatarUrl, 
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: ''
    },
    hasUserInfo: false,
    eventChannel: {},
  },
  onLoad() {
    const eventChannel = this.getOpenerEventChannel()
    this.setData({
      eventChannel: eventChannel
    })
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    const { nickName } = this.data.userInfo
    this.setData({
      "userInfo.avatarUrl": avatarUrl,
      hasUserInfo: avatarUrl &&  nickName && avatarUrl !== defaultAvatarUrl
    })
  },
  onInputChange(e) {
    const nickName = e.detail.value
    const { avatarUrl } = this.data.userInfo
    this.setData({
      "userInfo.nickName": nickName,
      hasUserInfo: avatarUrl && nickName && avatarUrl !== defaultAvatarUrl
    })
  },
  onFinishLogin() {
    this.data.eventChannel.emit('getUserInfo', this.data.userInfo)
    wx.navigateBack({
      delta: 1,
    })
  }
})