/**
 * 儿童识字小报生成器 - 前端逻辑
 * Children's Literacy Poster Generator - Frontend Logic
 */

// DOM 元素
const modeButtons = document.querySelectorAll('.mode-btn');
const singleForm = document.getElementById('singleForm');
const batchForm = document.getElementById('batchForm');
const themeSelect = document.getElementById('theme');
const customThemeInput = document.getElementById('customTheme');
const addItemBtn = document.getElementById('addItemBtn');
const batchItems = document.getElementById('batchItems');
const progressArea = document.getElementById('progressArea');
const progressFill = document.getElementById('progressFill');
const progressPercent = document.getElementById('progressPercent');
const singleResult = document.getElementById('singleResult');
const resultImage = document.getElementById('resultImage');
const downloadBtn = document.getElementById('downloadBtn');
const regenerateBtn = document.getElementById('regenerateBtn');
const batchResults = document.getElementById('batchResults');
const errorArea = document.getElementById('errorArea');
const errorMessage = document.getElementById('errorMessage');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// API Key 元素
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
const apiKeyStatus = document.getElementById('apiKeyStatus');

// API 配置
const API_BASE_URL = 'https://api.kie.ai/api/v1/jobs';

// 获取 API Key
function getApiKey() {
  return localStorage.getItem('nanoBananaApiKey') || '';
}

// 保存 API Key
function saveApiKey(key) {
  if (key && key.trim()) {
    localStorage.setItem('nanoBananaApiKey', key.trim());
    showApiKeyStatus('保存成功', true);
  } else {
    showApiKeyStatus('请输入有效的 API Key', false);
  }
}

// 显示 API Key 状态
function showApiKeyStatus(message, success) {
  apiKeyStatus.textContent = success ? `✓ ${message}` : `✗ ${message}`;
  apiKeyStatus.className = `api-key-status ${success ? 'show' : ''}`;
  if (success) {
    setTimeout(() => {
      apiKeyStatus.className = 'api-key-status';
    }, 2000);
  }
}

// 加载 API Key 到输入框
function loadApiKey() {
  const apiKey = getApiKey();
  if (apiKey) {
    apiKeyInput.value = apiKey;
    showApiKeyStatus('已加载', true);
  }
}

console.log('=== 儿童识字小报生成器初始化 ===');
console.log('表单元素:', singleForm);
console.log('主题选择器:', themeSelect);

// 当前状态
let currentTaskId = null;
let isGenerating = false;

// 模式切换
modeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    modeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const mode = btn.dataset.mode;
    if (mode === 'single') {
      singleForm.classList.add('active');
      batchForm.classList.remove('active');
    } else {
      singleForm.classList.remove('active');
      batchForm.classList.add('active');
    }

    // 重置显示
    hideResults();
  });
});

// 主题选择 - 自定义主题显示
themeSelect.addEventListener('change', () => {
  if (themeSelect.value === 'custom') {
    customThemeInput.style.display = 'block';
    customThemeInput.required = true;
    themeSelect.required = false;
  } else {
    customThemeInput.style.display = 'none';
    customThemeInput.required = false;
    themeSelect.required = true;
  }
});

// 批量生成 - 添加项目
addItemBtn.addEventListener('click', () => {
  const item = document.createElement('div');
  item.className = 'batch-item';
  item.innerHTML = `
    <input type="text" class="form-input batch-theme" placeholder="主题" required>
    <input type="text" class="form-input batch-title" placeholder="标题" required>
    <button type="button" class="btn btn-danger btn-sm remove-item">删除</button>
  `;
  batchItems.appendChild(item);
  updateRemoveButtons();
});

// 批量生成 - 删除项目
batchItems.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-item')) {
    e.target.parentElement.remove();
    updateRemoveButtons();
  }
});

function updateRemoveButtons() {
  const buttons = batchItems.querySelectorAll('.remove-item');
  buttons.forEach(btn => {
    btn.disabled = buttons.length <= 1;
  });
}

