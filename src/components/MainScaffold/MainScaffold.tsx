/**
 * MainScaffold 组件 - 应用程序主要布局脚手架
 *
 * 该组件提供了应用程序的基础布局结构，包括：
 * - 固定的顶部应用栏 (AppBar)
 * - 响应式的右侧抽屉 (Drawer)
 * - 自适应的主内容区域
 *
 * 支持桌面端和移动端的不同交互模式：
 * - 桌面端：持久化抽屉，可以固定显示或隐藏
 * - 移动端：临时抽屉，覆盖在内容上方，点击遮罩层关闭
 */

import React from 'react';
import clsx from 'clsx';
import { makeStyles, AppBar, Toolbar, Hidden, Drawer, Divider } from '@material-ui/core';

// 抽屉的固定宽度（像素）
const drawerWidth = 320;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flex: 1,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  drawer: {
    [theme.breakpoints.up('md')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    [theme.breakpoints.up('md')]: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginRight: -drawerWidth,
    },
  },
  contentShift: {
    [theme.breakpoints.up('md')]: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: 0,
    },
  },
  scroller: {
    height: '100%',
    overflowY: 'scroll',
    '&::-webkit-scrollbar': {
      width: 6,
      backgroundColor: 'rgba(0, 0, 0, 0.12)',
    },
    '&::-webkit-scrollbar-thumb:vertical': {
      width: 6,
      backgroundColor: 'rgba(0, 0, 0, 0.12)',
    },
  }
}));

/**
 * MainScaffold 组件的属性类型定义
 */
type MainScaffoldProps = {
  /** 桌面端抽屉是否打开 */
  drawerOpen: boolean;
  /** 移动端抽屉是否打开 */
  mobileDrawerOpen: boolean;
  /** 切换抽屉状态的回调函数 */
  toggleDrawer: () => void;
  /** 顶部应用栏的内容 */
  barContent: React.ReactElement;
  /** 主内容区域的内容 */
  mainContent: React.ReactElement;
  /** 抽屉（侧边栏）的内容 */
  drawerContent: React.ReactElement;
};

/**
 * MainScaffold 主组件
 *
 * 渲染应用程序的主要布局结构，包括顶部栏、主内容区域和响应式抽屉
 *
 * @param props - 组件属性
 * @returns {JSX.Element} 渲染的布局组件
 */
const MainScaffold = (props: MainScaffoldProps) => {
  // 解构获取抽屉状态和切换函数
  const { drawerOpen, toggleDrawer } = props;
  // 获取样式类
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {/* 固定顶部应用栏 */}
      <AppBar className={classes.appBar} position="fixed" color="inherit" elevation={0}>
        {props.barContent}
        <Divider />
      </AppBar>

      {/* 主内容区域 - 根据抽屉状态调整边距 */}
      <main className={clsx(classes.content, { [classes.contentShift]: drawerOpen })}>
        {/* 占位工具栏，为固定的 AppBar 留出空间 */}
        <Toolbar />
        {props.mainContent}
      </main>
      {/* 导航抽屉区域 - 包含移动端和桌面端两种模式 */}
      <nav className={classes.drawer}>
        {/* 移动端抽屉 - 仅在小屏幕设备上显示 */}
        <Hidden mdUp implementation="css">
          <Drawer
            variant="temporary"              // 临时抽屉，覆盖在内容上方
            anchor="right"                   // 从右侧滑出
            open={props.mobileDrawerOpen}    // 控制移动端抽屉开关
            onClose={toggleDrawer}           // 点击遮罩层或按键关闭
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true,             // 保持 DOM 挂载以提高性能
            }}
          >
            {/* 抽屉内容滚动容器 */}
            <div className={classes.scroller}>
              {props.drawerContent}
            </div>
          </Drawer>
        </Hidden>

        {/* 桌面端抽屉 - 仅在中等及以上屏幕设备上显示 */}
        <Hidden smDown implementation="css">
          <Drawer
            classes={{ paper: classes.drawerPaper }}
            open={drawerOpen}                // 控制桌面端抽屉开关
            variant="persistent"             // 持久化抽屉，推挤主内容区域
            anchor="right"                   // 从右侧显示
          >
            {/* 占位工具栏，与顶部 AppBar 对齐 */}
            <Toolbar />
            {/* 抽屉内容滚动容器 */}
            <div className={classes.scroller}>
              {props.drawerContent}
            </div>
          </Drawer>
        </Hidden>
      </nav>
    </div>
  );
};

// 导出 MainScaffold 组件作为默认导出
export default MainScaffold;
