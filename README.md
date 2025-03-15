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
