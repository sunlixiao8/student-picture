/**
 * 海报生成路由
 * Poster Generation Routes
 */

const express = require('express');
const router = express.Router();
const NanoBananaClient = require('../utils/apiClient');
const { buildPrompt, buildBatchPrompts, getAvailableThemes, isValidTheme } = require('../utils/promptBuilder');

// 获取 API Key
const getApiKey = () => process.env.API_KEY;

/**
 * GET /api/poster/themes
 * 获取可用主题列表
 * Get available theme list
 */
router.get('/themes', (req, res) => {
  try {
    const themes = getAvailableThemes();
    res.json({
      success: true,
      data: {
        themes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/poster/generate
 * 生成单张海报
 * Generate single poster
 */
router.post('/generate', async (req, res) => {
  try {
    const { theme, title, aspectRatio = '3:4', resolution = '4K', outputFormat = 'png' } = req.body;

    // 验证参数
    if (!theme || !title) {
      return res.status(400).json({
        success: false,
        error: '主题和标题不能为空'
      });
    }

    // 构建 API 客户端
    const apiKey = getApiKey();
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: '未配置 API Key'
      });
    }

    const client = new NanoBananaClient(apiKey);

    // 构建提示词
    const prompt = buildPrompt(theme, title);

    // 创建任务
    const taskResult = await client.createTask(prompt, {
      aspectRatio,
      resolution,
      outputFormat
    });

    if (!taskResult.success) {
      return res.status(500).json({
        success: false,
        error: taskResult.error
      });
    }

    // 等待任务完成
    const result = await client.waitForCompletion(taskResult.taskId);

    if (result.success) {
      res.json({
        success: true,
        data: {
          taskId: taskResult.taskId,
          imageUrl: result.imageUrl,
          costTime: result.costTime
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('生成海报失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/poster/generate-async
 * 异步生成海报（立即返回 taskId，客户端轮询）
 * Generate poster asynchronously (returns taskId immediately)
 */
router.post('/generate-async', async (req, res) => {
  try {
    const { theme, title, aspectRatio = '3:4', resolution = '4K', outputFormat = 'png' } = req.body;

    // 验证参数
    if (!theme || !title) {
      return res.status(400).json({
        success: false,
        error: '主题和标题不能为空'
      });
    }

    // 构建 API 客户端
    const apiKey = getApiKey();
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: '未配置 API Key'
      });
    }

    const client = new NanoBananaClient(apiKey);

    // 构建提示词
    const prompt = buildPrompt(theme, title);

    // 创建任务
    const taskResult = await client.createTask(prompt, {
      aspectRatio,
      resolution,
      outputFormat
    });

    if (!taskResult.success) {
      return res.status(500).json({
        success: false,
        error: taskResult.error
      });
    }

    // 立即返回 taskId
    res.json({
      success: true,
      data: {
        taskId: taskResult.taskId,
        theme,
        title
      }
    });
  } catch (error) {
    console.error('创建生成任务失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/poster/batch
 * 批量生成海报
 * Generate posters in batch
 */
router.post('/batch', async (req, res) => {
  try {
    const { items } = req.body;

    // 验证参数
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: '请提供有效的生成项目列表'
      });
    }

    // 验证每个项目
    for (const item of items) {
      if (!item.theme || !item.title) {
        return res.status(400).json({
          success: false,
          error: '每个项目必须包含 theme 和 title'
        });
      }
    }

    // 构建 API 客户端
    const apiKey = getApiKey();
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: '未配置 API Key'
      });
    }

    const client = new NanoBananaClient(apiKey);

    // 构建所有提示词
    const prompts = buildBatchPrompts(items);

    // 批量创建任务
    const taskResults = await client.createBatchTasks(prompts);

    // 提取成功的 taskId
    const taskIds = taskResults.filter(r => r.success).map(r => r.taskId);

    // 等待所有任务完成
    const results = await client.waitForBatchCompletion(taskIds);

    res.json({
      success: true,
      data: {
        total: items.length,
        success: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results: results
      }
    });
  } catch (error) {
    console.error('批量生成失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/poster/batch-async
 * 批量异步生成海报
 * Generate posters in batch asynchronously
 */
router.post('/batch-async', async (req, res) => {
  try {
    const { items } = req.body;

    // 验证参数
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: '请提供有效的生成项目列表'
      });
    }

    // 验证每个项目
    for (const item of items) {
      if (!item.theme || !item.title) {
        return res.status(400).json({
          success: false,
          error: '每个项目必须包含 theme 和 title'
        });
      }
    }

    // 构建 API 客户端
    const apiKey = getApiKey();
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: '未配置 API Key'
      });
    }

    const client = new NanoBananaClient(apiKey);

    // 构建所有提示词
    const prompts = buildBatchPrompts(items);

    // 批量创建任务
    const taskResults = await client.createBatchTasks(prompts);

    // 返回所有任务 ID
    res.json({
      success: true,
      data: {
        total: items.length,
        tasks: items.map((item, index) => ({
          theme: item.theme,
          title: item.title,
          taskId: taskResults[index].success ? taskResults[index].taskId : null,
          error: taskResults[index].success ? null : taskResults[index].error
        }))
      }
    });
  } catch (error) {
    console.error('批量创建任务失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
