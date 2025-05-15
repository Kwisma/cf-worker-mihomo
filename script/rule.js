const fs = require('fs');
const yaml = require('js-yaml');

// 从字符串或嵌套结构中递归提取所有 RULE-SET 名称
function extractRuleSets(input) {
  const ruleSets = new Set();

  // 匹配类似 RULE-SET,OpenAI 的字符串
  if (typeof input === 'string') {
    const matches = input.matchAll(/RULE-SET\s*,\s*([a-zA-Z0-9_\-]+)/g);
    for (const match of matches) {
      ruleSets.add(match[1]);
    }
  }

  // 如果是数组或对象，则递归处理
  else if (Array.isArray(input)) {
    input.forEach(item => {
      const nested = extractRuleSets(item);
      nested.forEach(rs => ruleSets.add(rs));
    });
  } else if (typeof input === 'object' && input !== null) {
    Object.values(input).forEach(value => {
      const nested = extractRuleSets(value);
      nested.forEach(rs => ruleSets.add(rs));
    });
  }

  return ruleSets;
}

// 主逻辑
fs.readFile('config.yaml', 'utf8', (err, data) => {
  if (err) {
    console.error('读取文件出错:', err);
    return;
  }

  try {
    const parsedData = yaml.load(data);

    const ruleProviders = parsedData['rule-providers'] || {};
    const subRules = parsedData['sub-rules'] || {};

    const ruleProviderKeys = Object.keys(ruleProviders);

    // 提取所有 sub-rules 中出现的 RULE-SET 名
    const foundRuleSets = new Set();
    for (const subRule of Object.values(subRules)) {
      const ruleSetNames = extractRuleSets(subRule);
      ruleSetNames.forEach(rs => foundRuleSets.add(rs));
    }

    // 找出在 rule-providers 中定义但没在 sub-rules 中引用的项
    const missing = ruleProviderKeys.filter(key => !foundRuleSets.has(key));

    // 输出
    if (missing.length > 0) {
      console.log('以下 rule-providers 中的规则没有在 sub-rules 中被引用：');
      missing.forEach(m => console.log(`- ${m}`));
    } else {
      console.log('所有 rule-providers 中的规则都已在 sub-rules 中被引用');
    }

  } catch (e) {
    console.error('解析 YAML 出错:', e);
  }
});
