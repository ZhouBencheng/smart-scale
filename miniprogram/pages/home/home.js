import Dialog from '../../@vant/weapp/dialog/dialog';

var app = getApp()

Page({
  data: {
    defaultAvatarUrl : app.globalData.defaultAvatarUrl,
    loggedIn: false,          // 表示userInfo是否非空
    userInfo: {
      nickName: '',
      avatarUrl: ''
    },

    companyBinded: false,     // 表示 company 是否非空
    company: {
      id: '',
      name: ''
    },
    selectableCompanyName: [
      '建水县日昇农业有限公司',
      '石屏县牧佳谷农业有限公司'
    ],
    selectableCompanyId: [
      'cc84495d6924447d04d162cc5cf04513',
      'none'
    ],
    selectableCompanyMap: {
      cc84495d6924447d04d162cc5cf04513: '建水县日昇农业有限公司'
    },
    inputCompanyCode: '',

    chartDays: 7,
    hasChartData: false,
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

  onLogin() {
    let that = this
    wx.navigateTo({
      url: '/pages/login/login',
      events: {
        getUserInfo: function(data) {
          that.setData({
            loggedIn: true,
            userInfo: data.userInfo,
          })
          // console.log(that.data.userInfo)
        },
        getCompanyBind: function(data) {
          that.setData({
            companyBinded: true,
            company: {
              name: that.data.selectableCompanyMap[data.companyId],
              id: data.companyId
            }
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

  onCompanyCodeChange(e) {
    this.setData({
      inputCompanyCode: e.detail
    })
    // console.log(this.data.inputCompanyCode)
  },

  onBindCompany() {
    if (!this.data.loggedIn) {
      wx.showToast({ icon: 'none', title: '请先登录' });
      return;
    }
    // refact: 公司数量多时可支持跳转至公司选择页
    wx.showActionSheet({
      // itemList最长为6
      itemList: this.data.selectableCompanyName,
      success: (res) => {
        const pickIndex = res.tapIndex
        const pickCompany = {
          id: this.data.selectableCompanyId[pickIndex],
          name: this.data.selectableCompanyName[pickIndex]
        }
        this.setData({
          companyBinded: false,
          company: pickCompany
        })
        Dialog.confirm({
          context: this,
          title: '输入邀请码',
          selector: '#van-dialog',
        }).then(() => {
          this.verifyCompanyCode()
        }).catch(() => {

        })
      }
    });
  },

  verifyCompanyCode() {
    const inputCompanyCode = this.data.inputCompanyCode
    const company = this.data.company
    if (!inputCompanyCode) {
      wx.showToast({ icon: 'none', title: '请输入邀请码' });
      return;
    }
    wx.cloud.callFunction({
      name: 'verifyCompanyCode',
      data: {
        companyId: company.id,
        companyCode: inputCompanyCode
      }
    }).then(res => {
      // console.log(res.result)
      if (res.result && res.result.valid) {
        this.setData({
          companyBinded: true,
        });
        wx.showToast({ icon: 'success', title: '绑定成功' });
      } else {
        wx.showToast({ icon: 'none', title: '邀请码错误' });
      }
    }).catch(err => {
      console.error(err);
      wx.showToast({ icon: 'none', title: '校验失败' });
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
