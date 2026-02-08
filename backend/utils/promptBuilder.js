/**
 * 提示词构建器 - 根据用户输入构建详细的图像生成提示词
 * Prompt Builder - Build detailed image generation prompts from user input
 */

const vocabulary = require('../config/vocabulary');

/**
 * 构建提示词
 * Build prompt from theme/title
 */
function buildPrompt(theme, title, customVocabulary = null) {
  // 获取词汇（使用预置或自定义）
  const vocab = customVocabulary || vocabulary[theme.toLowerCase()];

  // 如果没有找到词汇，使用默认词汇
  const defaultVocab = {
    core: [
      'shōu yín yuán 收银员',
      'huò jià 货架',
      'gòu wù chē 购物车',
      'jiǎn suǎn tái 收银台'
    ],
    items: [
      'píng guǒ 苹果',
      'niú nǎi 牛奶',
      'miàn bāo 面包',
      'yī fu 衣服',
      'shuǐ guǒ 水果',
      'shū cài 蔬菜',
      'dàn 鸡蛋',
      'guǒ zhī 果汁'
    ],
    environment: [
      'chū kǒu 出口',
      'rù kǒu 入口',
      'dēng 灯',
      'qiáng 墙',
      'zhǐ tiáo 指示牌'
    ]
  };

  const finalVocab = vocab || defaultVocab;

  // 构建核心词汇列表
  const coreWords = finalVocab.core.join(', ');
  const itemWords = finalVocab.items.join(', ');
  const envWords = finalVocab.environment.join(', ');

  // 构建完整提示词
  const prompt = `请生成一张儿童识字小报《${theme}》，竖版 A4，学习小报版式，适合 5–9 岁孩子认字与看图识物。

# 一、小报标题区（顶部）

**顶部居中大标题**：《${title}》
* **风格**：十字小报 / 儿童学习报感
* **文本要求**：大字、醒目、卡通手写体、彩色描边
* **装饰**：周围添加与 ${theme} 相关的贴纸风装饰，颜色鲜艳

# 二、小报主体（中间主画面）

画面中心是一幅 **卡通插画风的「${theme}」场景**：
* **整体气氛**：明亮、温暖、积极
* **构图**：物体边界清晰，方便对应文字，不要过于拥挤。

**场景分区与核心内容**
1.  **核心区域 A（主要对象）**：表现 ${theme} 的核心活动。
2.  **核心区域 B（配套设施）**：展示相关的工具或物品。
3.  **核心区域 C（环境背景）**：体现环境特征（如墙面、指示牌等）。

**主题人物**
* **角色**：1 位可爱卡通人物（职业/身份：与 ${theme} 匹配）。
* **动作**：正在进行与场景相关的自然互动。

# 三、必画物体与识字清单（Generated Content）

**请务必在画面中清晰绘制以下物体，并为其预留贴标签的位置：**

**1. 核心角色与设施：**
${coreWords}

**2. 常见物品/工具：**
${itemWords}

**3. 环境与装饰：**
${envWords}

*(注意：画面中的物体数量不限于此，但以上列表必须作为重点描绘对象)*

# 四、识字标注规则

对上述清单中的物体，贴上中文识字标签：
* **格式**：两行制（第一行拼音带声调，第二行简体汉字）。
* **样式**：彩色小贴纸风格，白底黑字或深色字，清晰可读。
* **排版**：标签靠近对应的物体，不遮挡主体。

# 五、画风参数
* **风格**：儿童绘本风 + 识字小报风
* **色彩**：高饱和、明快、温暖 (High Saturation, Warm Tone)
* **质量**：8k resolution, high detail, vector illustration style, clean lines.`;

  return prompt;
}

/**
 * 构建批量提示词
 * Build batch prompts from multiple themes/titles
 */
function buildBatchPrompts(themes) {
  return themes.map(({ theme, title }) => buildPrompt(theme, title));
}

/**
 * 获取可用主题列表
 * Get available theme list
 */
function getAvailableThemes() {
  return Object.keys(vocabulary);
}

/**
 * 验证主题是否存在
 * Validate if theme exists
 */
function isValidTheme(theme) {
  return vocabulary.hasOwnProperty(theme.toLowerCase());
}

module.exports = {
  buildPrompt,
  buildBatchPrompts,
  getAvailableThemes,
  isValidTheme
};
