<template>
    <div class="main-top" id="back">
        <video poster="/back.jpg" loop muted playsinline width="100%" height="100%" id="back-video"
            src="/back.mp4" @loadeddata="closeLoading"></video>
    </div>

    <teleport to="body">
        <button @click="sendFeedback" class="feedback-btn" v-show="loading">{{ feedbackBtnText }}</button>
    </teleport>
</template>

<script>
import { ElLoading } from 'element-plus';

export default {
    mounted() {
        const ua = navigator.userAgent;
        const isWeChatOniPhone = /iPhone/.test(ua) && /MicroMessenger/.test(ua);

        if(isWeChatOniPhone) {
            this.closeLoading();
            return;
        }

        const video = document.getElementById('back-video');
        const triggerPlay = () => {
            if (video.paused) {
                video.play().catch((err) => console.log('用户交互后播放：', err));
            }
            document.removeEventListener('touchstart', triggerPlay);
        };
        document.addEventListener('mousedown', triggerPlay);

        this.loadingInstance = ElLoading.service({
            lock: true,
            text: '加载魔法中，马上就好啦 ~',
            background: 'rgba(225, 225, 225, 1)'
        });
    },
    data() {
        return {
            loadingInstance: null,
            loading: true,
            feedbackBtnText: '点击发送反馈'
        }
    },
    methods: {
        sendFeedback() {
            if (localStorage.getItem('feedbackSuccess')) {
                this.feedbackBtnText = '已收到您的反馈，等待处理';
                return;
            }

            const browserInfo = this.getBrowserInfo();

            fetch('https://api.yncs2022.com/submitFeedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(browserInfo)
            })
                .then(res => res.json())
                .then(json => {
                    if (json.code === 200) {
                        localStorage.setItem('feedbackSuccess', 'true');
                        this.feedbackBtnText = '反馈成功';
                    }
                })
        },
        closeLoading() {
            this.loading = false;
            if (this.loadingInstance) this.loadingInstance.close();
            this.loadingInstance = null;
        },
        getBrowserInfo() {
            const ua = navigator.userAgent;
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

            // 浏览器检测
            const browser = (() => {
                const patterns = [
                    { regex: /Edg\/([\d.]+)/, name: 'Microsoft Edge' },
                    { regex: /Chrome\/([\d.]+)/, name: 'Google Chrome', exclude: /Edg/ },
                    { regex: /Firefox\/([\d.]+)/, name: 'Mozilla Firefox' },
                    { regex: /Safari\/([\d.]+)/, name: 'Safari', exclude: /Chrome/ },
                    { regex: /Opera\/([\d.]+)|OPR\/([\d.]+)/, name: 'Opera' },
                    { regex: /MSIE ([\d.]+)|Trident\/.+?rv:([\d.]+)/, name: 'Internet Explorer' }
                ];

                for (const { regex, name, exclude } of patterns) {
                    if (regex.test(ua) && (!exclude || !exclude.test(ua))) {
                        return { name, version: RegExp.$1 || RegExp.$2 };
                    }
                }
                return { name: 'Unknown', version: 'Unknown' };
            })();

            // 渲染内核
            const kernel = /WebKit/.test(ua) ? 'WebKit' :
                /Gecko/.test(ua) ? 'Gecko' :
                    /Trident/.test(ua) ? 'Trident' :
                        /Edge/.test(ua) ? 'Chromium' : 'Unknown';

            // 操作系统
            const os = (() => {
                if (/Windows NT ([\d.]+)/.test(ua)) {
                    const versions = { '10.': 'Windows 10/11', '6.1': 'Windows 7', '6.2': 'Windows 8', '6.3': 'Windows 8.1' };
                    return versions[RegExp.$1] || 'Windows';
                }
                return /Mac OS X ([\d_]+)/.test(ua) ? `macOS ${RegExp.$1.replace('_', '.')}` :
                    /iOS ([\d_]+)/.test(ua) ? `iOS ${RegExp.$1.replace('_', '.')}` :
                        /Android ([\d.]+)/.test(ua) ? `Android ${RegExp.$1}` :
                            /Linux/.test(ua) ? 'Linux' : 'Unknown';
            })();

            // 设备信息
            const device = {
                type: /Mobile|Android|iOS|iPhone|iPad|iPod|Opera Mini|IEMobile/.test(ua) ? 'Mobile' : 'Desktop',
                isTouchSupported: navigator.maxTouchPoints > 0 || 'ontouchstart' in window,
                screen: {
                    width: screen.width,
                    height: screen.height,
                    availWidth: screen.availWidth,
                    availHeight: screen.availHeight,
                    pixelRatio: window.devicePixelRatio,
                    colorDepth: screen.colorDepth
                },
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            };

            // 网络信息
            const network = {
                isOnline: navigator.onLine,
                type: connection?.type || 'Unknown',
                effectiveType: connection?.effectiveType || 'Unknown',
                downlink: connection ? `${connection.downlink} Mbps` : 'Unknown',
                rtt: connection ? `${connection.rtt} ms` : 'Unknown'
            };

            // 存储信息
            const storage = {
                cookieEnabled: navigator.cookieEnabled,
                localStorageSupported: !!localStorage,
                sessionStorageSupported: !!sessionStorage,
                estimateLocalStorageSize: (() => {
                    let total = 0;
                    if (!localStorage) return 'Not supported';
                    try {
                        const testData = 'a'.repeat(1024 * 1024);
                        while (total < 10) { // 限制最大测试10MB
                            localStorage.setItem(`test_${total}`, testData);
                            total++;
                        }
                        return `${total} MB (估算)`;
                    } catch {
                        Object.keys(localStorage).forEach(key =>
                            key.startsWith('test_') && localStorage.removeItem(key));
                        return `${total} MB (估算)`;
                    }
                })()
            };

            // 语言和时区
            const locale = {
                language: navigator.language || navigator.userLanguage,
                languages: navigator.languages || [navigator.language],
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            };

            // 其他信息
            const others = {
                userAgent: ua,
                vendor: navigator.vendor,
                appVersion: navigator.appVersion,
                platform: navigator.platform,
                webkitVersion: /WebKit\/([\d.]+)/.test(ua) ? RegExp.$1 : 'Unknown',
                supportsWebGL: !!window.WebGLRenderingContext,
                thirdPartyCookieBlocked: (() => {
                    if (!navigator.cookieEnabled) return true;
                    try {
                        document.cookie = 'test_third_party=1; SameSite=None; Secure';
                        const blocked = !document.cookie.includes('test_third_party=1');
                        document.cookie = 'test_third_party=; expires=Thu, 01 Jan 1970 00:00:00 UTC';
                        return blocked;
                    } catch {
                        return true;
                    }
                })()
            };

            return { browser, kernel, os, device, network, storage, locale, others };
        }
    }
}
</script>

<style scoped>
.main-top {
    width: 100%;
    height: 960px;
    background-size: 100%;
    background-repeat: no-repeat;
    position: relative;
    overflow: visible;
}

.main-top::after {
    position: absolute;
    content: "";
    width: 100%;
    height: 250px;
    left: 0;
    bottom: 0;
    z-index: 0;
    background: linear-gradient(to top, #eee, rgba(238, 238, 238, 0));
}

.feedback-btn {
    width: 200px;
    height: 50px;
    line-height: 50px;
    text-align: center;
    color: #fff;
    background: rgba(64, 158, 255, 1);
    border-radius: 25px;
    border: 0;
    position: fixed;
    z-index: 20001;
    bottom: calc(50% - 200px);
    left: calc(50% - 100px);
}
</style>