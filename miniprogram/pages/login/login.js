var app = getApp()
const defaultAvatarUrl = app.globalData.defaultAvatarUrl

Page({
  data: {
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
    var that = this
    wx.cloud.callFunction({ 
      name: 'checkCompanyBind',
      data: {}
    }).then(res => {
      // console.log(res.result)
      if (res.result.exist) {
        that.data.eventChannel.emit('getCompanyBind', {
          companyId: res.result.company_id
        })
      }
    }).catch(err => {
      console.error(err)
    })
    that.data.eventChannel.emit('getUserInfo', {
      userInfo: that.data.userInfo,
    })
    wx.navigateBack({
      delta: 1,
    })
  }
})