// 单张生成
singleForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (isGenerating) return;

  const theme = themeSelect.value === 'custom' ? customThemeInput.value : themeSelect.value;
  const title = document.getElementById('title').value;
  const aspectRatio = document.getElementById('aspectRatio').value;
  const resolution = document.getElementById('resolution').value;
  const outputFormat = document.getElementById('outputFormat').value;

  await generateSingle(theme, title, aspectRatio, resolution, outputFormat);
});

// 批量生成
batchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (isGenerating) return;

  const items = [];
  document.querySelectorAll('.batch-item').forEach(item => {
    const theme = item.querySelector('.batch-theme').value;
    const title = item.querySelector('.batch-title').value;
    if (theme && title) {
      items.push({ theme, title });
    }
  });

  if (items.length === 0) {
    showError('请至少添加一个项目');
    return;
  }

  const aspectRatio = document.getElementById('batchAspectRatio').value;
  const resolution = document.getElementById('batchResolution').value;
  const outputFormat = document.getElementById('batchOutputFormat').value;

  await generateBatch(items, aspectRatio, resolution, outputFormat);
});

// 单张生成函数
async function generateSingle(theme, title, aspectRatio, resolution, outputFormat) {
  const apiKey = getApiKey();
  if (!apiKey) {
    showError('请先设置 API Key');
    return;
  }

  isGenerating = true;
  setLoading(true);
  hideResults();

  console.log('=== 开始生成单张海报 ===');
  console.log('参数:', { theme, title, aspectRatio, resolution, outputFormat });

  try {
    // 构建提示词
    const prompt = buildPrompt(theme, title);
    console.log('提示词长度:', prompt.length);

    // 创建 Nano Banana Pro 任务
    const response = await fetch(`${API_BASE_URL}/createTask`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'nano-banana-pro',
        input: {
          prompt,
          aspect_ratio: aspectRatio,
          resolution,
          output_format: outputFormat
        }
      })
    });

    console.log('响应状态:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('错误响应:', errorText);
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const result = await response.json();
    console.log('创建任务响应:', result);

    if (result.code !== 200) {
      throw new Error(result.msg || '创建任务失败');
    }

    const taskId = result.data.taskId;
    currentTaskId = taskId;

    // 轮询任务状态
    await pollTaskStatus(taskId, theme, title);

  } catch (error) {
    console.error('生成失败:', error);
    showError(error.message);
    setLoading(false);
    isGenerating = false;
  }
}

// 构建提示词
function buildPrompt(theme, title) {
  return `请生成一张儿童识字小报《${theme}》，竖版 A4，学习小报版式，适合 5–9 岁孩子认字与看图识物。

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
${getCoreWords(theme)}

**2. 常见物品/工具：**
${getItemWords(theme)}

**3. 环境与装饰：**
${getEnvWords(theme)}

*(注意：画面中的物体数量不限于此，但以上列表必须作为重点描绘对象)*

# 四、识字标注规则

对上述清单中的物体，贴上中文识字标签：
* **格式**：两行制（第一行拼音带声调，第二行简体汉字）。
* **样式**：彩色小贴纸风格，白底黑字或深色字，清晰可读。
* **排版**：标签靠近对应的物体，不遮挡主体。

# 五、画风参数
* **风格**：儿童绘本风 + 识字小报风
* **色彩**：高饱和、明快、温暖
* **质量**：8k resolution, high detail, vector illustration style, clean lines.`;
}

