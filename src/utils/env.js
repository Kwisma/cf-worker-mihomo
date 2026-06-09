import { splitUrlsAndProxies, backimg, subapi, beiantext, beiandizi } from './index.js';
export function buildConfig(request, env, isNode = false) {
    const url = isNode ? new URL(request.url, `http://${request.headers.host}`) : new URL(request.url);

    const getHeader = (key) => {
        if (isNode) {
            return request.headers[key.toLowerCase()];
        }
        return request.headers.get(key);
    };

    const getParam = (key) => url.searchParams.get(key);

    const getParamBool = (key) => getParam(key) === 'true';
    const getEnv = (key, fallback) => {
        if (isNode) {
            return process.env[key] ?? fallback;
        }
        return env?.[key] ?? fallback;
    };

    const data = {};
    data.url = url;
    data.userAgent = getHeader('User-Agent');

    const urlParam = getParam('url');
    if (urlParam && urlParam.trim()) {
        data.urls = splitUrlsAndProxies(urlParam.split(',').map((u) => u.trim()));
    }

    const target = getParam('target');
    if (target) data.target = target;
    const log = getParam('log');
    if (log) data.log = log;
    if (getParamBool('udp')) data.udp = true;
    if (getParamBool('udp_frag')) data.udp_fragment = true;
    if (getParamBool('tls_frag')) data.tls_fragment = true;
    if (getParamBool('ep')) data.exclude_package = true;
    if (getParamBool('ea')) data.exclude_address = true;
    if (getParamBool('tailscale')) data.tailscale = true;
    if (getParamBool('adgdns')) data.adgdns = true;
    if (getParamBool('tun')) data.tun = true;
    if (getParamBool('ech')) data.ech = true;
    if (getParamBool('relay')) data.relay = true;
    if (getParamBool('fallback')) data.fallback = true;
    if (getParamBool('pp')) data.proxyprovider = true;

    data.IMG = getEnv('IMG', backimg);
    data.sub = getEnv('SUB', subapi);
    data.beian = getEnv('BEIAN', beiantext);
    data.beianurl = getEnv('BEIANURL', beiandizi);

    const templateBaseUrl = getEnv('TEMPLATE_URL', '');
    const template = getParam('template');
    if (template) {
        if (templateBaseUrl) {
            data.rule = `${templateBaseUrl}/${data.target}${template}`;
        } else {
            data.rule = `${url.origin}${isNode ? '/template' : ''}/${data.target}${template}`;
        }
    }

    return data;
}
