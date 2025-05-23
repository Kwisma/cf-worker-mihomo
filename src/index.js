import YAML from 'yaml';
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const userAgent = request.headers.get('User-Agent');
        const isBrowser = /mozilla|chrome|safari|firefox|edge|opera|webkit|gecko|trident/i.test(userAgent);
        const template = url.searchParams.get("template");
        // 处理 URL 参数
        let urls = url.searchParams.getAll("url");

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
        const {data, ResponseHeaders} = await initconfig(urls, template)
        const headers = new Headers(ResponseHeaders?.headers || {});
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
            <h1>mihomo汇聚工具</h1>
        </div>
        <div class="input-group">
            <label for="link">订阅链接</label>
            <div id="link-container">
                <div class="link-row">
                    <input type="text" class="link-input" placeholder="https://www.example.com/answer/land?token=xxx" />
                    <div class="add-btn" onclick="addLinkInput(this)">➕</div>
                </div>
            </div>
        </div>

        <button onclick="generateLink()">生成mihomo配置</button>

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

        function addLinkInput(button) {
            const container = document.getElementById('link-container'); // 获取容器
            const row = document.createElement('div');
            row.className = 'link-row'; // 添加相同的布局样式

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'link-input';
            input.placeholder = 'https://www.example.com/answer/land?token=xxx';

            // 隐藏当前按钮
            button.style.display = 'none';

            // 将新行添加到容器中
            row.appendChild(input);
            container.appendChild(row);

            // 为新输入框添加按钮
            const btn = document.createElement('div');
            btn.className = 'add-btn';
            btn.textContent = '➕';
            btn.onclick = function () {
                addLinkInput(btn); // 递归调用，按钮跟随新行
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

        // 页面加载完成后初始化模板选择器
        document.addEventListener('DOMContentLoaded', function() {
            const container = document.querySelector('.container');
            const firstInputGroup = document.querySelector('.input-group');
            
            // 创建模板选择器
            const templateDiv = document.createElement('div');
            templateDiv.className = 'template-selector';
            
            // 创建模板URL显示框
            // const templateUrlLabel = document.createElement('label');
            // templateUrlLabel.className = 'template-label';
            // templateUrlLabel.textContent = '模板URL';
            // templateDiv.appendChild(templateUrlLabel);
            
            // const templateUrlInput = document.createElement('input');
            // templateUrlInput.className = 'template-url';
            // templateUrlInput.type = 'text';
            // templateUrlInput.placeholder = '选择模板后将显示URL';
            // templateUrlInput.id = 'template-url-input';
            // templateUrlInput.readOnly = true;
            // templateDiv.appendChild(templateUrlInput);
            
            // 创建模板切换按钮
            const templateToggle = document.createElement('div');
            templateToggle.className = 'template-toggle';
            templateToggle.textContent = '选择配置模板（未选择）';
            templateDiv.appendChild(templateToggle);
            
            // 创建模板选项容器
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'template-options';

            // 配置数据
            const remoteConfig = [
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
            ];
            // 生成所有模板选项
            remoteConfig.forEach(group => {
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
                    
                    optionElement.addEventListener('click', function() {
                        // 移除之前选中的样式
                        document.querySelectorAll('.template-option.selected').forEach(item => {
                            item.classList.remove('selected');
                        });
                        templateToggle.textContent = \`选择配置模板（\${this.textContent}）\`;

                        // 添加选中样式
                        this.classList.add('selected');
                        
                        // 更新模板URL显示
                        // document.getElementById('template-url-input').value = this.dataset.value;
                        
                        // 点击后自动折叠选项面板
                        templateToggle.classList.add('collapsed');
                        optionsContainer.classList.remove('show');
                    });
                    
                    optionsContainer.appendChild(optionElement);
                });
            });
            
            templateDiv.appendChild(optionsContainer);
            container.insertBefore(templateDiv, firstInputGroup);
            
            // 默认选择第一个选项并显示其URL
            const firstOption = document.querySelector('.template-option');
            if (firstOption) {
                firstOption.classList.add('selected');
                // document.getElementById('template-url-input').value = firstOption.dataset.value;
                templateToggle.textContent = \`选择配置模板（\${firstOption.textContent}）\`;
            }
            
            // 点击切换按钮展开/折叠选项
            templateToggle.addEventListener('click', function() {
                this.classList.toggle('collapsed');
                optionsContainer.classList.toggle('show');
            });
        });

        // 修改generateLink函数以包含模板URL
        function generateLink() {
            const subscriptionInputs = document.querySelectorAll('.link-input');
            const selectedOption = document.querySelector('.template-option.selected');
            
            const subscriptionLinks = Array.from(subscriptionInputs)
                .map(input => input.value.trim())
                .filter(val => val !== '');
                
            const templateLink = selectedOption ? selectedOption.dataset.value : '';
            
            if (subscriptionLinks.length === 0 && !templateLink) {
                alert('请输入至少一个订阅链接或选择配置模板');
                return;
            }
            
            // 验证订阅链接
            const allValid = subscriptionLinks.every(link => 
                link.startsWith('http://') || link.startsWith('https://'));
            
            if (subscriptionLinks.length > 0 && !allValid) {
                alert('请输入有效的订阅URL地址');
                return;
            }
            
            // 如果有模板URL，添加到链接数组开头
            const allLinks = [];
            if (templateLink) {
                allLinks.push(\`template=\${encodeURIComponent(templateLink)}\`);
            }
            
            // 添加订阅链接
            subscriptionLinks.forEach(link => {
                allLinks.push(\`url=\${encodeURIComponent(link)}\`);
            });
            
            const domain = window.location.hostname;
            const urlLink = \`https://\${domain}/?\${allLinks.join('&')}\`;
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
async function initconfig(urls, template) {
    urls = urls.map(u => decodeURIComponent(u));
    let config = 'https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/Config/Mihomo_lite.yaml', templatedata, ResponseHeaders;
    if (!template) {
        config = 'https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/Config/Mihomo.yaml';
    } else {
        const templateyaml = await loadConfig(template);
        templatedata = YAML.parse(templateyaml, { maxAliasCount: -1, merge: true });
    }
    const mihomodata = await loadConfig(config);
    let data = YAML.parse(mihomodata, { maxAliasCount: -1, merge: true });
    const base = data.p || {};
    const override = data.override || {};
    const proxyProviders = {};
    if (urls.length === 1) {
        ResponseHeaders = await fetchResponseHeaders(urls[0])
        if (ResponseHeaders?.headers) {
            headers = { ...ResponseHeaders.headers };

            const hasContentDisposition = Object.keys(headers).some(
                key => key.toLowerCase() === "content-disposition"
            );

            if (!hasContentDisposition) {
                const domain = new URL(urls[0]).hostname;
                headers["Content-Disposition"] =
                    `attachment; filename="${domain}"; filename*=utf-8''${domain}`;
            }
            ResponseHeaders.headers = headers
        }
    }else {
        const fileName = getFileNameFromUrl(config);
        const fallbackName = fileName
            ? `mihomo汇聚订阅(${fileName})`
            : "mihomo汇聚订阅";
        headers["Content-Disposition"] =
            `attachment; filename="${fallbackName}"; filename*=utf-8''${fallbackName}`;
        ResponseHeaders = {
            headers,
        };
    }
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
    if (template) {
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
