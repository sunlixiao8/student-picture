/**
 * 任务状态查询路由
 * Task Status Query Routes
 */

const express = require('express');
const router = express.Router();
const NanoBananaClient = require('../utils/apiClient');

// 获取 API Key
const getApiKey = () => process.env.API_KEY;

/**
 * GET /api/task/:taskId
 * 查询任务状态
 * Query task status
 */
router.get('/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    // 验证参数
    if (!taskId) {
      return res.status(400).json({
        success: false,
        error: 'Task ID 不能为空'
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

    // 查询任务状态
    const result = await client.getTaskStatus(taskId);

    if (result.success) {
      const { state, resultJson, failCode, failMsg, costTime, createTime } = result.data;

      // 解析结果
      let imageUrl = null;
      if (state === 'success' && resultJson) {
        try {
          const resultData = JSON.parse(resultJson);
          imageUrl = resultData.resultUrls?.[0];
        } catch (e) {
          console.error('解析结果失败:', e.message);
        }
      }

      res.json({
        success: true,
        data: {
          taskId,
          state,
          imageUrl,
          failCode,
          failMsg,
          costTime,
          createTime
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('查询任务状态失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/task/:taskId/wait
 * 等待任务完成
 * Wait for task completion
 */
router.get('/:taskId/wait', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { maxRetries = 60, interval = 2000 } = req.query;

    // 验证参数
    if (!taskId) {
      return res.status(400).json({
        success: false,
        error: 'Task ID 不能为空'
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

    // 等待任务完成
    const result = await client.waitForCompletion(taskId, {
      maxRetries: parseInt(maxRetries),
      interval: parseInt(interval)
    });

    if (result.success) {
      res.json({
        success: true,
        data: {
          taskId,
          state: result.state,
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
    console.error('等待任务完成失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
