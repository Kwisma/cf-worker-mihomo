import { fetchpackExtract, fetchipExtract, fetchResponse } from '../../utils/index.js';
import getOutbounds_Data from './outbounds.js';
import Config111 from '../../config/singbox_1.11.X.js';
import Config112 from '../../config/singbox_1.12.X.js';
import Config112Alpha from '../../config/singbox_1.12.X_alpha.js';
import Config113 from '../../config/singbox_1.13.X.js';
import Config114Alpha from '../../config/singbox_1.14.X_alpha.js';
export async function getsingbox_config(e) {
    const config = structuredClone(Verbose(e));
    const alldata = await Promise.all([
        getOutbounds_Data(e),
        fetchResponse(e.rule),
        e.exclude_package ? fetchpackExtract() : null,
        e.exclude_address ? fetchipExtract() : null,
    ]);
    // 获取订阅数据
    const Outbounds_Data = alldata[0];
    if (Outbounds_Data?.data?.outbounds?.length === 0) {
        throw new Error(`节点为空，请使用有效订阅`);
    }
    // 获取规则数据
    const Rule_Data = alldata[1];
    if (!Rule_Data?.data) {
        throw new Error('获取规则数据失败');
    }

    e.Package = alldata[2];
    e.Address = alldata[3];

    // 处理节点数据
    Outbounds_Data.data.outbounds = outboundArrs(Outbounds_Data.data);
    const ApiUrlname = Outbounds_Data.data.outbounds.map((res) => res.tag);

    // 策略组处理
    Rule_Data.data.outbounds = loadAndSetOutbounds(Rule_Data.data.outbounds, ApiUrlname, e);

    // 合并节点
    Rule_Data.data.outbounds.push(...Outbounds_Data.data.outbounds);
    applyTemplate(config, Rule_Data.data, e);
    return {
        status: Outbounds_Data.status,
        headers: Outbounds_Data.headers,
        data: JSON.stringify(config, null, 4),
    };
}
export function Verbose(e) {
    const ua = e.userAgent;

    if (e.checkUA && !/singbox|sing-box|sfa|sfm/i.test(ua)) {
        throw new Error('不支持的客户端');
    }

    const getNum = (re) => {
        const m = ua.match(re);
        return m ? Number(m[1]) : null;
    };
    // 通用：注入 ECH DNS（112+ 用）
    const injectECH = (data) => {
        const next = structuredClone(data);
        next.dns.servers.push({
            type: 'https',
            tag: 'ECH-DNS',
            detour: '🎯 全球直连',
            server: 'google.88366388.xyz',
            path: '/marisa',
            domain_resolver: 'local',
        });

        next.dns.rules = next.dns.rules.map((p) => {
            const rule = { ...p };

            if (rule.action === 'evaluate') {
                rule.server = 'ECH-DNS';
            }

            if (rule.ip_accept_any && rule.server) {
                rule.server = 'ECH-DNS';
            }

            return rule;
        });

        return next;
    };

    // 通用：旧版（111）ECH 注入
    const injectECH111 = (data) => {
        const next = structuredClone(data);
        next.dns.servers.push({
            tag: 'ECH-DNS',
            address_resolver: 'local',
            address: 'https://google.88366388.xyz/marisa',
            detour: '🎯 全球直连',
        });

        next.dns.rules = next.dns.rules.map((p) => (p.outbound && p.server ? { ...p, server: 'ECH-DNS' } : p));

        return next;
    };

    const v112alpha = getNum(/1\.12\.0-alpha\.(\d{1,2})\b/);
    if (v112alpha !== null && v112alpha <= 23) {
        return e.ech ? injectECH(Config112Alpha) : Config112Alpha;
    }

    const v112beta = getNum(/1\.12\.0-beta\.(\d{1,2})\b/);
    if (/1\.11\.\d{1,2}/.test(ua) || (v112beta !== null && v112beta <= 9)) {
        e.tailscale = false;
        e.tls_fragment = false;
        return e.ech ? injectECH111(Config111) : Config111;
    }

    if (/1\.12\.\d{1,2}/.test(ua)) {
        return e.ech ? injectECH(Config112) : Config112;
    }

    const v114alpha = getNum(/1\.14\.0-alpha\.(\d{1,2})\b/);
    if (/1\.13\.\d{1,2}/.test(ua) || (v114alpha !== null && v114alpha <= 9)) {
        return e.ech ? injectECH(Config113) : Config113;
    }

    if (v114alpha !== null) {
        return e.ech ? injectECH(Config114Alpha) : Config114Alpha;
    }

    throw new Error(`不支持的 Singbox 版本：${ua}`);
}
/**
 * 处理配置文件中的 outbounds 数组：
 * 1. 先排除特定类型（如 direct、dns 等）；
 * 2. 根据参数决定是否为 tag 添加序号后缀；
 *
 * @param {Object} data - 包含 outbounds 数组的配置对象
 * @returns {Array<Object>} 处理后的 outbounds 数组
 */
