import YAML from 'yaml';
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const userAgent = request.headers.get('User-Agent');
        const isBrowser = /mozilla|chrome|safari|firefox|edge|opera|webkit|gecko|trident/i.test(userAgent);
        const templateUrl = url.searchParams.get("template");
        const singbox = url.searchParams.get("singbox");
        // 处理 URL 参数
        let urls = url.searchParams.getAll("url");
        let headers = new Headers(), data = "";

        if (urls.length === 1 && urls[0].includes(",")) {
            urls = urls[0].split(",").map(u => u.trim()); // 拆分并去除空格
        }

        if (urls.length === 0 || urls[0] === "") {
            return new Response(await getFakePage(env.IMG), {
                status: 200,
                headers: {
                    "Content-Type": "text/html; charset=utf-8"
                }
            });
        }

        // URL 校验
        for (let u of urls) {
            if (!isValidURL(u)) {
                return new Response(await getFakePage(env.IMG), {
                    status: 200,
                    headers: {
                        "Content-Type": "text/html; charset=utf-8"
                    }
                });
            }
        }
        if (isBrowser) {
            return new Response(
                `
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>Welcome</title>
                    <style>
                      /* 全局背景图（使用在线图片URL） */
                      body {
                        background:rgba(179, 172, 172, 0.5);
                        background-size: cover;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        font-family: 'Arial', sans-serif;
                      }

                      /* 文字框样式 */
                      .text-box {
                        background: rgba(255, 255, 255, 0.8); /* 半透明白色背景 */
                        backdrop-filter: blur(5px); /* 毛玻璃效果 */
                        border-radius: 15px;
                        padding: 40px;
                        max-width: 600px;
                        text-align: center;
                        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                      }

                      h1 {
                        color: rgb(255, 0, 0);
                        margin: 0 0 20px 0;
                      }
                    </style>
                  </head>
                  <body>
                    <div class="text-box">
                      <h1>请使用mihomo内核的代理工具订阅！</h1>
                    </div>
                  </body>
                </html>
                `,
                {
                    status: 400,
                    headers: { 'Content-Type': 'text/html; charset=utf-8' }
                }
            );
        }
        if (singbox) {
            const res = await singboxconfig(urls, templateUrl);
            data = res.data;
            const responseHeaders = res.ResponseHeaders?.headers || {};
            headers = new Headers(responseHeaders);
        } else {
            const res = await mihomoconfig(urls, templateUrl);
            data = res.data;
            const responseHeaders = res.ResponseHeaders?.headers || {};
            headers = new Headers(responseHeaders);
        }
        headers.set("Content-Type", "application/json; charset=utf-8");
        return new Response(data, {
            status: 200,
            headers
        });
    }
};

