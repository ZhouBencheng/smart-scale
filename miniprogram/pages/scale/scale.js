var app = getApp();

Page({
  data: {
    devicePopupShow: false,

    btDevices: app.globalData.btDevices,

    connected: false,
    devId: null,
    connectedDeviceName: '',
    notifyServiceId: null,
    notifyCharacteristicId: null,
    
    currentWeight: '',
    currentWeightHex: '',
    currentWeightDispaly: '',
  },

  onLoad() {
    var that = this
    // 页面初始化
    for (var i = 0; i < that.data.btDevices.length; ++i) {
			that.data.btDevices.pop()
		}
		that.setData({
			btDevices : that.data.btDevices
		});

		var launchToastDuration;
		if(app.globalData.platform == 'ios') {
			launchToastDuration = 1500
		} else {
			launchToastDuration = 2500
    }
    wx.showToast({
      title: '蓝牙初始化',
      icon: 'loading',
      mask: true,
      duration: launchToastDuration
    })
  },

  onOpenDevicePopup() {
    this.setData({ devicePopupShow: true })

    // 开始扫描可连接设备
    // 打开蓝牙适配器
    var that = this
		wx.openBluetoothAdapter({
      success: function (res) {
        console.log("open bluetooth adapter success", res)
        wx.startBluetoothDevicesDiscovery({
          success: function (res) {
            console.log("start bluetooth device discovery success", res)
          }
        })
      }
    })

    wx.onBluetoothDeviceFound(function(devices) {
      console.log("find bluetooth device")
			wx.getBluetoothDevices({
				success: function (res) {
				var ln = 0;
				console.log(res, that.data.btDevices.length)
				if(that.data.btDevices.length != null)
					ln = that.data.btDevices.length
				for (var i = ln; i < res.devices.length; ++i) {
					console.log(ln, that.data.btDevices.length, res.devices.length)
					if(res.devices[i].RSSI > 0 || res.devices[i].name == '未知设备') {
						continue;
          }
          const rssi = res.devices[i].RSSI
          var rssi_level_img =
            rssi > -40 ? '../../images/scan/5.png' :
            rssi > -50 ? '../../images/scan/4.png' :
            rssi > -60 ? '../../images/scan/3.png' :
            rssi > -70 ? '../../images/scan/2.png' : '../../images/scan/1.png'
					var newBtDevice = [{
						rssi : res.devices[i].RSSI,
						name : res.devices[i].name,
						devId : res.devices[i].deviceId,
						img : rssi_level_img,
					}];

          // 合并冗余设备，扫描已存在设备，
					for (var k = 0; k < that.data.btDevices.length; ++k) {
						//console.log('new ',res.devices[i].deviceId,'old',that.data.btDevices[k].devId)
						if(res.devices[i].deviceId == that.data.btDevices[k].devId) {
							//console.log('dump',k,that.data.btDevices[k].devId)
							that.data.btDevices.splice(k,1); // 删除元素
							break;
						}
					}
					that.data.btDevices = that.data.btDevices.concat(newBtDevice)
				}
				that.setData({
					btDevices : that.data.btDevices
				});
				app.globalData.btDevices = that.data.btDevices
				}
			})
		})
  },

  onCloseDevicePopup() {
    console.log("close popup window")
    this.setData({ devicePopupShow: false })
    wx.closeBluetoothAdapter()
  },

  onUnload() {
    const devId = this.data.devId
    if (devId) {
      wx.closeBLEConnection({ deviceId: devId })
    }
  },

  onRescanDevices() {
    // 清空记录，并重新搜索
		// console.log('onPullDownRefresh')
		var that = this
		wx.stopPullDownRefresh()
		wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
        // console.log(res)
        wx.closeBluetoothAdapter({
          success: function (res) {
            // console.log(res)
            var num = that.data.btDevices.length
            that.data.btDevices.splice(0,num)
            that.setData({
              btDevices : that.data.btDevices
            });			
            wx.openBluetoothAdapter({
              success: function (res) {
                // console.log(res)
                wx.startBluetoothDevicesDiscovery({
                  //services: ['FFF0'],
                  success: function (res) {
                    // console.log(res)
                  }
                })
              }
            })
          }
        })
      }
		})
  },

  onTapDevice(e) {
    const {devId, name} = e.currentTarget.dataset;
    this.createBLEConnection(devId, name)
    this.setData({ devicePopupShow: false })
  },

  createBLEConnection(deviceId, name) {
    const that = this
    wx.createBLEConnection({
      deviceId,
      success() {
        that.setData({ connectedDeviceName: name || '', devId: deviceId })
        // 获取服务并寻找 notify 特征
        wx.getBLEDeviceServices({
          deviceId,
          success(res) {
            const services = res.services || []
            let pending = services.length
            services.forEach(s => that.getCharacteristics(deviceId, s.uuid, () => {
              pending--
              if (pending === 0) {
                // 所有服务扫描完
                wx.showToast({ title: '已连接', icon: 'success', duration: 1200 })
                that.setData({ connected: true })
                wx.setNavigationBarTitle({ title: (name || '设备') + ': 已连接' })
                that.attachValueChangeListener() // 只需绑定一次
              }
            }))
          }
        })
      }
    })

    wx.onBLEConnectionStateChange(function (res) {
      if (!res.connected) {
        that.setData({ connected: false })
        wx.showToast({ title: '连接断开', icon: 'none' })
      }
    })
  },

  getCharacteristics(deviceId, serviceId, doneCb) {
    if (this.filterServerUUID(serviceId)) { doneCb && doneCb(); return }
    const that = this
    wx.getBLEDeviceCharacteristics({
      deviceId, serviceId,
      success(res) {
        const chars = res.characteristics || []
        for (let i = 0; i < chars.length; i++) {
          const c = chars[i]
          if (!that.data.notifyCharacteristicId && c.properties && c.properties.notify === true) {
            that.setData({ notifyServiceId: serviceId, notifyCharacteristicId: c.uuid })
            wx.notifyBLECharacteristicValueChanged({
              state: true,
              deviceId,
              serviceId,
              characteristicId: c.uuid,
              success() { /* 订阅成功 */ }
            })
            break // 已找到一个可通知特征即可
          }
        }
        doneCb && doneCb()
      },
      fail() { doneCb && doneCb() }
    })
  },

  // —— 监听并只保留最近一帧 —— //
  attachValueChangeListener() {
    const that = this
    wx.onBLECharacteristicValueChange(function (res) {
      const buf = res.value
      const text = that.arrayBufferToAscii(buf)   // 若可打印 ASCII，则返回字符串，否则 null
      const hex = that.ab2hex(buf)
      const display = (text && text.trim()) ? text.trim() : hex

      that.setData({
        currentWeight: text || '',
        currentWeightHex: hex,
        currentWeightDispaly: display, // UI 绑定此字段：只显示当前帧
      })
    })
  },

  /********* 字符串解析 *********/
  ab2hex(buffer) {
    const hexArr = Array.prototype.map.call(new Uint8Array(buffer), function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    })
    return hexArr.join(' ')
  },
  // 若全为可打印字符（含 \r \n），按 ASCII 文本解析
  arrayBufferToAscii(buf) {
    const arr = new Uint8Array(buf)
    const printable = arr.every(b => b === 10 || b === 13 || (b >= 32 && b <= 126))
    if (!printable) return null
    let s = String.fromCharCode.apply(null, arr)
    s = s.replace(/\r\n?/g, '\n')
    return s
  },
  filterServerUUID(uuid) {
    // 过滤 TI/Nordic OTA 等升级/无效服务
    if (uuid === 'F000FFC0-0451-4000-B000-000000000000') return true
    if (uuid === 'FEF5' || uuid === '0000FEF5-0000-1000-8000-00805F9B34FB') return true
    if (uuid === 'FE59' || uuid === '0000FE59-0000-1000-8000-00805F9B34FB') return true
    if (uuid === '00001801-0000-1000-8000-00805F9B34FB') return true
    return false
  },
  parseScaleText(text) {
    // 1) 去掉状态/称量类型前缀（支持 ST/US + GS/NT/TR）
    const cleaned = text
      .replace(/^\s*(?:ST|US)\s*,\s*(?:GS|NT|TR)\s*,\s*/i, '') // 移除 "US,GS," 等
      .trim();
  
    // 2) 提取数值
    const numMatch = cleaned.match(/-?\d+(?:\.\d+)?/);
    if (!numMatch) {
      // 没数字就回退显示原文（可按需返回空串）
      return cleaned;
    }
  
    // 3) 可选：提取单位（kg/g/lb/oz 等）
    const unitMatch = cleaned.match(/\b(kg|g|lb|oz)\b/i);
    const valueStr = numMatch[0];
    const unitStr = unitMatch ? unitMatch[1] : '';
  
    // 仅数值：return valueStr;
    // 数值+单位：
    return unitStr ? `${valueStr} ${unitStr}` : valueStr;
  }
});