export function outboundArrs(data) {
    const excludedTypes = ['direct', 'block', 'dns', 'selector', 'urltest'];
    if (data && Array.isArray(data.outbounds)) {
        const filteredOutbounds = data.outbounds.filter((outbound) => {
            if (excludedTypes.includes(outbound.type)) return false;
            if (outbound?.server === '') return false;
            if (outbound?.server_port < 1) return false;
            if (outbound?.password === '') return false;
            return true;
        });
        return filteredOutbounds;
    }
}
// 策略组处理
export function loadAndSetOutbounds(Outbounds, ApiUrlname, e) {
    // 处理每个 outbound 的过滤器
    const processOutboundFilters = (outbound) => {
        let matchedOutbounds = [];
        let hasValidAction = false;

        outbound.filter?.forEach((filter) => {
            if (filter.action !== 'all') {
                // 检查 keywords 是否存在且有效
                if (!filter.keywords || typeof filter.keywords !== 'string') {
                    return;
                }
            }

            let currentMatched = [];

            if (filter.action === 'all') {
                currentMatched = ApiUrlname;
                hasValidAction = true;
            } else {
                // 处理正则表达式模式
                const { pattern, ignoreCase } = parseRegexPattern(filter.keywords);
                const regex = new RegExp(pattern, ignoreCase ? 'i' : '');

                // 根据不同的 action 类型处理匹配
                currentMatched = applyFilterAction(ApiUrlname, regex, filter.action);
                hasValidAction = true;
            }

            if (currentMatched.length > 0) {
                matchedOutbounds = [...matchedOutbounds, ...currentMatched];
            }
        });

        return { matchedOutbounds: [...new Set(matchedOutbounds)], hasValidAction };
    };

    // 解析正则表达式模式
    const parseRegexPattern = (keywords) => {
        if (!keywords || typeof keywords !== 'string') {
            return { pattern: '^$', ignoreCase: false }; // 返回不匹配任何内容的模式
        }

        const ignoreCase = /\(\?i\)/i.test(keywords);
        const pattern = keywords.replace(/\(\?i\)/gi, '');
        return { pattern, ignoreCase };
    };

    // 应用过滤器操作
    const applyFilterAction = (items, regex, action) => {
        switch (action) {
            case 'include':
                return items.filter((name) => regex.test(name));
            case 'exclude':
                return items.filter((name) => !regex.test(name));
            default:
                return [];
        }
    };

    // 更新 outbounds 数组
    const updateOutboundsArray = (outbound, matchedOutbounds, hasValidAction) => {
        if (matchedOutbounds.length > 0) {
            outbound.outbounds = outbound.outbounds ? [...new Set([...outbound.outbounds, ...matchedOutbounds])] : matchedOutbounds;
        } else if (outbound.outbounds && outbound.outbounds.length > 0) {
            // 保留原有的 outbounds（没有匹配到但原本有内容）
        } else {
            delete outbound.outbounds;
        }

        // 删除 filter 字段
        delete outbound.filter;
        return outbound;
    };

    // 清理被删除的 tags
    const cleanRemovedTags = (outbounds) => {
        // 找出所有 outbounds 为空的项（将被删除的 tags）
        const removedTags = outbounds
            .filter((item) => !item.outbounds || (Array.isArray(item.outbounds) && item.outbounds.length === 0))
            .map((item) => item.tag)
            .filter((tag) => tag !== undefined);

        // 从所有 outbounds 数组中删除这些 tags
        const cleanedOutbounds = outbounds.map((item) => {
            if (item.outbounds && Array.isArray(item.outbounds)) {
                // 严格匹配 tag 名称（完全相等）
                item.outbounds = item.outbounds.filter((tag) => !removedTags.includes(tag));
            }
            return item;
        });

        // 过滤掉 outbounds 数组为空或不存在的策略组
        return cleanedOutbounds.filter((item) => {
            return item.outbounds && Array.isArray(item.outbounds) && item.outbounds.length > 0;
        });
    };

    // 主处理流程
    const processedOutbounds = Outbounds.map((outbound) => {
        const { matchedOutbounds, hasValidAction } = processOutboundFilters(outbound);
        return updateOutboundsArray(outbound, matchedOutbounds, hasValidAction);
    });
    if (e.relay && e.proxyname && e.dialerproxy) {
        if (processedOutbounds[1].outbounds) {
            processedOutbounds[1].outbounds.splice(0, 0, '🔗链式落地');
        } else {
            processedOutbounds[1].outbounds = ['🔗链式落地'];
        }
        if (processedOutbounds[0].outbounds) {
            processedOutbounds[0].outbounds.splice(0, 0, processedOutbounds[1].tag);
        } else {
            processedOutbounds[0].outbounds = [processedOutbounds[1].tag];
        }
        processedOutbounds[0].outbounds = [...new Set(processedOutbounds[0].outbounds)];
        processedOutbounds.splice(2, 0, {
            tag: '🔗链式前置',
            type: 'selector',
            interrupt_exist_connections: true,
            outbounds: e.proxyname,
        });
        processedOutbounds.splice(3, 0, {
            tag: '🔗链式落地',
            type: 'selector',
            interrupt_exist_connections: true,
            outbounds: e.dialerproxy,
        });
    }
    return cleanRemovedTags(processedOutbounds);
}

