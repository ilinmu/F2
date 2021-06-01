import { G } from '@antv/f2/lib/core';
import createComponentTree from './createComponentTree';
import Component from '../component';
import Container from '../component/container';
import Layout from './layout';
import Animation from './animation';

const { createCanvas } = G;

interface ChartUpdateProps {
  pixelRatio?: number,
  width?: number | string,
  height?: number | string,
  padding?: (number | string)[],
  animate?: boolean,
  children?: any
}

interface ChartProps extends ChartUpdateProps {
  context: any,
}

interface IF2Canvas {
  container: any;
}

// 顶层Canvas标签
class Canvas extends Component implements IF2Canvas {
  canvas: any;
  component: Container;
  animation?: Animation;

  constructor(props: ChartProps) {
    super(props);
    const { context, pixelRatio, width, height, animate = true, children } = props;

    // 创建G的canvas
    const canvas = createCanvas({
      context,
      pixelRatio,
      width,
      height,
    });

    const {
      width: canvasWidth,
      height: canvasHeight
    } = canvas._attrs;

    // 初始化默认的布局
    const layout = new Layout({
      width: canvasWidth,
      height: canvasHeight
    });

    const componentTree = createComponentTree(children, { width: canvasWidth, height: canvasHeight });
    const component = new Container({ children: componentTree, animate });
    component.init({ layout, container: canvas });

    this.canvas = canvas;
    this.container = canvas;
    this.component = component;

    // 实例化动画模块
    this.animation = animate ? new Animation(canvas) : null;

    this.willMount();
    this.mount();
  }

  willMount() {
    const { __mounted, component } = this;
    if (__mounted) {
      return;
    }
    component.willMount();
  }

  mount() {
    const { __mounted, component } = this;
    if (__mounted) {
      return;
    }
    component.mount();
    component.__mounted = true;
  }

  draw() {
    const { canvas, container, animation } = this;
    // 执行动画
    if (animation) {
      animation.play(container);
    } else {
      canvas.draw();
    }
  }

  render() {
    const { component } = this;

    component.render();
    this.draw();
    return null;
  }

  update(props: ChartUpdateProps) {
    const { component, canvas,  animation } = this;
    // 只处理数据，和children的变化
    const { children } = props;

    const {
      width,
      height
    } = canvas._attrs;

    const componentTree = createComponentTree(children, { width, height });
    component.update({ children: componentTree });

    component.willMount()
    component.mount();
    component.render();
    if(animation) {
      animation.abort();
    }
    this.draw();

    // if (data && data !== this.props.data) {
    //   chart.changeData(data);
    // } else {
    //   // 如果调用了changeData, 会触发aftergeomdraw
    //   // 这里因为没有changeData, 所以需要自己再调一次render
    //   component.render();
    // }
    // // 执行动画
    // if (animation) {
    //   animation.play(container);
    // }
  }

  destroy() {
    const { component } = this;
    component.destroy();
  }
}

export default Canvas;
