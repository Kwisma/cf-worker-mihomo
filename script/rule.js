const fs = require('fs');
const yaml = require('js-yaml');

// 假设数据保存在 rules.yaml 文件中
fs.readFile('config.yaml', 'utf8', (err, data) => {
  if (err) {
    console.error('读取文件出错:', err);
    return;
  }

  try {
    // 解析 YAML 数据
    const parsedData = yaml.load(data);

    // 获取 rule-providers 中的所有参数
    const ruleProviders = parsedData['rule-providers'];
    const ruleProviderKeys = Object.keys(ruleProviders);  // 提取所有规则提供者的键

    // 获取 sub-rules 中的所有 RULE-SET 参数
    const subRules = parsedData['sub-rules'];
    let subRulesRuleSetKeys = [];

    if (subRules) {
      Object.keys(subRules).forEach((subKey) => {
        const subList = subRules[subKey];

        // 从 sub-rules 中提取所有 RULE-SET 参数
        subList.forEach(item => {
          if (item.startsWith('RULE-SET')) {
            const parts = item.split(',');
            if (parts[1]) {
              subRulesRuleSetKeys.push(parts[1].trim());  // 提取 RULE-SET 后的参数名称
            }
          }
        });
      });
    }

    // 找出那些只在 rule-providers 中但不在 sub-rules 中的参数
    const missingInSubRules = ruleProviderKeys.filter(provider => !subRulesRuleSetKeys.includes(provider));

    // 输出结果
    if (missingInSubRules.length > 0) {
      console.log('以下参数在 rule-providers 中，但没有出现在 sub-rules 中：');
      missingInSubRules.forEach(param => {
        console.log(param);
      });
    } else {
      console.log('所有 rule-providers 中的参数都已出现在 sub-rules 中');
    }
  } catch (e) {
    console.error('解析 YAML 出错:', e);
  }
});