export function applyTemplate(top, rule, e) {
    const existingSet = Array.isArray(top.route.rule_set) ? top.route.rule_set : [];
    const newSet = Array.isArray(rule.route.rule_set) ? rule.route.rule_set : [];
    const mergedMap = new Map();
    for (const item of existingSet) {
        if (item?.tag) mergedMap.set(item.tag, item);
    }
    for (const item of newSet) {
        if (item?.tag) mergedMap.set(item.tag, item);
    }
    if (e.log) top.log.level = e.log;
    top.inbounds = [...(top.inbounds || []), ...(rule.inbounds || [])];
    top.outbounds = [...(top.outbounds || []), ...(rule.outbounds || [])];
    top.route.final = rule?.route?.final || top.route.final;
    top.route.rules = [...(top.route.rules || []), ...(rule.route.rules || [])];
    top.route.rule_set = [...mergedMap.values()];

    // 添加排除包和排除地址配置
    if (e.tun) {
        top.inbounds = top.inbounds.filter((p) => p.type !== 'tun');
    } else {
        if (e.exclude_package && e.Package) addExcludePackage(top, e.Package);
        if (e.exclude_address && e.Address) addExcludeAddress(top, e.Address);
    }
    // 添加 tailscale 相关配置
    if (e.tailscale) {
        top.dns.servers.push({
            type: 'tailscale',
            endpoint: 'ts-ep',
            accept_default_resolvers: true,
        });
        top.endpoints = top.endpoints || [];
        top.endpoints.push({
            type: 'tailscale',
            tag: 'ts-ep',
            auth_key: '',
            hostname: 'singbox-tailscale',
            udp_timeout: '5m',
        });
    }

    if (/ref1nd/i.test(e.userAgent)) {
        for (const item of top.route.rules) {
            if (item.action === 'resolve') {
                item.match_only = true;
            }
        }
    }
    // 处理 route-options 规则
    top.route.rules = top.route.rules.flatMap((p) => {
        if (p.action === 'route-options') {
            if (e.udp) {
                p.udp_disable_domain_unmapping = true;
                p.udp_connect = true;
                p.udp_timeout = '5m';
            }
            if (e.tls_fragment) {
                p.tls_fragment = true;
                p.tls_fragment_fallback_delay = '5m';
            }
            // 如果既没有 udp 也没有 tls_fragment 参数，则过滤掉该规则
            return e.udp || e.tls_fragment ? p : [];
        }
        return p;
    });
    const isV112 = /1\.(1[2-9]|[2-9]\d)\.\d+/i.test(e.userAgent);
    if (e.adgdns) {
        top.dns.servers = top.dns.servers.map((p) => {
            if (p.tag === 'DIRECT-DNS') {
                return isV112
                    ? {
                          type: 'https',
                          tag: 'DIRECT-DNS',
                          detour: '🎯 全球直连',
                          server: 'doh.18bit.cn',
                          domain_resolver: 'local',
                      }
                    : {
                          tag: 'DIRECT-DNS',
                          address_resolver: 'local',
                          address: 'https://doh.18bit.cn/dns-query',
                          detour: '🎯 全球直连',
                      };
            }
            if (p.tag === 'PROXY-DNS') {
                return isV112
                    ? {
                          type: 'https',
                          tag: 'PROXY-DNS',
                          detour: '🚀 节点选择',
                          server_port: 443,
                          server: 'dns.adguard-dns.com',
                          path: '/dns-query',
                          domain_resolver: 'local',
                      }
                    : {
                          tag: 'DIRECT-DNS',
                          address_resolver: 'local',
                          address: 'https://dns.adguard-dns.com/dns-query',
                          detour: '🎯 全球直连',
                      };
            }
            return p;
        });
    }
    // Singbox v1.14.0-alpha.13 引入了 http_clients 代替 download_detour 字段
    function parse(v) {
        const m = v.match(/1\.(\d+)\.(\d+)(?:-alpha\.(\d+))?/i);
        if (!m) return null;
        return {
            minor: +m[1],
            patch: +m[2],
            alpha: m[3] !== undefined ? +m[3] : Infinity,
        };
    }
    function gt(a, b) {
        if (a.minor !== b.minor) return a.minor > b.minor;
        if (a.patch !== b.patch) return a.patch > b.patch;
        return a.alpha > b.alpha;
    }
    const v = parse(e.userAgent);
    const isV114 = v && gt(v, { minor: 14, patch: 0, alpha: 12 });
    if (isV114) {
        top.http_clients = [
            {
                tag: 'DIRECT-clients',
                engine: 'go',
                version: 2,
                disable_version_fallback: false,
                detour: '🎯 全球直连',
            },
        ];
        // 替换 download_detour
        top.route.rule_set = top.route.rule_set.map((p) => {
            if (p.download_detour) {
                const { download_detour, ...rest } = p;
                return {
                    ...rest,
                };
            }
            return p;
        });
        top.route.default_http_client = 'DIRECT-clients';
    }
    return top;
}

export function addExcludePackage(singboxTopData, newPackages) {
    for (const inbound of singboxTopData.inbounds) {
        if (inbound.type === 'tun') {
            if (!Array.isArray(inbound['exclude_package'])) {
                inbound['exclude_package'] = [];
            }
            inbound['exclude_package'] = Array.from(new Set([...(inbound['exclude_package'] || []), ...newPackages]));
        }
    }
}

export function addExcludeAddress(singboxTopData, newddress) {
    for (const inbound of singboxTopData.inbounds) {
        if (inbound.type === 'tun') {
            inbound['route_address'] = ['0.0.0.0/1', '128.0.0.0/1', '::/1', '8000::/1'];
            if (!Array.isArray(inbound['route_exclude_address'])) {
                inbound['route_exclude_address'] = [];
            }
            inbound['route_exclude_address'] = Array.from(new Set([...(inbound['route_exclude_address'] || []), ...newddress]));
        }
    }
}
