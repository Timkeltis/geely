# 吉利汽车 Loon 脚本备份

来源与第三方归属见 [SOURCES.md](./SOURCES.md)。

- `geely-cookie.loon.js`：独立的 Loon 获取补丁，保存到本机 `geely_val`，不上传凭据。
- `geely.js`：wf021325/qx 原签到脚本的未修改副本。
- `loon.conf`：使用本仓库远程链接的配置片段，合并到现有配置使用。

## 使用

仓库已公开，可直接使用 loon.conf 中的远程脚本链接。也可以将两个 JS 文件下载并导入 Loon，把配置中的两个 script-path 分别改为本地文件名。

开启获取规则和 MITM（证书需已安装并信任），域名加入 app.geely.com。关闭原获取规则，打开吉利汽车 App 的“我的”和签到页面。获取成功后关闭获取规则，保留每日 08:05 的签到任务。获取失败时查看日志中的字段有无，不要分享真实 token、Cookie 或设备凭据。

补丁已通过 15 项模拟场景检查，尚未在真实手机/App 上验证。新版 App 如果改变域名或认证字段，仍需进一步调整；成功保存字段也不代表服务端一定接受。

## 来源与依赖

原作者：[wf021325/qx](https://github.com/wf021325/qx)。源文件：[task/geely.js](https://github.com/wf021325/qx/blob/main/task/geely.js)，备份日期 2026-09-15，源文件 blob SHA：`3d183a76cdb87986596eb5450bfb2d1bd424afdc`。获取时原链接的 master 分支已无法通过 GitHub API 读取，因此使用当前默认 main 分支。

原脚本内容及原有注释完整保留。读取到的上游根目录未包含 LICENSE，README 未声明许可证；本备份不另行声称获得开源授权或为上游代码添加许可证。

签到脚本仍访问吉利接口和 Apple 版本查询接口；CryptoJS 4.1.1 已随本仓库保存，并通过本仓库的 Raw 地址加载。备份避免依赖原作者仓库的后续可用性，但并非离线运行，接口变更或凭据过期仍会影响签到。
