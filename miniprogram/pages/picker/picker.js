Page({
  data: {
    workerId: '',
    worker: {
      id: '',
      name: '',
      phone: '',
      avatar: ''
    },
    defaultAvatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    showRecordPopup: false,
    records: [] // { id, time, weight, note }
  },

  onLoad(options) {
    const { workerId } = options || {};
    this.setData({ workerId });

    // 1) 从上一个页面通过 eventChannel 传数据（优先）
    const eventChannel = this.getOpenerEventChannel && this.getOpenerEventChannel();
    if (eventChannel && eventChannel.on) {
      eventChannel.on('workerData', (data) => {
        if (data && data.worker) {
          this.setData({ worker: data.worker });
        }
      });
    }

    // 2) 兜底：从本地存储拉取
    if (!this.data.worker.id && workerId) {
      try {
        const list = wx.getStorageSync('workers') || [];
        const found = list.find((w) => w.id === workerId);
        if (found) this.setData({ worker: found });
      } catch (e) { /* ignore */ }
    }

    // 拉取采摘记录（示例：从本地存储/模拟数据）
    this.loadRecords(workerId);
  },

  // 示例：加载记录（可替换为后端接口）
  loadRecords(workerId) {
    try {
      const map = wx.getStorageSync('recordsByWorker') || {};
      let recs = map[workerId] || [];
      // 若无数据，放入两条示例
      if (!recs.length) {
        recs = [
          // { id: 'r1', time: '2025-06-01 09:35', weight: 5.2, note: '晨间采摘' },
          // { id: 'r2', time: '2025-06-01 15:10', weight: 4.7, note: '' }
        ];
      }
      this.setData({ records: recs });
    } catch (e) {
      this.setData({ records: [] });
    }
  },

  openRecordPopup() {
    this.setData({ showRecordPopup: true });
  },
  closeRecordPopup() {
    this.setData({ showRecordPopup: false });
  }
});