// 获取词汇
const vocabularyMap = {
  supermarket: {
    core: ['shōu yín yuán 收银员', 'huò jià 货架', 'gòu wù chē 购物车', 'jiǎn suǎn tái 收银台'],
    items: ['píng guǒ 苹果', 'niú nǎi 牛奶', 'miàn bāo 面包', 'yī fu 衣服', 'shuǐ guǒ 水果', 'shū cài 蔬菜', 'dàn 鸡蛋', 'guǒ zhī 果汁'],
    environment: ['chū kǒu 出口', 'rù kǒu 入口', 'dēng 灯', 'qiáng 墙', 'zhǐ tiáo 指示牌']
  },
  hospital: {
    core: ['yī shēng 医生', 'hù shì 护士', 'yī yuàn 医院', 'bìng chuáng 病床'],
    items: ['yào 药', 'tǐ wēn jǐ 体温计', 'tīng zhěn qì 听诊器', 'bēng dài 绷带', 'yī shǒu shǒu tào 医用手套', 'yào xiāng 药箱', 'zhēn 针', 'yā suō jī 压缩机'],
    environment: ['zhěn shì 诊室', 'yào fáng 药房', 'zǒu láng 走廊', 'mén 门', 'chuāng 窗']
  },
  park: {
    core: ['shù 树', 'huā 花', 'cǎo 草', 'gōng yuán 公园'],
    items: ['qiū qiān 秋千', 'huá tī 滑梯', 'dàng qiū qiān 荡秋千', 'yǐ zi 椅子', 'shuǐ chí 水池', 'niǎo 鸟', 'hú dié 蝴蝶', 'qiú 球'],
    environment: ['lù 路', 'shān 山', 'hé 河', 'qiáo 桥', 'tiān kōng 天空']
  },
  school: {
    core: ['lǎo shī 老师', 'xué shēng 学生', 'jiào shì 教室', 'hēi bǎn 黑板'],
    items: ['shū 书', 'bǐ 笔', 'běn zi 本子', 'zhuō zi 桌子', 'yǐ zi 椅子', 'bāo 书包', 'chǐ 尺', 'xiàng pí 橡皮'],
    environment: ['mén 门', 'chuāng 窗', 'qiáng 墙', 'dēng 灯', 'bù 布告栏']
  },
  zoo: {
    core: ['shī zi 狮子', 'dà xiàng 大象', 'hóu zi 猴子', 'dòng wù yuán 动物园'],
    items: ['lǎo hǔ 老虎', 'cháng jǐng lù 长颈鹿', 'xióng māo 熊猫', 'kǒng què 孔雀', 'píng fēn 企鹅', 'hǎi tún 海豚', 'wū guī 乌龟'],
    environment: ['lóng zi 笼子', 'shuǐ chí 水池', 'shù 树', 'cǎo 草', 'lù 路']
  },
  kitchen: {
    core: ['chú fáng 厨房', 'guō 锅', 'pán 盘', 'zhuō zi 桌子'],
    items: ['dāo 刀', 'chā 叉', 'kuài zi 筷子', 'wǎn 碗', 'bēi zi 杯子', 'shuǐ hú 水壶', 'guō shào 锅勺', 'cài 菜'],
    environment: ['chú guì 橱柜', 'zào tái 灶台', 'shuǐ lóng tóu 水龙头', 'qiáng 墙', 'chuāng 窗']
  },
  bedroom: {
    core: ['chuáng 床', 'zhěn tou 枕头', 'bèi zi 被子', 'wò shì 卧室'],
    items: ['xiāng zi 箱子', 'yī guì 衣柜', 'dēng 灯', 'shū zhuō 书桌', 'yǐ zi 椅子', 'jìng zi 镜子', 'huà huà 画画', 'wán jù 玩具'],
    environment: ['mén 门', 'chuāng 窗', 'qiáng 墙', 'dì 地', 'tiān huā bǎn 天花板']
  },
  playground: {
    core: ['yóu lè chǎng 游乐场', 'qiū qiān 秋千', 'huá tī 滑梯', 'dān gàng 单杠'],
    items: ['pán qiū qiān 攀秋千', 'qí mǎ 骑马', 'huá lún 滑轮', 'bèng bèng chù 蹦蹦床', 'qí qián 骑钱', 'wán jù 玩具', 'qiú 球'],
    environment: ['dì 地', 'shù 树', 'lù 路', 'qiáng 墙', 'zhào péng 罩棚']
  },
  library: {
    core: ['tú shū guǎn 图书馆', 'shū jià 书架', 'shū 书', 'guǎn lǐ yuán 管理员'],
    items: ['kàn shū 看书', 'bǐ 笔', 'běn zi 本子', 'diàn nǎo 电脑', 'zhuō zi 桌子', 'yǐ zi 椅子', 'shū bāo 书包', 'bān zhī 板纸'],
    environment: ['mén 门', 'chuāng 窗', 'qiáng 墙', 'dēng 灯', 'lù 路']
  },
  transportation: {
    core: ['chē 车', 'gōng jiāo chē 公交车', 'diàn tiě 地铁', 'huǒ chē 火车'],
    items: ['chē zhàn 车站', 'zhào xiàng 照相', 'dēng 灯', 'zhǐ tiáo 指示牌', 'qiáo 桥', 'lù 路', 'jiāo tōng 交通', 'xíng 行'],
    environment: ['tiān 天空', 'qiáng 墙', 'dì 地', 'shù 树', 'hé 河']
  }
};

