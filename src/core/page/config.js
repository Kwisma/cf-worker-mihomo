export default function configs() {
    const data = {
        mihomo: {
            name: 'Clash(mihomo)',
            placeholder: 'https:// 订阅链接或单节点链接',
            tipMarkdown: `
## mihomo 特性

- 支持订阅/单节点合并，转换后端 [sub-store-node](https://github.com/Kwisma/Sub-Store-node.git)
- 面板: http://127.0.0.1:9090/ui/xd
- mixed(http+socks)端口: 7890，去广告 + 防DNS泄漏
- **附加参数说明**  

✔ UDP: 开启UDP代理

✔ ECH: 启用Encrypted Client Hello (ECH)

✔ 链式代理: [启用链式代理](https://wiki.metacubex.one/config/proxies/dialer-proxy/) 必须填入两个以上的地址，第一个输入订阅将作为前置链式，第二个往后的不做为前置

✔ 分应用代理: 排除CN应用(Android)

✔ 分IPCIDR代理: 排除CN IP

✔ 去广告dns: 去广告DNS

✔ 仅代理: 关闭tun，纯http/socks代理

✔ fallback: 获取原节点格式和流量信息

✔ Proxy-Provider: 不下载订阅，由客户端直接拉取订阅链接（仅 mihomo）
            `,
            protocolList: ['udp', 'ech', 'relay', 'pp', 'ep', 'ea', 'adgdns', 'tun', 'fallback', 'log'],
            protocolLabels: {
                udp: 'UDP',
                ech: 'ECH',
                relay: '链式代理',
                pp: 'Proxy-Provider',
                ep: '分应用代理',
                ea: '分IPCIDR代理',
                adgdns: '去广告DNS',
                tun: '仅代理',
                fallback: 'fallback',
                log: {
                    label: '日志等级',
                    levels: ['silent', 'error', 'warning', 'info', 'debug'],
                },
            },
            templates: {
                通用: [
                    {
                        label: '默认(ACL4SSR_Online_Full)',
                        value: '/ACL4SSR_Online_Full.yaml',
                    },
                    {
                        label: '默认(全分组)',
                        value: '/default_full.yaml',
                    },
                    {
                        label: '默认(精简版)',
                        value: '/default.yaml',
                    },
                ],
                'Lanlan13-14': [
                    {
                        label: 'configfull 全分组版 (秋风去广告)',
                        value: '/Lanlan13-14/configfull.yaml',
                    },
                    {
                        label: 'configfull_NoAd (无广告)',
                        value: '/Lanlan13-14/configfull_NoAd.yaml',
                    },
                    {
                        label: 'configfull_NoAd_lite (精简)',
                        value: '/Lanlan13-14/configfull_NoAd_lite.yaml',
                    },
                    {
                        label: 'configfull_lite (精简版)',
                        value: '/Lanlan13-14/configfull_lite.yaml',
                    },
                    {
                        label: 'configfull_beta',
                        value: '/Lanlan13-14/configfull_beta.yaml',
                    },
                ],
                zhuqq2020: [
                    {
                        label: 'ACL4SSR_Online_Full 重度',
                        value: '/zhuqq2020/ACL4SSR_Online_Full.yaml',
                    },
                    {
                        label: 'ACL4SSR_Online_Full_AdblockPlus',
                        value: '/zhuqq2020/ACL4SSR_Online_Full_AdblockPlus.yaml',
                    },
                    {
                        label: 'ACL4SSR_Online_Full_Tiktok',
                        value: '/zhuqq2020/ACL4SSR_Online_Full_Tiktok.yaml',
                    },
                    {
                        label: 'ACL4SSR_Online_Full_WithIcon',
                        value: '/zhuqq2020/ACL4SSR_Online_Full_WithIcon.yaml',
                    },
                    {
                        label: 'ACL4SSR_Online_Mini_MultiMode',
                        value: '/zhuqq2020/ACL4SSR_Online_Mini_MultiMode.yaml',
                    },
                    {
                        label: '极简分流规则',
                        value: '/zhuqq2020/极简分流规则.yaml',
                    },
                ],
                'mihomo-party-org': [
                    {
                        label: '布丁狗的订阅转换',
                        value: '/mihomo-party-org/布丁狗的订阅转换.yaml',
                    },
                    {
                        label: 'ACL4SSR_Online_Full',
                        value: '/mihomo-party-org/ACL4SSR_Online_Full.yaml',
                    },
                    {
                        label: 'ACL4SSR_Online_Full_WithIcon',
                        value: '/mihomo-party-org/ACL4SSR_Online_Full_WithIcon.yaml',
                    },
                ],
            },
        },
        singbox: {
            name: 'Sing-box',
            placeholder: 'https:// 订阅链接 / 节点链接',
            tipMarkdown: `
## sing-box 
- 支持多链接合并
- 面板: http://127.0.0.1:9090 
- mixed(http+socks) 端口: 7890
- **附加参数说明**  

✔ UDP: 开启UDP代理

✔ ECH: 启用Encrypted Client Hello (ECH)

✔ 链式代理: [启用链式代理](https://sing-box.sagernet.org/zh/configuration/shared/dial/) 必须填入两个以上的地址，第一个输入订阅将作为前置链式，第二个往后的不做为前置

✔ UDP分段: 把大 UDP 包拆成多个小包发送

✔ TLS分段: 拆分 TLS 握手数据

✔ 分应用代理: 排除CN应用(Android)

✔ 分IPCIDR代理: 排除CN IP

✔ tailscale: [查看说明](https://sing-box.sagernet.org/zh/configuration/dns/server/tailscale/)

✔ 去广告dns: 去广告DNS

✔ 仅代理: 关闭tun，纯http/socks代理

✔ fallback: 获取原节点格式和流量信息
            `,
            protocolList: ['udp', 'ech', 'relay', 'udp_frag', 'tls_frag', 'ep', 'ea', 'tailscale', 'adgdns', 'tun', 'fallback', 'log'],
            protocolLabels: {
                udp: 'UDP',
                ech: 'ECH',
                relay: '链式代理',
                udp_frag: 'UDP分段',
                tls_frag: 'TLS分段',
                ep: '分应用代理',
                ea: '分IPCIDR',
                tailscale: 'Tailscale',
                adgdns: '去广告DNS',
                tun: '仅代理',
                fallback: 'fallback',
                log: {
                    label: '日志等级',
                    levels: ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'panic'],
                },
            },
            templates: {
                通用: [
                    {
                        label: '默认(ACL4SSR_Online_Full)',
                        value: '/ACL4SSR_Online_Full.yaml',
                    },
                    {
                        label: '默认(全分组)',
                        value: '/default_full.yaml',
                    },
                    {
                        label: '默认(精简版)',
                        value: '/default.yaml',
                    },
                ],
            },
        },
        v2ray: {
            name: 'V2Ray',
            placeholder: 'vmess:// 或订阅链接',
            tipMarkdown: `## V2Ray 订阅转换\n支持标准订阅转换，使用后端 sub-store 生成通用配置。`,
            protocolList: [],
            templates: null,
            noTemplate: true,
        },
    };
    return JSON.stringify(data);
}
