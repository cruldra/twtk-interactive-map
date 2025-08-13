import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import clsx from 'clsx';
import L from 'leaflet';
import { makeStyles } from '@material-ui/core/styles';
import { useMapContext, } from '../map/context';
import { createSvgElement } from '../map/util';
import MapRegionOwnerTooltip from './MapRegionOwnerTooltip';
import regions from '../../data/common/regions.json';
import { usePainter, useOwnership } from './painter';

/**
 * 区域路径的样式定义
 */
const useStyles = makeStyles({
  path: {
    opacity: 0.4, // 默认透明度
    '&:hover': {
      opacity: 0.6, // 悬停时增加透明度
    }
  }
});

/**
 * 地图区域图层组件
 *
 * 该组件负责在地图上渲染所有的区域边界和填充色，支持交互功能如点击绘制和悬停提示。
 * 使用 SVG 覆盖层来绘制区域路径，并通过 React Portal 将区域元素渲染到 SVG 容器中。
 *
 * 主要功能：
 * - 创建 SVG 覆盖层并添加到地图
 * - 渲染所有区域的路径和填充色
 * - 支持区域点击绘制功能
 * - 显示区域所有者信息的工具提示
 *
 * @returns JSX.Element | null - 返回通过 Portal 渲染的区域路径，或在 SVG 元素未准备好时返回 null
 */
const RegionAreaLayer = () => {
  // SVG 元素的状态，用于存储创建的 SVG 容器
  const [svgElem, setSvgElem] = useState<SVGSVGElement | null>(null);
  // 获取地图上下文
  const context = useMapContext();

  React.useEffect(() => {
    // 从上下文中获取地图实例和边界信息
    const { map, bounds } = context;

    // 创建 SVG 元素，尺寸为 3840x3024（对应地图的像素尺寸）
    const svgElement = createSvgElement(3840, 3024);

    // 创建 SVG 覆盖层，将 SVG 元素绑定到地图边界
    const layer = L.svgOverlay(svgElement, bounds);

    // 将 SVG 覆盖层添加到地图中
    map.addLayer(layer);

    // TODO: 可能需要将图层添加到覆盖层控制器中
    // context.addOverlay('region-paths', layer, true);

    // 保存 SVG 元素引用，用于后续的 Portal 渲染
    setSvgElem(svgElement);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // 注意：这里故意忽略依赖项检查，因为只需要在组件挂载时执行一次

  // 如果 SVG 元素还未创建，则不渲染任何内容
  if (svgElem === null) return null;

  // 将所有区域数据转换为 RegionPath 组件
  const regionpaths = Object.values(regions).map((region: any) => (
    <RegionPath key={region.key} region={region} />
  ));

  // 使用 React Portal 将区域路径渲染到 SVG 元素中
  // 这样可以将 React 组件渲染到非 React 管理的 DOM 节点中
  return ReactDOM.createPortal(regionpaths, svgElem);
};

/**
 * 单个区域路径组件的属性类型
 */
type RegionPathProps = {
  /** 区域数据对象，包含区域的路径、键值等信息 */
  region: any;
};

/**
 * 单个区域路径组件
 *
 * 渲染单个区域的 SVG 路径元素，包含以下功能：
 * - 根据所有者派系显示对应的填充颜色
 * - 支持点击事件进行区域绘制
 * - 显示区域所有者的工具提示
 * - 应用悬停效果样式
 *
 * @param props - 组件属性
 * @returns JSX.Element - 包含工具提示的 SVG path 元素
 */
const RegionPath = (props: RegionPathProps) => {
  const classes = useStyles();
  const { region } = props;

  // 获取当前区域的所有者派系信息
  const owningFaction = useOwnership(region.key);

  // 获取绘制功能，用于处理区域点击事件
  const { paintRegion } = usePainter();

  return (
    // 使用工具提示组件包装路径元素，显示区域和派系信息
    <MapRegionOwnerTooltip region={region} faction={owningFaction}>
      <path
        // 应用 Leaflet 交互样式和自定义样式
        className={clsx('leaflet-interactive', classes.path)}
        // 区域的 SVG 路径数据
        d={region.d}
        // 根据所有者派系设置填充颜色，无所有者时为透明
        fill={owningFaction?.color ?? 'transparent'}
        // 点击事件：调用绘制功能来改变区域所有者
        onClick={() => paintRegion(region.key)}
      />
    </MapRegionOwnerTooltip>
  );
};

export default RegionAreaLayer;
