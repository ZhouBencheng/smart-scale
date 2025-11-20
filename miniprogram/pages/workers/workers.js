import Dialog from '../../@vant/weapp/dialog/dialog';

var app = getApp()

Page({
  data: {
    workers: [],                 // {id, name, phone, avatar}
    showAddPopup: false,
    onShowQr: false,
    form: {
      name: '',
      phone: '',
      avatar: ''                 // 临时文件路径或网络地址
    },
    avatarFileList: [],          // 供 van-uploader 预览
    defaultAvatarUrl: app.globalData.defaultAvatarUrl
  },

  /* 悬浮按钮 */
  openAddPopup() {
    this.setData({ showAddPopup: true });
  },
  closeAddPopup() {
    this.setData({ showAddPopup: false });
  },
  onShowQr(e) {
    const { name } = e.currentTarget.dataset;
    Dialog.alert({
      title: `${name}`,
      message: '二维码图片（将 <image src="..."> 写到 messageHTML 中）',
      selector: '#van-dialog',
      messageAlign: 'center'
    });
  },

  /* 删除工人 */
  onDeleteWorker(e) {
    const { id, name } = e.currentTarget.dataset;
    Dialog.confirm({
      title: '删除工人',
      message: `确定要删除工人 "${name}" 吗？此操作不可恢复。`,
      selector: '#van-dialog'
    })
      .then(() => {
        const next = this.data.workers.filter(w => w.id !== id);
        this.setData({ workers: next });
        wx.showToast({ title: '已删除', icon: 'success' });
      })
      .catch(() => {
        // 用户取消删除
      });
  },
  /* 头像上传完成 */
  onAvatarAfterRead(e) {
    // e.detail.file 可能为对象或数组，统一取第一个
    const file = Array.isArray(e.detail.file) ? e.detail.file[0] : e.detail.file;
    const url = file.url || file.tempFilePath;

    this.setData({
      avatarFileList: [{ url }],
      'form.avatar': url
    });
  },

  /* 删除头像 */
  onAvatarDelete() {
    this.setData({
      avatarFileList: [],
      'form.avatar': ''
    });
  },

  /* 表单字段变更 */
  onFieldChange(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail;
    this.setData({ [`form.${field}`]: value });
  },

  /* 保存工人 */
  onSubmit() {
    const { name, phone, avatar } = this.data.form;

    if (!name || !name.trim()) {
      wx.showToast({ title: '请填写姓名', icon: 'none' });
      return;
    }
    // 简单手机号校验（可按需替换更严格规则）
    if (phone && !/^(\+?\d{6,20})$/.test(phone)) {
      wx.showToast({ title: '电话号码格式不正确', icon: 'none' });
      return;
    }

    const newWorker = {
      id: Date.now().toString(),
      name: name.trim(),
      phone: phone.trim(),
      avatar: avatar || this.data.defaultAvatarUrl
    };

    this.setData({
      workers: [newWorker, ...this.data.workers],
      showAddPopup: false
    });

    // 重置表单
    this.resetForm();

    wx.showToast({ title: '已保存', icon: 'success' });
  },

  resetForm() {
    this.setData({
      form: { name: '', phone: '', avatar: '' },
      avatarFileList: []
    });
  },

  /* 进入工人详情 */
  onTapWorker(e) {
    const id = e.currentTarget.dataset.id;
    // 按你的实际路由调整
    wx.navigateTo({
      url: `/pages/picker/picker?workerId=${id}`
    });
  }
});
