DeepPet V8.48 - 15 宠物动态素材部署包

上传 Netlify：解压 ZIP，将本文件所在目录（包含 index.html）整体上传到 https://app.netlify.com/drop 。

文件：
- index.html 根目录入口；app.js、breed-catalog.js、styles.css；全部原有 assets/js、assets/css、assets/images 和 backup 原件。
- assets/animations/*.mp4：15 条独立宠物 6 秒循环影像。12fps，H.264，384×656。照片来源为现有 15 只演示宠物；眼睑闭合、耳部、嘴部、颊部与毛发表面采用局部像素形变；不是放大缩小整张照片。
- assets/animations/animation_manifest.json：按 pet ID 指定唯一视频的映射。
- file_manifest_v848.json：最终文件清单（大小及 SHA256）。

应用逻辑：主页点击心跳时刻直接进入手机比例全屏；演示宠物已有30日模拟记录，无倒数；新建宠物第一次显示60秒环形倒数，之后记录当天已完成。刷新页面后同一天不会重复倒数。指标均为模拟数据，非硬件实时采样。保存按钮输出PNG截图，不是60秒影片。

诚实说明：这是一套离线可播放、保留真实照片身份的局部像素变形短片，并非接入图生视频大模型生成的电影级真实宠物表情，也不是用户新上传任意照片的自动AI生成。本包不是商业临床设备/服务端/付款系统的正式交付，相关模拟功能需要生产环境接口。
