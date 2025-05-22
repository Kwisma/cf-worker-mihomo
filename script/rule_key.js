import { readFileSync, writeFileSync } from 'fs';
import { parse,stringify } from 'yaml';

// 1. 读取并解析 YAML
const yamlContent = readFileSync('Mihomo.yaml', 'utf8');
const parsedData = parse(yamlContent, { maxAliasCount: -1, merge: true });

// 2. 通用格式化函数
const formatEntry = (obj) => {
  let str = JSON.stringify(obj, null, 2)
    .replace(/"((?:\\"|[^"]|\\')*)"/g, '$1')  // 移除所有值的引号
    .replace(/: "?(true|false|\d+\.?\d*)"?/g, ': $1')  // 处理布尔值和数字
    .replace(/\n\s*/g, ' ')  // 压缩为单行
    .replace(/{ /g, '{').replace(/ }/g, '}'); // 优化对象格式

  return str;
};
let proxiesContent = 'proxies:\n';
parsedData.proxies.forEach(item => {
  proxiesContent += `  - ${formatEntry(item)}\n`;
});

// 3. 处理 proxy-groups
let proxyGroupsContent = 'proxy-groups:\n';
parsedData['proxy-groups']?.forEach(item => {
  proxyGroupsContent += `  - ${formatEntry(item)}\n`;
});

// 4. 处理 rule-providers
let ruleProvidersContent = 'rule-providers:\n'; 
Object.entries(parsedData['rule-providers'] || {}).forEach(([key, value]) => {
  ruleProvidersContent += `  ${key}: ${formatEntry(value)}\n`;
});

// rules 多行输出
let rulesContent = 'rules:\n';
(parsedData.rules || []).forEach(rule => {
  rulesContent += `  - ${rule}\n`;
});

// sub-rules 多行输出
let subRulesContent = 'sub-rules:\n';
Object.entries(parsedData['sub-rules'] || {}).forEach(([key, value]) => {
  subRulesContent += `  ${key}:\n`;
  value.forEach(rule => {
    subRulesContent += `    - ${rule}\n`;
  });
});// 5. 合并内容并写入文件
const finalContent = [
  proxiesContent,
  proxyGroupsContent,
  rulesContent,
  subRulesContent,
  ruleProvidersContent,
].join('\n');


writeFileSync('output.yaml', finalContent);