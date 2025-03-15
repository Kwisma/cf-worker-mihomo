# cf-worker-mihomo
快速生成mihomo（clash  mate）配置
## 编译
- 安装依赖
```bash
npm install js-yaml
npm install --save-dev esbuild
```
- 编译
```bash
npx esbuild config.js --bundle --outfile=worker.js --platform=neutral --format=esm
```
## 部署
将编译好的文件上传workers
## 变量
`CONFIG` 配置文件地址，默认 `https://raw.githubusercontent.com/Kwisma/MarketNest/refs/heads/main/vpn/mihomo/Mihomo.yaml`
## 使用
url参数填入订阅链接，英文逗号分隔或者写多个url
如：

https://mihomo.haxtop.ggff.net?url=https://miku.mikuru.ip-ddns.com/nYMU6Xk61WsKCCXF941K,https://arrbu.zs0mpg07dtj.ddns-ip.net/Y1JRPHZXm4LXM6R9MRzi

或者 

https://mihomo.haxtop.ggff.net?url=https://miku.mikuru.ip-ddns.com/nYMU6Xk61WsKCCXF941K&url=https://arrbu.zs0mpg07dtj.ddns-ip.net/Y1JRPHZXm4LXM6R9MRzi
