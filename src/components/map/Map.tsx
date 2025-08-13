import React, { useCallback } from 'react';
import L from 'leaflet';
import { MapContext } from './context';
import { useStoreActions } from '../../store';

/**
 * Map组件的属性类型定义
 */
type MapProps = {
  /** 子组件，通常是地图图层和标记等 */
  children: React.ReactNode;
  /** 地图配置 */
  config: {
    /** 地图宽度（像素） */
    width: number;
    /** 地图高度（像素） */
    height: number;
  }
};

/**
 * 地图组件 - 基于Leaflet的交互式地图容器
 *
 * 该组件提供了一个可缩放、可平移的地图容器，使用简单坐标系统（CRS.Simple）
 * 适用于显示游戏地图、室内平面图等非地理坐标系的图像
 *
 * @param props - 组件属性
 * @returns 地图组件JSX元素
 */
const Map = (props: MapProps) => {
  const { children, config } = props;

  // 从store中获取地图相关的action函数
  /** 重置地图状态的action */
  const reset = useStoreActions((actions) => actions.map.reset);
  /** 设置缩放级别的action */
  const setZoom = useStoreActions((actions) => actions.map.setZoom);
  /** 设置地图加载完成状态的action */
  const setLoaded = useStoreActions((actions) => actions.map.setLoaded);

  /**
   * 地图边界定义
   * 使用简单坐标系，左上角为(0,0)，右下角为(height, width)
   */
  const bounds = [
    [0, 0],
    [config.height, config.width],
  ] as L.LatLngBoundsLiteral;

  /**
   * 地图上下文状态
   * 使用useRef保持引用稳定性，避免不必要的重渲染
   */
  const contextState = React.useRef({
    /** Leaflet地图实例 */
    map: null as any,
    /** 地图图层集合 */
    layers: {} as any,
    /** 等待完成的Promise数组，用于同步加载 */
    waitFor: [] as Promise<void>[],
    /** 地图边界 */
    bounds,
  });

  /** 地图是否已加载完成的本地状态 */
  const [mapLoaded, setMapLoaded] = React.useState(false);

  /**
   * 地图容器的ref回调函数
   * 当DOM元素挂载时初始化Leaflet地图实例
   */
  const mapContainer = useCallback((el) => {
    if (el !== null) {
      // 创建Leaflet地图实例
      const map = L.map(el, {
        crs: L.CRS.Simple,              // 使用简单坐标系统，适用于非地理地图
        minZoom: -2,                    // 最小缩放级别（最远视角）
        maxZoom: 2,                     // 最大缩放级别（最近视角）
        inertiaMaxSpeed: Infinity,      // 惯性滚动最大速度
        zoomControl: false,             // 禁用默认缩放控件
        attributionControl: false,      // 禁用版权信息控件
        doubleClickZoom: false,         // 禁用双击缩放
        maxBounds: bounds,              // 设置地图最大边界
        zoomSnap: 0.25,                // 缩放级别步进值
        zoomDelta: 0.25,               // 缩放增量
        zoomAnimation: true,            // 启用缩放动画
        markerZoomAnimation: true,      // 启用标记缩放动画
        wheelPxPerZoomLevel: 60,        // 鼠标滚轮每级缩放的像素数
      });

      /**
       * 监听缩放结束事件
       * 根据缩放级别设置不同的缩放状态
       */
      map.on('zoomend', (e) => {
        if (e.target._zoom === -2) {
          setZoom('high');              // 最远视角 - 高级别视图
        } else if (e.target._zoom >= 0) {
          setZoom('low');               // 最近视角 - 低级别视图
        } else {
          setZoom('mid');               // 中等视角 - 中级别视图
        }
      });

      // 将地图实例保存到上下文状态中
      contextState.current.map = map;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * 地图初始化和清理的副作用
   * 在组件挂载时设置地图视图，在卸载时清理资源
   */
  React.useEffect(() => {
    const map = contextState.current.map!;
    const waitFor = contextState.current.waitFor!;

    // 将地图视图调整到指定边界
    map.fitBounds(bounds);

    /**
     * 等待所有异步加载任务完成后，标记地图为已加载状态
     * 这确保了所有图层和资源都已准备就绪
     */
    Promise.all(waitFor).then(() => {
      setLoaded();           // 更新store中的加载状态
      setMapLoaded(true);    // 更新本地加载状态
    });

    /**
     * 组件卸载时的清理函数
     * 重置store状态并销毁Leaflet地图实例
     */
    return () => {
      reset();               // 重置store中的地图状态
      map.remove();          // 销毁Leaflet地图实例，释放内存
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * 地图容器的样式配置
   * 包含淡入动画和交互控制
   */
  const style: any = {
    height: '100%',                              // 占满父容器高度
    transition: 'opacity 1s',                   // 1秒的透明度过渡动画
    opacity: mapLoaded ? 1 : 0,                 // 根据加载状态控制透明度
    pointerEvents: mapLoaded ? 'auto' : 'none', // 加载完成前禁用鼠标事件
  };

  return (
    <div style={style}>
      {/* 地图容器div，设置ref回调和基础样式 */}
      <div ref={mapContainer} style={{ height: '100%', backgroundColor: 'transparent' }}>
        {/* 提供地图上下文给子组件，使子组件能够访问地图实例和相关状态 */}
        <MapContext.Provider value={contextState}>{children}</MapContext.Provider>
      </div>
    </div>
  );
};

/** 导出Map组件作为默认导出 */
export default Map;
