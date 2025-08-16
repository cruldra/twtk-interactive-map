import React from 'react';
import ReactDOM from 'react-dom';
import L from 'leaflet';
import { makeStyles } from '@material-ui/core/styles';
import { useMapContext } from '../map/context';
import { regions } from '../../data/common';
import assets from '../../assets';
import { createPortalIcon } from '../map/util';

/**
 * 定居点标记的样式
 */
const useStyles = makeStyles((theme) => ({
  marker: {
    position: 'absolute',
    height: 50,           // 标记高度
    width: 50,            // 标记宽度
    flexShrink: 0,        // 防止在 flex 容器中收缩
    filter: 'drop-shadow(5px 5px 5px rgba(0, 0, 0, 0.8))', // 添加阴影效果
  },
}));

/**
 * 地图定居点标记图层组件
 *
 * 该组件负责在地图上显示所有区域的定居点标记，包括城市和城镇。
 * 使用 Leaflet 标记和 React Portal 技术来实现高性能的标记渲染。
 *
 * 主要功能：
 * - 为每个区域的定居点创建地图标记
 * - 根据定居点类型（首都/普通城镇）显示不同的图标
 * - 将标记添加到地图图层组中进行统一管理
 * - 支持图层控制器的开关功能
 *
 * 技术实现：
 * - 使用 Leaflet 的 marker 和 layerGroup 进行地图标记管理
 * - 使用 React Portal 将 React 组件渲染到 Leaflet 创建的 DOM 元素中
 * - 通过 createPortalIcon 创建可承载 React 组件的自定义图标
 *
 * @returns JSX.Element - 返回包含所有定居点标记的 React Fragment
 */
const MapSettlementMarkerLayer = () => {
  const context = useMapContext();
  // 存储所有标记条目的状态，每个条目包含 [DOM元素, 区域数据, Leaflet标记]
  const [entries, setEntries] = React.useState<any>([]);

  React.useEffect(() => {
    const { map } = context;

    // 为每个区域创建定居点标记
    const elements = Object.values(regions).map((region: any) => {
      // 获取定居点的坐标位置
      const { x, y } = region.settlement;

      // 创建可承载 React 组件的自定义图标
      // interactive: false 表示图标本身不响应交互事件
      const icon = createPortalIcon({ interactive: false });

      // 获取图标对应的 DOM 元素，用于 React Portal 渲染
      const el = icon.getElement();

      // 创建 Leaflet 标记，注意坐标顺序为 [纬度, 经度] 即 [y, x]
      const marker = L.marker([y, x], { icon });

      // 返回包含 DOM 元素、区域数据和标记实例的数组
      return [el, region, marker];
    });

    // 保存所有标记条目到状态中
    setEntries(elements);

    // 从标记条目中提取 Leaflet 标记实例
    const markers = elements.reduce((accumulator: any, entry) => {
      const [el, region, marker] = entry; // eslint-disable-line @typescript-eslint/no-unused-vars
      // 只需要标记实例，DOM 元素和区域数据用于 React 渲染
      accumulator.push(marker);
      return accumulator;
    }, []);

    // 创建图层组来统一管理所有定居点标记
    const layer = L.layerGroup(markers);

    // 将图层组添加到地图中
    map.addLayer(layer);

    // 将图层添加到覆盖层控制器中
    // 'painter.settlements': 图层名称
    // layer: 图层实例
    // false: 默认不显示
    // markers.length: 标记数量，用于显示统计信息
    context.addOverlay('painter.settlements', layer, false, markers.length);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // 注意：这里故意忽略依赖项检查，因为只需要在组件挂载时执行一次

  return (
    <>
      {/* 使用 React Portal 将每个区域标记渲染到对应的 DOM 元素中 */}
      {entries.map(([e, region]: any) =>
        ReactDOM.createPortal(<RegionMarker region={region} />, e)
      )}
    </>
  );
};

/**
 * 区域标记组件的属性类型
 */
type RegionMarkerProps = {
  /** 区域数据对象，包含定居点信息和是否为首都的标识 */
  region: any;
};

/**
 * 单个区域标记组件
 *
 * 渲染单个定居点的图标，根据定居点类型显示不同的图标样式。
 *
 * 功能特性：
 * - 根据 region.isCapital 属性判断是否为首都
 * - 首都显示城市图标，普通定居点显示城镇图标
 * - 应用统一的标记样式（大小、阴影等）
 *
 * @param props - 组件属性
 * @returns JSX.Element - 返回定居点图标的 img 元素
 */
const RegionMarker = (props: RegionMarkerProps) => {
  const { region } = props;
  const classes = useStyles();

  return (
    <img
      className={classes.marker}
      // 根据是否为首都选择不同的图标资源
      // 首都使用 'icons/marker_high_city'，普通城镇使用 'icons/marker_high_town'
      src={assets[region.isCapital ? 'icons/marker_high_city' : 'icons/marker_high_town']}
      alt="" // 装饰性图片，不需要 alt 文本
    />
  )
};

export default MapSettlementMarkerLayer;