// 获取伪装页面
async function getFakePage(image = 'https://t.alcy.cc/ycy') {
    return `
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>mihomo汇聚工具</title>
    <style>
        :root {
            --primary-color: #4361ee;
            --hover-color: #3b4fd3;
            --bg-color: #f5f6fa;
            --card-bg: #ffffff;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background-image: url(${image});
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            background-color: var(--bg-color);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            padding: 60px 0;
            align-items: center;
        }

        .container {
            position: relative;
            /* 使用rgba设置半透明背景 */
            background: rgba(255, 255, 255, 0.7);
            /* 添加磨砂玻璃效果 */
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            /* Safari兼容 */
            max-width: 600px;
            margin: 0;
            width: 90%;
            height: 90%;
            padding: 2rem;
            border-radius: 20px;
            /* 调整阴影效果增加通透感 */
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05),
                inset 0 0 0 1px rgba(255, 255, 255, 0.1);
            transition: transform 0.3s ease;
        }

        /* 调整hover效果 */
        .container:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1),
                inset 0 0 0 1px rgba(255, 255, 255, 0.2);
        }

        h1 {
            text-align: center;
            color: var(--primary-color);
            margin-bottom: 2rem;
            font-size: 1.8rem;
        }

        .input-group {
            margin-bottom: 1.5rem;
        }

        .link-input {
            display: block;
            margin-top: 8px;
            width: 100%;
        }

        .link-row {
            display: flex;
            align-items: center;
            position: relative;
            margin-bottom: 8px;
        }

        /* 圆形添加按钮样式 */
        .add-btn {
            position: relative;
            background-color: #f8f9fa;
            width: 50px;
            height: 50px;
            top: 3px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background-color 0.2s ease;
            margin-left: 10px;
        }

        .add-btn:hover {
            background-color: #ddd;
            /* 鼠标悬停效果 */
        }


        label {
            display: block;
            margin-bottom: 0.5rem;
            color: #555;
            font-weight: 500;
        }

        input {
            width: 100%;
            padding: 12px;
            /* 修改边框颜色从 #eee 到更深的颜色 */
            border: 2px solid rgba(0, 0, 0, 0.15);
            /* 使用rgba实现更自然的深度 */
            border-radius: 10px;
            font-size: 1rem;
            transition: all 0.3s ease;
            /* 添加轻微的内阴影增强边框效果 */
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
        }

        input:focus {
            outline: none;
            border-color: var(--primary-color);
            /* 增强focus状态下的阴影效果 */
            box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15),
                inset 0 2px 4px rgba(0, 0, 0, 0.03);
        }

        button {
            width: 100%;
            padding: 12px;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 1.5rem;
        }

        button:hover {
            background-color: var(--hover-color);
            transform: translateY(-2px);
        }

        button:active {
            transform: translateY(0);
        }

        #result {
            background-color: #f8f9fa;
            font-family: monospace;
            word-break: break-all;
        }

        .github-corner svg {
            fill: var(--primary-color);
            color: var(--card-bg);
            position: absolute;
            top: 0;
            right: 0;
            border: 0;
            width: 80px;
            height: 80px;
        }

        .github-corner:hover .octo-arm {
            animation: octocat-wave 560ms ease-in-out;
        }

        @keyframes octocat-wave {

            0%,
            100% {
                transform: rotate(0)
            }

            20%,
            60% {
                transform: rotate(-25deg)
            }

            40%,
            80% {
                transform: rotate(10deg)
            }
        }

        @keyframes rotate {
            from {
                transform: rotate(0deg);
            }

            to {
                transform: rotate(360deg);
            }
        }

        .logo-title {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 2rem;
        }

        .logo-title img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            position: relative;
            z-index: 1;
            background: var(--card-bg);
            box-shadow: 0 0 15px rgba(67, 97, 238, 0.1);
        }


        @keyframes rotate {
            from {
                transform: rotate(0deg);
            }

            to {
                transform: rotate(360deg);
            }
        }

        .logo-title h1 {
            margin-bottom: 0;
            text-align: center;
        }

        @media (max-width: 480px) {
            .container {
                padding: 1.5rem;
            }

            h1 {
                font-size: 1.5rem;
            }

            .github-corner:hover .octo-arm {
                animation: none;
            }

            .github-corner .octo-arm {
                animation: octocat-wave 560ms ease-in-out;
            }
        }

        .beian-info {
            text-align: center;
            font-size: 13px;
        }

        .beian-info a {
            color: var(--primary-color);
            text-decoration: none;
            border-bottom: 1px dashed var(--primary-color);
            padding-bottom: 2px;
        }

        .beian-info a:hover {
            border-bottom-style: solid;
        }

        #qrcode {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 20px;
        }
        
        /* 新增模板选择器样式 - 单展开面板版本 */
        .template-selector {
            margin-bottom: 1.5rem;
        }
        
        .template-toggle {
            padding: 12px 15px;
            background-color: rgba(67, 97, 238, 0.1);
            font-weight: bold;
            cursor: pointer;
            border-radius: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: background-color 0.2s;
        }
        
        .template-toggle:hover {
            background-color: rgba(67, 97, 238, 0.2);
        }
        
        .template-toggle:after {
            content: "▶"; /* 改为向右箭头 */
            font-size: 12px;
            transition: transform 0.3s;
            margin-left: 8px; /* 增加间距 */
        }
        
        .template-toggle.collapsed:after {
            transform: rotate(90deg);
        }
        
        .template-options {
            background-color: white;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            display: none;
            margin-top: 5px;
            max-height: 200px; /* 可根据需要调整高度 */
            overflow-y: auto;
        }
        
        .template-options.show {
            display: block;
        }
        
        .template-option {
            padding: 10px 20px;
            cursor: pointer;
            transition: all 0.2s;
            border-bottom: 1px solid #eee;
        }
        
        .template-option:last-child {
            border-bottom: none;
        }
        
        .template-option:hover {
            background-color: rgba(67, 97, 238, 0.1);
        }
        
        .template-option.selected {
            background-color: rgba(67, 97, 238, 0.2);
            font-weight: bold;
        }
        
        // .template-url {
        //     width: 100%;
        //     padding: 12px;
        //     border: 2px solid rgba(0, 0, 0, 0.15);
        //     border-radius: 10px;
        //     font-size: 1rem;
        //     background-color: #f8f9fa;
        //     color: #666;
        //     cursor: not-allowed;
        //     margin-top: 10px;
        // }
        /* Add new styles for the toggle switch */
        .config-toggle {
            display: flex;
            justify-content: center;
            margin-bottom: 1.5rem;
            background: rgba(67, 97, 238, 0.1);
            border-radius: 10px;
            padding: 8px;
        }

        .toggle-option {
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: bold;
            text-align: center;
            flex: 1;
        }

        .toggle-option.active {
            background-color: #4361ee;
            color: white;
        }

        .toggle-option:not(.active):hover {
            background-color: rgba(67, 97, 238, 0.2);
        }

        .singbox-options {
            display: none;
        }

        .singbox-mode .singbox-options {
            display: block;
        }

        .singbox-mode .mihomo-options {
            display: none;
        }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/@keeex/qrcodejs-kx@1.0.2/qrcode.min.js"></script>
</head>

<body>
    <a href="${atob('aHR0cHM6Ly9naXRodWIuY29tL0t3aXNtYS9jZi13b3JrZXItbWlob21v')}" target="_blank" class="github-corner"
        aria-label="View source on Github">
        <svg viewBox="0 0 250 250" aria-hidden="true">
            <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
            <path
                d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
                fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path>
            <path
                d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
                fill="currentColor" class="octo-body"></path>
        </svg>
    </a>
    <div class="container">
        <div class="logo-title">
            <h1>mihomo/singbox汇聚工具</h1>
        </div>
        <div class="config-toggle">
            <div class="toggle-option active" data-mode="mihomo">Clash (mihomo)</div>
            <div class="toggle-option" data-mode="singbox">Singbox</div>
        </div>
        <div class="mihomo-options">
            <div class="template-selector">
                <div class="template-toggle collapsed">选择配置模板（未选择）</div>
                <div class="template-options">
                    <!-- 模板选项将通过JavaScript填充 -->
                </div>
            </div>

            <div class="input-group">
                <label for="link">订阅链接</label>
                <div id="link-container">
                    <div class="link-row">
                        <input type="text" class="link-input"
                            placeholder="https://www.example.com/answer/land?token=xxx" />
                        <div class="add-btn" onclick="addLinkInput(this)">➕</div>
                    </div>
                </div>
            </div>

            <button onclick="generateLink()">生成mihomo配置</button>
        </div>

        <div class="singbox-options">
            <div class="template-selector">
                <div class="template-toggle collapsed">选择配置模板（未选择）</div>
                <div class="template-options">
                    <!-- 模板选项将通过JavaScript填充 -->
                </div>
            </div>
            <div class="input-group">
                <label for="link">订阅链接</label>
                <div id="link-container-singbox">
                    <div class="link-row">
                        <input type="text" class="link-input"
                            placeholder="https://www.example.com/answer/land?token=xxx" />
                        <div class="add-btn" onclick="addLinkInput(this, 'singbox')">➕</div>
                    </div>
                </div>
            </div>

            <button onclick="generateSingboxLink()">生成Singbox配置</button>
        </div>


        <div class="input-group">
            <div style="display: flex; align-items: center;">
                <label for="result">订阅链接</label>
            </div>
            <input type="text" id="result" readonly onclick="copyToClipboard()">
            <label id="qrcode" style="margin: 15px 10px -15px 10px;"></label>
        </div>
        <div class="beian-info" style="text-align: center; font-size: 13px;">
            <a href='https://t.me/Marisa_kristi'>萌ICP备20250001号</a>
        </div>
    </div>

    <script>

        // 点击页面其他区域关闭提示框
        document.addEventListener('click', function (event) {
            const tooltip = document.getElementById('infoTooltip');
            const infoIcon = document.querySelector('.info-icon');

            if (!tooltip.contains(event.target) && !infoIcon.contains(event.target)) {
                tooltip.style.display = 'none';
            }
        });

        function copyToClipboard() {
            const resultInput = document.getElementById('result');
            if (!resultInput.value) {
                return;
            }

            resultInput.select();
            navigator.clipboard.writeText(resultInput.value).then(() => {
                const tooltip = document.createElement('div');
                tooltip.style.position = 'fixed';
                tooltip.style.left = '50%';
                tooltip.style.top = '20px';
                tooltip.style.transform = 'translateX(-50%)';
                tooltip.style.padding = '8px 16px';
                tooltip.style.background = '#4361ee';
                tooltip.style.color = 'white';
                tooltip.style.borderRadius = '4px';
                tooltip.style.zIndex = '1000';
                tooltip.textContent = '已复制到剪贴板';

                document.body.appendChild(tooltip);

                setTimeout(() => {
                    document.body.removeChild(tooltip);
                }, 2000);
            }).catch(err => {
                alert('复制失败，请手动复制');
            });
        }

        // 修改addLinkInput以支持singbox容器
        function addLinkInput(button, mode = 'mihomo') {
            const containerId = mode === 'singbox' ? 'link-container-singbox' : 'link-container';
            const container = document.getElementById(containerId);
            const row = document.createElement('div');
            row.className = 'link-row';

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'link-input';
            input.placeholder = 'https://www.example.com/answer/land?token=xxx';

            button.style.display = 'none';
            row.appendChild(input);
            container.appendChild(row);

            const btn = document.createElement('div');
            btn.className = 'add-btn';
            btn.textContent = '➕';
            btn.onclick = function () {
                addLinkInput(btn, mode);
            };

            row.appendChild(btn);
        }

        function generateLink() {
            const inputs = document.querySelectorAll('.link-input');
            const links = Array.from(inputs).map(input => input.value.trim()).filter(val => val !== '');

            if (links.length === 0) {
                alert('请输入至少一个链接');
                return;
            }

            const allValid = links.every(link => link.startsWith('http://') || link.startsWith('https://'));
            if (!allValid) {
                alert('请输入有效的url地址');
                return;
            }
	        const encodedLinks = links.map(link => encodeURIComponent(link));
            const domain = window.location.hostname;
            const urlLink = \`https://\${domain}/?url=\${encodedLinks.join(',')}\`;
            document.getElementById('result').value = urlLink;

            // 生成二维码
            const qrcodeDiv = document.getElementById('qrcode');
            qrcodeDiv.innerHTML = '';
            new QRCode(qrcodeDiv, {
                text: urlLink,
                width: 220,
                height: 220,
                colorDark: "#4a60ea",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.L,
                scale: 1
            });
        }

        // 在mihomo和singbox模式之间切换
        document.addEventListener('DOMContentLoaded', function () {
            const toggleOptions = document.querySelectorAll('.toggle-option');
            const container = document.querySelector('.container');

            toggleOptions.forEach(option => {
                option.addEventListener('click', function () {
                    // 设置活动状态
                    toggleOptions.forEach(opt => opt.classList.remove('active'));
                    this.classList.add('active');

                    // 切换模式
                    if (this.dataset.mode === 'singbox') {
                        container.classList.add('singbox-mode');
                    } else {
                        container.classList.remove('singbox-mode');
                    }
                });
            });

            // 初始化模板选择器
            initTemplateSelector('mihomo');
            initTemplateSelector('singbox');
        });
        // 初始化模板选择器
        function initTemplateSelector(mode = 'mihomo') {
            const selectorClass = mode === 'singbox' ? '.singbox-options .template-selector' : '.mihomo-options .template-selector';
            const templateToggle = document.querySelector(\`\${selectorClass} .template-toggle\`);
            const optionsContainer = document.querySelector(\`\${selectorClass} .template-options\`);

            // 配置数据
            const configs = {
                mihomo: [
                    {
                        label: "通用",
                        options: [
                            {
                                label: "默认（精简版）（仅国内外分流）",
                                value: "https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/template/Mihomo_default.yaml"
                            },
                            {
                                label: "默认（精简版）（无去广告）",
                                value: "https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/template/Mihomo_default_NoAds.yaml"
                            },
                            {
                                label: "默认（全分组）",
                                value: "https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/template/Mihomo_default_full.yaml"
                            }
                        ]
                    },
                    {
                        label: "Mihomo-Party-ACL4SSR",
                        options: [
                            {
                                label: "ACL4SSR_Online_Full 全包重度用户使用（与Github同步）",
                                value: "https://raw.githubusercontent.com/zhuqq2020/Mihomo-Party-ACL4SSR/main/ACL4SSR_Online_Full.yaml"
                            },
                            {
                                label: "ACL4SSR_Online_Full_AdblockPlus 全包重度用户使用更多去广告（与Github同步）",
                                value: "https://raw.githubusercontent.com/zhuqq2020/Mihomo-Party-ACL4SSR/main/ACL4SSR_Online_Full_AdblockPlus.yaml"
                            },
                            {
                                label: "ACL4SSR_Online_Full_Tiktok 全包重度用户使用抖音全量（与Github同步）",
                                value: "https://raw.githubusercontent.com/zhuqq2020/Mihomo-Party-ACL4SSR/main/ACL4SSR_Online_Full_Tiktok.yaml"
                            },
                            {
                                label: "ACL4SSR_Online_Full_WithIcon 全包重度用户使用（与Github同步）（无图标）",
                                value: "https://raw.githubusercontent.com/zhuqq2020/Mihomo-Party-ACL4SSR/main/ACL4SSR_Online_Full_WithIcon.yaml"
                            },
                            {
                                label: "ACL4SSR_Online_Mini_MultiMode 专业版自动测速、故障转移、负载均衡（与Github同步）",
                                value: "https://raw.githubusercontent.com/zhuqq2020/Mihomo-Party-ACL4SSR/main/ACL4SSR_Online_Mini_MultiMode.yaml"
                            },
                            {
                                label: "极简分流规则",
                                value: "https://raw.githubusercontent.com/zhuqq2020/Mihomo-Party-ACL4SSR/main/极简分流规则.yaml"
                            }
                        ]
                    },
                    {
                        label: "网络收集",
                        options: [
                            {
                                label: "布丁狗的订阅转换 (与Github同步)",
                                value: "https://raw.githubusercontent.com/mihomo-party-org/override-hub/main/yaml/%E5%B8%83%E4%B8%81%E7%8B%97%E7%9A%84%E8%AE%A2%E9%98%85%E8%BD%AC%E6%8D%A2.yaml"
                            },
                            {
                                label: "ACL4SSR_Online_Full 全分组版 (与Github同步)",
                                value: "https://raw.githubusercontent.com/mihomo-party-org/override-hub/main/yaml/ACL4SSR_Online_Full.yaml"
                            },
                            {
                                label: "ACL4SSR_Online_Full_WithIcon 全分组版 (与Github同步) (无图标)",
                                value: "https://raw.githubusercontent.com/mihomo-party-org/override-hub/main/yaml/ACL4SSR_Online_Full_WithIcon.yaml"
                            },
                        ]
                    },
                    {
                        label: "Lanlan13-14",
                        options: [
                            {
                                label: "configfull 全分组版 (与Github同步)",
                                value: "https://raw.githubusercontent.com/Lanlan13-14/Rules/main/configfull.yaml"
                            },
                            {
                                label: "configfull_NoAd 全分组版 (与Github同步) (无去广告)",
                                value: "https://raw.githubusercontent.com/Lanlan13-14/Rules/main/configfull_NoAd.yaml"
                            },
                            {
                                label: "configfull_NoAd_Stash 全分组版 (与Github同步) (无去广告) (Stash)",
                                value: "https://raw.githubusercontent.com/Lanlan13-14/Rules/main/configfull_NoAd_Stash.yaml"
                            },
                            {
                                label: "configfull_NoAd_Stash_lite 全分组版 (与Github同步) (无去广告) (精简版) (Stash)",
                                value: "https://raw.githubusercontent.com/Lanlan13-14/Rules/main/configfull_NoAd_Stash_lite.yaml"
                            },
                            {
                                label: "configfull_NoAd_lite 全分组版 (与Github同步) (无去广告) (精简版)",
                                value: "https://raw.githubusercontent.com/Lanlan13-14/Rules/main/configfull_NoAd_lite.yaml"
                            },
                            {
                                label: "configfull_Stash 全分组版 (与Github同步) (Stash)",
                                value: "https://raw.githubusercontent.com/Lanlan13-14/Rules/main/configfull_Stash.yaml"
                            },
                            {
                                label: "configfull_Stash_lite 全分组版 (与Github同步) (精简版) (Stash)",
                                value: "https://raw.githubusercontent.com/Lanlan13-14/Rules/main/configfull_Stash_lite.yaml"
                            },
                            {
                                label: "configfull_lite 全分组版 (与Github同步) (精简版)",
                                value: "https://raw.githubusercontent.com/Lanlan13-14/Rules/main/configfull_lite.yaml"
                            },
                        ]
                    },
                ],
                singbox: [
                    {
                        label: "1.12.X",
                        options: [
                            {
                                label: "默认（精简版）",
                                value: "https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/template/singbox-1.12.0-beta.17.json"
                            }
                        ]
                    }
                ]
            };
            // 生成所有模板选项
            configs[mode].forEach(group => {
                // 添加分组标签
                const groupLabel = document.createElement('div');
                groupLabel.style.padding = '10px 20px';
                groupLabel.style.fontWeight = 'bold';
                groupLabel.style.color = '#555';
                groupLabel.style.backgroundColor = '#f5f5f5';
                groupLabel.textContent = group.label;
                optionsContainer.appendChild(groupLabel);

                // 添加选项
                group.options.forEach(option => {
                    const optionElement = document.createElement('div');
                    optionElement.className = 'template-option';
                    optionElement.textContent = option.label;
                    optionElement.dataset.value = option.value;

                    optionElement.addEventListener('click', function () {
                        // 移除之前选中的样式
                        document.querySelectorAll(\`\${selectorClass} .template-option.selected\`).forEach(item => {
                            item.classList.remove('selected');
                        });

                        // 更新显示文本
                        templateToggle.textContent = \`选择配置模板（\${option.label}）\`;

                        // 添加选中样式
                        this.classList.add('selected');

                        // 点击后自动折叠选项面板
                        templateToggle.classList.add('collapsed');
                        optionsContainer.classList.remove('show');
                    });

                    optionsContainer.appendChild(optionElement);
                });
            });

            // 默认选择第一个选项
            const firstOption = document.querySelector(\`\${selectorClass} .template-option\`);
            if (firstOption) {
                firstOption.classList.add('selected');
                templateToggle.textContent = \`选择配置模板（\${firstOption.textContent}）\`;
            }

            // 点击切换按钮展开/折叠选项
            templateToggle.addEventListener('click', function () {
                this.classList.toggle('collapsed');
                optionsContainer.classList.toggle('show');
            });

            // 点击页面其他区域关闭选项面板
            document.addEventListener('click', function (event) {
                if (!templateToggle.contains(event.target) && !optionsContainer.contains(event.target)) {
                    templateToggle.classList.add('collapsed');
                    optionsContainer.classList.remove('show');
                }
            });
        }

        // 生成mihomo链接
        function generateLink() {
            const inputs = document.querySelectorAll('.mihomo-options .link-input');
            const selectedOption = document.querySelector('.template-option.selected');

            const subscriptionLinks = Array.from(inputs)
                .map(input => input.value.trim())
                .filter(val => val !== '');

            const templateLink = selectedOption ? selectedOption.dataset.value : '';

            if (subscriptionLinks.length === 0 && !templateLink) {
                alert('请输入至少一个订阅链接或选择配置模板');
                return;
            }

            const allValid = subscriptionLinks.every(link =>
                link.startsWith('http://') || link.startsWith('https://'));

            if (subscriptionLinks.length > 0 && !allValid) {
                alert('请输入有效的订阅URL地址');
                return;
            }

            const allLinks = [];
            if (templateLink) {
                allLinks.push(\`template=\${encodeURIComponent(templateLink)}\`);
            }

            subscriptionLinks.forEach(link => {
                allLinks.push(\`url=\${encodeURIComponent(link)}\`);
            });

            const domain = window.location.hostname;
            const urlLink = \`https://\${domain}/?\${allLinks.join('&')}\`;
            updateResult(urlLink);
        }
        // 生成singbox链接
        function generateSingboxLink() {
            const inputs = document.querySelectorAll('.singbox-options .link-input');
            const selectedOption = document.querySelector('.singbox-options .template-option.selected');
            const subscriptionLinks = Array.from(inputs)
                .map(input => input.value.trim())
                .filter(val => val !== '');

            const templateLink = selectedOption ? selectedOption.dataset.value : '';

            if (subscriptionLinks.length === 0 && !templateLink) {
                alert('请输入至少一个订阅链接或选择配置模板');
                return;
            }

             const allValid = subscriptionLinks.every(link =>
                link.startsWith('http://') || link.startsWith('https://'));

            if (subscriptionLinks.length > 0 && !allValid) {
                alert('请输入有效的订阅URL地址');
                return;
            }

            const allLinks = [];
            if (templateLink) {
                allLinks.push(\`template=\${encodeURIComponent(templateLink)}\`);
            }

            subscriptionLinks.forEach(link => {
                allLinks.push(\`url=\${encodeURIComponent(link)}\`);
            });

            const domain = window.location.hostname;
            const urlLink = \`https://\${domain}/?\${allLinks.join('&')}&singbox=true\`;
            updateResult(urlLink);
        }
        // 更新结果和二维码
        function updateResult(urlLink) {
            document.getElementById('result').value = urlLink;

            // 生成二维码
            const qrcodeDiv = document.getElementById('qrcode');
            qrcodeDiv.innerHTML = '';
            new QRCode(qrcodeDiv, {
                text: urlLink,
                width: 220,
                height: 220,
                colorDark: "#4a60ea",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.L,
                scale: 1
            });
        }
    </script>
</body>

</html>    `;
}

