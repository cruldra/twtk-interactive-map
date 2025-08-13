/**
 * Maps 组件 - 地图视图的主要容器组件
 *
 * 该组件负责管理和渲染不同类型的地图视图，包括：
 * - 战略地图 (Strategic Map)
 * - 地图绘制器 (Map Painter)
 * - 起始位置地图 (Start Position Map)
 *
 * 使用 React Router 进行路由管理，每个地图类型都有对应的主内容区域和侧边栏组件
 */

import React from 'react';
import { Route } from 'react-router-dom';
import { RouteConfig } from 'react-router-config';

// 主要布局组件
import MainScaffold from '../MainScaffold';
import { useMainScaffold } from '../MainScaffold/useMainScaffold';

// 通用地图组件
import TopBar from '../map-base/TopBar';

// 战略地图相关组件
import MapStrategic from '../map-strategic/MapStrategic';
import MapRegionMarkerFilterSection from '../map-strategic/MapRegionMarkerFilterSection';

// 地图绘制器相关组件
import MapPainter from '../map-painter/MapPainter';
import PainterSection from '../map-painter/PainterSection';

// 起始位置地图相关组件
import MapStartpos from '../map-startpos/MapStartpos';
import CampaignSelect from '../map-startpos/CampaignSelect';

/**
 * 路由配置数组
 * 定义了三种不同的地图视图路由，每个路由包含：
 * - path: 路由路径
 * - exact: 是否精确匹配路径
 * - main: 主内容区域要渲染的组件
 * - sidebar: 侧边栏要渲染的组件
 */
const routes: RouteConfig[] = [
  {
    // 战略地图路由 - 显示游戏的战略层面地图
    path: '/maps/strategic',
    exact: true,
    main: MapStrategic,                    // 主要的战略地图组件
    sidebar: MapRegionMarkerFilterSection  // 区域标记过滤器侧边栏
  },
  {
    // 地图绘制器路由 - 用于编辑和绘制地图
    path: '/maps/painter',
    exact: true,
    main: MapPainter,     // 地图绘制器主组件
    sidebar: PainterSection, // 绘制工具侧边栏
  },
  {
    // 起始位置地图路由 - 显示战役起始位置
    path: '/maps/startpos',
    exact: true,
    main: MapStartpos,    // 起始位置地图主组件
    sidebar: CampaignSelect // 战役选择侧边栏
  }
];

/**
 * Maps 主组件
 *
 * 该组件是地图视图的主要容器，负责：
 * 1. 管理抽屉（侧边栏）的开关状态
 * 2. 根据当前路由渲染对应的主内容和侧边栏组件
 * 3. 提供统一的布局结构
 *
 * @returns {JSX.Element} 渲染的地图视图组件
 */
const Maps = () => {
  // 从 MainScaffold hook 获取抽屉状态管理
  const { appDrawerOpen, mobileDrawerOpen, toggleDrawer } = useMainScaffold();

  /**
   * 根据路由配置生成主内容区域的路由组件
   * 每个路由对应一个不同的地图视图
   */
  const main = routes.map((route) => (
    <Route
      key={route.path as string}  // 使用路径作为唯一键
      path={route.path}           // 路由路径
      exact={route.exact}         // 是否精确匹配
      component={route.main}      // 要渲染的主组件
    />
  ));

  /**
   * 根据路由配置生成侧边栏区域的路由组件
   * 每个路由对应不同的侧边栏内容
   */
  const sidebar = routes.map((route) => (
    <Route
      key={route.path as string}  // 使用路径作为唯一键
      path={route.path}           // 路由路径
      exact={route.exact}         // 是否精确匹配
      component={route.sidebar}   // 要渲染的侧边栏组件
    />
  ));

  return (
    <MainScaffold
      drawerOpen={appDrawerOpen}           // 桌面端抽屉开关状态
      mobileDrawerOpen={mobileDrawerOpen}  // 移动端抽屉开关状态
      toggleDrawer={toggleDrawer}          // 切换抽屉状态的函数
      barContent={<TopBar />}              // 顶部栏内容
      mainContent={<>{main}</>}            // 主内容区域（地图组件）
      drawerContent={<>{sidebar}</>}       // 抽屉内容（侧边栏组件）
    />
  );
};

// 导出 Maps 组件作为默认导出
export default Maps;
