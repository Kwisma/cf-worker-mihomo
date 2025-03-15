import yaml from 'js-yaml';
export default {
    async fetch(request, env) {
        const config = env.CONFIG || "https://raw.githubusercontent.com/Kwisma/MarketNest/refs/heads/main/vpn/mihomo/Mihomo.yaml"
        const url = new URL(request.url);

        // 1. 先获取所有 `url` 参数（数组格式）
        let urls = url.searchParams.getAll("url");

        // 2. 处理逗号分隔的 URL（如果 `url` 只有一个参数但包含逗号）
        if (urls.length === 1 && urls[0].includes(",")) {
            urls = urls[0].split(",").map(u => u.trim()); // 拆分并去除空格
        }

        if (urls.length === 0 || urls[0] === "") {
            return new Response("No URLs provided", { status: 400 });
        }

        return new Response(await initconfig(urls, config), {
            headers: { "Content-Type": "text/plain" }
        });
    }
};

async function initconfig(urls, config) {
    let index = 0, proxy = [], u = [];
    for (const url of urls) {
        proxy.push(`
  provider${index + 1}:
    <<: *p # 继承通用配置
    url: "${url}"
    path: ./proxies/provider${index + 1}.yaml
`)
        u.push(`
    - provider${index + 1}
`)
        index++;
    }
    const ProxyProviders = `
proxy-providers:
${proxy.join('')}
`
    const use = `
use:
${u.join('')}
`

    const response = await fetch(config);
    let mihomodata = await response.text()
    // 使用正则表达式替换 proxy-providers 和 u 锚点
    mihomodata = mihomodata.replace(/proxy-providers:([\s\S]*?)(?=\n\S|$)/, ProxyProviders.trim());
    mihomodata = mihomodata.replace(/use:\n([\s\S]*?)(?=\n\S|$)/, use.trim());
    return yaml.dump(yaml.load(mihomodata), { noRefs: true, lineWidth: -1 });
}
