import React from 'react';
import L from 'leaflet';
import { useMapContext } from '../map/context';

/**
 * MapImageLayer 组件的属性类型定义
 */
type MapImageLayerProps = {
  /** 图片的 URL 地址，支持相对路径和绝对路径 */
  image: string;
};

/**
 * 地图图片图层组件
 *
 * 该组件用于在地图上添加一个图片覆盖层，图片会根据地图的边界进行缩放和定位。
 * 主要用于显示地图背景图片、区域图片等静态图像内容。
 *
 * @param props - 组件属性
 * @returns null - 该组件不渲染任何 DOM 元素，仅用于地图图层管理
 *
 * @example
 * ```tsx
 * <MapImageLayer image="/assets/map-background.jpg" />
 * ```
 */
const MapImageLayer = (props: MapImageLayerProps) => {
  // 获取地图上下文，包含地图实例、边界信息和等待队列
  const context = useMapContext();

  React.useEffect(() => {
    // 从上下文中解构出地图实例、边界和等待队列
    const { map, bounds, waitFor } = context;

    // 创建 Leaflet 图片覆盖层
    // - props.image: 图片 URL
    // - bounds: 图片在地图上的边界范围
    // - {}: 图片覆盖层的选项配置（当前为空对象）
    const imageOverlay = L.imageOverlay(props.image, bounds, {});

    // 创建一个 Promise 来监听图片加载完成事件
    // 这确保了图片完全加载后才继续后续操作
    const onLoad = new Promise<void>((resolve) => {
      imageOverlay.on('load', () => resolve());
    });

    // 将图片加载 Promise 添加到等待队列中
    // 这样地图组件可以等待所有图层加载完成后再执行其他操作
    waitFor.push(onLoad);

    // 将图片覆盖层添加到地图中
    map.addLayer(imageOverlay);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // 注意：这里故意忽略了依赖项检查，因为我们只想在组件挂载时执行一次

  // 该组件不渲染任何 DOM 元素，仅用于地图图层的副作用管理
  return null;
};

export default MapImageLayer;
