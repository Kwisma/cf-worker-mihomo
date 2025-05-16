import YAML from 'yaml'
import fs from 'fs/promises'  // 使用 Promise API
import path from 'path'
initconfig(['https%3A%2F%2Fetc.mesa.ip-ddns.com%2F9g4C1UAZeaBQD86WfCV0'], 'https://raw.githubusercontent.com/Kwisma/cf-worker-mihomo/main/Config/Mihomo.yaml');

async function initconfig(urls, configUrl) {
    const proxyProviders = {};

    urls.forEach((url, index) => {
        const decodedUrl = decodeURIComponent(url);
        proxyProviders[`provider${index + 1}`] = {
            url: decodedUrl,
            path: `./proxies/provider${index + 1}.yaml`,
            override: {
                'additional-suffix': ` ${index + 1}`,
            }
        };
    });

    const response = await fetch(configUrl);
    let rawConfigText = await response.text();

    // 继续处理 YAML
    let obj = YAML.parse(rawConfigText, { maxAliasCount: Infinity });
    obj['proxy-providers'] = proxyProviders;
    data = deepMerge(data)
    let data = YAML.parse(rawConfigText, { maxAliasCount: Infinity });
    obj['proxy-providers'] = proxyProviders;
    const newYaml = YAML.stringify(obj);
    await fs.writeFile(path.resolve('./new_config.yaml'), newYaml, 'utf8');

    return JSON.stringify(obj);
}