// 校验 URL 是否有效
function isValidURL(url) {
    try {
        const parsedUrl = new URL(url);
        return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch (e) {
        return false;
    }
}

// 初始化配置
async function mihomoconfig(urls, templateUrl) {
    urls = urls.map(u => decodeURIComponent(u));
    templateUrl = decodeURIComponent(templateUrl)
    let config = 'https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/Config/Mihomo_lite.yaml', templatedata;
    if (!templateUrl) {
        config = 'https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/Config/Mihomo.yaml';
    } else {
        const templateyaml = await loadConfig(templateUrl);
        templatedata = YAML.parse(templateyaml, { maxAliasCount: -1, merge: true });
    }
    const mihomodata = await loadConfig(config);
    let data = YAML.parse(mihomodata, { maxAliasCount: -1, merge: true });
    const base = data.p || {};
    const override = data.override || {};
    const proxyProviders = {};
    const ResponseHeaders = await handleRequest(urls, templateUrl)
    urls.forEach((url, i) => {
        proxyProviders[`provider${i + 1}`] = {
            ...base,
            url: url,
            path: `./proxies/provider${i + 1}.yaml`,
            override: {
                ...override,
                "additional-suffix": ` ${i + 1}`
            }
        };
    });
    data['proxy-providers'] = proxyProviders;
    if (templatedata) {
        data.proxies = templatedata.proxies || [];
        data['proxy-groups'] = templatedata['proxy-groups'] || [];
        data.rules = templatedata.rules || [];
        data['sub-rules'] = templatedata['sub-rules'] || {};
        data['rule-providers'] = templatedata['rule-providers'] || {};
    }
    return {
        data: JSON.stringify(data, null, 4),
        ResponseHeaders
    }
}

async function loadConfig(configUrl) {
    const cacheKey = new Request(configUrl); // 使用 Request 对象作为缓存键
    const cache = caches.default;

    // 尝试从缓存读取
    let cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
        return cachedResponse.text();
    }

    // 缓存未命中，发起新请求
    const response = await fetch(configUrl);
    const data = await response.text();

    // 将响应存入缓存（克隆响应以复用）
    const cacheResponse = new Response(data, {
        headers: { 'Cache-Control': 'public, max-age=1800' }
    });
    await cache.put(cacheKey, cacheResponse.clone());

    return data;
}

