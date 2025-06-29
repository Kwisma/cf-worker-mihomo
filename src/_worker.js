import { getmihomo_config } from './mihomo.js';
import { getsingbox_config } from './singbox.js';
import { getFakePage, backimg, subapi, mihomo_top, beiantext, beiandizi, configs } from './utils.js';
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const userAgent = request.headers.get('User-Agent');
        const rule = url.searchParams.get("template");
        const singbox = url.searchParams.get("singbox");
        const IMG = env.IMG || backimg
        const sub = env.SUB || subapi
        const Mihomo_default = env.MIHOMO || mihomo_top
        const beian = env.BEIAN || beiantext
        const beianurl = env.BEIANURL || beiandizi
        // 处理 URL 参数
        let urls = url.searchParams.getAll("url");

        if (urls.length === 1 && urls[0].includes(",")) {
            urls = urls[0].split(",").map(u => u.trim()); // 拆分并去除空格
        }

        if (urls.length === 0 || urls[0] === "") {
            return new Response(await getFakePage(IMG, beianurl, beian, configs()), {
                status: 200,
                headers: {
                    "Content-Type": "text/html; charset=utf-8"
                }
            });
        }
        try {
            let res, headers, status;
            if (singbox) {
                res = await getsingbox_config(urls, rule, userAgent, sub);
            } else {
                res = await getmihomo_config(urls, rule, Mihomo_default, userAgent, sub);
            }
            const responseHeaders = res.headers || {};
            headers = new Headers(responseHeaders);
            status = res.status;
            headers.set("Content-Type", "application/json; charset=utf-8");
            return new Response(res.data, {
                status,
                headers
            });
        } catch (err) {
            return new Response(err.message, {
                status: 400,
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                }
            });
        }
    }
};