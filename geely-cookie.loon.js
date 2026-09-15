/*
 * 吉利汽车：Loon 专用凭据获取补丁，2026-09-15（获取提醒版）
 * 配合 wf021325/qx/task/geely.js 的原签到任务使用。
 * 类型：http-request；匹配：^https:\/\/app\.geely\.com(?::443)?\/
 * 无需请求体。MITM hostname 添加 app.geely.com。
 * 仅保存同一请求内完整的 token/deviceSN，不拼接不同请求或旧账号数据。
 * 只保存到本机 geely_val，不输出凭据、不发送网络请求。
 */
(function () {
    var title = '吉利汽车 Cookie';
    // 相同凭据最多每 60 秒提醒一次；更新凭据立即提醒。
    function reportCapture(changed) {
        var now = Date.now();
        var date = new Date(now);
        function pad(n) { return ('0' + n).slice(-2); }
        var time = date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) +
            ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
        var state = changed ? '已更新本地凭据' : '与已保存凭据一致';
        console.log('[吉利 Cookie] 本次获取成功；' + state + '；获取时间：' + time);
        $persistentStore.write(JSON.stringify({at: now, time: time, changed: changed}), 'geely_capture_last_seen');
        var last = Number($persistentStore.read('geely_capture_last_notice')) || 0;
        if (!changed && last > 0 && now >= last && now - last < 60000) {
            console.log('[吉利 Cookie] 60 秒内重复获取，本次不重复弹窗。');
            return;
        }
        $notification.post(title, '本次获取成功，' + (changed ? '已更新' : '凭据一致'),
            '获取时间：' + time + '\n' + state + '。已从本次 App 请求读取 token 和 deviceSN，可运行签到任务验证。');
        $persistentStore.write(String(now), 'geely_capture_last_notice');
    }
    function clean(value) {
        if (typeof value !== 'string') return '';
        value = value.trim();
        return /^(?:null|undefined)$/i.test(value) ? '' : value;
    }
    function object(text) {
        try {
            var value = JSON.parse(text);
            return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
        } catch (_) { return {}; }
    }
    try {
        if (typeof $request === 'undefined') {
            $notification.post(title, '请通过 App 请求触发', '此脚本只负责获取凭据；签到请运行原 geely.js。');
            return;
        }
        if (!/^https:\/\/app\.geely\.com(?::443)?\//i.test($request.url || '')) return;
        if (String($request.method || '').toUpperCase() === 'OPTIONS') return;
        var headers = {};
        Object.keys($request.headers || {}).forEach(function (key) {
            headers[key.toLowerCase()] = clean($request.headers[key]);
        });
        var token = headers.token || '';
        var device = headers.devicesn || '';
        // 原签到脚本的 sweet_security_info 中也携带设备标识。
        // 只作同一请求的兼容读取，不假定新版 App 必然发送该字段。
        if (!device && headers.sweet_security_info) {
            var info = object(headers.sweet_security_info);
            if (!Object.keys(info).length) {
                try { info = object(decodeURIComponent(headers.sweet_security_info)); } catch (_) {}
            }
            var uuid = clean(info.deviceUUID);
            var geelyId = clean(info.geelyDeviceId);
            if (uuid && geelyId && uuid !== geelyId) {
                console.log('[吉利 Cookie] 设备标识不一致，跳过保存。');
                return;
            }
            device = uuid || geelyId;
        }
        if (!token || !device) {
            console.log('[吉利 Cookie] 已触发；token=' + (token ? '有' : '无') + '，deviceSN=' + (device ? '有' : '无') + '；缺少字段，保留原凭据。');
            return;
        }
        var old = object($persistentStore.read('geely_val'));
        if (old.token === token && old.devicesn === device) {
            reportCapture(false);
            return;
        }
        var saved = $persistentStore.write(JSON.stringify({token: token, devicesn: device}), 'geely_val');
        if (saved) {
            reportCapture(true);
        } else {
            $notification.post(title, '保存失败', 'Loon 本地存储写入失败，请重试。');
        }
    } catch (_) {
        console.log('[吉利 Cookie] 获取异常，请检查脚本类型及 Loon 版本。');
    } finally {
        $done({});
    }
})();