async function fetchResponseHeaders(url) {
    const response = await fetch(url);

    const headersObj = {};
    for (const [key, value] of response.headers.entries()) {
        headersObj[key] = value;
    }

    return {
        status: response.status,
        headers: headersObj
    };
}
function getFileNameFromUrl(url) {
    try {
        const pathname = new URL(url).pathname;
        const parts = pathname.split('/').filter(Boolean);
        const lastPart = parts.length > 0 ? parts[parts.length - 1] : '';
        return lastPart || null;
    } catch {
        return null;
    }
}

/**
 * 合并多个 singbox URL 数据并注入模板配置
 * @param {string|string[]} urls - 节点订阅链接，可传入一个 URL 或多个 URL 数组
 * @returns {Promise<Object|undefined>} - 合并后的 JSON 数据
 */
async function singboxconfig(urls, templateUrl) {
    try {
        templateUrl = decodeURIComponent(templateUrl);
        const ResponseHeaders = await handleRequest(urls, templateUrl);
        const templateJson = await loadConfig(templateUrl); // 使用缓存
        const templateData = JSON.parse(templateJson);

        if (!templateData || !Array.isArray(templateData.outbounds)) 
            throw new Error('template JSON 中没有 outbounds 数组');

        const urlList = Array.isArray(urls) ? urls : [urls];
        const allTargetOutbounds = [];
        const skipTags = ['🚀 节点选择', '🟢 手动选择', '🎈 自动选择'];
        const needNumbering = urlList.length > 1;

        for (let i = 0; i < urlList.length; i++) {
            const rawUrl = urlList[i];
            const index = String(i + 1).padStart(2, '0');
            const apiUrl = `https://url.v1.mk/sub?target=singbox&url=${encodeURIComponent(rawUrl)}&insert=false&config=https%3A%2F%2Fraw.githubusercontent.com%2FACL4SSR%2FACL4SSR%2Fmaster%2FClash%2Fconfig%2FACL4SSR_Online_Full_NoAuto.ini&emoji=true&list=true&xudp=false&udp=false&tfo=false&expand=true&scv=false&fdn=false`;

            const resp = await fetch(apiUrl);
            if (!resp.ok) throw new Error(`获取 ${apiUrl} 失败，状态码：${resp.status}`);

            const data = await resp.json();
            if (!data || !Array.isArray(data.outbounds)) throw new Error(`URL ${rawUrl} 返回格式异常，没有 outbounds 数组`);

            // 过滤跳过的策略组名
            const validOutbounds = data.outbounds.filter(o => o && o.tag && !skipTags.includes(o.tag));
            const filteredOutbounds = validOutbounds.map(o => ({
                ...o,
                tag: needNumbering ? `${o.tag} [${index}]` : o.tag
            }));

            allTargetOutbounds.push(...filteredOutbounds);
        }

        // 根据tag去重节点，防止重复
        const uniqueTargetMap = new Map();
        for (const ob of allTargetOutbounds) {
            if (ob.tag && !uniqueTargetMap.has(ob.tag)) {
                uniqueTargetMap.set(ob.tag, ob);
            }
        }
        const uniqueOutbounds = Array.from(uniqueTargetMap.values());

        // 模板中非策略组节点（除跳过的策略组tag）
        const templateNonSelectors = templateData.outbounds.filter(
            o => o && o.tag && !skipTags.includes(o.tag)
        );

        // 合并唯一节点 + 模板非策略组节点，避免重复tag
        const mergedOutbounds = [...uniqueOutbounds];
        const existingTags = new Set(mergedOutbounds.map(o => o.tag));
        for (const obj of templateNonSelectors) {
            if (obj.tag && !existingTags.has(obj.tag)) {
                mergedOutbounds.push(obj);
                existingTags.add(obj.tag);
            }
        }

        // 提取已编号后的订阅节点标签（字符串且不属于跳过标签）
        const subscriberNodeTags = uniqueOutbounds
            .map(o => o.tag)
            .filter(tag => typeof tag === 'string' && !skipTags.includes(tag));

        // 区域策略组配置
        const regionConfigs = [
            { tag: "🇭🇰 香港自动", regex: /🇭🇰|\bHK\b|香港|Hong Kong/i },
            { tag: "🇹🇼 台湾自动", regex: /🇹🇼|\bTW\b|台湾|Taiwan|Tai wan/i },
            { tag: "🇯🇵 日本自动", regex: /🇯🇵|\bJP\b|日本|Japan/i },
            { tag: "🇺🇸 美国自动", regex: /🇺🇸|\bUS\b|美国|United States|CT/i },
            { tag: "🇸🇬 新加坡自动", regex: /🇸🇬|\bSG\b|新加坡|Singapore/i },
            { tag: "🇰🇷 韩国自动", regex: /🇰🇷|\bKR\b|韩国|South Korea/i },
            { tag: "🇩🇪 德国自动", regex: /🇩🇪|\bDE\b|德国|Germany/i },
            { tag: "🇫🇷 法国自动", regex: /🇫🇷|\bFR\b|法国|France/i },
            { tag: "🇨🇦 加拿大自动", regex: /🇨🇦|\bCA\b|加拿大|Canada/i },
            { tag: "🇦🇺 澳大利亚自动", regex: /🇦🇺|\bAU\b|澳大利亚|Australia/i },
            { tag: "🇷🇺 俄罗斯自动", regex: /🇷🇺|\bRU\b|俄罗斯|Russia/i },
            { tag: "🇳🇱 荷兰自动", regex: /🇳🇱|\bNL\b|荷兰|Netherlands/i },
            { tag: "🇮🇳 印度自动", regex: /🇮🇳|\bIN\b|印度|India/i },
            { tag: "🇲🇾 马来西亚自动", regex: /🇲🇾|\bMY\b|马来西亚|Malaysia/i },
            { tag: "🇵🇱 波兰自动", regex: /🇵🇱|\bPL\b|波兰|Poland/i },
            { tag: "🇪🇪 爱沙尼亚自动", regex: /🇪🇪|\bEE\b|爱沙尼亚|Estonia/i },
            { tag: "🇦🇪 阿联酋自动", regex: /🇦🇪|\bAE\b|阿联酋|United Arab Emirates/i },
            { tag: "🇳🇬 尼日利亚自动", regex: /🇳🇬|\bNG\b|尼日利亚|Nigeria/i },
            { tag: "🇧🇬 保加利亚自动", regex: /🇧🇬|\bBG\b|保加利亚|Bulgaria/i },
            { tag: "🇸🇨 塞舌尔自动", regex: /🇸🇨|\bSC\b|塞舌尔|Seychelles/i },
            { tag: "🇬🇧 英国自动", regex: /🇬🇧|\bGB\b|英国|United Kingdom/i },
            { tag: "🇪🇸 西班牙自动", regex: /🇪🇸|\bES\b|西班牙|Spain/i },
            { tag: "🇻🇳 越南自动", regex: /🇻🇳|\bVN\b|越南|Vietnam/i },
            { tag: "🇸🇽 荷属圣马丁自动", regex: /🇸🇽|\bSX\b|荷属圣马丁|Sint Maarten/i },
            { tag: "🇲🇴 澳门自动", regex: /🇲🇴|\bMO\b|澳门|Macau|Macao/i },
            { tag: "🇵🇭 菲律宾自动", regex: /🇵🇭|\bPH\b|菲律宾|Philippines/i },
            { tag: "🇹🇭 泰国自动", regex: /🇹🇭|\bTH\b|泰国|Thailand/i },
            { tag: "🇲🇳 蒙古自动", regex: /🇲🇳|\bMN\b|蒙古|Mongolia/i },
            { tag: "🇫🇮 芬兰自动", regex: /🇫🇮|\bFI\b|芬兰|Finland/i },
            { tag: "🇸🇪 瑞典自动", regex: /🇸🇪|\bSE\b|瑞典|Sweden/i },
            { tag: "🇦🇹 奥地利自动", regex: /🇦🇹|\bAT\b|奥地利|Austria/i },
            { tag: "🇧🇷 巴西自动", regex: /🇧🇷|\bBR\b|巴西|Brazil/i },
            { tag: "🇰🇿 哈萨克斯坦自动", regex: /🇰🇿|\bKZ\b|哈萨克斯坦|Kazakhstan/i },
            { tag: "🇮🇱 以色列自动", regex: /🇮🇱|\bIL\b|以色列|Israel/i },
            { tag: "🇨🇭 瑞士自动", regex: /🇨🇭|\bCH\b|瑞士|Switzerland/i },
        ];

        for (const { tag, regex } of regionConfigs) {
            addNodesToGroupByTag(templateData, subscriberNodeTags, regex, tag);
        }

        // 添加订阅节点到模板中已有的策略组（跳过的组）
        for (const tag of skipTags) {
            const selector = templateData.outbounds.find(o => o.tag === tag);
            if (!selector) {
                // 允许策略组不存在，跳过
                continue;
            }
            if (!Array.isArray(selector.outbounds)) selector.outbounds = [];

            // 合并去重策略组内节点
            const mergedTags = new Set([...selector.outbounds, ...subscriberNodeTags]);
            selector.outbounds = Array.from(mergedTags);
        }
        const regionTags = regionConfigs.map(c => c.tag);
        const regionGroups = templateData.outbounds.filter(o => regionTags.includes(o.tag));

        // 最终合并策略组 + 节点 + 模板其他非策略组节点
        const finalOutbounds = [
            ...templateData.outbounds.filter(o => skipTags.includes(o.tag)),
            ...regionGroups,
            ...mergedOutbounds
        ];

        const finalConfig = { ...templateData, outbounds: finalOutbounds };
        const data = JSON.stringify(finalConfig, null, 4);
        return {
            ResponseHeaders,
            data
        };

    } catch (error) {
        // 捕获异常，确保返回字符串类型错误消息
        return error.message || String(error);
    }
}

