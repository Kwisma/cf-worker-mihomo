import { fetchpackExtract, fetchipExtract, fetchResponse } from '../../utils/index.js';
import getProxies_Data from './proxies.js';
import clashConfig from '../../config/mihomo.js';

export async function getmihomo_config(e) {
    const config = structuredClone(clashConfig);
    // 客户端验证
    if (e.checkUA && !/meta|clash.meta|clash|clashverge|mihomo/i.test(e.userAgent)) {
        throw new Error('不支持的客户端');
    }
    if (!e.rule) {
        throw new Error('缺少规则模板');
    }
    const alldata = await Promise.all([
        getProxies_Data(e),
        fetchResponse(e.rule),
        e.exclude_package ? fetchpackExtract() : null,
        e.exclude_address ? fetchipExtract() : null,
    ]);
    // 获取订阅数据
    const Proxies_Data = alldata[0];
    if (Proxies_Data?.data?.proxies?.length === 0) {
        throw new Error('节点为空，请使用有效订阅');
    }
    // 获取规则数据
    const Rule_Data = alldata[1];
    if (!Rule_Data?.data) {
        throw new Error('获取规则数据失败');
    }

    // 处理路由的排除配置
    e.Package = alldata[2];
    e.Address = alldata[3];

    // 合并代理数据
    Rule_Data.data.proxies = [...(Rule_Data?.data?.proxies || []), ...Proxies_Data.data.proxies];
    Rule_Data.data['proxy-groups'] = getProxies_Grouping(Proxies_Data.data, Rule_Data.data, e);
    Rule_Data.data['proxy-providers'] = Proxies_Data.data.providers;
    applyTemplate(config, Rule_Data.data, e);
    return {
        status: Proxies_Data.status,
        headers: Proxies_Data.headers,
        data: JSON.stringify(config, null, 4),
    };
}

/**
 * 将模板中的 proxies、proxy-groups、rules 等字段合并到目标配置对象
 * @param {Object} target - 目标配置对象（基础配置）
 * @param {Object} template - 模板配置对象
 */
export function applyTemplate(top, rule, e) {
    if (e.log) top['log-level'] = e.log;
    top['proxy-providers'] = rule['proxy-providers'] || {};
    top.proxies = [...(top.proxies || []), ...(rule.proxies || [])];
    top['proxy-groups'] = rule['proxy-groups'] || [];
    top.rules = [...(top.rules || []), ...(rule.rules || [])];
    top['sub-rules'] = rule['sub-rules'] || {};
    top['rule-providers'] = { ...(top['rule-providers'] || {}), ...(rule['rule-providers'] || {}) };
    const proxyName = rule['proxy-groups'][0].name;
    if (top.dns.nameserver && rule['proxy-groups'][0].name) {
        top.dns.nameserver = top.dns.nameserver.map((ns) => {
            if (typeof ns === 'string') {
                return ns.replace(/#PROXY/g, `#${proxyName}`);
            }
            return ns;
        });
    }
    if (e.tun && top.tun) {
        top.tun.enable = false;
    } else if (top.tun) {
        if (e.exclude_address && e.Address) {
            top.tun['route-address'] = ['0.0.0.0/1', '128.0.0.0/1', '::/1', '8000::/1'];
            top.tun['route-exclude-address'] = e.Address || [];
        }
        if (e.exclude_package && e.Package) {
            top.tun['include-package'] = [];
            top.tun['exclude-package'] = e.Package || [];
        }
    }
    if (e.adgdns) {
        top.dns.nameserver = [`https://dns.adguard-dns.com/dns-query#${proxyName}`];
        top.dns['nameserver-policy']['RULE-SET:private_domain,cn_domain'] = ['https://doh.18bit.cn/dns-query#DIRECT'];
    }
    return top;
}

/**
 * 获取 Mihomo 代理分组信息
 * @param {Array} proxies - 代理列表
 * @param {Array} groups - 策略组
 * @returns {Object} 分组信息
 */
export function getProxies_Grouping(proxies, groups, e) {
    const deletedGroups = []; // 用于记录已删除的组名
    const updatedGroups = groups['proxy-groups'].filter((group) => {
        let matchFound = false;
        // 确保 filter 存在并且是一个字符串
        let filter = group.filter;
        if (typeof filter !== 'string') {
            return true; // 保留没有 filter 的组
        }

        // 移除所有 (?i)，但保留后续内容
        const hasIgnoreCase = /\(\?i\)/i.test(filter);
        const cleanedFilter = filter.replace(/\(\?i\)/gi, '');

        let regex;
        try {
            regex = new RegExp(cleanedFilter, hasIgnoreCase ? 'i' : '');
        } catch (e) {
            console.warn(`无效的正则表达式: ${filter}`, e);
            return true; // 遇到错误时保留该组
        }

        // 遍历每个代理，检查是否与当前组的正则匹配
        for (let proxy of proxies.proxies) {
            if (regex.test(proxy.name)) {
                matchFound = true;
                break;
            }
        }

        // 如果没有匹配，记录删除的组并返回 false (删除该组)
        if (!matchFound && (!group.proxies || group.proxies.length === 0)) {
            deletedGroups.push(group.name);
            return false;
        }

        return true;
    });
    if (e.relay && e.proxyname && e.dialerproxy) {
        if (updatedGroups[1].proxies) {
            updatedGroups[1].proxies.splice(0, 0, '🔗链式落地');
        } else {
            updatedGroups[1].proxies = ['🔗链式落地'];
        }
        if (updatedGroups[0].proxies) {
            updatedGroups[0].proxies.splice(0, 0, updatedGroups[1].name);
        } else {
            updatedGroups[0].proxies = updatedGroups[1].name;
        }
        updatedGroups[0].proxies = [...new Set(updatedGroups[0].proxies)];
        updatedGroups.splice(2, 0, {
            name: '🔗链式前置',
            type: 'select',
            lazy: true,
            proxies: e.proxyname,
        });
        updatedGroups.splice(3, 0, {
            name: '🔗链式落地',
            type: 'select',
            lazy: true,
            proxies: e.dialerproxy,
        });
    }
    // 遍历所有策略组，删除 deletedGroups 中的代理
    updatedGroups.forEach((group) => {
        if (group.proxies) {
            group.proxies = group.proxies.filter((proxyName) => {
                // 只删除那些在 deletedGroups 中的代理
                return !deletedGroups.some((deletedGroup) => {
                    return deletedGroup.includes(proxyName); // 检查 deletedGroups 中是否包含该代理名称
                });
            });
        }
    });

    return updatedGroups;
}
