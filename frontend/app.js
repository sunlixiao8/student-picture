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
  isGenerating = true;
  setLoading(true);
  hideResults();

  console.log('=== 开始生成单张海报 ===');
  console.log('参数:', { theme, title, aspectRatio, resolution, outputFormat });

  try {
    // 创建异步任务
    const url = '/api/poster/generate-async';
    console.log('请求 URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        theme,
        title,
        aspectRatio,
        resolution,
        outputFormat
      })
    });

    console.log('响应状态:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`HTTP 错误: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('响应数据:', result);

    if (!result.success) {
      throw new Error(result.error || '生成失败');
    }

    currentTaskId = result.data.taskId;

    // 轮询任务状态
    await pollTaskStatus(currentTaskId, theme, title);

  } catch (error) {
    console.error('生成失败:', error);
    showError(error.message);
    setLoading(false);
    isGenerating = false;
  }
}

// 批量生成函数
async function generateBatch(items, aspectRatio, resolution, outputFormat) {
  isGenerating = true;
  setLoading(true);
  hideResults();

  try {
    const response = await fetch('/api/poster/batch-async', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: items.map(item => ({
          ...item,
          aspectRatio,
          resolution,
          outputFormat
        }))
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || '批量生成失败');
    }

    // 显示批量任务结果
    displayBatchResults(result.data.tasks);

    // 轮询每个任务
    const taskIds = result.data.tasks.filter(t => t.taskId).map(t => t.taskId);
    const results = await pollBatchTaskStatus(taskIds);

    setLoading(false);
    isGenerating = false;

  } catch (error) {
    console.error('生成失败:', error);
    showError(error.message);
    setLoading(false);
    isGenerating = false;
  }
}

// 轮询单个任务状态
async function pollTaskStatus(taskId, theme, title) {
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
    // 使用等待接口
    const response = await fetch(`/api/task/${taskId}/wait`);
    const result = await response.json();

    clearInterval(interval);
    updateProgress(100);

    if (result.success && result.data.imageUrl) {
      // 显示结果
      resultImage.src = result.data.imageUrl;
      singleResult.style.display = 'block';

      // 保存到历史记录
      addToHistory({
        taskId,
        theme,
        title,
        imageUrl: result.data.imageUrl,
        timestamp: Date.now()
      });

      // 设置下载按钮
      downloadBtn.onclick = () => downloadImage(result.data.imageUrl, `${title}.png`);

      // 设置重新生成按钮
      regenerateBtn.onclick = () => singleForm.dispatchEvent(new Event('submit'));

    } else {
      throw new Error(result.error || '生成失败');
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
      ${task.taskId ? '<div class="loading-spinner">生成中...</div>' : `<div class="error-text">${task.error || '任务创建失败'}</div>`}
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
          <div class="batch-result-title">${item.querySelector('.batch-result-title').textContent}</div>
          <div class="batch-result-theme">${item.querySelector('.batch-result-theme').textContent}</div>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="downloadImage('${imageUrl}', 'poster-${taskId}.png')">下载</button>
      `;
    } else if (error) {
      item.innerHTML = `
        <div class="batch-result-info">
          <div class="batch-result-title">${item.querySelector('.batch-result-title').textContent}</div>
          <div class="batch-result-theme">${item.querySelector('.batch-result-theme').textContent}</div>
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

// 页面加载时加载历史记录
document.addEventListener('DOMContentLoaded', () => {
  loadHistory();
});
