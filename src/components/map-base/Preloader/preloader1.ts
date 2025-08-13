import { useState, useReducer, useEffect } from 'react';
import { createSlice } from '@reduxjs/toolkit';

// 简单的缓存对象，用于存储已加载过的资源组
// key: 资源数组的字符串表示，value: true 表示已加载
const cache = {} as any; // shitty cache, good enough for now...

// 初始状态：存储各个资源的加载进度
const initialState = {
  progress: [] as number[], // 数组索引对应资源索引，值为加载进度百分比
};

// Redux Toolkit slice，用于管理加载进度状态
const slice = createSlice({
  name: 'preloader',
  initialState,
  reducers: {
    /**
     * 更新指定资源的加载进度
     * @param state - 当前状态
     * @param action - action.payload 格式为 [index, value]，index 为资源索引，value 为进度值
     */
    updateProgress(state, action) {
      const [index, value] = action.payload;
      state.progress[index] = value;
    }
  }
});

/**
 * 图片预加载器 Hook
 * 用于批量预加载图片资源并跟踪加载进度
 * 
 * @param assets - 需要预加载的图片资源路径数组
 * @returns 返回加载状态和进度信息
 * @returns {boolean} loaded - 是否所有资源都已加载完成
 * @returns {number} progress - 总体加载进度百分比 (0-100)
 */
export function usePreloader(assets: string[]) {
  // 使用 reducer 管理各个资源的加载进度状态
  const [state, dispatch] = useReducer(slice.reducer, initialState);
  // 标记是否所有资源都已加载完成
  const [loaded, setLoaded] = useState(false);

  /**
   * 更新指定索引位置资源的加载进度
   * @param index - 资源在数组中的索引
   * @param value - 加载进度百分比 (0-100)
   */
  const updateProgress = (index: number, value: number) => {
    const payload = [index, value];
    dispatch(slice.actions.updateProgress(payload));
  };

  useEffect(() => {
    // 检查缓存，如果这批资源已经加载过，直接标记为已加载
    if (cache[assets.toString()]) {
      setLoaded(true);
      return;
    };

    // 为每个资源创建加载 Promise
    const promises = assets.map((asset, index) => {
      return loadImage(
        asset,
        // 进度回调函数：计算并更新单个资源的加载进度
        (e) => updateProgress(index, Math.round((e.loaded / e.total) * 100)),
      );
    });

    // 等待所有资源加载完成
    Promise.all(promises).then(() => {
      // 延迟 800ms 再标记为已加载，让动画更平滑
      setTimeout(() => setLoaded(true), 800);
      // 将这批资源标记为已缓存，避免重复加载
      cache[assets.toString()] = true;
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // 是否所有资源都已加载完成
    loaded,
    // 计算平均加载进度：所有资源进度的平均值
    progress: Math.round(state.progress.reduce((a, b) => a + b, 0) / assets.length),
  }
}

/**
 * 使用 XMLHttpRequest 加载单个图片资源
 * 支持进度跟踪，比普通的 Image 对象加载方式更适合预加载场景
 * 
 * @param path - 图片资源的 URL 路径
 * @param onprogress - 进度回调函数，接收 ProgressEvent 对象
 * @returns Promise<void> - 当资源加载完成时 resolve
 */
function loadImage(path: string, onprogress: (e: any) => void) {
  return new Promise<void>((resolve) => {
    const request = new XMLHttpRequest();
    request.open('GET', path, true);
    request.responseType = 'blob'; // 以二进制数据形式接收响应
    request.onprogress = onprogress; // 绑定进度事件处理器
    request.onload = () => resolve(); // 加载完成时 resolve Promise
    request.send(); // 发送请求
  });
}
