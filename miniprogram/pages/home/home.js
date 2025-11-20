var app = getApp()

Page({
  data: {
    defaultAvatarUrl : app.globalData.defaultAvatarUrl,
    loggedIn: false,
    userInfo: {
      nickName: '',
      avatarUrl: ''
    },
    company: {
      id: '',
      name: ''
    },
    chartDays: 7,
    hasChartData: false
  },

  onShow() {
    // console.log("show home page")
    if (!this.data.loggedIn) {
        wx.showToast({
          icon: 'none',
          title: '请完成登录并绑定公司',
      })
    }
  },

  /* —— 登录 —— */
  onLogin() {
    let that = this
    wx.navigateTo({
      url: '/pages/login/login',
      events: {
        getUserInfo: function(userInfo) {
          that.setData({
            loggedIn: true,
            userInfo: userInfo
          })
        }
      },
    })
  },

  onLogout() {
    // TODO: 清理本地凭证、通知后端注销会话
    this.setData({
      loggedIn: false,
      userInfo: { nickName: '', avatarUrl: '' },
      company: { id: '', name: '' },
      hasChartData: false
    });
    wx.showToast({ icon: 'success', title: '已退出' });
  },

  /* —— 公司绑定 —— */
  onBindCompany() {
    if (!this.data.loggedIn) {
      wx.showToast({ icon: 'none', title: '请先登录' });
      return;
    }
    // 这里仅示例：实际可跳转到公司选择页
    // wx.navigateTo({ url: '/pages/company-select/index' })
    wx.showActionSheet({
      itemList: ['绑定示例公司 A', '绑定示例公司 B'],
      success: (res) => {
        const pick = res.tapIndex === 0
          ? { id: 'A-001', name: '示例公司A' }
          : { id: 'B-002', name: '示例公司B' };
        this.setData({ company: pick });
      }
    });
  },

  /* —— 日历跳转 —— */
  goCalendar() {
    // 预留：在新页面中选择某日并展示当天记录
    wx.navigateTo({ url: '/pages/calendar/index' });
  },

  /* —— 图表配置 —— */
  onChartDaysChange(e) {
    const v = e.detail;
    this.setData({ chartDays: v });
    // TODO: 重新拉取 v 天的数据并重绘
    // const chart = await api.fetchRecentStats({ days: v })
    // this.setData({ hasChartData: chart?.length > 0 }, () => this.drawChart(chart))
  },

  /* —— 绘图占位（后续接入 ECharts/F2 均可） —— */
  drawChart(series) {
    // 这里留空：等你选定图表库后实现
    // 建议：使用微信小程序版 ECharts（ec-canvas），或自绘 2D canvas。
  }
});