function getCoreWords(theme) {
  const vocab = vocabularyMap[theme] || vocabularyMap.supermarket;
  return vocab.core.map(w => w).join(', ');
}

function getItemWords(theme) {
  const vocab = vocabularyMap[theme] || vocabularyMap.supermarket;
  return vocab.items.map(w => w).join(', ');
}

function getEnvWords(theme) {
  const vocab = vocabularyMap[theme] || vocabularyMap.supermarket;
  return vocab.environment.map(w => w).join(', ');
}

// 支持自定义主题的词汇生成
function getCustomWords(theme) {
  // 为自定义主题生成简单的词汇
  return {
    core: [`${theme}工作人员`, `${theme}设施`, `${theme}设备`, `${theme}工具`],
    items: [`${theme}物品1`, `${theme}物品2`, `${theme}物品3`, `${theme}物品4`, `${theme}物品5`, `${theme}物品6`, `${theme}物品7`, `${theme}物品8`],
    environment: [`${theme}环境1`, `${theme}环境2`, `${theme}环境3`, `${theme}环境4`, `${theme}环境5`]
  };
}

// 批量生成函数
async function generateBatch(items, aspectRatio, resolution, outputFormat) {
  const apiKey = getApiKey();
  if (!apiKey) {
    showError('请先设置 API Key');
    return;
  }

  isGenerating = true;
  setLoading(true);
  hideResults();

  try {
    const taskResults = [];

    // 并行创建任务
    const taskPromises = items.map(async (item) => {
      const prompt = buildPrompt(item.theme, item.title);
      const response = await fetch(`${API_BASE_URL}/createTask`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'nano-banana-pro',
          input: {
            prompt,
            aspect_ratio: aspectRatio,
            resolution,
            output_format: outputFormat
          }
        })
      });

      if (!response.ok) {
        throw new Error(`创建任务失败: ${item.title}`);
      }

      const result = await response.json();
      if (result.code !== 200) {
        throw new Error(`任务创建失败: ${item.title}`);
      }

      return {
        theme: item.theme,
        title: item.title,
        taskId: result.data.taskId,
        state: 'waiting'
      };
    });

    const tasks = await Promise.all(taskPromises);
    console.log('批量任务创建完成:', tasks);

    // 显示批量任务结果
    displayBatchResults(tasks);

    // 并行轮询任务状态
    const pollPromises = tasks.map(async (task) => {
      await pollTaskStatus(task.taskId, task.theme, task.title);
    });

    await Promise.all(pollPromises);

    setLoading(false);
    isGenerating = false;

  } catch (error) {
    console.error('批量生成失败:', error);
    showError(error.message);
    setLoading(false);
    isGenerating = false;
  }
}