/**
 * 将符合匹配规则的节点 tag 添加到目标策略组的 outbounds 中
 * @param {object} templateData - 配置 JSON 对象，包含 outbounds 数组
 * @param {string[]} nodeTags - 节点 tag 数组（已经编号过）
 * @param {RegExp} matchRegex - 用于匹配节点 tag 的正则表达式
 * @param {string} targetGroupTag - 目标策略组的 tag 名称
 */
function addNodesToGroupByTag(templateData, nodeTags, matchRegex, targetGroupTag) {
    if (!templateData || !Array.isArray(templateData.outbounds)) {
        throw new Error('templateData 必须有 outbounds 数组');
    }
    if (!Array.isArray(nodeTags)) {
        throw new Error('nodeTags 必须是字符串数组');
    }

    // 过滤出匹配的节点标签
    const matchedTags = nodeTags.filter(tag => matchRegex.test(tag));
    if (matchedTags.length === 0) {
        // 没匹配到节点，则不创建组，也不添加引用
        return;
    }

    // 查找已有的目标策略组
    let targetGroup = templateData.outbounds.find(o => o.tag === targetGroupTag);
    if (!targetGroup) {
        targetGroup = {
            type: "urltest",
            tag: targetGroupTag,
            url: "https://www.gstatic.com/generate_204",
            interval: "3m",
            tolerance: 150,
            interrupt_exist_connections: true,
            outbounds: []
        };
        templateData.outbounds.push(targetGroup);
    }

    if (!Array.isArray(targetGroup.outbounds)) {
        targetGroup.outbounds = [];
    }

    // 将匹配到的节点标签合并到该策略组的 outbounds 中
    const outboundSet = new Set(targetGroup.outbounds);
    matchedTags.forEach(tag => outboundSet.add(tag));
    targetGroup.outbounds = Array.from(outboundSet);

    // 找到主策略组 "🚀 节点选择"
    const mainSelector = templateData.outbounds.find(o => o.tag === "🚀 节点选择");
    if (mainSelector) {
        if (!Array.isArray(mainSelector.outbounds)) {
            mainSelector.outbounds = [];
        }
        // 把目标策略组的tag添加到主策略组
        const selectorSet = new Set(mainSelector.outbounds);
        selectorSet.add(targetGroupTag);
        mainSelector.outbounds = Array.from(selectorSet);
    } else {
        console.warn('⚠️ 未找到主策略组 "🚀 节点选择"，未添加子组引用');
    }
}

async function handleRequest(urls, templateUrl) {
    let ResponseHeaders = {};
    let headers = {};
    if (urls.length === 1) {
        // 处理单个 URL 的 headers
        const ResponseHeadersRaw = await fetchResponseHeaders(urls[0]);
        if (ResponseHeadersRaw?.headers) {
            headers = { ...ResponseHeadersRaw.headers };
            const hasContentDisposition = Object.keys(headers).some(
                key => key.toLowerCase() === "content-disposition"
            );
            if (!hasContentDisposition) {
                const domain = new URL(urls[0]).hostname;
                headers["Content-Disposition"] =
                    `attachment; filename="${domain}"; filename*=utf-8''${encodeURIComponent(domain)}`;
            }
            ResponseHeaders = { headers };
        }
        return ResponseHeaders;
    } else {
        const fileName = getFileNameFromUrl(templateUrl);
        const fallbackName = fileName
            ? `mihomo汇聚订阅(${fileName})`
            : "mihomo汇聚订阅";
        headers["Content-Disposition"] =
            `attachment; filename="${fallbackName}"; filename*=utf-8''${encodeURIComponent(fallbackName)}`;
        ResponseHeaders = { headers };
        return ResponseHeaders;
    }
}
