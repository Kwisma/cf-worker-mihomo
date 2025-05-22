# cf-worker-mihomo

快速生成mihomo（clash  mate）配置

![](./icon/icon.png)
## 编译

- 安装依赖

```bash
npm install
```

- 编译

```bash
npm run build
```

## 如何使用？
### Workers 部署方法

1. 部署 CF Worker：
   - 在 CF Worker 控制台中创建一个新的 Worker。
   - 将 [worker.js](./worker.js) 的内容粘贴到 Worker 编辑器中。
2. 给 workers绑定 自定义域： 
   - 在 workers控制台的 `触发器`选项卡，下方点击 `添加自定义域`。
   - 填入你已转入 CF 域名解析服务的次级域名，例如:`mihomo.haxtop.ggff.net`后 点击`添加自定义域`，等待证书生效即可。
3. 使用方法：
   - 自定义域传入url参数，可传入多个，用逗号分隔，如：
   - https://mihomo.haxtop.ggff.net?url=订阅链接

### Pages 部署方法

#### 创建 Pages 项目
- 打开 Cloudflare 控制台，进入 [Pages 控制台](https://dash.cloudflare.com/?to=/:account/pages)。
- 点击「创建项目」，选择你要托管的代码来源（GitHub/GitLab），或点击「直接上传」。

#### 如果使用 Git 仓库：

- 选择你的仓库并授权 Cloudflare 访问
- 部署即可

#### 如果使用直接上传：

- 下载 [_worker.js](./_worker.js)
- 点击「直接上传」，将下载的文件上传即可

#### 给 pages 绑定自定义域（可选）
- 在 Pages 项目页面中，点击「自定义域」。
- 绑定你在 Cloudflare 中托管的域名，例如 `pages.haxtop.ggff.net`。
- 系统会自动为你配置 DNS 和 SSL 证书。

### 3. 使用方法

- 部署完成后，你会获得一个类似 `https://your-project.pages.dev` 的访问地址。  
- 如果你设置了自定义域名，也可以直接使用它来访问你的页面。

| 变量名         | 描述               | 示例值                      |
|----------------|--------------------|-----------------------------|
| `IMG`          | 背景图           | `https://t.alcy.cc/ycy` |