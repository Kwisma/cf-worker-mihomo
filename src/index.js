import YAML from 'yaml';
export default {
    async fetch(request, env) {
        const config = env.CONFIG || atob('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0t3aXNtYS9jZi13b3JrZXItbWlob21vL21haW4vQ29uZmlnL01paG9tby55YW1s')
        const url = new URL(request.url);
        // const hostHeader = request.headers.get("host");
        const userAgent = request.headers.get('User-Agent');
        const isBrowser = /mozilla|chrome|safari|firefox|edge|opera|webkit|gecko|trident/i.test(userAgent);
        // 处理 URL 参数
        let urls = url.searchParams.getAll("url");

        if (urls.length === 1 && urls[0].includes(",")) {
            urls = urls[0].split(",").map(u => u.trim()); // 拆分并去除空格
        }

        if (urls.length === 0 || urls[0] === "") {
            return new Response(await getFakePage(env.IMG), {
                headers: {
                    "Content-Type": "text/html; charset=utf-8"
                }
            }, { status: 400 });
        }

        // URL 校验
        for (let u of urls) {
            if (!isValidURL(u)) {
                return new Response(await getFakePage(env.IMG), {
                    headers: {
                        "Content-Type": "text/html; charset=utf-8"
                    }
                }, { status: 400 });
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
                    headers: { 'Content-Type': 'text/html; charset=utf-8' },
                }
            );
        }
        return new Response(await initconfig(urls, config), {
            headers: { "Content-Type": "text/plain; charset=utf-8" }
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
            width: 90%;
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
            console.log(domain);
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
async function initconfig(urls, config) {
    let index = 0, proxy = [];
    for (const url of urls) {
        const decodedUrl = decodeURIComponent(url)
        proxy.push(`
  provider${index + 1}:
    <<: *p
    url: "${decodedUrl}"
    path: ./proxies/provider${index + 1}.yaml
    override:
      <<: *override
      additional-suffix: ' ${index + 1}'
`)
        index++;
    }
    const ProxyProviders = `
proxy-providers:
${proxy.join('')}
`

    const response = await fetch(config);
    let mihomodata = await response.text()
    // 使用正则表达式替换 proxy-providers 和 u 锚点
    mihomodata = mihomodata.replace(/proxy-providers:([\s\S]*?)(?=\n\S|$)/, ProxyProviders.trim());
    return JSON.stringify(YAML.parse(mihomodata, { maxAliasCount: -1, merge: true }));
}