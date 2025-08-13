/**
 * useMainScaffold Hook - 主要脚手架布局状态管理
 *
 * 该 Hook 负责管理应用程序主要布局的抽屉（侧边栏）状态，
 * 包括桌面端和移动端的不同行为逻辑
 */

import { useCallback, useEffect } from 'react';
import { useTheme, useMediaQuery } from '@material-ui/core';
import { useStoreState, useStoreActions } from '../../store';

/**
 * 主要脚手架布局状态管理 Hook
 *
 * 功能：
 * 1. 检测设备类型（移动端/桌面端）
 * 2. 管理不同设备下的抽屉开关状态
 * 3. 提供统一的抽屉切换接口
 * 4. 处理设备切换时的状态同步
 *
 * @returns {Object} 包含抽屉状态和控制函数的对象
 */
export function useMainScaffold() {
  // 获取 Material-UI 主题对象
  const theme = useTheme();

  // 检测是否为移动端设备（屏幕宽度小于等于 'sm' 断点）
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 从全局状态中获取桌面端抽屉开关状态
  const appDrawerOpen = useStoreState((state) => state.scaffold.appDrawerOpen);

  // 从全局状态中获取移动端抽屉开关状态
  const mobileDrawerOpen = useStoreState((state) => state.scaffold.mobileDrawerOpen);

  // 获取设置桌面端抽屉状态的 action
  const setAppDrawerOpen = useStoreActions((actions) => actions.scaffold.setAppDrawerOpen);

  // 获取设置移动端抽屉状态的 action
  const setMobileDrawerOpen = useStoreActions((actions) => actions.scaffold.setMobileDrawerOpen);


  /**
   * 切换抽屉开关状态的回调函数
   * 根据当前设备类型（移动端/桌面端）切换对应的抽屉状态
   *
   * 逻辑：
   * - 移动端：切换 mobileDrawerOpen 状态
   * - 桌面端：切换 appDrawerOpen 状态
   */
  const toggleDrawer = useCallback(() => {
    if (isMobile) {
      // 移动端：切换移动端抽屉状态
      setMobileDrawerOpen(!mobileDrawerOpen);
    } else {
      // 桌面端：切换桌面端抽屉状态
      setAppDrawerOpen(!appDrawerOpen);
    }
  }, [appDrawerOpen, isMobile, mobileDrawerOpen, setAppDrawerOpen, setMobileDrawerOpen]);

  /**
   * 处理设备类型切换时的状态同步
   * 当从移动端切换到桌面端时，自动关闭移动端抽屉
   *
   * 这样可以避免在桌面端显示移动端的抽屉状态，保持界面的一致性
   */
  useEffect(() => {
    if (isMobile === false && mobileDrawerOpen === true) {
      // 从移动端切换到桌面端时，关闭移动端抽屉
      setMobileDrawerOpen(false);
    }
  }, [isMobile, mobileDrawerOpen, setMobileDrawerOpen]);

  /**
   * 返回抽屉状态管理相关的数据和函数
   *
   * @returns {Object} 包含以下属性：
   * - appDrawerOpen: 桌面端抽屉开关状态
   * - mobileDrawerOpen: 移动端抽屉开关状态
   * - toggleDrawer: 切换抽屉状态的函数
   */
  return {
    appDrawerOpen,     // 桌面端抽屉是否打开
    mobileDrawerOpen,  // 移动端抽屉是否打开
    toggleDrawer,      // 切换抽屉状态的函数
  };
}
