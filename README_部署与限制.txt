DeepPet V8.42 完整目录部署包（基于 V8.41 原型）

将本目录整体拖到 Netlify Drop，或上传本 ZIP（如果 Netlify 接受 ZIP）。
index.html 是入口；assets/js 为从原 HTML 提取的实际脚本；assets/css 为原 CSS；assets/images 为原包全部图片；assets/design_references 为设计参考图（不是实时动画）；backup 保留原单文件版本；file_manifest.json 是所有文件及 SHA256 清单。

注意：原始应用有些图片仍内嵌在 HTML 中，保留原样以免破坏功能；另存独立备份在 assets/images。原应用可能使用在线 PDF/OCR 等第三方脚本服务，未把远程依赖冒充本地文件。真实 AI 图生视频、15 宠物四档动态视频和真实项圈 SDK 尚未接入。本次主要修复 JS/CSS 文件缺失和部署包结构，未完成手机端到端验证。