// 轮询单个任务状态
async function pollTaskStatus(taskId, theme, title) {
  const apiKey = getApiKey();
  if (!apiKey) {
    showError('请先设置 API Key');
    setLoading(false);
    isGenerating = false;
    return;
  }

  progressArea.style.display = 'block';
  updateProgress(0);

  let progress = 0;
  const interval = setInterval(() => {
    progress += 5;
    if (progress > 90) {
      clearInterval(interval);
    }
    updateProgress(progress);
  }, 1000);

  try {
    // 查询任务状态
    const response = await fetch(`${API_BASE_URL}/recordInfo?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const result = await response.json();
    console.log('任务状态:', result);

    clearInterval(interval);

    if (result.code !== 200) {
      throw new Error(result.msg || '查询任务失败');
    }

    const { state, resultJson, failCode, failMsg } = result.data;

    // 检查任务状态
    if (state === 'waiting' || state === 'processing') {
      // 继续轮询
      throw new Error('任务处理中，请稍候...');
    }

    if (state === 'fail') {
      throw new Error(failMsg || '生成失败');
    }

    if (state === 'success') {
      updateProgress(100);

      let imageUrl = null;
      try {
        const resultData = JSON.parse(resultJson);
        imageUrl = resultData.resultUrls?.[0];
      } catch (e) {
        console.error('解析结果失败:', e);
      }

      if (!imageUrl) {
        throw new Error('未获取到图片链接');
      }

      // 显示结果
      resultImage.src = imageUrl;
      singleResult.style.display = 'block';

      // 保存到历史记录
      addToHistory({
        taskId,
        theme,
        title,
        imageUrl,
        timestamp: Date.now()
      });

      // 设置下载按钮
      downloadBtn.onclick = () => downloadImage(imageUrl, `${title}.png`);

      // 设置重新生成按钮
      regenerateBtn.onclick = () => singleForm.dispatchEvent(new Event('submit'));
    }

  } catch (error) {
    clearInterval(interval);
    showError(error.message);
  }

  setLoading(false);
  isGenerating = false;
}

// 轮询批量任务状态
async function pollBatchTaskStatus(taskIds) {
  const results = [];

  for (let i = 0; i < taskIds.length; i++) {
    const taskId = taskIds[i];
    const progress = Math.round(((i + 1) / taskIds.length) * 100);
    updateProgress(progress);

    try {
      const response = await fetch(`/api/task/${taskId}/wait`);
      const result = await response.json();

      if (result.success && result.data.imageUrl) {
        results.push({
          taskId,
          imageUrl: result.data.imageUrl,
          success: true
        });

        // 更新对应的批量结果项
        updateBatchResultItem(taskId, result.data.imageUrl);

      } else {
        results.push({
          taskId,
          success: false,
          error: result.error
        });
        updateBatchResultItem(taskId, null, result.error);
      }

    } catch (error) {
      results.push({
        taskId,
        success: false,
        error: error.message
      });
      updateBatchResultItem(taskId, null, error.message);
    }
  }

  return results;
}

// 显示批量结果
function displayBatchResults(tasks) {
  batchResults.style.display = 'grid';
  batchResults.innerHTML = '';

  tasks.forEach(task => {
    const div = document.createElement('div');
    div.className = 'batch-result-item';
    div.dataset.taskId = task.taskId;
    div.innerHTML = `
      <div class="batch-result-info">
        <div class="batch-result-title">${task.title}</div>
        <div class="batch-result-theme">${task.theme}</div>
      </div>
      <div class="loading-spinner">创建任务中...</div>
    `;
    batchResults.appendChild(div);
  });
}

// 更新批量结果项
function updateBatchResultItem(taskId, imageUrl, error = null) {
  const item = batchResults.querySelector(`[data-task-id="${taskId}"]`);
  if (item) {
    if (imageUrl) {
      item.innerHTML = `
        <img src="${imageUrl}" class="batch-result-image" alt="生成的识字小报">
        <div class="batch-result-info">
          <div class="batch-result-title">${item.querySelector('.batch-result-title')?.textContent || ''}</div>
          <div class="batch-result-theme">${item.querySelector('.batch-result-theme')?.textContent || ''}</div>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="downloadImage('${imageUrl}', 'poster-${taskId}.png')">下载</button>
      `;
    } else if (error) {
      item.innerHTML = `
        <div class="batch-result-info">
          <div class="batch-result-title">${item.querySelector('.batch-result-title')?.textContent || ''}</div>
          <div class="batch-result-theme">${item.querySelector('.batch-result-theme')?.textContent || ''}</div>
          <div class="error-text">${error}</div>
        </div>
      `;
    }
  }
}

// 更新进度
function updateProgress(percent) {
  progressFill.style.width = `${percent}%`;
  progressPercent.textContent = `${percent}%`;
}

// 设置加载状态
function setLoading(loading) {
  isGenerating = loading;
  const btn = document.querySelector('.btn-primary.btn-lg');
  const btnText = btn.querySelector('.btn-text');
  const btnLoading = btn.querySelector('.btn-loading');

  if (loading) {
    btnText.style.display = 'none';
    btnLoading.style.display = 'flex';
    btn.disabled = true;
  } else {
    btnText.style.display = 'block';
    btnLoading.style.display = 'none';
    btn.disabled = false;
    progressArea.style.display = 'none';
  }
}

// 隐藏结果
function hideResults() {
  singleResult.style.display = 'none';
  batchResults.style.display = 'none';
  errorArea.style.display = 'none';
  progressArea.style.display = 'none';
}

// 显示错误
function showError(message) {
  errorMessage.textContent = message;
  errorArea.style.display = 'flex';
}

// 下载图片
async function downloadImage(url, filename) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('下载失败:', error);
    alert('下载失败，请尝试右键图片另存为');
  }
}

// 历史记录功能
function addToHistory(item) {
  const history = getHistory();
  history.unshift(item);

  // 只保留最近 20 条
  if (history.length > 20) {
    history.pop();
  }

  localStorage.setItem('posterHistory', JSON.stringify(history));
  loadHistory();
}

function getHistory() {
  const stored = localStorage.getItem('posterHistory');
  return stored ? JSON.parse(stored) : [];
}

function loadHistory() {
  const history = getHistory();

  if (history.length === 0) {
    historyList.innerHTML = '<p class="empty-message">暂无历史记录</p>';
    return;
  }

  historyList.innerHTML = '';
  history.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <img src="${item.imageUrl}" class="history-thumb" alt="${item.title}">
      <div class="history-info">
        <div class="history-title">${item.title}</div>
        <div class="history-meta">${item.theme} - ${formatDate(item.timestamp)}</div>
      </div>
    `;
    div.addEventListener('click', () => {
      // 重新显示该结果
      hideResults();
      resultImage.src = item.imageUrl;
      singleResult.style.display = 'block';
      downloadBtn.onclick = () => downloadImage(item.imageUrl, `${item.title}.png`);
      regenerateBtn.onclick = () => {
        // 填充表单并重新生成
        themeSelect.value = item.theme;
        document.getElementById('title').value = item.title;
        singleForm.dispatchEvent(new Event('submit'));
      };
    });
    historyList.appendChild(div);
  });
}

function clearHistory() {
  if (confirm('确定要清空所有历史记录吗？')) {
    localStorage.removeItem('posterHistory');
    loadHistory();
  }
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

// 清空历史记录
clearHistoryBtn.addEventListener('click', clearHistory);

// 保存 API Key
saveApiKeyBtn.addEventListener('click', () => {
  const apiKey = apiKeyInput.value.trim();
  saveApiKey(apiKey);
});

// 页面加载时加载历史记录
document.addEventListener('DOMContentLoaded', () => {
  loadApiKey();
  loadHistory();
});
