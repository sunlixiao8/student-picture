/**
 * Nano Banana Pro API 客户端
 * Nano Banana Pro API Client
 */

const axios = require('axios');

class NanoBananaClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.kie.ai/api/v1/jobs';
  }

  /**
   * 创建生成任务
   * Create a generation task
   */
  async createTask(prompt, options = {}) {
    const {
      aspectRatio = '3:4',  // 默认竖版，适合海报
      resolution = '4K',     // 默认高分辨率
      outputFormat = 'png',
      callBackUrl = null,
      imageInput = []
    } = options;

    const requestData = {
      model: 'nano-banana-pro',
      input: {
        prompt,
        image_input: imageInput,
        aspect_ratio: aspectRatio,
        resolution,
        output_format: outputFormat
      }
    };

    if (callBackUrl) {
      requestData.callBackUrl = callBackUrl;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/createTask`,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.code === 200) {
        return {
          success: true,
          taskId: response.data.data.taskId
        };
      } else {
        return {
          success: false,
          error: response.data.msg || '创建任务失败'
        };
      }
    } catch (error) {
      console.error('创建任务失败:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 查询任务状态
   * Get task status
   */
  async getTaskStatus(taskId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/recordInfo`,
        {
          params: { taskId },
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      if (response.data.code === 200) {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        return {
          success: false,
          error: response.data.msg || '查询任务状态失败'
        };
      }
    } catch (error) {
      console.error('查询任务状态失败:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 等待任务完成
   * Wait for task completion
   */
  async waitForCompletion(taskId, options = {}) {
    const {
      maxRetries = 60,      // 最多轮询次数
      interval = 2000       // 轮询间隔（毫秒）
    } = options;

    let retryCount = 0;

    while (retryCount < maxRetries) {
      const result = await this.getTaskStatus(taskId);

      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }

      const { state, resultJson, failCode, failMsg, costTime } = result.data;

      // 任务成功
      if (state === 'success') {
        let imageUrl = null;
        try {
          const resultData = JSON.parse(resultJson);
          imageUrl = resultData.resultUrls?.[0];
        } catch (e) {
          console.error('解析结果失败:', e.message);
        }

        return {
          success: true,
          state: 'success',
          imageUrl,
          costTime
        };
      }

      // 任务失败
      if (state === 'fail') {
        return {
          success: false,
          state: 'fail',
          error: failMsg || '任务失败',
          failCode
        };
      }

      // 任务还在处理中，继续等待
      retryCount++;
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    // 超时
    return {
      success: false,
      state: 'timeout',
      error: '任务超时，请稍后重试'
    };
  }

  /**
   * 批量创建任务
   * Create multiple tasks
   */
  async createBatchTasks(prompts, options = {}) {
    const tasks = [];
    for (const prompt of prompts) {
      const result = await this.createTask(prompt, options);
      tasks.push(result);
    }
    return tasks;
  }

  /**
   * 批量等待任务完成
   * Wait for multiple tasks to complete
   */
  async waitForBatchCompletion(taskIds, options = {}) {
    const results = [];
    for (const taskId of taskIds) {
      const result = await this.waitForCompletion(taskId, options);
      results.push({
        taskId,
        ...result
      });
    }
    return results;
  }
}

module.exports = NanoBananaClient;
