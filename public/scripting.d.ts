/**
 * scripting-js v1.0.0
 * Copyright (c) 2024-present thomfang <tilfon9017@gmail.com>
 * All rights reserved.
 */

type RefObject<T> = {
  readonly current: T | null;
};
type MutableRefObject<T> = {
  current: T;
};
declare function useRef<T>(initialValue: T): MutableRefObject<T>;
declare function useRef<T>(initialValue: T | null): RefObject<T>;
declare function useRef<T = undefined>(): MutableRefObject<T | undefined>;

declare function runApp(node: VirtualNode): void;

declare function createElement<P = {}>(type: FunctionComponent<P>, props: ComponentProps<P>, ...children: VirtualNode[]): VirtualNode;

declare function useCallback<T extends Function>(callback: T, deps: any[]): T;

type ProviderProps<T> = {
  value: T;
  children: VirtualNode;
};
type ConsumerProps<T> = {
  children: (value: T) => VirtualNode;
};
type Provider<T> = (props: ProviderProps<T>) => VirtualNode;
type Consumer<T> = (props: ConsumerProps<T>) => VirtualNode;
type Context<T> = {
  readonly id: number;
  readonly Provider: Provider<T>;
  readonly Consumer: Consumer<T>;
};
declare function createContext<T>(): Context<T>;

declare function useContext<T>(context: Context<T>): T;
declare function useSelector<T, R>(context: Context<T>, selector: (context: T) => R): R;

declare function useEffect(callback: EffectCallback, deps: any[]): void;

declare function useMemo<T>(factory: () => T, deps: any[]): T;

declare function useReducer<R extends Reducer<any, any>, I>(reducer: R, initializerArg: I & ReducerState<R>, initializer: (arg: I & ReducerState<R>) => ReducerState<R>): [ReducerState<R>, Dispatch<ReducerAction<R>>];
declare function useReducer<R extends Reducer<any, any>>(reducer: R, initialState: ReducerState<R>, initializer?: undefined): [ReducerState<R>, Dispatch<ReducerAction<R>>];

declare function useState<T = undefined>(): [T | undefined, (state: SetStateAction<T | undefined>) => void];
declare function useState<T>(value: T | StateInitializer<T>): [T, (state: SetStateAction<T>) => void];

type RenderObjectShowOnScreenOptions = {
  rect?: {
      left: number;
      top: number;
      width: number;
      height: number;
  };
  duration?: number;
  curve?: Curve;
};
declare function __createRenderObjectRef(refKey: string): {
  renderObject: {
      showOnScreen(options?: RenderObjectShowOnScreenOptions): void;
      getPaintBounds(): Promise<PaintRect | null>;
  };
};
type RenderObject = ReturnType<typeof __createRenderObjectRef>;

type KeyProps = {
  key?: string;
};
type RefProps<T extends RenderObject = RenderObject> = {
  ref?: RefObject<T>;
};
type Brightness = 'light' | 'dark';
type Offset = {
  x: number;
  y: number;
};
type RelativeRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
} | {
  rect: {
      left: number;
      top: number;
      width: number;
      height: number;
  };
  size: {
      width: number;
      height: number;
  };
};
type Color = string | {
  r: number;
  g: number;
  b: number;
  /**
   *透明度, 0 ~ 1
   */
  o: number;
} | {
  hex: string;
  opacity: number;
};
type BoxFit = 'contain' | 'cover' | 'fill' | 'fitHeight' | 'fitWidth' | 'scaleDown' | 'none';
type ImageRepeat = 'noRepeat' | 'repeat' | 'repeatX' | 'repeatY';
/**
* margin和padding使用的描述
*/
type EdgeInsets = {
  horizontal?: number;
  vertical?: number;
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
};
type EdgeInsetsDirectional = {
  horizontal?: number;
  vertical?: number;
  start?: number;
  end?: number;
  top?: number;
  bottom?: number;
};
type FontWeight = 300 | 400 | 500 | 600 | 700 | 800 | 900 | 'w300' | 'w400' | 'w500' | 'w600' | 'w700' | 'w800' | 'w900' | 'normal' | 'bold';
type FontStyle = 'normal' | 'italic';
type TextBaseLine = 'alphabetic' | 'ideographic';
type TextDecoration = 'none' | 'underline' | 'overline' | 'lineThrough';
type TextDecorationStyle = 'solid' | 'double' | 'dotted' | 'dashed' | 'wavy';
type TextOverflow = 'clip' | 'fade' | 'ellipsis' | 'visible';
type TextAlign = 'left' | 'right' | 'center' | 'justify' | 'start' | 'end';
type TextDirection = 'rtl' | 'ltr';
type TextWidthBasis = 'parent' | 'longestLine';
type TextLeadingDistribution = 'proportional' | 'even';
type TextHeightBehavior = {
  applyHeightToFirstAscent?: boolean;
  applyHeightToLastDescent?: boolean;
  leadingDistribution?: TextLeadingDistribution;
};
type StackFit = 'loose' | 'expand' | 'passthrough';
/**
* 对齐方式
*
* topLeft: {x: -1, y: -1}
*
* center: {x: 0, y: 0}
*
* bottomRight: {x: 1, y: 1}
*/
type Alignment = Offset | 'topLeft' | 'topCenter' | 'topRight' | 'centerLeft' | 'center' | 'centerRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight';
type WrapAlignment = 'start' | 'end' | 'center' | 'spaceBetween' | 'spaceAround' | 'spaceEvenly';
type WrapCrossAlignment = 'start' | 'end' | 'center';
type BorderSide = {
  color?: Color;
  width?: number;
  style?: 'none' | 'solid';
};
type BorderRadius = {
  topLeft?: number;
  topRight?: number;
  bottomLeft?: number;
  bottomRight?: number;
};
type BlurStyle = 'normal' | 'solid' | 'outer' | 'inner';
type BoxShadow = {
  color: Color;
  blurRadius: number;
  offset?: Offset;
  spreadRadius?: number;
  blurStyle?: BlurStyle;
};
type TileMode = 'clamp' | 'repeated' | 'mirror' | 'decal';
type BoxDecoration = {
  color?: Color;
  border?: BorderSide | {
      left?: BorderSide;
      right?: BorderSide;
      top?: BorderSide;
      bottom?: BorderSide;
  };
  /** 设置数值则全部都生效 */
  borderRadius?: number | BorderRadius;
  boxShadow?: BoxShadow[];
  gradient?: LinearGradient | RadialGradient;
};
type BoxConstraints = {
  minWidth?: number;
  maxWidth?: number | 'infinity';
  minHeight?: number;
  maxHeight?: number | 'infinity';
};
type LinearGradient = {
  begin?: Alignment;
  end?: Alignment;
  colors: Color[];
  /** 如果不为空，必须和colors的数组长度一致，表示每个颜色在 0 ~ 1 中的分布 */
  stops?: number[];
  tileMode?: TileMode;
};
type RadialGradient = {
  colors: Color[];
  center?: Alignment;
  radius?: number;
  /** 如果不为空，必须和colors的数组长度一致，表示每个颜色在 0 ~ 1 中的分布 */
  stops?: number[];
  tileMode?: TileMode;
  focal?: Alignment;
  focalRadius?: number;
};
type MainAxisAlignment = 'start' | 'end' | 'center' | 'spaceBetween' | 'spaceAround' | 'spaceEvenly';
type CrossAxisAlignment = 'start' | 'end' | 'center' | 'stretch' | 'baseline';
type MainAxisSize = 'max' | 'min';
type VerticalDirection = 'down' | 'up';
type EventPosition = {
  dx: number;
  dy: number;
  distance: number;
  distanceSquared: number;
  direction: number;
};
type Velocity = {
  pixelsPerSecond: EventPosition;
};
type TapDownDetails = {
  localPosition: EventPosition;
  globalPosition: EventPosition;
};
type TapUpDetails = TapDownDetails;
type DragDownDetails = {
  localPosition: EventPosition;
  globalPosition: EventPosition;
};
type DragUpdateDetails = DragDownDetails & {
  delta: EventPosition;
};
type DragEndDetails = {
  velocity: Velocity;
};
type ScaleStartDetails = {
  focalPoint: EventPosition;
  localFocalPoint: EventPosition;
  pointerCount: number;
};
type ScaleUpdateDetails = ScaleStartDetails & {
  focalPointDelta: EventPosition;
  /**
   * The scale implied by the average distance between the pointers in contact
   * with the screen.
   *
   * This value must be greater than or equal to zero.
   *
   *  See also:
   *
   *   * [horizontalScale], which is the scale along the horizontal axis.
   *   * [verticalScale], which is the scale along the vertical axis.
   */
  scale: number;
  horizontalScale: number;
  verticalScale: number;
  rotation: number;
};
type ScaleEndDetails = {
  velocity: Velocity;
  pointerCount: number;
};
type Axis = 'horizontal' | 'vertical';
type AixsDirection = 'down' | 'up' | 'left' | 'right';
type ScrollOrientation = 
/**
* Place towards the left of the screen.
*/
'left'
/**
* Place towards the right of the screen.
*/
| 'right'
/**
* Place on top of the screen.
*/
| 'top'
/**
* Place on the bottom of the screen.
*/
| 'bottom';
type ScrollPhysics = 'AlwaysScrollable' | 'Bouncing' | 'Clamping' | 'NeverScrollable' | 'FixedExtent' | 'RangeMaintaining' | 'Page';
type Clip = 'none' | 'hardEdge' | 'antiAlias' | 'antiAliasWithSaveLayer';
type ScrollViewKeyboardDismissBehavior = 'manual' | 'onDrag';
type TextStyle = {
  inherit?: boolean;
  color?: Color;
  backgroundColor?: Color;
  fontSize?: number;
  fontWeight?: FontWeight;
  fontFamily?: string;
  fontStyle?: FontStyle;
  letterSpacing?: number;
  wordSpacing?: number;
  textBaseLine?: TextBaseLine;
  height?: number;
  decoration?: TextDecoration | TextDecoration[];
  decorationColor?: Color;
  decorationStyle?: TextDecorationStyle;
  overflow?: TextOverflow;
  leadingDistribution?: TextLeadingDistribution;
  fontFeatures?: string[];
  fontFamilyFallback?: string[];
};
type StrutStyle = {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: FontWeight;
  fontStyle?: FontStyle;
  height?: number;
  leading?: number;
  forceStrutHeight?: boolean;
};
type TextInputType = 'none' | 'text' | 'number' | 'decimal' | 'signedNumber' | 'signedDecimal' | 'datetime' | 'emailAddress' | 'multiline' | 'name' | 'phone' | 'streetAddress' | 'url' | 'visiblePassword';
type TabBarIndicatorSize = 'label' | 'tab';
type NormalCurve = 'bounceIn' | 'bounceInOut' | 'bounceOut' | 'decelerate' | 'ease' | 'easeIn' | 'easeInBack' | 'easeInCirc' | 'easeInExpo' | 'easeInOut' | 'easeInOutBack' | 'easeInOutCirc' | 'easeInOutCubic' | 'easeInOutCubicEmphasized' | 'easeInOutExpo' | 'easeInOutQuad' | 'easeInOutQuart' | 'easeInOutQuint' | 'easeInOutSine' | 'easeInQuad' | 'easeInQuart' | 'easeInQuint' | 'easeInSine' | 'easeInToLinear' | 'easeOut' | 'easeOutBack' | 'easeOutCirc' | 'easeOutCubic' | 'easeOutExpo' | 'easeOutQuad' | 'easeOutQuart' | 'easeOutQuint' | 'easeOutSine' | 'elasticIn' | 'elasticInOut' | 'elasticOut' | 'fastLinearToSlowEaseIn' | 'fastOutSlowIn' | 'linear' | 'linearToEaseOut' | 'slowMiddle';
/**
* 开始到结束的时间
*/
type IntervalCurve = {
  /**
   * 0.0 ~ 1.0
   */
  begin: number;
  /**
   * 0.0 ~ 1.0
   */
  end: number;
  curve?: NormalCurve;
};
type Curve = NormalCurve | IntervalCurve;
type FilterQuality = 'high' | 'medium' | 'low' | 'none';
type StrokeCap = 'butt' | 'round' | 'square';
type ScrollMetrics = {
  /**
   * The current scroll position, in logical pixels along the [axisDirection]
   */
  pixels: number;
  /**
   * The maximum in-range value for [pixels].
   *
   * The actual [pixels] value might be [outOfRange].
   *
   * This value should typically be non-null and greater than or equal to [minScrollExtent]. It can be infinity, if the scroll is unbounded.
   */
  maxScrollExtent: number;
  /**
   * The minimum in-range value for [pixels].
   *
   * The actual [pixels] value might be [outOfRange].
   *
   * This value should typically be non-null and less than or equal to [maxScrollExtent]. It can be negative infinity, if the scroll is unbounded.
   */
  minScrollExtent: number;
  /**
   * The extent of the viewport along the [axisDirection].
   */
  viewportDimension: number;
  /**
   * The quantity of content conceptually "below" the viewport in the scrollable.
   *
   * This is the content below the content described by [extentInside].
   */
  extentAfter: number;
  /**
   * The quantity of content conceptually "above" the viewport in the scrollable.
   *
   * This is the content above the content described by [extentInside].
   */
  extentBefore: number;
  /**
   * The quantity of content conceptually "inside" the viewport in the scrollable.
   *
   * The value is typically the height of the viewport when [outOfRange] is false. It could be less if there is less content visible than the size of the viewport, such as when overscrolling.
   *
   * The value is always non-negative, and less than or equal to [viewportDimension].
   */
  extentInside: number;
  /**
   * Whether the [pixels] value is exactly at the [minScrollExtent] or the [maxScrollExtent]
   */
  atEdge: boolean;
  /**
   * Whether the [pixels] value is outside the [minScrollExtent] and [maxScrollExtent].
   */
  outOfRange: boolean;
  /**
   * The direction in which the scroll view scrolls.
   */
  axisDirection: AixsDirection;
};
type ScrollNotification = {
  /**
   * The number of viewports that this notification has bubbled through.
   *
   * Typically listeners only respond to notifications with a [depth] of zero.
   *
   * Specifically, this is the number of [Widget]s representing [RenderAbstractViewport] render objects through which this notification has bubbled.
   */
  depth: number;
  /**
   * A description of a [Scrollable]'s contents, useful for modeling the state of its viewport.
   */
  metrics: ScrollMetrics;
};
type ScrollStartNotification = ScrollNotification & {
  dragDetails?: DragDownDetails;
};
type ScrollUpdateNotification = ScrollNotification & {
  dragDetails?: DragUpdateDetails;
  scrollDelta?: number;
};
type ScrollEndNotification = ScrollNotification & {
  dragDetails?: DragEndDetails;
};
type OverScrollNotification = ScrollNotification & {
  dragDetails?: DragUpdateDetails;
  /**
   * The number of logical pixels that the [Scrollable] avoided scrolling.
   *
   * This will be negative for overscroll on the "start" side and positive for overscroll on the "end" side.
   */
  overscroll: number;
  velocity: number;
};
type UserScrollNotification = ScrollNotification & {
  direction: 'idle' | 'forward' | 'reverse';
};
type PaintSize = {
  width: number;
  height: number;
  aspectRatio: number;
  isEmpty: boolean;
  isFinite: boolean;
  isInfinite: boolean;
  longestSide: number;
  shortestSide: number;
};
type PaintRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  topLeft: EventPosition;
  topRight: EventPosition;
  topCenter: EventPosition;
  centerLeft: EventPosition;
  center: EventPosition;
  centerRight: EventPosition;
  bottomLeft: EventPosition;
  bottomCenter: EventPosition;
  bottomRight: EventPosition;
  width: number;
  height: number;
  size: PaintSize;
  isEmpty: boolean;
  isFinite: boolean;
  isInfinite: boolean;
};
type DismissDirection = 'none' | 'horizontal' | 'startToEnd' | 'endToStart' | 'up' | 'down' | 'endToStart';
type BlendMode = 'clear' | 'src' | 'dst' | 'srcOver' | 'dstOver' | 'srcIn' | 'dstIn' | 'srcOut' | 'dstOut' | 'srcATop' | 'dstATop' | 'xor' | 'plus' | 'modulate' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'colorDodge' | 'colorBurn' | 'hardLight' | 'softLight' | 'difference' | 'exclusion' | 'multiply' | 'hue' | 'saturation' | 'color' | 'luminosity';
type ImageFilterBlur = {
  type: 'blur';
  tileMode?: TileMode;
  sigmaX?: number;
  sigmaY?: number;
};
type ImageFilterDilate = {
  type: 'dilate';
  radiusX?: number;
  radiusY?: number;
};
type ImageFilterErode = {
  type: 'erode';
  radiusX?: number;
  radiusY?: number;
};
type ImageFilterMaxtrix = {
  type: 'matrix';
  /**
   * value.length times 8 bytes.
   */
  value: number[];
};
type ImageFilterCompose = {
  type: 'compose';
  outer: ImageFilter;
  inner: ImageFilter;
};
type ImageFilter = ImageFilterBlur | ImageFilterDilate | ImageFilterErode | ImageFilterMaxtrix | ImageFilterCompose;
type OverlayVisibilityMode = 
/**
* Overlay will never appear regardless of the text entry state.
*/
'never'
/**
* Overlay will only appear when the current text entry is not empty.
*
* This includes prefilled text that the user did not type in manually. But
* does not include text in placeholders.
*/
| 'editing'
/**
* Overlay will only appear when the current text entry is empty.
*
* This also includes not having prefilled text that the user did not type
* in manually. Texts in placeholders are ignored.
*/
| 'notEditing'
/**
* Always show the overlay regardless of the text entry state.
*/
| 'always';
type TabAlignment = 'start' | 'startOffset' | 'fill' | 'center';

type InternalWidgetRender<P = {}> = (props: P) => RenderNode;
type RenderNode = {
  isInternal: boolean;
  type?: string;
  id?: string;
  props?: any;
  key?: string;
  ref?: string;
};
type ComponentProps<T = {}> = T & KeyProps & RefProps & {
  children?: VirtualNode | string | number | boolean | undefined | null | Array<string | number | boolean | undefined | null | VirtualNode>;
};
type VirtualNode = KeyProps & {
  isInternal: boolean;
  props: ComponentProps<any>;
  render: FunctionComponent<any> | InternalWidgetRender;
};
type FunctionComponent<P = {}> = (props: P) => VirtualNode;
type SetStateAction<S> = S | ((preState: S) => S);
type StateInitializer<S> = () => S;
type EffectDestructor = () => void;
type EffectCallback = () => EffectDestructor | void | undefined;
type ComponentEffect = [any[], EffectCallback, boolean, ReturnType<EffectCallback>];
type ComponentCallback<T extends Function> = [T, any[]];
type ComponentMemo = [any, any[]];
type Reducer<S, A> = (preState: S, action: A) => S;
type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any> ? S : never;
type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<any, infer A> ? A : never;
type Dispatch<A> = (action: A) => void;
declare enum ChildrenRule {
  none = 0,
  single = 1,
  multiple = 2
}

type PagePushEvent = {
  pageId: string;
  path: string;
  params: RouteParams | undefined | null;
};
type PagePopEvent<T> = {
  pageId: string;
};
type PageParamsUpdateEvent<T extends object = {}> = {
  pageId: string;
  params: T | undefined;
};
type PagePopResultEvent<T> = {
  pageId: string;
  result: {
      value?: T | null;
  };
};
type PageInfo = {
  path: string | undefined;
  params: RouteParams | undefined | null;
  pageId: string;
  navigator: string | undefined;
  element: VirtualNode;
  isPushByJs: boolean;
  pageRoute: PageRoute | undefined;
};
type RouteParams = {
  [key: string]: any;
};
type NormalRouteObject = {
  pageRoute?: PageRoute;
  path: string;
  element: VirtualNode;
  params?: {
      [key: string]: TypedParams;
  };
};
type IndexRouteObject = NormalRouteObject & {
  index: true;
};
type OtherwiseRouteObject = NormalRouteObject & {
  otherwise: true;
};
type RouteObject = NormalRouteObject | IndexRouteObject | OtherwiseRouteObject;
type TypedParams = {
  type: 'String' | 'Number' | 'Boolean';
  isRequired: boolean;
} | {
  type: 'Map';
  isRequired: boolean;
  items?: {
      [key: string]: TypedParams;
  };
} | {
  type: 'Array';
  isRequired: boolean;
  items?: TypedParams;
};
type MaterialPageRoute = {
  type: 'MaterialPageRoute';
  fullscreenDialog?: boolean;
  allowSnapshotting?: boolean;
};
type DialogRoute = {
  type: 'DialogRoute';
  barrierColor?: Color;
  barrierDismissible?: boolean;
};
type ModalBottomSheetRoute = {
  type: 'ModalBottomSheetRoute';
  isScrollControlled: boolean;
  barrierLabel?: string;
  backgroundColor?: Color;
  elevation?: number;
  clipBehavior?: Clip;
  modalBarrierColor?: Color;
  isDismissible?: boolean;
  enableDrag?: boolean;
  anchorPoint?: Offset;
  useSafeArea?: boolean;
  constraints?: BoxConstraints;
};
type CupertinoModalPopupRoute = {
  type: 'CupertinoModalPopupRoute';
  barrierLabel?: string;
  barrierColor?: Color;
  barrierDismissible?: boolean;
  semanticsDismissible?: boolean;
  anchorPoint?: Offset;
};
type CupertinoDialogRoute = {
  type: 'CupertinoDialogRoute';
  barrierDismissible?: boolean;
  barrierColor?: Color;
  barrierLabel?: string;
  anchorPoint?: Offset;
};
type CupertinoPageRoute = {
  type: 'CupertinoPageRoute';
  title?: string;
  fullscreenDialog?: boolean;
  allowSnapshotting?: boolean;
};
type PageRoute = MaterialPageRoute | ModalBottomSheetRoute | DialogRoute | CupertinoDialogRoute | CupertinoModalPopupRoute | CupertinoPageRoute;
type PushRouteOptions<P extends RouteParams> = {
  element: VirtualNode;
  params?: P;
  pageRoute?: PageRoute;
};
type PushNamedRouteOptions<P extends RouteParams> = {
  path: string;
  params?: P;
};

type PageInfoSubscriber = (pages: PageInfo[]) => void;
declare class Router {
  routes: RouteObject[];
  constructor(routes: RouteObject[]);
  private _pages;
  private _callbacks;
  private _isInited;
  private _navigatorKey?;
  get pages(): PageInfo[];
  private _onPageCheck;
  private _onPagePush;
  private _onPageParamsUpdate;
  private _onPagePop;
  init(navigatorKey?: string): void;
  reset(): void;
  hasIndexRoute(): boolean;
  private _notify;
  push<T, P extends RouteParams>(options: PushRouteOptions<P>): Promise<T | null | undefined>;
  pushNamed<T, P extends RouteParams = object>({ path, params, }: PushNamedRouteOptions<P>): Promise<T | null | undefined>;
  pop<T>(result?: T): void;
  getPageCount(): number;
  subscribe(callback: PageInfoSubscriber): () => void;
  getIndexRouteElement(): VirtualNode | undefined;
}

declare function useRouteParams<T extends RouteParams>(): T | undefined | null;

type WrappedRouter = {
  push: <T, P extends RouteParams>(options: PushRouteOptions<P>) => Promise<T | null | undefined>;
  pushNamed: <T, P extends RouteParams>(options: PushNamedRouteOptions<P>) => Promise<T | null | undefined>;
  pop: <T>(result?: T | undefined) => void;
  getPageCount: () => number;
};

declare function useRouter(): WrappedRouter;
declare function RouterProvider({ router }: {
  router: Router;
}): JSX.Element;

type MediaQueryData = {
  size: {
      width: number;
      height: number;
  };
  devicePixelRatio: number;
  textScaleFactor: number;
  platformBrightness: 'dark' | 'light';
  padding: {
      left: number;
      right: number;
      top: number;
      bottom: number;
  };
  viewPadding: {
      left: number;
      right: number;
      top: number;
      bottom: number;
  };
  viewInsets: {
      left: number;
      right: number;
      top: number;
      bottom: number;
  };
  alwaysUse24HourFormat: boolean;
  accessibleNavigation: boolean;
  highContrast: boolean;
  disableAnimations: boolean;
  invertColors: boolean;
  boldText: boolean;
  navigationMode: 'traditional' | 'directional';
};
type ScriptingDeviceInfo = {
  appVersion: string;
  isIOS: boolean;
  isAndroid: boolean;
  brand: string;
  model: string;
  timeZone: string;
  locale: string;
  systemLocale: string;
  systemLocales: string[];
  systemLanguageTag: string;
  systemLanguageCode: string;
  systemCountryCode?: string;
  systemScriptCode?: string;
};
type ThemeState = {
  isDarkMode: boolean;
  themeMode: 'light' | 'dark';
};
type LocaleState = {
  locale: string;
};
type ShareResultStatus = 'success' | 'dismissed' | 'unavailable';
type AppLifeCycleState = 'resumed' | 'inactive' | 'paused' | 'detached' | 'hidden';

declare const isApiEnabled: boolean;
declare function addAppEvent<T extends Function>(type: string, handler: T): void;

declare function useByTheme<T>({ dark, light }: {
  dark: T;
  light: T;
}): T;

declare function useLocale(): string;

declare function useThemeState(): {
  isDarkMode: boolean;
  themeMode: "dark" | "light";
};

declare function useMediaQuery(): MediaQueryData;

/**
* Scripting app events
*/
declare const ScriptingAppEvents: {
  mediaQueryDataChanged: string;
  themeModeChanged: string;
  localeChanged: string;
  appLifeCycleStateChanged: string;
  appDispose: string;
};

type FileMode = 'read' | 'write' | 'writeOnly' | 'append' | 'writeOnlyAppend';
type Encoding = 'utf-8' | 'ascii' | 'latin1';
type FileStat = {
  changed: number;
  accessed: number;
  modified: number;
  size: number;
  mode: number;
  type: string;
  modeString: string;
};
declare const enum FileSystemEvent {
  create = 1,
  modify = 2,
  delete = 4,
  move = 8,
  /**
   * create | modify | delete | move
   */
  all = 15
}
type FileSystemCommonEventDetails = {
  isDirectory: boolean;
  path: string;
};
type FileSystemCreateEventDetails = FileSystemCommonEventDetails & {
  type: FileSystemEvent.create;
};
type FileSystemDeleteEventDetails = FileSystemCommonEventDetails & {
  type: FileSystemEvent.delete;
};
type FileSystemModifyEventDetails = FileSystemCommonEventDetails & {
  type: FileSystemEvent.modify;
  contentChanged: boolean;
};
type FileSystemMoveEventDetails = FileSystemCommonEventDetails & {
  type: FileSystemEvent.move;
  destination?: string;
};
type FileSystemEventDetails = FileSystemCreateEventDetails | FileSystemDeleteEventDetails | FileSystemModifyEventDetails | FileSystemMoveEventDetails;

/**
* 复制文件
*/
declare function copyFile(path: string, newPath: string): Promise<void>;

/**
* 创建文件夹
*/
declare function createDirectory(path: string, recursive?: boolean): Promise<void>;

/**
* 创建link
*/
declare function createLink(path: string, target: string, recursive?: boolean): Promise<void>;

/**
* 获取documentsDirectory目录
*/
declare function documentsDirectory(): Promise<string>;

/**
* 判断File/Directory/Link是否存在
*/
declare function exists(path: string): Promise<boolean>;

declare function isDirectory(path: string): Promise<boolean>;

declare function isFile(path: string): Promise<boolean>;

/**
* 读取文件
*/
declare function readAsString(path: string, encoding?: Encoding): Promise<string>;

/**
* 读取文件
*/
declare function readAsBytes(path: string): Promise<string>;

/**
* 读取目录列表
*/
declare function readDirectory(path: string, options?: {
  recursive?: boolean;
  followLinks?: boolean;
}): Promise<string[]>;

/**
* 移除File/Directory/Link
*/
declare function remove$1(path: string, recursive?: boolean): Promise<void>;

/**
* 重命名文件或目录
*/
declare function rename(path: string, newPath: string): Promise<void>;

/**
* 获取临时文件目录
*/
declare function temporaryDirectory(): Promise<string>;

/**
* 监听文件或目录
* @param path 文件路径
* @param events 事件，多个事件使用或运算拼接
* @param listener 回调
* @returns 取消监听的函数
*/
declare function watch(path: string, events: FileSystemEvent, listener: (event: FileSystemEventDetails) => void): () => void;

/**
* 写入文件
*/
declare function writeAsString(path: string, contents: string, options?: {
  mode?: FileMode;
  encoding?: Encoding;
  flush?: boolean;
}): Promise<void>;

/**
* 写入文件
*/
declare function writeAsBytes(path: string, contents: number[], options?: {
  mode?: FileMode;
  flush?: boolean;
}): Promise<void>;

type index$1_Encoding = Encoding;
type index$1_FileMode = FileMode;
type index$1_FileStat = FileStat;
type index$1_FileSystemCommonEventDetails = FileSystemCommonEventDetails;
type index$1_FileSystemCreateEventDetails = FileSystemCreateEventDetails;
type index$1_FileSystemDeleteEventDetails = FileSystemDeleteEventDetails;
type index$1_FileSystemEvent = FileSystemEvent;
declare const index$1_FileSystemEvent: typeof FileSystemEvent;
type index$1_FileSystemEventDetails = FileSystemEventDetails;
type index$1_FileSystemModifyEventDetails = FileSystemModifyEventDetails;
type index$1_FileSystemMoveEventDetails = FileSystemMoveEventDetails;
declare const index$1_copyFile: typeof copyFile;
declare const index$1_createDirectory: typeof createDirectory;
declare const index$1_createLink: typeof createLink;
declare const index$1_documentsDirectory: typeof documentsDirectory;
declare const index$1_exists: typeof exists;
declare const index$1_isDirectory: typeof isDirectory;
declare const index$1_isFile: typeof isFile;
declare const index$1_readAsBytes: typeof readAsBytes;
declare const index$1_readAsString: typeof readAsString;
declare const index$1_readDirectory: typeof readDirectory;
declare const index$1_rename: typeof rename;
declare const index$1_temporaryDirectory: typeof temporaryDirectory;
declare const index$1_watch: typeof watch;
declare const index$1_writeAsBytes: typeof writeAsBytes;
declare const index$1_writeAsString: typeof writeAsString;
declare namespace index$1 {
export { type index$1_Encoding as Encoding, type index$1_FileMode as FileMode, type index$1_FileStat as FileStat, type index$1_FileSystemCommonEventDetails as FileSystemCommonEventDetails, type index$1_FileSystemCreateEventDetails as FileSystemCreateEventDetails, type index$1_FileSystemDeleteEventDetails as FileSystemDeleteEventDetails, index$1_FileSystemEvent as FileSystemEvent, type index$1_FileSystemEventDetails as FileSystemEventDetails, type index$1_FileSystemModifyEventDetails as FileSystemModifyEventDetails, type index$1_FileSystemMoveEventDetails as FileSystemMoveEventDetails, index$1_copyFile as copyFile, index$1_createDirectory as createDirectory, index$1_createLink as createLink, index$1_documentsDirectory as documentsDirectory, index$1_exists as exists, index$1_isDirectory as isDirectory, index$1_isFile as isFile, index$1_readAsBytes as readAsBytes, index$1_readAsString as readAsString, index$1_readDirectory as readDirectory, remove$1 as remove, index$1_rename as rename, index$1_temporaryDirectory as temporaryDirectory, index$1_watch as watch, index$1_writeAsBytes as writeAsBytes, index$1_writeAsString as writeAsString };
}

declare function hapticFeedback(type: 'heavyImpact' | 'lightImpact' | 'mediumImpact' | 'selectionClick'): void;

declare const Device: {
  readonly isIOS: boolean;
  readonly isAndroid: boolean;
  readonly brand: string;
  readonly model: string;
  readonly locale: string;
  readonly systemLocale: string;
  readonly systemLocales: string[];
  readonly systemLanguageTag: string;
  readonly sysmtemLanguageCode: string;
  readonly systemCountryCode: string | undefined;
  readonly systemScriptCode: string | undefined;
  hapticFeedback: typeof hapticFeedback;
};

/**
* Share base64 image
* @param options
* @param options.image base64 format, e.g. data:image/png;base64,xxxxx...
* @param options.text Share text content
* @param options.subject Share subject
*/
declare function shareBase64Image(options: {
  image: string;
  text?: string;
  subject?: string;
}): Promise<{
  status: ShareResultStatus;
}>;

/**
* Share files
* @param options
* @param options.files Files path
* @param options.text Share text content
* @param options.subject Share subject
*/
declare function shareFiles(options: {
  files: string[];
  text: string;
  subject?: string;
}): Promise<{
  status: ShareResultStatus;
}>;

/**
* Share text
* @param options
* @param options.text Share text content
* @param options.subject Share subject
*/
declare function shareText(options: {
  text: string;
  subject?: string;
}): Promise<{
  status: ShareResultStatus;
}>;

declare const Share: {
  shareText: typeof shareText;
  shareBase64Image: typeof shareBase64Image;
  shareFiles: typeof shareFiles;
};

/**
* Copy text to clipboard.
* @param text Text content
* @returns
*/
declare function copyText(text: string): Promise<boolean>;

/**
* Get text form clipboard.
* @returns
*/
declare function getClipboardText(): Promise<string | null>;

declare const Clipboard: {
  copyText: typeof copyText;
  getText: typeof getClipboardText;
};

/**
* 关闭全屏loading
*/
declare function hideLoading(): void;

/**
* 打开Alert弹窗
* @param options
* @param options.content 弹窗内容
* @param options.title 弹窗标题（可选）
* @param options.buttonLabel 按钮文案（可选）
*/
declare function showAlert(options: {
  content: string;
  title?: string;
  buttonLabel?: string;
}): Promise<void>;

type VstarBottomSheetOptions = {
  /** 标题 */
  title?: string;
  /** 是否显示取消按钮，默认不显示 */
  cancelButton?: boolean;
  /** 是否可往下拖动关闭，默认可以 */
  dragDownDissmisible?: boolean;
  /** action选项 */
  actions: {
      /** 文本内容 */
      label: string;
      /** 是否选中 */
      selected?: boolean;
  }[];
};
/**
* 展示bottom sheet 弹窗，类似iOS的选项功能
* @param options
* @param options.title 标题（可选）
* @param options.cancelButton 是否展示取消按钮，默认展示（可选）
* @param options.dragDownDissmisible 是否可以下拉关闭弹窗，默认可以（可选）
* @param options.actions 选项列表
* @param options.actions.label 选项文本
* @param options.actions.selected 是否选中，设置为true改选项展示选中状态（可选）
* @returns 点击某个选项后返回其下标，取消的话返回null
*/
declare function showBottomSheet({ title, cancelButton, dragDownDissmisible, actions, }: VstarBottomSheetOptions): Promise<number | null>;

/**
* 展示Confirm弹窗
* @param options
* @param options.content 提示内容
* @param options.title 提示标题（可选）
* @param options.cancelLabel 取消按钮文案（可选）
* @param options.confirmLabel 确认按钮文案（可选）
* @returns 返回true或false的promise
*/
declare function showConfirm(options: {
  content: string;
  title?: string;
  cancelLabel?: string;
  confirmLabel?: string;
}): Promise<boolean>;

declare function showLoading(options: {
  message?: string;
  color?: string;
}): void;

/**
* 展示提醒弹窗
* @param options
* @param options.title 标题
* @param options.obscureText 是否使用晦涩文本模式，用于密码之类（可选）
* @param options.hintText 提示placeholder文案（可选）
* @param options.cancelLabel 取消按钮文案（可选）
* @param options.confirmLabel 确认按钮文案（可选）
* @returns 用户输入确认后返回字符串，用户取消后返回null
*/
declare function showPrompt(options: {
  title: string;
  obscureText?: boolean;
  hintText?: string;
  cancelLabel?: string;
  confirmLabel?: string;
}): Promise<string | null>;

/**
* 展示Toast弹窗
* @param options
* @param options.content toast消息
* @param options.duration 展示时间（可选），单位毫秒，默认2000毫秒（2秒）
*/
declare function showToast(options: {
  content: string;
  duration?: number;
}): Promise<void>;

declare const Dialog: {
  showLoading: typeof showLoading;
  hideLoading: typeof hideLoading;
  showAlert: typeof showAlert;
  showPrompt: typeof showPrompt;
  showConfirm: typeof showConfirm;
  showToast: typeof showToast;
  showBottomSheet: typeof showBottomSheet;
};

type PickFileOptions = {
  maxWidth?: number;
  maxHeight?: number;
  /**
   * 1 - 100
   */
  imageQuality?: number;
  requestFullMetadata?: boolean;
};
declare function pickImage(options?: PickFileOptions): Promise<string | null>;
declare function pickMultipleImage(options?: PickFileOptions): Promise<string[]>;

declare function pickMedia(options?: PickFileOptions): Promise<string | null>;
declare function pickMultipleMedia(options?: PickFileOptions): Promise<string[]>;

type TakePhotoOptions = PickFileOptions & {
  preferredCameraDevice?: 'front' | 'rear';
};
declare function takePhoto(options?: TakePhotoOptions): Promise<string | null>;

declare const FilePicker: {
  pickImage: typeof pickImage;
  pickMultipleImage: typeof pickMultipleImage;
  pickMedia: typeof pickMedia;
  pickMultipleMedia: typeof pickMultipleMedia;
  takePhoto: typeof takePhoto;
};

declare const ImageSaver: {
  saveBytesImage(options: {
      image: ArrayBuffer;
      quality?: number;
      name?: string;
  }): Promise<boolean>;
  saveBase64Image(options: {
      image: string;
      quality?: number;
      name?: string;
  }): Promise<boolean>;
  saveNetworkImage(options: {
      url: string;
      quality?: number;
      name?: string;
  }): Promise<boolean>;
};

declare function set<T>(key: string, value: T): Promise<boolean>;
declare function get<T>(key: string): Promise<T | null>;
declare function remove(key: string): Promise<boolean>;
declare const Storage: {
  set: typeof set;
  get: typeof get;
  remove: typeof remove;
};

type PermissionStatus = {
  isDenied: boolean;
  isGranted: boolean;
  isLimited: boolean;
  isPermanentlyDenied: boolean;
  isProvisional: boolean;
  isRestricted: boolean;
};
type PermissionType = 'accessMediaLocation' | 'accessNotificationPolicy' | 'activityRecognition' | 'appTrackingTransparency' | 'audio' | 'bluetoothAdvertise' | 'bluetoothConnect' | 'bluetoothScan' | 'calendarFullAccess' | 'calendarWriteOnly' | 'camera' | 'contacts' | 'criticalAlerts' | 'ignoreBatteryOptimizations' | 'manageExternalStorage' | 'mediaLibrary' | 'microphone' | 'nearbyWifiDevices' | 'notification' | 'photos' | 'photosAddOnly' | 'reminders' | 'requestInstallPackages' | 'scheduleExactAlarm' | 'sensors' | 'sensorsAlways' | 'sms' | 'speech' | 'storage' | 'systemAlertWindow';
declare function getPermissionStatus(type: PermissionType): Promise<PermissionStatus>;
declare function requestPermission(type: PermissionType): Promise<PermissionStatus>;

declare function launchUrl(url: string): Promise<boolean>;

declare function openScriptingApp<T>(options: {
  url: string;
  params?: {
      [key: string]: any;
  };
}): Promise<T | null>;

declare const Navigation: {
  launchUrl: typeof launchUrl;
  openScriptingApp: typeof openScriptingApp;
};

/**
* 取消请求的token
*
* 同一个token可以用于多个请求
*/
declare class CancelToken {
  readonly token: string;
  private _isCancelled;
  get isCancelled(): boolean;
  /**
   * 调用cancel方法后所有请求都会被取消
   */
  cancel(): void;
}
/**
* 网络请求 CancelToken
*/
declare function useCancelToken(): {
  get: () => CancelToken | undefined;
  create: () => CancelToken;
};

declare function loadBytes(options: {
  url: string;
  noCache?: boolean;
  timeout?: number;
  debugLabel?: string;
}): Promise<number[] | null>;

declare function loadFont(options: {
  family: string;
  urls: string[];
  type?: 'otf' | 'ttf';
}): Promise<boolean>;

declare function loadJson<T>(options: {
  url: string;
  noCache?: boolean;
  timeout?: number;
  debugLabel?: string;
}): Promise<T | null>;

declare function loadString<T>(options: {
  url: string;
  noCache?: boolean;
  timeout?: number;
  debugLabel?: string;
}): Promise<T | null>;

declare const Request: {
  loadString: typeof loadString;
  loadJson: typeof loadJson;
  loadBytes: typeof loadBytes;
  loadFont: typeof loadFont;
};

type SocketIOOptions = {};

declare class SocketIO {
  private key;
  url: string;
  private _eventMap;
  constructor(key: string, url: string);
  connect(): void;
  isConnected(): Promise<boolean | null>;
  on<T>(event: string, callback: (data: T) => void): void;
  once<T>(event: string, callback: (data: T) => void): void;
  off<T>(event: string, callback: (data: T) => void): void;
  emit(event: string, data?: any): void;
  emitWithAck(event: string, data?: any): Promise<unknown>;
  close(): void;
  dispose(): void;
  static open(url: string, options?: SocketIOOptions): Promise<SocketIO>;
}

type AnimatedAlignProps = {
  alignment: Alignment;
  duration: number;
  heightFactor?: number;
  widthFactor?: number;
  curve?: Curve;
  onEnd?: () => void;
  children?: VirtualNode;
};
declare const AnimatedAlign: FunctionComponent<AnimatedAlignProps>;

type ContainerProps = BoxDecoration & BoxConstraints & {
  children?: VirtualNode;
  width?: number | 'infinity';
  height?: number | 'infinity';
  /** 设置数值则left,top,right,bottom都生效 */
  margin?: EdgeInsets | number;
  /** 设置数值则left,top,right,bottom都生效 */
  padding?: EdgeInsets | number;
  alignment?: Alignment;
  clipBehavior?: Clip;
};
declare const Container: FunctionComponent<ContainerProps>;

type AnimatedContainerProps = ContainerProps & {
  duration: number;
  curve?: Curve;
  onEnd?: () => void;
};
declare const AnimatedContainer: FunctionComponent<AnimatedContainerProps>;

type AnimatedOpacityProps = {
  opacity: number;
  duration: number;
  curve?: Curve;
  onEnd?: () => void;
  alwaysIncludeSemantics?: boolean;
  children?: VirtualNode;
};
declare const AnimatedOpacity: FunctionComponent<AnimatedOpacityProps>;

type AnimatedPaddingProps = {
  padding: EdgeInsets | number;
  duration: number;
  curve?: Curve;
  onEnd?: () => void;
  children?: VirtualNode;
};
declare const AnimatedPadding: FunctionComponent<AnimatedPaddingProps>;

type AnimatedPositionedProps = {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  width?: number;
  height?: number;
  curve?: Curve;
  onEnd?: () => void;
  duration: number;
  children: VirtualNode;
};
declare const AnimatedPositioned: FunctionComponent<AnimatedPositionedProps>;

type AnimatedRotationProps = {
  turns: number;
  duration: number;
  alignment?: Alignment;
  curve?: Curve;
  filterQuality?: FilterQuality;
  onEnd?: () => void;
  children?: VirtualNode;
};
declare const AnimatedRotation: FunctionComponent<AnimatedRotationProps>;

type AnimatedScaleProps = {
  scale: number;
  duration: number;
  curve?: Curve;
  alignment?: Alignment;
  filterQuality?: FilterQuality;
  onEnd?: () => void;
  children?: VirtualNode;
};
declare const AnimatedScale: FunctionComponent<AnimatedScaleProps>;

type AnimatedSizeProps = {
  alignment?: Alignment;
  duration: number;
  reverseDuration?: number;
  curve?: Curve;
  clipBehavior?: Clip;
  children?: VirtualNode;
};
declare const AnimatedSize: FunctionComponent<AnimatedSizeProps>;

type AnimatedSlideProps = {
  /**
   * The target offset.
   * The child will be translated horizontally by width * x and vertically by height * y
   */
  offset: Offset;
  duration: number;
  curve?: Curve;
  onEnd?: () => void;
  children?: VirtualNode;
};
declare const AnimatedSlide: FunctionComponent<AnimatedSlideProps>;

type AnimationValue = number | Offset | RelativeRect | BoxDecoration;
type TweenType = 'double' | 'Offset' | 'RelativeRect' | 'BoxDecoration';
type Tween<T extends AnimationValue> = {
  begin: T;
  end: T;
  curve?: Curve;
  reverseCurve?: Curve;
};
type TweenSequenceItem<T extends AnimationValue> = {
  begin: T;
  end: T;
  curve?: Curve;
  /**
   * 0 - 100
   */
  weight: number;
};
type TweenSequenceConstantItem<T extends AnimationValue> = {
  value: T;
  curve?: Curve;
  /**
   * 0 - 100
   */
  weight: number;
};
type TweenSequence<T extends AnimationValue> = Array<TweenSequenceItem<T> | TweenSequenceConstantItem<T>>;
type AnimationInitalOptions<T extends AnimationValue> = Tween<T> | TweenSequence<T>;
type AnimationStatus = 'dismissed' | 'forward' | 'reverse' | 'completed';
type AnimationStatusListener = (status: AnimationStatus) => void;
type AnimationControllerIntialOptions = {
  value?: number;
  duration?: number;
  reverseDuration?: number;
  lowerBound?: number;
  upperBound?: number;
  auto?: 'forward' | 'repeat' | 'reverseRepeat';
};

declare class _AnimationBase {
  private _statusListeners;
  addStatusListener(listener: AnimationStatusListener): this;
  removeStatusListener(listener: AnimationStatusListener): this;
  removeAllStatusListener(): this;
  private __triggerStatusListener__;
  protected _checkCallInEffect(methodName: string): void;
  protected _checkCallInRenderLoop(methodName: string): void;
}

declare class Animation<T extends AnimationValue> extends _AnimationBase {
  readonly key: string;
  readonly controllerKey: string;
  readonly tickerProviderKey: string;
  readonly options: AnimationInitalOptions<T>;
  readonly isSequence: boolean;
  constructor(key: string, controllerKey: string, tickerProviderKey: string, options: AnimationInitalOptions<T>, isSequence: boolean);
  private _getTweenType;
  readonly type: TweenType;
  toJson(): {
      animationKey: string;
      controllerKey: string;
      tickerProviderKey: string;
  };
  toTweenJson(): {
      begin: T;
      end: T;
      curve?: Curve | undefined;
      reverseCurve?: Curve | undefined;
      animationKey: string;
      controllerKey: string;
      tickerProviderKey: string;
      type: TweenType;
  };
  toTweenSequenceJson(): {
      animationKey: string;
      controllerKey: string;
      tickerProviderKey: string;
      type: TweenType;
      options: TweenSequence<T>;
  };
}

declare class AnimationController extends _AnimationBase {
  readonly key: string;
  readonly tickerProviderKey: string;
  constructor(key: string, tickerProviderKey: string);
  private _animtions;
  forward(from?: number): Promise<boolean>;
  reverse(from?: number): Promise<boolean>;
  animateTo(target: number, duration?: number): Promise<boolean>;
  repeat(options?: {
      min?: number;
      max?: number;
      period?: number;
      reverse?: boolean;
  }): Promise<boolean>;
  reset(): Promise<boolean>;
  stop(canceled?: boolean): Promise<boolean>;
  useTween<T extends AnimationValue>(options: Tween<T>): Animation<T>;
  useTweenSequence<T extends AnimationValue>(options: TweenSequence<T>): Animation<T>;
  private _createAnimation;
}

declare function useAnimationController(options?: AnimationControllerIntialOptions): AnimationController;

type CupertinoActionSheetProps = {
  title?: VirtualNode;
  message?: VirtualNode;
  actions?: VirtualNode[];
  cancelButton?: VirtualNode;
};
declare const CupertinoActionSheet: FunctionComponent<CupertinoActionSheetProps>;

type CupertinoActionSheetActionProps = {
  isDefaultAction?: boolean;
  isDestructiveAction?: boolean;
  onPressed: () => void;
  children: VirtualNode;
};
declare const CupertinoActionSheetAction: FunctionComponent<CupertinoActionSheetActionProps>;

type CupertinoActivityIndicatorProps = {
  color?: Color;
  animating?: boolean;
  radius?: number;
  partiallyRevealed?: boolean;
};
declare const CupertinoActivityIndicator: FunctionComponent<CupertinoActivityIndicatorProps>;

type CupertinoAlertDialogProps = {
  title?: VirtualNode;
  content?: VirtualNode;
  actions?: VirtualNode[];
  insetAnimationDuration?: number;
  insetAnimationCurve?: Curve;
};
declare const CupertinoAlertDialog: FunctionComponent<CupertinoAlertDialogProps>;

type CupertinoButtonProps = {
  filled?: boolean;
  padding?: number | EdgeInsets;
  color?: Color;
  disabledColor?: Color;
  minSize?: number;
  pressedOpacity?: number;
  borderRadius?: BorderRadius;
  alignment?: Alignment;
  onPressed?: () => void;
  children: VirtualNode;
};
declare const CupertinoButton: FunctionComponent<CupertinoButtonProps>;

type CupertinoContextMenuProps = {
  enableHapticFeedback?: boolean;
  actions: VirtualNode[];
  children: VirtualNode;
};
declare const CupertinoContextMenu: FunctionComponent<CupertinoContextMenuProps>;

type CupertinoIcons = "left_chevron" | "right_chevron" | "share" | "share_solid" | "book" | "book_solid" | "bookmark" | "bookmark_solid" | "info" | "reply" | "conversation_bubble" | "profile_circled" | "plus_circled" | "minus_circled" | "flag" | "search" | "check_mark" | "check_mark_circled" | "check_mark_circled_solid" | "circle" | "circle_filled" | "back" | "forward" | "home" | "shopping_cart" | "ellipsis" | "phone" | "phone_solid" | "down_arrow" | "up_arrow" | "battery_charging" | "battery_empty" | "battery_full" | "battery_75_percent" | "battery_25_percent" | "bluetooth" | "restart" | "reply_all" | "reply_thick_solid" | "share_up" | "shuffle" | "shuffle_medium" | "shuffle_thick" | "photo_camera" | "photo_camera_solid" | "video_camera" | "video_camera_solid" | "switch_camera" | "switch_camera_solid" | "collections" | "collections_solid" | "folder" | "folder_solid" | "folder_open" | "delete" | "delete_solid" | "delete_simple" | "pen" | "pencil" | "create" | "create_solid" | "refresh" | "refresh_circled" | "refresh_circled_solid" | "refresh_thin" | "refresh_thick" | "refresh_bold" | "clear_thick" | "clear_thick_circled" | "clear" | "clear_circled" | "clear_circled_solid" | "add" | "add_circled" | "add_circled_solid" | "gear" | "gear_solid" | "gear_big" | "settings" | "settings_solid" | "music_note" | "double_music_note" | "play_arrow" | "play_arrow_solid" | "pause" | "pause_solid" | "loop" | "loop_thick" | "volume_down" | "volume_mute" | "volume_off" | "volume_up" | "fullscreen" | "fullscreen_exit" | "mic_off" | "mic" | "mic_solid" | "clock" | "clock_solid" | "time" | "time_solid" | "padlock" | "padlock_solid" | "eye" | "eye_solid" | "person" | "person_solid" | "person_add" | "person_add_solid" | "group" | "group_solid" | "mail" | "mail_solid" | "location" | "location_solid" | "tag" | "tag_solid" | "tags" | "tags_solid" | "bus" | "car" | "car_detailed" | "train_style_one" | "train_style_two" | "paw" | "paw_solid" | "game_controller" | "game_controller_solid" | "lab_flask" | "lab_flask_solid" | "heart" | "heart_solid" | "bell" | "bell_solid" | "news" | "news_solid" | "brightness" | "brightness_solid" | "airplane" | "alarm" | "alarm_fill" | "alt" | "ant" | "ant_circle" | "ant_circle_fill" | "ant_fill" | "antenna_radiowaves_left_right" | "app" | "app_badge" | "app_badge_fill" | "app_fill" | "archivebox" | "archivebox_fill" | "arrow_2_circlepath" | "arrow_2_circlepath_circle" | "arrow_2_circlepath_circle_fill" | "arrow_2_squarepath" | "arrow_3_trianglepath" | "arrow_branch" | "arrow_clockwise" | "arrow_clockwise_circle" | "arrow_clockwise_circle_fill" | "arrow_counterclockwise" | "arrow_counterclockwise_circle" | "arrow_counterclockwise_circle_fill" | "arrow_down" | "arrow_down_circle" | "arrow_down_circle_fill" | "arrow_down_doc" | "arrow_down_doc_fill" | "arrow_down_left" | "arrow_down_left_circle" | "arrow_down_left_circle_fill" | "arrow_down_left_square" | "arrow_down_left_square_fill" | "arrow_down_right" | "arrow_down_right_arrow_up_left" | "arrow_down_right_circle" | "arrow_down_right_circle_fill" | "arrow_down_right_square" | "arrow_down_right_square_fill" | "arrow_down_square" | "arrow_down_square_fill" | "arrow_down_to_line" | "arrow_down_to_line_alt" | "arrow_left" | "arrow_left_circle" | "arrow_left_circle_fill" | "arrow_left_right" | "arrow_left_right_circle" | "arrow_left_right_circle_fill" | "arrow_left_right_square" | "arrow_left_right_square_fill" | "arrow_left_square" | "arrow_left_square_fill" | "arrow_left_to_line" | "arrow_left_to_line_alt" | "arrow_merge" | "arrow_right" | "arrow_right_arrow_left" | "arrow_right_arrow_left_circle" | "arrow_right_arrow_left_circle_fill" | "arrow_right_arrow_left_square" | "arrow_right_arrow_left_square_fill" | "arrow_right_circle" | "arrow_right_circle_fill" | "arrow_right_square" | "arrow_right_square_fill" | "arrow_right_to_line" | "arrow_right_to_line_alt" | "arrow_swap" | "arrow_turn_down_left" | "arrow_turn_down_right" | "arrow_turn_left_down" | "arrow_turn_left_up" | "arrow_turn_right_down" | "arrow_turn_right_up" | "arrow_turn_up_left" | "arrow_turn_up_right" | "arrow_up" | "arrow_up_arrow_down" | "arrow_up_arrow_down_circle" | "arrow_up_arrow_down_circle_fill" | "arrow_up_arrow_down_square" | "arrow_up_arrow_down_square_fill" | "arrow_up_bin" | "arrow_up_bin_fill" | "arrow_up_circle" | "arrow_up_circle_fill" | "arrow_up_doc" | "arrow_up_doc_fill" | "arrow_up_down" | "arrow_up_down_circle" | "arrow_up_down_circle_fill" | "arrow_up_down_square" | "arrow_up_down_square_fill" | "arrow_up_left" | "arrow_up_left_arrow_down_right" | "arrow_up_left_circle" | "arrow_up_left_circle_fill" | "arrow_up_left_square" | "arrow_up_left_square_fill" | "arrow_up_right" | "arrow_up_right_circle" | "arrow_up_right_circle_fill" | "arrow_up_right_diamond" | "arrow_up_right_diamond_fill" | "arrow_up_right_square" | "arrow_up_right_square_fill" | "arrow_up_square" | "arrow_up_square_fill" | "arrow_up_to_line" | "arrow_up_to_line_alt" | "arrow_uturn_down" | "arrow_uturn_down_circle" | "arrow_uturn_down_circle_fill" | "arrow_uturn_down_square" | "arrow_uturn_down_square_fill" | "arrow_uturn_left" | "arrow_uturn_left_circle" | "arrow_uturn_left_circle_fill" | "arrow_uturn_left_square" | "arrow_uturn_left_square_fill" | "arrow_uturn_right" | "arrow_uturn_right_circle" | "arrow_uturn_right_circle_fill" | "arrow_uturn_right_square" | "arrow_uturn_right_square_fill" | "arrow_uturn_up" | "arrow_uturn_up_circle" | "arrow_uturn_up_circle_fill" | "arrow_uturn_up_square" | "arrow_uturn_up_square_fill" | "arrowshape_turn_up_left" | "arrowshape_turn_up_left_2" | "arrowshape_turn_up_left_2_fill" | "arrowshape_turn_up_left_circle" | "arrowshape_turn_up_left_circle_fill" | "arrowshape_turn_up_left_fill" | "arrowshape_turn_up_right" | "arrowshape_turn_up_right_circle" | "arrowshape_turn_up_right_circle_fill" | "arrowshape_turn_up_right_fill" | "arrowtriangle_down" | "arrowtriangle_down_circle" | "arrowtriangle_down_circle_fill" | "arrowtriangle_down_fill" | "arrowtriangle_down_square" | "arrowtriangle_down_square_fill" | "arrowtriangle_left" | "arrowtriangle_left_circle" | "arrowtriangle_left_circle_fill" | "arrowtriangle_left_fill" | "arrowtriangle_left_square" | "arrowtriangle_left_square_fill" | "arrowtriangle_right" | "arrowtriangle_right_circle" | "arrowtriangle_right_circle_fill" | "arrowtriangle_right_fill" | "arrowtriangle_right_square" | "arrowtriangle_right_square_fill" | "arrowtriangle_up" | "arrowtriangle_up_circle" | "arrowtriangle_up_circle_fill" | "arrowtriangle_up_fill" | "arrowtriangle_up_square" | "arrowtriangle_up_square_fill" | "asterisk_circle" | "asterisk_circle_fill" | "at" | "at_badge_minus" | "at_badge_plus" | "at_circle" | "at_circle_fill" | "backward" | "backward_end" | "backward_end_alt" | "backward_end_alt_fill" | "backward_end_fill" | "backward_fill" | "badge_plus_radiowaves_right" | "bag" | "bag_badge_minus" | "bag_badge_plus" | "bag_fill" | "bag_fill_badge_minus" | "bag_fill_badge_plus" | "bandage" | "bandage_fill" | "barcode" | "barcode_viewfinder" | "bars" | "battery_0" | "battery_100" | "battery_25" | "bed_double" | "bed_double_fill" | "bell_circle" | "bell_circle_fill" | "bell_fill" | "bell_slash" | "bell_slash_fill" | "bin_xmark" | "bin_xmark_fill" | "bitcoin" | "bitcoin_circle" | "bitcoin_circle_fill" | "bold" | "bold_italic_underline" | "bold_underline" | "bolt" | "bolt_badge_a" | "bolt_badge_a_fill" | "bolt_circle" | "bolt_circle_fill" | "bolt_fill" | "bolt_horizontal" | "bolt_horizontal_circle" | "bolt_horizontal_circle_fill" | "bolt_horizontal_fill" | "bolt_slash" | "bolt_slash_fill" | "book_circle" | "book_circle_fill" | "book_fill" | "bookmark_fill" | "briefcase" | "briefcase_fill" | "bubble_left" | "bubble_left_bubble_right" | "bubble_left_bubble_right_fill" | "bubble_left_fill" | "bubble_middle_bottom" | "bubble_middle_bottom_fill" | "bubble_middle_top" | "bubble_middle_top_fill" | "bubble_right" | "bubble_right_fill" | "building_2_fill" | "burn" | "burst" | "burst_fill" | "calendar" | "calendar_badge_minus" | "calendar_badge_plus" | "calendar_circle" | "calendar_circle_fill" | "calendar_today" | "camera" | "camera_circle" | "camera_circle_fill" | "camera_fill" | "camera_on_rectangle" | "camera_on_rectangle_fill" | "camera_rotate" | "camera_rotate_fill" | "camera_viewfinder" | "capslock" | "capslock_fill" | "capsule" | "capsule_fill" | "captions_bubble" | "captions_bubble_fill" | "car_fill" | "cart" | "cart_badge_minus" | "cart_badge_plus" | "cart_fill" | "cart_fill_badge_minus" | "cart_fill_badge_plus" | "chart_bar" | "chart_bar_alt_fill" | "chart_bar_circle" | "chart_bar_circle_fill" | "chart_bar_fill" | "chart_bar_square" | "chart_bar_square_fill" | "chart_pie" | "chart_pie_fill" | "chat_bubble" | "chat_bubble_2" | "chat_bubble_2_fill" | "chat_bubble_fill" | "chat_bubble_text" | "chat_bubble_text_fill" | "checkmark" | "checkmark_alt" | "checkmark_alt_circle" | "checkmark_alt_circle_fill" | "checkmark_circle" | "checkmark_circle_fill" | "checkmark_rectangle" | "checkmark_rectangle_fill" | "checkmark_seal" | "checkmark_seal_fill" | "checkmark_shield" | "checkmark_shield_fill" | "checkmark_square" | "checkmark_square_fill" | "chevron_back" | "chevron_compact_down" | "chevron_compact_left" | "chevron_compact_right" | "chevron_compact_up" | "chevron_down" | "chevron_down_circle" | "chevron_down_circle_fill" | "chevron_down_square" | "chevron_down_square_fill" | "chevron_forward" | "chevron_left" | "chevron_left_2" | "chevron_left_circle" | "chevron_left_circle_fill" | "chevron_left_slash_chevron_right" | "chevron_left_square" | "chevron_left_square_fill" | "chevron_right" | "chevron_right_2" | "chevron_right_circle" | "chevron_right_circle_fill" | "chevron_right_square" | "chevron_right_square_fill" | "chevron_up" | "chevron_up_chevron_down" | "chevron_up_circle" | "chevron_up_circle_fill" | "chevron_up_square" | "chevron_up_square_fill" | "circle_bottomthird_split" | "circle_fill" | "circle_grid_3x3" | "circle_grid_3x3_fill" | "circle_grid_hex" | "circle_grid_hex_fill" | "circle_lefthalf_fill" | "circle_righthalf_fill" | "clear_fill" | "clock_fill" | "cloud" | "cloud_bolt" | "cloud_bolt_fill" | "cloud_bolt_rain" | "cloud_bolt_rain_fill" | "cloud_download" | "cloud_download_fill" | "cloud_drizzle" | "cloud_drizzle_fill" | "cloud_fill" | "cloud_fog" | "cloud_fog_fill" | "cloud_hail" | "cloud_hail_fill" | "cloud_heavyrain" | "cloud_heavyrain_fill" | "cloud_moon" | "cloud_moon_bolt" | "cloud_moon_bolt_fill" | "cloud_moon_fill" | "cloud_moon_rain" | "cloud_moon_rain_fill" | "cloud_rain" | "cloud_rain_fill" | "cloud_sleet" | "cloud_sleet_fill" | "cloud_snow" | "cloud_snow_fill" | "cloud_sun" | "cloud_sun_bolt" | "cloud_sun_bolt_fill" | "cloud_sun_fill" | "cloud_sun_rain" | "cloud_sun_rain_fill" | "cloud_upload" | "cloud_upload_fill" | "color_filter" | "color_filter_fill" | "command" | "compass" | "compass_fill" | "control" | "creditcard" | "creditcard_fill" | "crop" | "crop_rotate" | "cube" | "cube_box" | "cube_box_fill" | "cube_fill" | "cursor_rays" | "decrease_indent" | "decrease_quotelevel" | "delete_left" | "delete_left_fill" | "delete_right" | "delete_right_fill" | "desktopcomputer" | "device_desktop" | "device_laptop" | "device_phone_landscape" | "device_phone_portrait" | "dial" | "dial_fill" | "divide" | "divide_circle" | "divide_circle_fill" | "divide_square" | "divide_square_fill" | "doc" | "doc_append" | "doc_chart" | "doc_chart_fill" | "doc_checkmark" | "doc_checkmark_fill" | "doc_circle" | "doc_circle_fill" | "doc_fill" | "doc_on_clipboard" | "doc_on_clipboard_fill" | "doc_on_doc" | "doc_on_doc_fill" | "doc_person" | "doc_person_fill" | "doc_plaintext" | "doc_richtext" | "doc_text" | "doc_text_fill" | "doc_text_search" | "doc_text_viewfinder" | "dot_radiowaves_left_right" | "dot_radiowaves_right" | "dot_square" | "dot_square_fill" | "download_circle" | "download_circle_fill" | "drop" | "drop_fill" | "drop_triangle" | "drop_triangle_fill" | "ear" | "eject" | "eject_fill" | "ellipses_bubble" | "ellipses_bubble_fill" | "ellipsis_circle" | "ellipsis_circle_fill" | "ellipsis_vertical" | "ellipsis_vertical_circle" | "ellipsis_vertical_circle_fill" | "envelope" | "envelope_badge" | "envelope_badge_fill" | "envelope_circle" | "envelope_circle_fill" | "envelope_fill" | "envelope_open" | "envelope_open_fill" | "equal" | "equal_circle" | "equal_circle_fill" | "equal_square" | "equal_square_fill" | "escape" | "exclamationmark" | "exclamationmark_bubble" | "exclamationmark_bubble_fill" | "exclamationmark_circle" | "exclamationmark_circle_fill" | "exclamationmark_octagon" | "exclamationmark_octagon_fill" | "exclamationmark_shield" | "exclamationmark_shield_fill" | "exclamationmark_square" | "exclamationmark_square_fill" | "exclamationmark_triangle" | "exclamationmark_triangle_fill" | "eye_fill" | "eye_slash" | "eye_slash_fill" | "eyedropper" | "eyedropper_full" | "eyedropper_halffull" | "eyeglasses" | "f_cursive" | "f_cursive_circle" | "f_cursive_circle_fill" | "film" | "film_fill" | "flag_circle" | "flag_circle_fill" | "flag_fill" | "flag_slash" | "flag_slash_fill" | "flame" | "flame_fill" | "floppy_disk" | "flowchart" | "flowchart_fill" | "folder_badge_minus" | "folder_badge_person_crop" | "folder_badge_plus" | "folder_circle" | "folder_circle_fill" | "folder_fill" | "folder_fill_badge_minus" | "folder_fill_badge_person_crop" | "folder_fill_badge_plus" | "forward_end" | "forward_end_alt" | "forward_end_alt_fill" | "forward_end_fill" | "forward_fill" | "function" | "fx" | "gamecontroller" | "gamecontroller_alt_fill" | "gamecontroller_fill" | "gauge" | "gauge_badge_minus" | "gauge_badge_plus" | "gear_alt" | "gear_alt_fill" | "gift" | "gift_alt" | "gift_alt_fill" | "gift_fill" | "globe" | "gobackward" | "gobackward_10" | "gobackward_15" | "gobackward_30" | "gobackward_45" | "gobackward_60" | "gobackward_75" | "gobackward_90" | "gobackward_minus" | "goforward" | "goforward_10" | "goforward_15" | "goforward_30" | "goforward_45" | "goforward_60" | "goforward_75" | "goforward_90" | "goforward_plus" | "graph_circle" | "graph_circle_fill" | "graph_square" | "graph_square_fill" | "greaterthan" | "greaterthan_circle" | "greaterthan_circle_fill" | "greaterthan_square" | "greaterthan_square_fill" | "grid" | "grid_circle" | "grid_circle_fill" | "guitars" | "hammer" | "hammer_fill" | "hand_draw" | "hand_draw_fill" | "hand_point_left" | "hand_point_left_fill" | "hand_point_right" | "hand_point_right_fill" | "hand_raised" | "hand_raised_fill" | "hand_raised_slash" | "hand_raised_slash_fill" | "hand_thumbsdown" | "hand_thumbsdown_fill" | "hand_thumbsup" | "hand_thumbsup_fill" | "hare" | "hare_fill" | "headphones" | "heart_circle" | "heart_circle_fill" | "heart_fill" | "heart_slash" | "heart_slash_circle" | "heart_slash_circle_fill" | "heart_slash_fill" | "helm" | "hexagon" | "hexagon_fill" | "hifispeaker" | "hifispeaker_fill" | "hourglass" | "hourglass_bottomhalf_fill" | "hourglass_tophalf_fill" | "house" | "house_alt" | "house_alt_fill" | "house_fill" | "hurricane" | "increase_indent" | "increase_quotelevel" | "infinite" | "info_circle" | "info_circle_fill" | "italic" | "keyboard" | "keyboard_chevron_compact_down" | "largecircle_fill_circle" | "lasso" | "layers" | "layers_alt" | "layers_alt_fill" | "layers_fill" | "leaf_arrow_circlepath" | "lessthan" | "lessthan_circle" | "lessthan_circle_fill" | "lessthan_square" | "lessthan_square_fill" | "light_max" | "light_min" | "lightbulb" | "lightbulb_fill" | "lightbulb_slash" | "lightbulb_slash_fill" | "line_horizontal_3" | "line_horizontal_3_decrease" | "line_horizontal_3_decrease_circle" | "line_horizontal_3_decrease_circle_fill" | "link" | "link_circle" | "link_circle_fill" | "list_bullet" | "list_bullet_below_rectangle" | "list_bullet_indent" | "list_dash" | "list_number" | "list_number_rtl" | "location_circle" | "location_circle_fill" | "location_fill" | "location_north" | "location_north_fill" | "location_north_line" | "location_north_line_fill" | "location_slash" | "location_slash_fill" | "lock" | "lock_circle" | "lock_circle_fill" | "lock_fill" | "lock_open" | "lock_open_fill" | "lock_rotation" | "lock_rotation_open" | "lock_shield" | "lock_shield_fill" | "lock_slash" | "lock_slash_fill" | "macwindow" | "map" | "map_fill" | "map_pin" | "map_pin_ellipse" | "map_pin_slash" | "memories" | "memories_badge_minus" | "memories_badge_plus" | "metronome" | "mic_circle" | "mic_circle_fill" | "mic_fill" | "mic_slash" | "mic_slash_fill" | "minus" | "minus_circle" | "minus_circle_fill" | "minus_rectangle" | "minus_rectangle_fill" | "minus_slash_plus" | "minus_square" | "minus_square_fill" | "money_dollar" | "money_dollar_circle" | "money_dollar_circle_fill" | "money_euro" | "money_euro_circle" | "money_euro_circle_fill" | "money_pound" | "money_pound_circle" | "money_pound_circle_fill" | "money_rubl" | "money_rubl_circle" | "money_rubl_circle_fill" | "money_yen" | "money_yen_circle" | "money_yen_circle_fill" | "moon" | "moon_circle" | "moon_circle_fill" | "moon_fill" | "moon_stars" | "moon_stars_fill" | "moon_zzz" | "moon_zzz_fill" | "move" | "multiply" | "multiply_circle" | "multiply_circle_fill" | "multiply_square" | "multiply_square_fill" | "music_albums" | "music_albums_fill" | "music_house" | "music_house_fill" | "music_mic" | "music_note_2" | "music_note_list" | "nosign" | "number" | "number_circle" | "number_circle_fill" | "number_square" | "number_square_fill" | "option" | "paintbrush" | "paintbrush_fill" | "pano" | "pano_fill" | "paperclip" | "paperplane" | "paperplane_fill" | "paragraph" | "pause_circle" | "pause_circle_fill" | "pause_fill" | "pause_rectangle" | "pause_rectangle_fill" | "pencil_circle" | "pencil_circle_fill" | "pencil_ellipsis_rectangle" | "pencil_outline" | "pencil_slash" | "percent" | "person_2" | "person_2_alt" | "person_2_fill" | "person_2_square_stack" | "person_2_square_stack_fill" | "person_3" | "person_3_fill" | "person_alt" | "person_alt_circle" | "person_alt_circle_fill" | "person_badge_minus" | "person_badge_minus_fill" | "person_badge_plus" | "person_badge_plus_fill" | "person_circle" | "person_circle_fill" | "person_crop_circle" | "person_crop_circle_badge_checkmark" | "person_crop_circle_badge_exclam" | "person_crop_circle_badge_minus" | "person_crop_circle_badge_plus" | "person_crop_circle_badge_xmark" | "person_crop_circle_fill" | "person_crop_circle_fill_badge_checkmark" | "person_crop_circle_fill_badge_exclam" | "person_crop_circle_fill_badge_minus" | "person_crop_circle_fill_badge_plus" | "person_crop_circle_fill_badge_xmark" | "person_crop_rectangle" | "person_crop_rectangle_fill" | "person_crop_square" | "person_crop_square_fill" | "person_fill" | "personalhotspot" | "perspective" | "phone_arrow_down_left" | "phone_arrow_right" | "phone_arrow_up_right" | "phone_badge_plus" | "phone_circle" | "phone_circle_fill" | "phone_down" | "phone_down_circle" | "phone_down_circle_fill" | "phone_down_fill" | "phone_fill" | "phone_fill_arrow_down_left" | "phone_fill_arrow_right" | "phone_fill_arrow_up_right" | "phone_fill_badge_plus" | "photo" | "photo_fill" | "photo_fill_on_rectangle_fill" | "photo_on_rectangle" | "piano" | "pin" | "pin_fill" | "pin_slash" | "pin_slash_fill" | "placemark" | "placemark_fill" | "play" | "play_circle" | "play_circle_fill" | "play_fill" | "play_rectangle" | "play_rectangle_fill" | "playpause" | "playpause_fill" | "plus" | "plus_app" | "plus_app_fill" | "plus_bubble" | "plus_bubble_fill" | "plus_circle" | "plus_circle_fill" | "plus_rectangle" | "plus_rectangle_fill" | "plus_rectangle_fill_on_rectangle_fill" | "plus_rectangle_on_rectangle" | "plus_slash_minus" | "plus_square" | "plus_square_fill" | "plus_square_fill_on_square_fill" | "plus_square_on_square" | "plusminus" | "plusminus_circle" | "plusminus_circle_fill" | "power" | "printer" | "printer_fill" | "projective" | "purchased" | "purchased_circle" | "purchased_circle_fill" | "qrcode" | "qrcode_viewfinder" | "question" | "question_circle" | "question_circle_fill" | "question_diamond" | "question_diamond_fill" | "question_square" | "question_square_fill" | "quote_bubble" | "quote_bubble_fill" | "radiowaves_left" | "radiowaves_right" | "rays" | "recordingtape" | "rectangle" | "rectangle_3_offgrid" | "rectangle_3_offgrid_fill" | "rectangle_arrow_up_right_arrow_down_left" | "rectangle_arrow_up_right_arrow_down_left_slash" | "rectangle_badge_checkmark" | "rectangle_badge_xmark" | "rectangle_compress_vertical" | "rectangle_dock" | "rectangle_expand_vertical" | "rectangle_fill" | "rectangle_fill_badge_checkmark" | "rectangle_fill_badge_xmark" | "rectangle_fill_on_rectangle_angled_fill" | "rectangle_fill_on_rectangle_fill" | "rectangle_grid_1x2" | "rectangle_grid_1x2_fill" | "rectangle_grid_2x2" | "rectangle_grid_2x2_fill" | "rectangle_grid_3x2" | "rectangle_grid_3x2_fill" | "rectangle_on_rectangle" | "rectangle_on_rectangle_angled" | "rectangle_paperclip" | "rectangle_split_3x1" | "rectangle_split_3x1_fill" | "rectangle_split_3x3" | "rectangle_split_3x3_fill" | "rectangle_stack" | "rectangle_stack_badge_minus" | "rectangle_stack_badge_person_crop" | "rectangle_stack_badge_plus" | "rectangle_stack_fill" | "rectangle_stack_fill_badge_minus" | "rectangle_stack_fill_badge_person_crop" | "rectangle_stack_fill_badge_plus" | "rectangle_stack_person_crop" | "rectangle_stack_person_crop_fill" | "repeat" | "repeat_1" | "resize" | "resize_h" | "resize_v" | "return_icon" | "rhombus" | "rhombus_fill" | "rocket" | "rocket_fill" | "rosette" | "rotate_left" | "rotate_left_fill" | "rotate_right" | "rotate_right_fill" | "scissors" | "scissors_alt" | "scope" | "scribble" | "search_circle" | "search_circle_fill" | "selection_pin_in_out" | "shield" | "shield_fill" | "shield_lefthalf_fill" | "shield_slash" | "shield_slash_fill" | "shift" | "shift_fill" | "sidebar_left" | "sidebar_right" | "signature" | "skew" | "slash_circle" | "slash_circle_fill" | "slider_horizontal_3" | "slider_horizontal_below_rectangle" | "slowmo" | "smallcircle_circle" | "smallcircle_circle_fill" | "smallcircle_fill_circle" | "smallcircle_fill_circle_fill" | "smiley" | "smiley_fill" | "smoke" | "smoke_fill" | "snow" | "sort_down" | "sort_down_circle" | "sort_down_circle_fill" | "sort_up" | "sort_up_circle" | "sort_up_circle_fill" | "sparkles" | "speaker" | "speaker_1" | "speaker_1_fill" | "speaker_2" | "speaker_2_fill" | "speaker_3" | "speaker_3_fill" | "speaker_fill" | "speaker_slash" | "speaker_slash_fill" | "speaker_slash_fill_rtl" | "speaker_slash_rtl" | "speaker_zzz" | "speaker_zzz_fill" | "speaker_zzz_fill_rtl" | "speaker_zzz_rtl" | "speedometer" | "sportscourt" | "sportscourt_fill" | "square" | "square_arrow_down" | "square_arrow_down_fill" | "square_arrow_down_on_square" | "square_arrow_down_on_square_fill" | "square_arrow_left" | "square_arrow_left_fill" | "square_arrow_right" | "square_arrow_right_fill" | "square_arrow_up" | "square_arrow_up_fill" | "square_arrow_up_on_square" | "square_arrow_up_on_square_fill" | "square_favorites" | "square_favorites_alt" | "square_favorites_alt_fill" | "square_favorites_fill" | "square_fill" | "square_fill_line_vertical_square" | "square_fill_line_vertical_square_fill" | "square_fill_on_circle_fill" | "square_fill_on_square_fill" | "square_grid_2x2" | "square_grid_2x2_fill" | "square_grid_3x2" | "square_grid_3x2_fill" | "square_grid_4x3_fill" | "square_lefthalf_fill" | "square_line_vertical_square" | "square_line_vertical_square_fill" | "square_list" | "square_list_fill" | "square_on_circle" | "square_on_square" | "square_pencil" | "square_pencil_fill" | "square_righthalf_fill" | "square_split_1x2" | "square_split_1x2_fill" | "square_split_2x1" | "square_split_2x1_fill" | "square_split_2x2" | "square_split_2x2_fill" | "square_stack" | "square_stack_3d_down_dottedline" | "square_stack_3d_down_right" | "square_stack_3d_down_right_fill" | "square_stack_3d_up" | "square_stack_3d_up_fill" | "square_stack_3d_up_slash" | "square_stack_3d_up_slash_fill" | "square_stack_fill" | "squares_below_rectangle" | "star" | "star_circle" | "star_circle_fill" | "star_fill" | "star_lefthalf_fill" | "star_slash" | "star_slash_fill" | "staroflife" | "staroflife_fill" | "stop" | "stop_circle" | "stop_circle_fill" | "stop_fill" | "stopwatch" | "stopwatch_fill" | "strikethrough" | "suit_club" | "suit_club_fill" | "suit_diamond" | "suit_diamond_fill" | "suit_heart" | "suit_heart_fill" | "suit_spade" | "suit_spade_fill" | "sum" | "sun_dust" | "sun_dust_fill" | "sun_haze" | "sun_haze_fill" | "sun_max" | "sun_max_fill" | "sun_min" | "sun_min_fill" | "sunrise" | "sunrise_fill" | "sunset" | "sunset_fill" | "t_bubble" | "t_bubble_fill" | "table" | "table_badge_more" | "table_badge_more_fill" | "table_fill" | "tag_circle" | "tag_circle_fill" | "tag_fill" | "text_aligncenter" | "text_alignleft" | "text_alignright" | "text_append" | "text_badge_checkmark" | "text_badge_minus" | "text_badge_plus" | "text_badge_star" | "text_badge_xmark" | "text_bubble" | "text_bubble_fill" | "text_cursor" | "text_insert" | "text_justify" | "text_justifyleft" | "text_justifyright" | "text_quote" | "textbox" | "textformat" | "textformat_123" | "textformat_abc" | "textformat_abc_dottedunderline" | "textformat_alt" | "textformat_size" | "textformat_subscript" | "textformat_superscript" | "thermometer" | "thermometer_snowflake" | "thermometer_sun" | "ticket" | "ticket_fill" | "tickets" | "tickets_fill" | "timelapse" | "timer" | "timer_fill" | "today" | "today_fill" | "tornado" | "tortoise" | "tortoise_fill" | "tram_fill" | "trash" | "trash_circle" | "trash_circle_fill" | "trash_fill" | "trash_slash" | "trash_slash_fill" | "tray" | "tray_2" | "tray_2_fill" | "tray_arrow_down" | "tray_arrow_down_fill" | "tray_arrow_up" | "tray_arrow_up_fill" | "tray_fill" | "tray_full" | "tray_full_fill" | "tree" | "triangle" | "triangle_fill" | "triangle_lefthalf_fill" | "triangle_righthalf_fill" | "tropicalstorm" | "tuningfork" | "tv" | "tv_circle" | "tv_circle_fill" | "tv_fill" | "tv_music_note" | "tv_music_note_fill" | "uiwindow_split_2x1" | "umbrella" | "umbrella_fill" | "underline" | "upload_circle" | "upload_circle_fill" | "videocam" | "videocam_circle" | "videocam_circle_fill" | "videocam_fill" | "view_2d" | "view_3d" | "viewfinder" | "viewfinder_circle" | "viewfinder_circle_fill" | "wand_rays" | "wand_rays_inverse" | "wand_stars" | "wand_stars_inverse" | "waveform" | "waveform_circle" | "waveform_circle_fill" | "waveform_path" | "waveform_path_badge_minus" | "waveform_path_badge_plus" | "waveform_path_ecg" | "wifi" | "wifi_exclamationmark" | "wifi_slash" | "wind" | "wind_snow" | "wrench" | "wrench_fill" | "xmark" | "xmark_circle" | "xmark_circle_fill" | "xmark_octagon" | "xmark_octagon_fill" | "xmark_rectangle" | "xmark_rectangle_fill" | "xmark_seal" | "xmark_seal_fill" | "xmark_shield" | "xmark_shield_fill" | "xmark_square" | "xmark_square_fill" | "zoom_in" | "zoom_out" | "zzz";

type CupertinoContextMenuActionProps = {
  isDefaultAction?: boolean;
  isDestructiveAction?: boolean;
  onPressed?: () => void;
  trailingIcon?: CupertinoIcons;
  children: VirtualNode;
};
declare const CupertinoContextMenuAction: FunctionComponent<CupertinoContextMenuActionProps>;

type CupertinoDatePickerMode = 'date' | 'dateAndTime' | 'monthYear' | 'time';
type DatePickerDateOrder = 
/**
*  Order of the columns, from left to right: day, month, year.
*
*  Example: 12 | March | 1996.
*/
'dmy'
/**
*  Order of the columns, from left to right: month, day, year.
*
*  Example: March | 12 | 1996.
*/
| 'mdy'
/**
*  Order of the columns, from left to right: year, month, day.
*
*  Example: 1996 | March | 12.
*/
| 'ymd'
/**
*  Order of the columns, from left to right: year, day, month.
*
*  Example: 1996 | 12 | March.
*/
| 'ydm';
type CupertinoDatePickerProps = {
  mode?: CupertinoDatePickerMode;
  onDateTimeChanged?: (timestamp: number) => void;
  /**
   * timestamp
   */
  initialDateTime?: number;
  /**
   * timestamp
   */
  minimumDate?: number;
  /**
   * timestamp
   */
  maximumDate?: number;
  /**
   *  [int] Default: 1
   */
  minimumYear?: number;
  /**
   * [int]
   */
  maximumYear?: number;
  /**
   * [int] Default: 1
   */
  minuteInterval?: number;
  use24hFormat?: boolean;
  dateOrder?: DatePickerDateOrder;
  backgroundColor?: Color;
  showDayOfWeek?: boolean;
  /**
   * The uniform height of all children.
   *
   * All children will be given the [BoxConstraints] to match this exact height. Must be a positive value.
   *
   * Defaults to a value that matches the default iOS date picker wheel.
   */
  itemExtent?: number;
};
declare const CupertinoDatePicker: FunctionComponent<CupertinoDatePickerProps>;

type CupertinoDialogActionProps = {
  isDefaultAction?: boolean;
  isDestructiveAction?: boolean;
  textStyle?: TextStyle;
  onPressed?: () => void;
  children: VirtualNode;
};
declare const CupertinoDialogAction: FunctionComponent<CupertinoDialogActionProps>;

type CupertinoFormRowProps = {
  padding?: EdgeInsets | number;
  prefix?: VirtualNode;
  helper?: VirtualNode;
  error?: VirtualNode;
  children: VirtualNode;
};
declare const CupertinoFormRow: FunctionComponent<CupertinoFormRowProps>;

type CupertinoFormSectionProps = BoxDecoration & {
  insetGrouped?: boolean;
  margin?: EdgeInsets | number;
  clipBehavior?: Clip;
  backgroundColor?: Color;
  header?: VirtualNode;
  footer?: VirtualNode;
  children: (VirtualNode | undefined | null | (VirtualNode | undefined | null)[])[] | VirtualNode;
};
declare const CupertinoFormSection: FunctionComponent<CupertinoFormSectionProps>;

type CupertinoListSectionProps = BoxDecoration & {
  insetGrouped?: boolean;
  margin?: number | EdgeInsets;
  backgroundColor?: Color;
  clipBehavior?: Clip;
  dividerMargin?: number;
  additionalDividerMargin?: number;
  topMargin?: number;
  hasLeading?: boolean;
  separatorColor?: Color;
  header?: VirtualNode;
  footer?: VirtualNode;
  children?: (VirtualNode | undefined | null | (VirtualNode | undefined | null)[])[] | VirtualNode;
};
declare const CupertinoListSection: FunctionComponent<CupertinoListSectionProps>;

type CupertinoListTileProps = {
  notched?: boolean;
  padding?: number | EdgeInsets;
  backgroundColor?: Color;
  backgroundColorActivated?: Color;
  onTap?: () => void;
  subtitle?: VirtualNode;
  additionalInfo?: VirtualNode;
  leading?: VirtualNode;
  leadingSize?: number;
  leadingToTitle?: number;
  trailing?: VirtualNode;
  title: VirtualNode;
};
declare const CupertinoListTile: FunctionComponent<CupertinoListTileProps>;

declare const CupertinoListTileChevron: FunctionComponent<{}>;

type CupertinoNavigationBarProps = {
  automaticallyImplyLeading?: boolean;
  automaticallyImplyMiddle?: boolean;
  previousPageTitle?: string;
  border?: BoxDecoration['border'];
  backgroundColor?: Color;
  brightness?: Brightness;
  padding?: number | EdgeInsetsDirectional;
  transitionBetweenRoutes?: boolean;
  leading?: VirtualNode;
  middle?: VirtualNode;
  trailing?: VirtualNode;
};
declare const CupertinoNavigationBar: FunctionComponent<CupertinoNavigationBarProps>;

type CupertinoNavigationBarBackButtonProps = {
  color?: Color;
  previousPageTitle?: string;
  onPressed?: () => void;
};
declare const CupertinoNavigationBarBackButton: FunctionComponent<CupertinoNavigationBarBackButtonProps>;

type CupertinoPageScaffoldProps = {
  backgroundColor?: Color;
  resizeToAvoidBottomInset?: boolean;
  /**
   * Must use `<CupertinoNavigationBar />`
   */
  navigationBar?: VirtualNode;
  children: VirtualNode;
};
declare const CupertinoPageScaffold: FunctionComponent<CupertinoPageScaffoldProps>;

type CupertinoPickerProps = {
  diameterRatio?: number;
  backgroundColor?: Color;
  offAxisFraction?: number;
  useMagnifier?: boolean;
  magnification?: number;
  squeeze?: number;
  looping?: boolean;
  itemExtent: number;
  selectionOverlay?: VirtualNode;
  onSelectedItemChanged?: (index: number) => void;
  children: (VirtualNode | undefined | null | (VirtualNode | undefined | null)[])[] | VirtualNode;
};
declare const CupertinoPicker: FunctionComponent<CupertinoPickerProps>;

type CupertinoPickerDefaultSelectionOverlayProps = {
  background?: Color;
  capStartEdge?: boolean;
  capEndEdge?: boolean;
};
declare const CupertinoPickerDefaultSelectionOverlay: FunctionComponent<CupertinoPickerDefaultSelectionOverlayProps>;

type CupertinoScrollerBarProps = {
  thumbVisibility?: boolean;
  thickness?: number;
  thicknessWhileDragging?: number;
  radius?: number;
  radiusWhileDragging?: number;
  scrollbarOrientation?: ScrollOrientation;
  children: VirtualNode;
};
declare const CupertinoScrollerBar: FunctionComponent<CupertinoScrollerBarProps>;

type CupertinoSearchTextFieldProps = {
  value?: string;
  placeholder?: string;
  tapOutsideUnfocus?: boolean;
  onChanged?: (value: string) => void;
  autofocus?: boolean;
  autocorrect?: boolean;
  decoration?: BoxDecoration;
  backgroundColor?: Color;
  borderRadius?: BorderRadius;
  padding?: number | EdgeInsets;
  enabled?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitted?: (value: string) => void;
  keyboardType?: TextInputType;
  textStyle?: TextStyle;
  placeholderStyle?: TextStyle;
  itemColor?: Color;
  itemSize?: number;
};
declare const CupertinoSearchTextField: FunctionComponent<CupertinoSearchTextFieldProps>;

type CupertinoSegmentedControlProps = {
  children: (VirtualNode | undefined | null | (VirtualNode | undefined | null)[])[] | VirtualNode;
  groupValue?: number;
  onValueChanged: (value: number) => void;
  unselectedColor?: Color;
  selectedColor?: Color;
  borderColor?: Color;
  pressedColor?: Color;
  padding?: number | EdgeInsets;
};
declare const CupertinoSegmentedControl: FunctionComponent<CupertinoSegmentedControlProps>;

type CupertinoSliderProps = {
  value: number;
  onChanged?: (value: number) => void;
  onChangeStart?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  min?: number;
  max?: number;
  divisions?: number;
  activeColor?: Color;
  thumbColor?: Color;
};
declare const CupertinoSlider: FunctionComponent<CupertinoSliderProps>;

type CupertinoSlidingSegmentedControlProps = {
  value: number;
  onChanged: (value: number) => void;
  children: VirtualNode[];
  padding?: EdgeInsets | number;
  thumbColor?: Color;
  backgroundColor?: Color;
};
declare const CupertinoSlidingSegmentedControl: FunctionComponent<CupertinoSlidingSegmentedControlProps>;

type CupertinoSliverNavigationBarProps = {
  automaticallyImplyLeading?: boolean;
  automaticallyImplyTitle?: boolean;
  stretch?: boolean;
  previousPageTitle?: string;
  border?: BoxDecoration['border'];
  backgroundColor?: Color;
  brightness?: Brightness;
  padding?: number | EdgeInsetsDirectional;
  transitionBetweenRoutes?: boolean;
  leading?: VirtualNode;
  middle?: VirtualNode;
  trailing?: VirtualNode;
};
declare const CupertinoSliverNavigationBar: FunctionComponent<CupertinoSliverNavigationBarProps>;

type CupertinoSliverRefreshControlProps = {
  refreshTriggerPullDistance?: number;
  refreshIndicatorExtent?: number;
  onRefresh?: () => Promise<void>;
};
declare const CupertinoSliverRefreshControl: FunctionComponent<CupertinoSliverRefreshControlProps>;

type CupertinoSwitchProps = {
  value: boolean;
  onChanged?: (value: boolean) => void;
  activeColor?: Color;
  trackColor?: Color;
  thumbColor?: Color;
  focusColor?: Color;
  onLabelColor?: Color;
  offLabelColor?: Color;
  applyTheme?: boolean;
  autofocus?: boolean;
};
declare const CupertinoSwitch: FunctionComponent<CupertinoSwitchProps>;

type CupertinoTabBarProps = {
  items: (VirtualNode | undefined | null | (VirtualNode | undefined | null)[])[] | VirtualNode;
  onTap?: (index: number) => void;
  iconSize?: number;
  height?: number;
  currentIndex?: number;
  backgroundColor?: Color;
  activeColor?: Color;
  inactiveColor?: Color;
  border?: BoxDecoration['border'];
};
declare const CupertinoTabBar: FunctionComponent<CupertinoTabBarProps>;

type CupertinoTextFieldProps = {
  value?: string;
  placeholder?: string;
  autocorrect?: boolean;
  autofocus?: boolean;
  showCursor?: boolean;
  readOnly?: boolean;
  obscureText?: boolean;
  enabled?: boolean;
  onChanged?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  keyboardType?: TextInputType;
  textAlign?: TextAlign;
  textStyle?: TextStyle;
  placeholderStyle?: TextStyle;
  decoration?: BoxDecoration;
  cursorColor?: Color;
  cursorHeight?: number;
  cursorWidth?: number;
  cursorOpacityAnimates?: boolean;
  cursorRadius?: number;
  tapOutsideUnfocus?: boolean;
  minLines?: number;
  maxLines?: number;
  maxLength?: number;
  enableSuggestions?: boolean;
  expands?: boolean;
  obscuringCharacter?: string;
  prefix?: VirtualNode;
  suffix?: VirtualNode;
  prefixMode?: OverlayVisibilityMode;
  suffixMode?: OverlayVisibilityMode;
  clearButtonMode?: OverlayVisibilityMode;
};
declare const CupertinoTextField: FunctionComponent<CupertinoTextFieldProps>;

type CupertinoTimerPickerMode = 'hm' | 'ms' | 'hms';
type CupertinoTimerPickerProps = {
  mode?: CupertinoTimerPickerMode;
  onTimerDurationChanged: (durationInMilliseconds: number) => void;
  initialTimerDuration?: number;
  minuteInterval?: number;
  secondInterval?: number;
  alignment?: Alignment;
  backgroundColor?: Color;
  itemExtent?: number;
};
declare const CupertinoTimerPicker: FunctionComponent<CupertinoTimerPickerProps>;

type TransformRotateProps = {
  /**
   * -math.pi / 12.0,
   */
  angle: number;
  origin?: Offset;
  alignment?: Alignment;
  transformHitTests?: boolean;
  filterQuality?: FilterQuality;
  children?: VirtualNode;
};
declare const TransformRotate: FunctionComponent<TransformRotateProps>;

type TransformScaleProps = {
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  origin?: Offset;
  alignment?: Alignment;
  transformHitTests?: boolean;
  filterQuality?: FilterQuality;
  children?: VirtualNode;
};
declare const TransformScale: FunctionComponent<TransformScaleProps>;

type TransformTranslateProps = {
  offset: Offset;
  transformHitTests?: boolean;
  filterQuality?: FilterQuality;
  children?: VirtualNode;
};
declare const TransformTranslate: FunctionComponent<TransformTranslateProps>;

type AbsorbPointerProps = {
  absorbing?: boolean;
  children?: VirtualNode;
};
declare const AbsorbPointer: FunctionComponent<AbsorbPointerProps>;

type AspectRatioProps = {
  aspectRatio: number;
  children?: VirtualNode;
};
declare const AspectRatio: FunctionComponent<AspectRatioProps>;

type AutoSizeTextProps = TextStyle & {
  children: string | number | boolean | Array<string | number | boolean>;
  textAlign?: TextAlign;
  textDirection?: TextDirection;
  softWrap?: boolean;
  wrapWords?: boolean;
  textScaleFactor?: number;
  minFontSize?: number;
  maxFontSize?: number;
  maxLines?: number;
  stepGranularity?: number;
  presetFontSizes?: number[];
  semanticsLabel?: string;
  textWidthBasis?: TextWidthBasis;
  selectionColor?: Color;
  structStyle?: StrutStyle;
  overflowReplacement?: VirtualNode;
};
declare const AutoSizeText: FunctionComponent<AutoSizeTextProps>;

type BackdropFilterProps = {
  filter: ImageFilter;
  blendMode?: BlendMode;
  children?: VirtualNode;
};
declare const BackdropFilter: FunctionComponent<BackdropFilterProps>;

type BaselineProps = {
  baseline: number;
  baselineType: TextBaseLine;
  children?: VirtualNode;
};
declare const Baseline: FunctionComponent<BaselineProps>;

type BottomNavigationBarItemProps = {
  label?: string;
  tooltip?: string;
  icon?: VirtualNode;
  activeIcon?: VirtualNode;
};
declare const BottomNavigationBarItem: FunctionComponent<BottomNavigationBarItemProps>;

type CSSFilterMatrix = {
  type: 'contrast' | 'blur' | 'brightness' | 'grayscale' | 'hueRotate' | 'invert' | 'opacity' | 'saturate' | 'sepia';
  value?: number;
};
type CSSFilterProps = {
  filters: CSSFilterMatrix[];
  children: VirtualNode;
};
declare const CSSFilter: FunctionComponent<CSSFilterProps>;

type CSSFilterPresetsEffect = 'ins1977' | 'ins1977V2' | 'insAden' | 'insAmaro' | 'insAshby' | 'insBrannan' | 'insBrooklyn' | 'insClarendon' | 'insDogpatch' | 'insEarlybird' | 'insGingham' | 'insHelena' | 'insHudson' | 'insInkwell' | 'insInkwellV2' | 'insJuno' | 'insKelvin' | 'insLark' | 'insLofi' | 'insLudwig' | 'insMaven' | 'insMayfair' | 'insMoon' | 'insMoonV2' | 'insNashville' | 'insNashvilleV2' | 'insPerpetua' | 'insPoprocket' | 'insReyes' | 'insRise' | 'insSierra' | 'insSkyline' | 'insSlumber' | 'insStinson' | 'insSutro' | 'insToaster' | 'insToasterV2' | 'insValencia' | 'insVesper' | 'insWalden' | 'insWaldenV2' | 'insWillow' | 'insXpro2' | 'origin';
type CSSFilterPresetsProps = {
  effect: CSSFilterPresetsEffect;
  children: VirtualNode;
};
declare const CSSFilterPresets: FunctionComponent<CSSFilterPresetsProps>;

type CenterProps = {
  widthFactor?: number;
  heightFactor?: number;
  children?: VirtualNode;
};
declare const Center: FunctionComponent<CenterProps>;

type CircularProgressIndicatorProps = {
  value?: number;
  backgroundColor?: Color;
  color?: Color;
  strokeWidth?: number;
  /**
   * -1.0 ~ 1.0
   */
  strokeAlign?: number;
  strokeCap?: StrokeCap;
  semanticsLabel?: string;
  semanticsValue?: string;
};
declare const CircularProgressIndicator: FunctionComponent<CircularProgressIndicatorProps>;

type ClipOvalProps = {
  clipBehavior?: Clip;
  children?: VirtualNode;
};
declare const ClipOval: FunctionComponent<ClipOvalProps>;

type ClipRRectProps = {
  clipBehavior?: Clip;
  borderRadius?: number | BorderRadius;
  children?: VirtualNode;
};
declare const ClipRRect: FunctionComponent<ClipRRectProps>;

type ClipRectProps = {
  clipBehavior?: Clip;
  children?: VirtualNode;
};
declare const ClipRect: FunctionComponent<ClipRectProps>;

type ColumnProps = {
  mainAxisAlignment?: MainAxisAlignment;
  crossAxisAlignment?: CrossAxisAlignment;
  mainAxisSize?: MainAxisSize;
  textBaseline?: TextBaseLine;
  textDirection?: TextDirection;
  verticalDirection?: VerticalDirection;
  children?: (VirtualNode | undefined | null | (VirtualNode | undefined | null)[])[] | VirtualNode;
};
declare const Column: FunctionComponent<ColumnProps>;

declare class LayerLink {
  readonly key: string;
  constructor(key: string);
}
declare function useLayerLink(): LayerLink;
type CompositedTransformTargetProps = {
  link: LayerLink;
  children?: VirtualNode;
};
declare const CompositedTransformTarget: FunctionComponent<CompositedTransformTargetProps>;

type CompositedTransformFollowerProps = {
  link: LayerLink;
  showWhenUnlinked?: boolean;
  offset?: Offset;
  targetAnchor?: Alignment;
  followerAnchor?: Alignment;
  children?: VirtualNode;
};
declare const CompositedTransformFollower: FunctionComponent<CompositedTransformFollowerProps>;

type ConstrainedBoxProps = BoxConstraints & {
  children?: VirtualNode;
};
declare const ConstrainedBox: FunctionComponent<ConstrainedBoxProps>;

type CustomScrollViewProps = {
  scrollDirection?: Axis;
  reverse?: boolean;
  primary?: boolean;
  physics?: ScrollPhysics;
  shrinkWrap?: boolean;
  anchor?: number;
  cacheExtent?: number;
  clipBehavior?: Clip;
  keyboardDismissBehavior?: ScrollViewKeyboardDismissBehavior;
  children: VirtualNode[] | VirtualNode;
};
declare const CustomScrollView: FunctionComponent<CustomScrollViewProps>;

type DefaultTabControllerProps = {
  initialIndex?: number;
  length: number;
  animationDuration?: number;
  children: VirtualNode;
};
declare const DefaultTabController: FunctionComponent<DefaultTabControllerProps>;

type DefaultTextStyleProps = TextStyle & {
  children: VirtualNode;
};
declare const DefaultTextStyle: FunctionComponent<DefaultTextStyleProps>;

type DismissableProps = KeyProps & RefProps & {
  background?: VirtualNode;
  secondaryBackground?: VirtualNode;
  direction?: DismissDirection;
  resizeDuration?: number;
  movementDuration?: number;
  dismissThresholds?: {
      [key in DismissDirection]?: number;
  };
  crossAxisEndOffset?: number;
  confirmDismiss?: (direction: DismissDirection) => Promise<boolean | undefined>;
  onUpdate?: (details: {
      direction: DismissDirection;
      previousReached: boolean;
      progress: number;
      reached: boolean;
  }) => void;
  onDismissed?: (direction: DismissDirection) => void;
  children: VirtualNode;
};
declare const Dismissable: FunctionComponent<DismissableProps>;

type DottedBorderProps = {
  color?: Color;
  strokeWidth?: number;
  borderType?: 'Rect' | 'RRect' | 'Oval' | 'Circle';
  /**
   * Default: [3, 1]
   */
  dashPattern?: number[];
  padding?: EdgeInsets | number;
  borderPadding?: EdgeInsets | number;
  radius?: number;
  strokeCap?: StrokeCap;
  children: VirtualNode;
};
declare const DottedBorder: FunctionComponent<DottedBorderProps>;

type DottedLineProps = {
  direction?: Axis;
  alignment?: WrapAlignment;
  lineLength?: number | 'infinity';
  lineThickness?: number;
  dashLength?: number;
  dashColor?: Color;
  dashGradient?: Color[];
  dashGapLength?: number;
  dashGapColor?: Color;
  dashGapGradient?: Color[];
  dashRadius?: number;
  dashGapRadius?: number;
};
declare const DottedLine: FunctionComponent<DottedLineProps>;

type ExpandedProps = {
  children: VirtualNode;
  flex?: number;
};
declare const Expanded: FunctionComponent<ExpandedProps>;

type FittedBoxProps = {
  fit?: BoxFit;
  alignment?: Alignment;
  clipBehavior?: Clip;
  children?: VirtualNode;
};
declare const FittedBox: FunctionComponent<FittedBoxProps>;

type GestureDetectorProps = KeyProps & {
  children?: VirtualNode;
  onTap?: () => void;
  onTapDown?: (details: TapDownDetails) => void;
  onTapUp?: (details: TapUpDetails) => void;
  onTapCancel?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onPanDown?: (details: DragDownDetails) => void;
  onPanStart?: (details: DragDownDetails) => void;
  onPanUpdate?: (details: DragUpdateDetails) => void;
  onPanEnd?: (details: DragEndDetails) => void;
  onPanCancel?: () => void;
  onScaleStart?: (details: ScaleStartDetails) => void;
  onScaleUpdate?: (details: ScaleUpdateDetails) => void;
  onScaleEnd?: (details: ScaleEndDetails) => void;
  onHorizontalDragDown?: (details: DragDownDetails) => void;
  onHorizontalDragStart?: (details: DragDownDetails) => void;
  onHorizontalDragUpdate?: (details: DragUpdateDetails) => void;
  onHorizontalDragEnd?: (details: DragEndDetails) => void;
  onHorizontalDragCancel?: () => void;
  onVerticalDragDown?: (details: DragDownDetails) => void;
  onVerticalDragStart?: (details: DragDownDetails) => void;
  onVerticalDragUpdate?: (details: DragUpdateDetails) => void;
  onVerticalDragEnd?: (details: DragEndDetails) => void;
  onVerticalDragCancel?: () => void;
};
declare const GestureDetector: FunctionComponent<GestureDetectorProps>;

type GifProps = {
  src: string;
  duration: number;
  width?: number;
  height?: number;
  repeat?: boolean;
};
declare const Gif: FunctionComponent<GifProps>;

type GridDelegateWithFixedCrossAxisCount = {
  type: 'FixedCrossAxisCount';
  crossAxisCount: number;
};
type GridDelegateWithMaxCrossAxisExtent = {
  type: 'MaxCrossAxisExtent';
  maxCrossAxisExtent: number;
};
type GridViewCommonProps = {
  mainAxisSpacing?: number;
  crossAxisSpacing?: number;
  childAspectRatio?: number;
  mainAxisExtent?: number;
  scrollDirection?: Axis;
  reverse?: boolean;
  primary?: boolean;
  shrinkWrap?: boolean;
  physics?: ScrollPhysics;
  padding?: EdgeInsets | number;
  addAutomaticKeepAlives?: boolean;
  addRepaintBoundaries?: boolean;
  addSemanticIndexes?: boolean;
  keyboardDismissBehavior?: ScrollViewKeyboardDismissBehavior;
  clipBehavior?: Clip;
  cacheExtent?: number;
  itemCount: number;
  itemBuilder: (index: number) => VirtualNode | null;
  onScrollToEnd?: () => void;
};
type GridViewFixedCrossAxisCountProps = GridDelegateWithFixedCrossAxisCount & GridViewCommonProps;
type GridViewMaxCrossAxisExtentProps = GridDelegateWithMaxCrossAxisExtent & GridViewCommonProps;
type GridViewProps = GridViewFixedCrossAxisCountProps | GridViewMaxCrossAxisExtentProps;
declare const GridView: FunctionComponent<GridViewProps>;

type HeroProps = {
  tag: string;
  children: VirtualNode;
};
declare const Hero: FunctionComponent<HeroProps>;

type IconProps = {
  icon?: CupertinoIcons;
  size?: number;
  fill?: number;
  weight?: number;
  grade?: number;
  opticalSize?: number;
  color?: Color;
  semanticLabel?: string;
  textDirection?: TextDirection;
};
declare const Icon: FunctionComponent<IconProps>;

type IgnorePointerProps = {
  ignoring?: boolean;
  children?: VirtualNode;
};
declare const IgnorePointer: FunctionComponent<IgnorePointerProps>;

type ImageProps = {
  src: string;
  width?: number | 'infinity';
  height?: number | 'infinity';
  color?: Color;
  fit?: BoxFit;
  repeat?: ImageRepeat;
  alignment?: Alignment;
};
declare const Image: FunctionComponent<ImageProps>;

type IndexedStackProps = {
  index?: number;
  alignment?: Alignment;
  textDirection?: TextDirection;
  sizing?: StackFit;
  children?: VirtualNode[];
};
declare const IndexedStack: FunctionComponent<IndexedStackProps>;

type InkWellProps = KeyProps & {
  highlightColor?: Color;
  onTap?: () => void;
  onTapDown?: (details: TapDownDetails) => void;
  onTapUp?: (details: TapUpDetails) => void;
  onTapCancel?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  children?: VirtualNode;
};
declare const InkWell: FunctionComponent<InkWellProps>;

type IntrinsicHeightProps = {
  children?: VirtualNode;
};
declare const IntrinsicHeight: FunctionComponent<IntrinsicHeightProps>;

type IntrinsicWidthProps = {
  stepWidth?: number;
  stepHeight?: number;
  children?: VirtualNode;
};
declare const IntrinsicWidth: FunctionComponent<IntrinsicWidthProps>;

type LinearProgressIndicatorProps = {
  value?: number;
  backgroundColor?: Color;
  color?: Color;
  minHeight?: number;
  semanticsLabel?: string;
  semanticsValue?: string;
  borderRadius?: BorderRadius | number;
};
declare const LinearProgressIndicator: FunctionComponent<LinearProgressIndicatorProps>;

type ListViewProps = {
  scrollDirection?: Axis;
  primary?: boolean;
  physics?: ScrollPhysics;
  shrinkWrap?: boolean;
  padding?: EdgeInsets | number;
  cacheExtent?: number;
  itemExtent?: number;
  itemCount: number;
  clipBehavior?: Clip;
  keyboardDismissBehavior?: ScrollViewKeyboardDismissBehavior;
  prototypeItem?: VirtualNode;
  itemBuilder: (index: number) => VirtualNode | null;
  onScrollToEnd?: () => void;
};
declare const ListView: FunctionComponent<ListViewProps>;

type MaterialProps = {
  color?: Color;
  shadowColor?: Color;
  surfaceTintColor?: Color;
  elevation?: number;
  textStyle?: TextStyle;
  borderRadius?: number | BorderRadius;
  clipBehavior?: Clip;
  children?: VirtualNode;
};
declare const Material: FunctionComponent<MaterialProps>;

type NavigatorRef = RenderObject & {
  navigator: WrappedRouter;
};
type NavigatorProps = {
  router: Router;
  ref?: RefObject<NavigatorRef>;
};
declare function Navigator({ router, ref, }: NavigatorProps): JSX.Element;
declare function useNavigator(): WrappedRouter;

type NestedScrollViewProps = {
  scrollDirection?: Axis;
  reverse?: boolean;
  physics?: ScrollPhysics;
  floatHeaderSlivers?: boolean;
  clipBehavior?: Clip;
  headerSlivers: VirtualNode[];
  children: VirtualNode;
};
declare const NestedScrollView: FunctionComponent<NestedScrollViewProps>;

type NetworkImageProps = KeyProps & {
  imageUrl: string;
  httpHeaders?: {
      [key: string]: string;
  };
  width?: number | 'infinity';
  height?: number | 'infinity';
  color?: Color;
  fit?: BoxFit;
  repeat?: ImageRepeat;
  alignment?: Alignment;
  fadeInDuration?: number;
  fadeOutDuration?: number;
};
declare const NetworkImage: FunctionComponent<NetworkImageProps>;

type OpacityProps = {
  opacity: number;
  alwaysIncludeSemantics?: boolean;
  children?: VirtualNode;
};
declare const Opacity: FunctionComponent<OpacityProps>;

type OverflowBoxProps = BoxConstraints & {
  alignment?: Alignment;
  children?: VirtualNode;
};
declare const OverflowBox: FunctionComponent<OverflowBoxProps>;

type OverlayProps = KeyProps & {
  target: VirtualNode;
  follower: VirtualNode;
  visible: boolean;
  onBarrierDismiss?: () => void;
  maskColor?: Color;
  offset?: Offset;
  targetAnchor?: Alignment;
  followerAnchor?: Alignment;
};
declare const Overlay: FunctionComponent<OverlayProps>;

type PaddingProps = KeyProps & EdgeInsets & {
  children?: VirtualNode;
};
declare const Padding: FunctionComponent<PaddingProps>;

type PageViewProps = {
  scrollDirection?: Axis;
  reverse?: boolean;
  physics?: ScrollPhysics;
  pageSnapping?: boolean;
  allowImplicitScrolling?: boolean;
  clipBehavior?: Clip;
  padEnds?: boolean;
  onPageChanged?: (index: number) => void;
  children: VirtualNode[] | VirtualNode;
};
declare const PageView: FunctionComponent<PageViewProps>;

type PopScopeProps = {
  canPop?: boolean;
  onPopInvoked?: (didPop: boolean) => void;
  children: VirtualNode;
};
declare const PopScope: FunctionComponent<PopScopeProps>;

type PositionedProps = {
  children: VirtualNode;
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  width?: number | 'infinity';
  height?: number | 'infinity';
  fill?: true;
};
declare const Positioned: FunctionComponent<PositionedProps>;

type QrImageProps = {
  data: string;
  size?: number;
  padding?: EdgeInsets | number;
  backgroundColor?: Color;
  eyeStyle?: {
      eyeShape?: 'circle' | 'square';
      color?: Color;
  };
  dataModuleStyle?: {
      dataModuleShape?: 'circle' | 'square';
      color?: Color;
  };
  gapless?: boolean;
  semanticsLabel?: string;
};
declare const QrImage: FunctionComponent<QrImageProps>;

type RefreshIndicatorProps = {
  displacement?: number;
  edgeOffset?: number;
  color?: Color;
  backgroundColor?: Color;
  strokeWidth?: number;
  semanticsValue?: string;
  semanticsLabel?: string;
  triggerMode?: 'anywhere' | 'onEdge';
  onRefresh: () => Promise<void>;
  children: VirtualNode;
};
declare const RefreshIndicator: FunctionComponent<RefreshIndicatorProps>;

type ReorderableListViewProps = {
  padding?: EdgeInsets | number;
  scrollDirection?: Axis;
  reverse?: boolean;
  primary?: boolean;
  shrinkWrap?: boolean;
  anchor?: number;
  cacheExtent?: number;
  buildDefaultDragHandles?: boolean;
  physics?: ScrollPhysics;
  clipBehavior?: Clip;
  keyboardDismissBehavior?: ScrollViewKeyboardDismissBehavior;
  itemExtent?: number;
  itemCount: number;
  itemBuilder: (index: number) => VirtualNode | null;
  prototypeItem?: VirtualNode;
  header?: VirtualNode;
  footer?: VirtualNode;
  onReorderStart?: (index: number) => void;
  onReorderEnd?: (index: number) => void;
  onReorder: (details: {
      oldIndex: number;
      newIndex: number;
  }) => void;
  onScrollToEnd?: () => void;
};
declare const ReorderableListView: FunctionComponent<ReorderableListViewProps>;

type ImageByteFormat = 'png' | 'rawRgba' | 'rawStraightRgba' | 'rawUnmodified';
type RepaintBoundaryRef = RenderObject & {
  /**
   * 获取图片的ArrayBuffer数组
   */
  getImageBytes(format?: ImageByteFormat, pixelRatio?: number): Promise<number[] | null>;
  /**
   * 生成图片并分享
   */
  shareImage(pixelRatio?: number): Promise<ShareResultStatus | null>;
  /**
   * 生成图片并保存
   */
  saveImage(options?: {
      format?: ImageByteFormat;
      /**
       * 图片质量 0-100
       */
      quality?: number;
      pixelRatio?: number;
      /**
       * 图片名称
       */
      name?: string;
  }): Promise<boolean | null>;
};
type RepaintBoundaryProps = {
  ref?: RefObject<RepaintBoundaryRef>;
  children?: VirtualNode;
};
declare const RepaintBoundary: FunctionComponent<RepaintBoundaryProps>;

type RichTextProps = {
  textAlign?: TextAlign;
  textDirection?: TextDirection;
  softWrap?: boolean;
  overflow?: TextOverflow;
  textScaleFactor?: number;
  maxLines?: number;
  strutStyle?: StrutStyle;
  textWidthBasis?: TextWidthBasis;
  /**
   * 只能作为 `<RichText />`的子节点
   */
  children: VirtualNode;
};
type TextSpanProps = TextStyle & {
  text?: string;
  spellOut?: boolean;
  semanticsLabel?: string;
  /**
   * 只能作为 `<RichText />`的子节点
   */
  children?: VirtualNode[] | VirtualNode;
  onTap?: () => void;
  onTapDown?: (details: TapDownDetails) => void;
  onTapUp?: (details: TapUpDetails) => void;
  onTapCancel?: () => void;
};
/**
* 只能作为 `<RichText />`的子节点
*
* 只能接收 `<TextSpan />` 作为子节点
*
* ```
* <RichText>
*   <TextSpan>
*     <TextSpan text="Hello" />
*     <TextSpan text=" World!" />
*   </TextSpan>
* </RichText>
* ```
*/
declare const TextSpan: FunctionComponent<TextSpanProps>;
/**
* 只能接收 `<TextSpan />` 作为子节点
*
* ```
* <RichText>
*   <TextSpan>
*     <TextSpan text="Hello" />
*     <TextSpan text=" World!" />
*   </TextSpan>
* </RichText>
* ```
*/
declare const RichText: FunctionComponent<RichTextProps>;

type RotatedBoxProps = {
  /**
   * The number of clockwise quarter turns the child should be rotated.
   */
  quarterTurns: number;
  children?: VirtualNode;
};
declare const RotatedBox: FunctionComponent<RotatedBoxProps>;

type RowProps = {
  mainAxisAlignment?: MainAxisAlignment;
  crossAxisAlignment?: CrossAxisAlignment;
  mainAxisSize?: MainAxisSize;
  textBaseline?: TextBaseLine;
  textDirection?: TextDirection;
  verticalDirection?: VerticalDirection;
  children?: (VirtualNode | undefined | null | (VirtualNode | undefined | null)[])[] | VirtualNode;
};
declare const Row: FunctionComponent<RowProps>;

type SafeAreaProps = KeyProps & {
  children: VirtualNode;
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  minimum?: EdgeInsets | number;
  maintainBottomViewPadding?: boolean;
};
declare const SafeArea: FunctionComponent<SafeAreaProps>;

type ScrollbarProps = {
  thickness?: number;
  thumbVisibility?: boolean;
  trackVisibility?: boolean;
  radius?: number;
  interactive?: boolean;
  scrollbarOrientation?: ScrollOrientation;
  children: VirtualNode;
};
declare const Scrollbar: FunctionComponent<ScrollbarProps>;

type ScrollNotificationListenerProps = KeyProps & {
  onScrollStart?: (notification: ScrollStartNotification) => void;
  onScrollUpdate?: (notification: ScrollUpdateNotification) => void;
  onScrollEnd?: (notification: ScrollEndNotification) => void;
  onOverScroll?: (notification: OverScrollNotification) => void;
  onUserScroll?: (notificaiton: UserScrollNotification) => void;
  children: VirtualNode;
};
declare const ScrollNotificationListener: FunctionComponent<ScrollNotificationListenerProps>;

type SingleChildScrollViewProps = KeyProps & {
  /**
   * vertical
   */
  scrollDirection?: Axis;
  reverse?: boolean;
  padding?: EdgeInsets | number;
  primary?: boolean;
  physics?: ScrollPhysics;
  /**
   * 默认: hardEdge
   */
  clipBehavior?: Clip;
  /**
   * 默认: manual
   */
  keyboardDismissBehavior?: ScrollViewKeyboardDismissBehavior;
  children?: VirtualNode;
};
declare const SingleChildScrollView: FunctionComponent<SingleChildScrollViewProps>;

type SizedBoxProps = {
  width?: number | 'infinity';
  height?: number | 'infinity';
  children?: VirtualNode;
};
declare const SizedBox: FunctionComponent<SizedBoxProps>;

type SliverFillRemainingProps = KeyProps & {
  hasScrollBody?: boolean;
  fillOverscroll?: boolean;
  children: VirtualNode;
};
declare const SliverFillRemaining: FunctionComponent<SliverFillRemainingProps>;

type SliverFixedHeightPersistentHeaderProps = KeyProps & {
  height: number;
  children: VirtualNode;
  pinned?: boolean;
  floating?: boolean;
};
declare const SliverFixedHeightPersistentHeader: FunctionComponent<SliverFixedHeightPersistentHeaderProps>;

type SliverToBoxAdapterProps = KeyProps & {
  children: VirtualNode;
};
declare const SliverToBoxAdapter: FunctionComponent<SliverToBoxAdapterProps>;

type SpacerProps = {
  flex?: number;
};
declare const Spacer: FunctionComponent<SpacerProps>;

type StackProps = KeyProps & {
  alignment?: Alignment;
  textDirection?: TextDecoration;
  fit?: StackFit;
  clipBehavior?: Clip;
  children?: VirtualNode | (VirtualNode | null | undefined)[];
};
declare const Stack: FunctionComponent<StackProps>;

type StickyHeaderProps = {
  header: VirtualNode;
  content: VirtualNode;
  overlapHeaders?: boolean;
};
declare const StickyHeader: FunctionComponent<StickyHeaderProps>;

type StringSvgProps = KeyProps & {
  source: string;
};
declare const StringSvg: FunctionComponent<StringSvgProps>;

type SvgProps = KeyProps & {
  src: string;
  width?: number;
  height?: number;
  size?: number;
  color?: Color;
};
declare const Svg: FunctionComponent<SvgProps>;

type SwiperProps = {
  autoplay?: boolean;
  /**
   * 毫秒，默认3000
   */
  autoplayDelay?: number;
  autoplayDisableOnInteraction?: boolean;
  /**
   * 默认300
   */
  duration?: number;
  /**
   * 初始化下标
   */
  index?: number;
  onIndexChanged?: (index: number) => void;
  loop?: boolean;
  curve?: Curve;
  onTap?: (index: number) => void;
  scrollDirection?: Axis;
  axisDirection?: AixsDirection;
  physics?: ScrollPhysics;
  containerWidth?: number;
  containerHeight?: number;
  itemWidth?: number;
  itemHeight?: number;
  viewportFraction?: number;
  /**
   * viewportFraction设置并 < 1.0 时，该值不生效
   */
  scale?: number;
  /**
   * viewportFraction设置并 < 1.0 时，该值不生效
   */
  fade?: number;
  /**
   * Indicator是否在外部
   */
  outer?: boolean;
  layout?: 'default' | 'stack' | 'tinder';
  indicatorLayout?: 'none' | 'color' | 'drop' | 'scale' | 'slide' | 'warm';
  children: VirtualNode[] | VirtualNode;
  pagination?: VirtualNode;
};
type SwiperPaginationProps = {
  alignment?: Alignment;
  margin?: EdgeInsets | number;
  children: VirtualNode;
};
declare const Swiper: FunctionComponent<SwiperProps>;
declare const SwiperPagination: FunctionComponent<SwiperPaginationProps>;

type SwitchProps = {
  value: boolean;
  onChanged?: (value: boolean) => void;
  activeColor?: Color;
  activeTrackColor?: Color;
  inactiveThumbColor?: Color;
  inactiveTrackColor?: Color;
  hoverColor?: Color;
  focusColor?: Color;
  splashRadius?: number;
  autofocus?: boolean;
};
declare const Switch: FunctionComponent<SwitchProps>;

type TabControllerRenderNode = {
  key: string;
  initialIndex?: number;
  length: number;
  animationDuration?: number;
  listener?: string;
};
declare class TabController {
  readonly key: string;
  constructor(key: string);
  private _listeners;
  private _renderNode;
  get renderNode(): TabControllerRenderNode;
  getIndex(): Promise<number>;
  animateTo(index: number, duration?: number): void;
  addListener(listener: () => void): void;
  removeListener(listener: () => void): void;
  private __setup__;
  dispose(): void;
}
declare const TabControllerContext: Context<TabController>;
type TabControllerRef = RenderObject & {
  tabController: TabController;
};
type TabControllerProps = {
  length: number;
  initialIndex?: number;
  animationDuration?: number;
  children: VirtualNode;
  ref?: RefObject<TabControllerRef>;
};
declare function TabControllerProvider({ children, ref, ...props }: TabControllerProps): JSX.Element;
declare function TabControllerConsumer({ children, }: {
  children: (tabController: TabController) => VirtualNode;
}): JSX.Element;
declare function useTabController(): TabController;

type TabBarProps = {
  controller?: TabController;
  tabAlignment?: TabAlignment;
  tabs: VirtualNode[];
  isScrollable?: boolean;
  padding?: EdgeInsets | number;
  indicatorColor?: Color;
  automaticIndicatorColorAdjustment?: boolean;
  indicatorWeight?: number;
  indicatorPadding?: EdgeInsets | number;
  indicator?: BoxDecoration;
  indicatorSize?: TabBarIndicatorSize;
  dividerColor?: Color;
  labelColor?: Color;
  enableFeedback?: boolean;
  onTap?: (index: number) => void;
  physics?: ScrollPhysics;
  splashBorderRadius?: BorderRadius | number;
};
declare const TabBar: FunctionComponent<TabBarProps>;

type TabBarViewProps = {
  controller?: TabController;
  physics?: ScrollPhysics;
  viewportFraction?: number;
  clipBehavior?: Clip;
  children: (VirtualNode | undefined | null | (VirtualNode | undefined | null)[])[] | VirtualNode;
};
declare function TabBarView({ children, ...props }: TabBarViewProps): JSX.Element;

type TextProps = TextStyle & {
  children: string | number | boolean | Array<string | number | boolean>;
  textAlign?: TextAlign;
  textDirection?: TextDirection;
  softWrap?: boolean;
  textScaleFactor?: number;
  maxLines?: number;
  semanticsLabel?: string;
  textWidthBasis?: TextWidthBasis;
  selectionColor?: Color;
  strutStyle?: StrutStyle;
  textHeightBehavior?: TextHeightBehavior;
};
declare const Text: FunctionComponent<TextProps>;

type TextFieldProps = {
  value?: string;
  onChanged?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  textStyle?: TextStyle;
  textAlign?: TextAlign;
  hintText?: string;
  hintTextStyle?: TextStyle;
  autofocus?: boolean;
  readOnly?: boolean;
  obscureText?: boolean;
  enabled?: boolean;
  keyboardType?: TextInputType;
  maxLines?: number;
  minLines?: number;
  maxLength?: number;
  enableSuggestions?: boolean;
  expands?: boolean;
  obscuringCharacter?: string;
};
declare const TextField: FunctionComponent<TextFieldProps>;

type TickerManagerRef = {
  tickerManager: TickerManager;
};
type TickerManagerProviderProps = {
  children: VirtualNode;
  ref?: RefObject<TickerManagerRef>;
};
declare class TickerManager {
  readonly key: string;
  constructor(key: string);
  private _tickers;
  get tickers(): Ticker[];
  createTicker(onTick: (elapsed: number) => void): Ticker;
  dispose(): void;
}
declare class Ticker {
  private readonly _manager;
  private readonly _tickerKey;
  private readonly _remove;
  constructor(_manager: TickerManager, _tickerKey: string, _remove: () => void);
  start(): Promise<boolean>;
  stop(canceled?: boolean): Promise<boolean>;
  remove(): void;
}
declare function TickerManagerProvider({ children, ref, }: TickerManagerProviderProps): JSX.Element;
declare function TickerManagerConsumer({ children }: {
  children: (tickerManager: TickerManager) => VirtualNode;
}): JSX.Element;
declare function useTickerManager(): TickerManager;

type UnconstrainedBoxProps = {
  textDirection?: TextDecoration;
  alignment?: Alignment;
  constrainedAxis?: Axis;
  clipBehavior?: Clip;
  children?: VirtualNode;
};
declare const UnconstrainedBox: FunctionComponent<UnconstrainedBoxProps>;

declare class WebViewController {
  readonly key: string;
  constructor(key: string);
  /**
   * 加载url
   */
  loadUrl(url: string): void;
  /**
   * 加载数据，如 html 或 pdf 或base64图片
   */
  loadData(data: string, options?: {
      mimeType?: string;
      encoding?: string;
      baseUrl?: string;
  }): void;
  getHtml(): Promise<string | null>;
  reload(): void;
  evaluateJavaScript<T>(source: string): Promise<T>;
  callAsyncJavaScript<T>(source: string): Promise<T>;
}
type WebViewSettings = {
  useShouldOverrideUrlLoading?: boolean;
  clearCache?: boolean;
  userAgent?: string;
  verticalScrollBarEnabled?: boolean;
  horizontalScrollBarEnabled?: boolean;
  mediaPlaybackRequiresUserGesture?: boolean;
  cacheEnabled?: boolean;
  transparentBackground?: boolean;
  disableVerticalScroll?: boolean;
  disableHorizontalScroll?: boolean;
  supportZoom?: boolean;
  disallowOverScroll?: boolean;
  allowsInlineMediaPlayback?: boolean;
  iframeAllow?: string;
  iframeAllowFullscreen?: boolean;
  allowsBackForwardNavigationGestures?: boolean;
};
type WebViewProps = {
  /**
   * 访问的链接
   */
  url?: string;
  data?: {
      /**
       * html string
       */
      data: string;
      /**
       * https://www.vstar.com
       */
      baseUrl?: string;
      /**
       * utf8
       */
      encoding?: string;
      /**
       * 'text/html'
       */
      mimeType?: string;
  };
  settings?: WebViewSettings;
  onWebViewCreated?: (controller: WebViewController) => void;
  onLoadStart?: (url?: string) => void;
  onLoadStop?: (url?: string) => void;
  onReceivedError?: (details: {
      url: string;
      isForMainFrame: boolean;
      errorType: string;
      description: string;
  }) => void;
  onProgressChanged?: (progress: number) => void;
  shouldOverrideUrlLoading?: (url: string) => Promise<boolean>;
};
declare function WebView({ onWebViewCreated, ...props }: WebViewProps): JSX.Element;

type WrapProps = {
  direction?: Axis;
  alignment?: WrapAlignment;
  spacing?: number;
  runAlignment?: WrapAlignment;
  runSpacing?: number;
  crossAxisAlignment?: WrapCrossAlignment;
  textDirection?: TextDirection;
  verticalDirection?: VerticalDirection;
  clipBehavior?: Clip;
  children?: (VirtualNode | undefined | null)[] | VirtualNode;
};
declare const Wrap: FunctionComponent<WrapProps>;

declare const index_AbsorbPointer: typeof AbsorbPointer;
type index_AbsorbPointerProps = AbsorbPointerProps;
type index_AixsDirection = AixsDirection;
type index_Alignment = Alignment;
declare const index_AnimatedAlign: typeof AnimatedAlign;
type index_AnimatedAlignProps = AnimatedAlignProps;
declare const index_AnimatedContainer: typeof AnimatedContainer;
type index_AnimatedContainerProps = AnimatedContainerProps;
declare const index_AnimatedOpacity: typeof AnimatedOpacity;
type index_AnimatedOpacityProps = AnimatedOpacityProps;
declare const index_AnimatedPadding: typeof AnimatedPadding;
type index_AnimatedPaddingProps = AnimatedPaddingProps;
declare const index_AnimatedPositioned: typeof AnimatedPositioned;
type index_AnimatedPositionedProps = AnimatedPositionedProps;
declare const index_AnimatedRotation: typeof AnimatedRotation;
type index_AnimatedRotationProps = AnimatedRotationProps;
declare const index_AnimatedScale: typeof AnimatedScale;
type index_AnimatedScaleProps = AnimatedScaleProps;
declare const index_AnimatedSize: typeof AnimatedSize;
type index_AnimatedSizeProps = AnimatedSizeProps;
declare const index_AnimatedSlide: typeof AnimatedSlide;
type index_AnimatedSlideProps = AnimatedSlideProps;
type index_AnimationControllerIntialOptions = AnimationControllerIntialOptions;
type index_AnimationInitalOptions<T extends AnimationValue> = AnimationInitalOptions<T>;
type index_AnimationStatus = AnimationStatus;
type index_AnimationStatusListener = AnimationStatusListener;
type index_AnimationValue = AnimationValue;
declare const index_AspectRatio: typeof AspectRatio;
type index_AspectRatioProps = AspectRatioProps;
declare const index_AutoSizeText: typeof AutoSizeText;
type index_AutoSizeTextProps = AutoSizeTextProps;
type index_Axis = Axis;
declare const index_BackdropFilter: typeof BackdropFilter;
type index_BackdropFilterProps = BackdropFilterProps;
declare const index_Baseline: typeof Baseline;
type index_BaselineProps = BaselineProps;
type index_BlendMode = BlendMode;
type index_BlurStyle = BlurStyle;
type index_BorderRadius = BorderRadius;
type index_BorderSide = BorderSide;
declare const index_BottomNavigationBarItem: typeof BottomNavigationBarItem;
type index_BottomNavigationBarItemProps = BottomNavigationBarItemProps;
type index_BoxConstraints = BoxConstraints;
type index_BoxDecoration = BoxDecoration;
type index_BoxFit = BoxFit;
type index_BoxShadow = BoxShadow;
type index_Brightness = Brightness;
declare const index_CSSFilter: typeof CSSFilter;
type index_CSSFilterMatrix = CSSFilterMatrix;
declare const index_CSSFilterPresets: typeof CSSFilterPresets;
type index_CSSFilterPresetsEffect = CSSFilterPresetsEffect;
type index_CSSFilterPresetsProps = CSSFilterPresetsProps;
type index_CSSFilterProps = CSSFilterProps;
declare const index_Center: typeof Center;
type index_CenterProps = CenterProps;
declare const index_CircularProgressIndicator: typeof CircularProgressIndicator;
type index_CircularProgressIndicatorProps = CircularProgressIndicatorProps;
type index_Clip = Clip;
declare const index_ClipOval: typeof ClipOval;
type index_ClipOvalProps = ClipOvalProps;
declare const index_ClipRRect: typeof ClipRRect;
type index_ClipRRectProps = ClipRRectProps;
declare const index_ClipRect: typeof ClipRect;
type index_ClipRectProps = ClipRectProps;
type index_Color = Color;
declare const index_Column: typeof Column;
type index_ColumnProps = ColumnProps;
declare const index_CompositedTransformFollower: typeof CompositedTransformFollower;
type index_CompositedTransformFollowerProps = CompositedTransformFollowerProps;
declare const index_CompositedTransformTarget: typeof CompositedTransformTarget;
type index_CompositedTransformTargetProps = CompositedTransformTargetProps;
declare const index_ConstrainedBox: typeof ConstrainedBox;
type index_ConstrainedBoxProps = ConstrainedBoxProps;
declare const index_Container: typeof Container;
type index_ContainerProps = ContainerProps;
type index_CrossAxisAlignment = CrossAxisAlignment;
declare const index_CupertinoActionSheet: typeof CupertinoActionSheet;
declare const index_CupertinoActionSheetAction: typeof CupertinoActionSheetAction;
type index_CupertinoActionSheetActionProps = CupertinoActionSheetActionProps;
type index_CupertinoActionSheetProps = CupertinoActionSheetProps;
declare const index_CupertinoActivityIndicator: typeof CupertinoActivityIndicator;
type index_CupertinoActivityIndicatorProps = CupertinoActivityIndicatorProps;
declare const index_CupertinoAlertDialog: typeof CupertinoAlertDialog;
type index_CupertinoAlertDialogProps = CupertinoAlertDialogProps;
declare const index_CupertinoButton: typeof CupertinoButton;
type index_CupertinoButtonProps = CupertinoButtonProps;
declare const index_CupertinoContextMenu: typeof CupertinoContextMenu;
declare const index_CupertinoContextMenuAction: typeof CupertinoContextMenuAction;
type index_CupertinoContextMenuActionProps = CupertinoContextMenuActionProps;
type index_CupertinoContextMenuProps = CupertinoContextMenuProps;
declare const index_CupertinoDatePicker: typeof CupertinoDatePicker;
type index_CupertinoDatePickerMode = CupertinoDatePickerMode;
type index_CupertinoDatePickerProps = CupertinoDatePickerProps;
declare const index_CupertinoDialogAction: typeof CupertinoDialogAction;
type index_CupertinoDialogActionProps = CupertinoDialogActionProps;
declare const index_CupertinoFormRow: typeof CupertinoFormRow;
type index_CupertinoFormRowProps = CupertinoFormRowProps;
declare const index_CupertinoFormSection: typeof CupertinoFormSection;
type index_CupertinoFormSectionProps = CupertinoFormSectionProps;
type index_CupertinoIcons = CupertinoIcons;
declare const index_CupertinoListSection: typeof CupertinoListSection;
type index_CupertinoListSectionProps = CupertinoListSectionProps;
declare const index_CupertinoListTile: typeof CupertinoListTile;
declare const index_CupertinoListTileChevron: typeof CupertinoListTileChevron;
type index_CupertinoListTileProps = CupertinoListTileProps;
declare const index_CupertinoNavigationBar: typeof CupertinoNavigationBar;
declare const index_CupertinoNavigationBarBackButton: typeof CupertinoNavigationBarBackButton;
type index_CupertinoNavigationBarBackButtonProps = CupertinoNavigationBarBackButtonProps;
type index_CupertinoNavigationBarProps = CupertinoNavigationBarProps;
declare const index_CupertinoPageScaffold: typeof CupertinoPageScaffold;
type index_CupertinoPageScaffoldProps = CupertinoPageScaffoldProps;
declare const index_CupertinoPicker: typeof CupertinoPicker;
declare const index_CupertinoPickerDefaultSelectionOverlay: typeof CupertinoPickerDefaultSelectionOverlay;
type index_CupertinoPickerDefaultSelectionOverlayProps = CupertinoPickerDefaultSelectionOverlayProps;
type index_CupertinoPickerProps = CupertinoPickerProps;
declare const index_CupertinoScrollerBar: typeof CupertinoScrollerBar;
type index_CupertinoScrollerBarProps = CupertinoScrollerBarProps;
declare const index_CupertinoSearchTextField: typeof CupertinoSearchTextField;
type index_CupertinoSearchTextFieldProps = CupertinoSearchTextFieldProps;
declare const index_CupertinoSegmentedControl: typeof CupertinoSegmentedControl;
type index_CupertinoSegmentedControlProps = CupertinoSegmentedControlProps;
declare const index_CupertinoSlider: typeof CupertinoSlider;
type index_CupertinoSliderProps = CupertinoSliderProps;
declare const index_CupertinoSlidingSegmentedControl: typeof CupertinoSlidingSegmentedControl;
type index_CupertinoSlidingSegmentedControlProps = CupertinoSlidingSegmentedControlProps;
declare const index_CupertinoSliverNavigationBar: typeof CupertinoSliverNavigationBar;
type index_CupertinoSliverNavigationBarProps = CupertinoSliverNavigationBarProps;
declare const index_CupertinoSliverRefreshControl: typeof CupertinoSliverRefreshControl;
type index_CupertinoSliverRefreshControlProps = CupertinoSliverRefreshControlProps;
declare const index_CupertinoSwitch: typeof CupertinoSwitch;
type index_CupertinoSwitchProps = CupertinoSwitchProps;
declare const index_CupertinoTabBar: typeof CupertinoTabBar;
type index_CupertinoTabBarProps = CupertinoTabBarProps;
declare const index_CupertinoTextField: typeof CupertinoTextField;
type index_CupertinoTextFieldProps = CupertinoTextFieldProps;
declare const index_CupertinoTimerPicker: typeof CupertinoTimerPicker;
type index_CupertinoTimerPickerMode = CupertinoTimerPickerMode;
type index_CupertinoTimerPickerProps = CupertinoTimerPickerProps;
type index_Curve = Curve;
declare const index_CustomScrollView: typeof CustomScrollView;
type index_CustomScrollViewProps = CustomScrollViewProps;
type index_DatePickerDateOrder = DatePickerDateOrder;
declare const index_DefaultTabController: typeof DefaultTabController;
type index_DefaultTabControllerProps = DefaultTabControllerProps;
declare const index_DefaultTextStyle: typeof DefaultTextStyle;
type index_DefaultTextStyleProps = DefaultTextStyleProps;
type index_DismissDirection = DismissDirection;
declare const index_Dismissable: typeof Dismissable;
type index_DismissableProps = DismissableProps;
declare const index_DottedBorder: typeof DottedBorder;
type index_DottedBorderProps = DottedBorderProps;
declare const index_DottedLine: typeof DottedLine;
type index_DottedLineProps = DottedLineProps;
type index_DragDownDetails = DragDownDetails;
type index_DragEndDetails = DragEndDetails;
type index_DragUpdateDetails = DragUpdateDetails;
type index_EdgeInsets = EdgeInsets;
type index_EdgeInsetsDirectional = EdgeInsetsDirectional;
type index_EventPosition = EventPosition;
declare const index_Expanded: typeof Expanded;
type index_ExpandedProps = ExpandedProps;
type index_FilterQuality = FilterQuality;
declare const index_FittedBox: typeof FittedBox;
type index_FittedBoxProps = FittedBoxProps;
type index_FontStyle = FontStyle;
type index_FontWeight = FontWeight;
declare const index_GestureDetector: typeof GestureDetector;
type index_GestureDetectorProps = GestureDetectorProps;
declare const index_Gif: typeof Gif;
type index_GifProps = GifProps;
type index_GridDelegateWithFixedCrossAxisCount = GridDelegateWithFixedCrossAxisCount;
type index_GridDelegateWithMaxCrossAxisExtent = GridDelegateWithMaxCrossAxisExtent;
declare const index_GridView: typeof GridView;
type index_GridViewCommonProps = GridViewCommonProps;
type index_GridViewFixedCrossAxisCountProps = GridViewFixedCrossAxisCountProps;
type index_GridViewMaxCrossAxisExtentProps = GridViewMaxCrossAxisExtentProps;
type index_GridViewProps = GridViewProps;
declare const index_Hero: typeof Hero;
type index_HeroProps = HeroProps;
declare const index_Icon: typeof Icon;
type index_IconProps = IconProps;
declare const index_IgnorePointer: typeof IgnorePointer;
type index_IgnorePointerProps = IgnorePointerProps;
declare const index_Image: typeof Image;
type index_ImageByteFormat = ImageByteFormat;
type index_ImageFilter = ImageFilter;
type index_ImageFilterBlur = ImageFilterBlur;
type index_ImageFilterCompose = ImageFilterCompose;
type index_ImageFilterDilate = ImageFilterDilate;
type index_ImageFilterErode = ImageFilterErode;
type index_ImageFilterMaxtrix = ImageFilterMaxtrix;
type index_ImageProps = ImageProps;
type index_ImageRepeat = ImageRepeat;
declare const index_IndexedStack: typeof IndexedStack;
type index_IndexedStackProps = IndexedStackProps;
declare const index_InkWell: typeof InkWell;
type index_InkWellProps = InkWellProps;
type index_IntervalCurve = IntervalCurve;
declare const index_IntrinsicHeight: typeof IntrinsicHeight;
type index_IntrinsicHeightProps = IntrinsicHeightProps;
declare const index_IntrinsicWidth: typeof IntrinsicWidth;
type index_IntrinsicWidthProps = IntrinsicWidthProps;
type index_KeyProps = KeyProps;
type index_LayerLink = LayerLink;
declare const index_LayerLink: typeof LayerLink;
type index_LinearGradient = LinearGradient;
declare const index_LinearProgressIndicator: typeof LinearProgressIndicator;
type index_LinearProgressIndicatorProps = LinearProgressIndicatorProps;
declare const index_ListView: typeof ListView;
type index_ListViewProps = ListViewProps;
type index_MainAxisAlignment = MainAxisAlignment;
type index_MainAxisSize = MainAxisSize;
declare const index_Material: typeof Material;
type index_MaterialProps = MaterialProps;
declare const index_Navigator: typeof Navigator;
type index_NavigatorProps = NavigatorProps;
type index_NavigatorRef = NavigatorRef;
declare const index_NestedScrollView: typeof NestedScrollView;
type index_NestedScrollViewProps = NestedScrollViewProps;
declare const index_NetworkImage: typeof NetworkImage;
type index_NetworkImageProps = NetworkImageProps;
type index_NormalCurve = NormalCurve;
type index_Offset = Offset;
declare const index_Opacity: typeof Opacity;
type index_OpacityProps = OpacityProps;
type index_OverScrollNotification = OverScrollNotification;
declare const index_OverflowBox: typeof OverflowBox;
type index_OverflowBoxProps = OverflowBoxProps;
declare const index_Overlay: typeof Overlay;
type index_OverlayProps = OverlayProps;
type index_OverlayVisibilityMode = OverlayVisibilityMode;
declare const index_Padding: typeof Padding;
type index_PaddingProps = PaddingProps;
declare const index_PageView: typeof PageView;
type index_PageViewProps = PageViewProps;
type index_PaintRect = PaintRect;
type index_PaintSize = PaintSize;
declare const index_PopScope: typeof PopScope;
type index_PopScopeProps = PopScopeProps;
declare const index_Positioned: typeof Positioned;
type index_PositionedProps = PositionedProps;
declare const index_QrImage: typeof QrImage;
type index_QrImageProps = QrImageProps;
type index_RadialGradient = RadialGradient;
type index_RefProps<T extends RenderObject = RenderObject> = RefProps<T>;
declare const index_RefreshIndicator: typeof RefreshIndicator;
type index_RefreshIndicatorProps = RefreshIndicatorProps;
type index_RelativeRect = RelativeRect;
declare const index_ReorderableListView: typeof ReorderableListView;
type index_ReorderableListViewProps = ReorderableListViewProps;
declare const index_RepaintBoundary: typeof RepaintBoundary;
type index_RepaintBoundaryProps = RepaintBoundaryProps;
type index_RepaintBoundaryRef = RepaintBoundaryRef;
declare const index_RichText: typeof RichText;
type index_RichTextProps = RichTextProps;
declare const index_RotatedBox: typeof RotatedBox;
type index_RotatedBoxProps = RotatedBoxProps;
declare const index_Row: typeof Row;
type index_RowProps = RowProps;
declare const index_SafeArea: typeof SafeArea;
type index_SafeAreaProps = SafeAreaProps;
type index_ScaleEndDetails = ScaleEndDetails;
type index_ScaleStartDetails = ScaleStartDetails;
type index_ScaleUpdateDetails = ScaleUpdateDetails;
type index_ScrollEndNotification = ScrollEndNotification;
type index_ScrollMetrics = ScrollMetrics;
type index_ScrollNotification = ScrollNotification;
declare const index_ScrollNotificationListener: typeof ScrollNotificationListener;
type index_ScrollNotificationListenerProps = ScrollNotificationListenerProps;
type index_ScrollOrientation = ScrollOrientation;
type index_ScrollPhysics = ScrollPhysics;
type index_ScrollStartNotification = ScrollStartNotification;
type index_ScrollUpdateNotification = ScrollUpdateNotification;
type index_ScrollViewKeyboardDismissBehavior = ScrollViewKeyboardDismissBehavior;
declare const index_Scrollbar: typeof Scrollbar;
type index_ScrollbarProps = ScrollbarProps;
declare const index_SingleChildScrollView: typeof SingleChildScrollView;
type index_SingleChildScrollViewProps = SingleChildScrollViewProps;
declare const index_SizedBox: typeof SizedBox;
type index_SizedBoxProps = SizedBoxProps;
declare const index_SliverFillRemaining: typeof SliverFillRemaining;
type index_SliverFillRemainingProps = SliverFillRemainingProps;
declare const index_SliverFixedHeightPersistentHeader: typeof SliverFixedHeightPersistentHeader;
type index_SliverFixedHeightPersistentHeaderProps = SliverFixedHeightPersistentHeaderProps;
declare const index_SliverToBoxAdapter: typeof SliverToBoxAdapter;
type index_SliverToBoxAdapterProps = SliverToBoxAdapterProps;
declare const index_Spacer: typeof Spacer;
type index_SpacerProps = SpacerProps;
declare const index_Stack: typeof Stack;
type index_StackFit = StackFit;
type index_StackProps = StackProps;
declare const index_StickyHeader: typeof StickyHeader;
type index_StickyHeaderProps = StickyHeaderProps;
declare const index_StringSvg: typeof StringSvg;
type index_StringSvgProps = StringSvgProps;
type index_StrokeCap = StrokeCap;
type index_StrutStyle = StrutStyle;
declare const index_Svg: typeof Svg;
type index_SvgProps = SvgProps;
declare const index_Swiper: typeof Swiper;
declare const index_SwiperPagination: typeof SwiperPagination;
type index_SwiperPaginationProps = SwiperPaginationProps;
type index_SwiperProps = SwiperProps;
declare const index_Switch: typeof Switch;
type index_SwitchProps = SwitchProps;
type index_TabAlignment = TabAlignment;
declare const index_TabBar: typeof TabBar;
type index_TabBarIndicatorSize = TabBarIndicatorSize;
type index_TabBarProps = TabBarProps;
declare const index_TabBarView: typeof TabBarView;
type index_TabBarViewProps = TabBarViewProps;
type index_TabController = TabController;
declare const index_TabController: typeof TabController;
declare const index_TabControllerConsumer: typeof TabControllerConsumer;
declare const index_TabControllerContext: typeof TabControllerContext;
type index_TabControllerProps = TabControllerProps;
declare const index_TabControllerProvider: typeof TabControllerProvider;
type index_TabControllerRef = TabControllerRef;
type index_TabControllerRenderNode = TabControllerRenderNode;
type index_TapDownDetails = TapDownDetails;
type index_TapUpDetails = TapUpDetails;
declare const index_Text: typeof Text;
type index_TextAlign = TextAlign;
type index_TextBaseLine = TextBaseLine;
type index_TextDecoration = TextDecoration;
type index_TextDecorationStyle = TextDecorationStyle;
type index_TextDirection = TextDirection;
declare const index_TextField: typeof TextField;
type index_TextFieldProps = TextFieldProps;
type index_TextHeightBehavior = TextHeightBehavior;
type index_TextInputType = TextInputType;
type index_TextLeadingDistribution = TextLeadingDistribution;
type index_TextOverflow = TextOverflow;
type index_TextProps = TextProps;
declare const index_TextSpan: typeof TextSpan;
type index_TextSpanProps = TextSpanProps;
type index_TextStyle = TextStyle;
type index_TextWidthBasis = TextWidthBasis;
type index_Ticker = Ticker;
declare const index_Ticker: typeof Ticker;
type index_TickerManager = TickerManager;
declare const index_TickerManager: typeof TickerManager;
declare const index_TickerManagerConsumer: typeof TickerManagerConsumer;
declare const index_TickerManagerProvider: typeof TickerManagerProvider;
type index_TickerManagerProviderProps = TickerManagerProviderProps;
type index_TickerManagerRef = TickerManagerRef;
type index_TileMode = TileMode;
declare const index_TransformRotate: typeof TransformRotate;
type index_TransformRotateProps = TransformRotateProps;
declare const index_TransformScale: typeof TransformScale;
type index_TransformScaleProps = TransformScaleProps;
declare const index_TransformTranslate: typeof TransformTranslate;
type index_TransformTranslateProps = TransformTranslateProps;
type index_Tween<T extends AnimationValue> = Tween<T>;
type index_TweenSequence<T extends AnimationValue> = TweenSequence<T>;
type index_TweenSequenceConstantItem<T extends AnimationValue> = TweenSequenceConstantItem<T>;
type index_TweenSequenceItem<T extends AnimationValue> = TweenSequenceItem<T>;
type index_TweenType = TweenType;
declare const index_UnconstrainedBox: typeof UnconstrainedBox;
type index_UnconstrainedBoxProps = UnconstrainedBoxProps;
type index_UserScrollNotification = UserScrollNotification;
type index_Velocity = Velocity;
type index_VerticalDirection = VerticalDirection;
declare const index_WebView: typeof WebView;
type index_WebViewController = WebViewController;
declare const index_WebViewController: typeof WebViewController;
type index_WebViewProps = WebViewProps;
type index_WebViewSettings = WebViewSettings;
declare const index_Wrap: typeof Wrap;
type index_WrapAlignment = WrapAlignment;
type index_WrapCrossAlignment = WrapCrossAlignment;
type index_WrapProps = WrapProps;
declare const index_useAnimationController: typeof useAnimationController;
declare const index_useLayerLink: typeof useLayerLink;
declare const index_useNavigator: typeof useNavigator;
declare const index_useTabController: typeof useTabController;
declare const index_useTickerManager: typeof useTickerManager;
declare namespace index {
export { index_AbsorbPointer as AbsorbPointer, type index_AbsorbPointerProps as AbsorbPointerProps, type index_AixsDirection as AixsDirection, type index_Alignment as Alignment, index_AnimatedAlign as AnimatedAlign, type index_AnimatedAlignProps as AnimatedAlignProps, index_AnimatedContainer as AnimatedContainer, type index_AnimatedContainerProps as AnimatedContainerProps, index_AnimatedOpacity as AnimatedOpacity, type index_AnimatedOpacityProps as AnimatedOpacityProps, index_AnimatedPadding as AnimatedPadding, type index_AnimatedPaddingProps as AnimatedPaddingProps, index_AnimatedPositioned as AnimatedPositioned, type index_AnimatedPositionedProps as AnimatedPositionedProps, index_AnimatedRotation as AnimatedRotation, type index_AnimatedRotationProps as AnimatedRotationProps, index_AnimatedScale as AnimatedScale, type index_AnimatedScaleProps as AnimatedScaleProps, index_AnimatedSize as AnimatedSize, type index_AnimatedSizeProps as AnimatedSizeProps, index_AnimatedSlide as AnimatedSlide, type index_AnimatedSlideProps as AnimatedSlideProps, type index_AnimationControllerIntialOptions as AnimationControllerIntialOptions, type index_AnimationInitalOptions as AnimationInitalOptions, type index_AnimationStatus as AnimationStatus, type index_AnimationStatusListener as AnimationStatusListener, type index_AnimationValue as AnimationValue, index_AspectRatio as AspectRatio, type index_AspectRatioProps as AspectRatioProps, index_AutoSizeText as AutoSizeText, type index_AutoSizeTextProps as AutoSizeTextProps, type index_Axis as Axis, index_BackdropFilter as BackdropFilter, type index_BackdropFilterProps as BackdropFilterProps, index_Baseline as Baseline, type index_BaselineProps as BaselineProps, type index_BlendMode as BlendMode, type index_BlurStyle as BlurStyle, type index_BorderRadius as BorderRadius, type index_BorderSide as BorderSide, index_BottomNavigationBarItem as BottomNavigationBarItem, type index_BottomNavigationBarItemProps as BottomNavigationBarItemProps, type index_BoxConstraints as BoxConstraints, type index_BoxDecoration as BoxDecoration, type index_BoxFit as BoxFit, type index_BoxShadow as BoxShadow, type index_Brightness as Brightness, index_CSSFilter as CSSFilter, type index_CSSFilterMatrix as CSSFilterMatrix, index_CSSFilterPresets as CSSFilterPresets, type index_CSSFilterPresetsEffect as CSSFilterPresetsEffect, type index_CSSFilterPresetsProps as CSSFilterPresetsProps, type index_CSSFilterProps as CSSFilterProps, index_Center as Center, type index_CenterProps as CenterProps, index_CircularProgressIndicator as CircularProgressIndicator, type index_CircularProgressIndicatorProps as CircularProgressIndicatorProps, type index_Clip as Clip, index_ClipOval as ClipOval, type index_ClipOvalProps as ClipOvalProps, index_ClipRRect as ClipRRect, type index_ClipRRectProps as ClipRRectProps, index_ClipRect as ClipRect, type index_ClipRectProps as ClipRectProps, type index_Color as Color, index_Column as Column, type index_ColumnProps as ColumnProps, index_CompositedTransformFollower as CompositedTransformFollower, type index_CompositedTransformFollowerProps as CompositedTransformFollowerProps, index_CompositedTransformTarget as CompositedTransformTarget, type index_CompositedTransformTargetProps as CompositedTransformTargetProps, index_ConstrainedBox as ConstrainedBox, type index_ConstrainedBoxProps as ConstrainedBoxProps, index_Container as Container, type index_ContainerProps as ContainerProps, type index_CrossAxisAlignment as CrossAxisAlignment, index_CupertinoActionSheet as CupertinoActionSheet, index_CupertinoActionSheetAction as CupertinoActionSheetAction, type index_CupertinoActionSheetActionProps as CupertinoActionSheetActionProps, type index_CupertinoActionSheetProps as CupertinoActionSheetProps, index_CupertinoActivityIndicator as CupertinoActivityIndicator, type index_CupertinoActivityIndicatorProps as CupertinoActivityIndicatorProps, index_CupertinoAlertDialog as CupertinoAlertDialog, type index_CupertinoAlertDialogProps as CupertinoAlertDialogProps, index_CupertinoButton as CupertinoButton, type index_CupertinoButtonProps as CupertinoButtonProps, index_CupertinoContextMenu as CupertinoContextMenu, index_CupertinoContextMenuAction as CupertinoContextMenuAction, type index_CupertinoContextMenuActionProps as CupertinoContextMenuActionProps, type index_CupertinoContextMenuProps as CupertinoContextMenuProps, index_CupertinoDatePicker as CupertinoDatePicker, type index_CupertinoDatePickerMode as CupertinoDatePickerMode, type index_CupertinoDatePickerProps as CupertinoDatePickerProps, index_CupertinoDialogAction as CupertinoDialogAction, type index_CupertinoDialogActionProps as CupertinoDialogActionProps, index_CupertinoFormRow as CupertinoFormRow, type index_CupertinoFormRowProps as CupertinoFormRowProps, index_CupertinoFormSection as CupertinoFormSection, type index_CupertinoFormSectionProps as CupertinoFormSectionProps, type index_CupertinoIcons as CupertinoIcons, index_CupertinoListSection as CupertinoListSection, type index_CupertinoListSectionProps as CupertinoListSectionProps, index_CupertinoListTile as CupertinoListTile, index_CupertinoListTileChevron as CupertinoListTileChevron, type index_CupertinoListTileProps as CupertinoListTileProps, index_CupertinoNavigationBar as CupertinoNavigationBar, index_CupertinoNavigationBarBackButton as CupertinoNavigationBarBackButton, type index_CupertinoNavigationBarBackButtonProps as CupertinoNavigationBarBackButtonProps, type index_CupertinoNavigationBarProps as CupertinoNavigationBarProps, index_CupertinoPageScaffold as CupertinoPageScaffold, type index_CupertinoPageScaffoldProps as CupertinoPageScaffoldProps, index_CupertinoPicker as CupertinoPicker, index_CupertinoPickerDefaultSelectionOverlay as CupertinoPickerDefaultSelectionOverlay, type index_CupertinoPickerDefaultSelectionOverlayProps as CupertinoPickerDefaultSelectionOverlayProps, type index_CupertinoPickerProps as CupertinoPickerProps, index_CupertinoScrollerBar as CupertinoScrollerBar, type index_CupertinoScrollerBarProps as CupertinoScrollerBarProps, index_CupertinoSearchTextField as CupertinoSearchTextField, type index_CupertinoSearchTextFieldProps as CupertinoSearchTextFieldProps, index_CupertinoSegmentedControl as CupertinoSegmentedControl, type index_CupertinoSegmentedControlProps as CupertinoSegmentedControlProps, index_CupertinoSlider as CupertinoSlider, type index_CupertinoSliderProps as CupertinoSliderProps, index_CupertinoSlidingSegmentedControl as CupertinoSlidingSegmentedControl, type index_CupertinoSlidingSegmentedControlProps as CupertinoSlidingSegmentedControlProps, index_CupertinoSliverNavigationBar as CupertinoSliverNavigationBar, type index_CupertinoSliverNavigationBarProps as CupertinoSliverNavigationBarProps, index_CupertinoSliverRefreshControl as CupertinoSliverRefreshControl, type index_CupertinoSliverRefreshControlProps as CupertinoSliverRefreshControlProps, index_CupertinoSwitch as CupertinoSwitch, type index_CupertinoSwitchProps as CupertinoSwitchProps, index_CupertinoTabBar as CupertinoTabBar, type index_CupertinoTabBarProps as CupertinoTabBarProps, index_CupertinoTextField as CupertinoTextField, type index_CupertinoTextFieldProps as CupertinoTextFieldProps, index_CupertinoTimerPicker as CupertinoTimerPicker, type index_CupertinoTimerPickerMode as CupertinoTimerPickerMode, type index_CupertinoTimerPickerProps as CupertinoTimerPickerProps, type index_Curve as Curve, index_CustomScrollView as CustomScrollView, type index_CustomScrollViewProps as CustomScrollViewProps, type index_DatePickerDateOrder as DatePickerDateOrder, index_DefaultTabController as DefaultTabController, type index_DefaultTabControllerProps as DefaultTabControllerProps, index_DefaultTextStyle as DefaultTextStyle, type index_DefaultTextStyleProps as DefaultTextStyleProps, type index_DismissDirection as DismissDirection, index_Dismissable as Dismissable, type index_DismissableProps as DismissableProps, index_DottedBorder as DottedBorder, type index_DottedBorderProps as DottedBorderProps, index_DottedLine as DottedLine, type index_DottedLineProps as DottedLineProps, type index_DragDownDetails as DragDownDetails, type index_DragEndDetails as DragEndDetails, type index_DragUpdateDetails as DragUpdateDetails, type index_EdgeInsets as EdgeInsets, type index_EdgeInsetsDirectional as EdgeInsetsDirectional, type index_EventPosition as EventPosition, index_Expanded as Expanded, type index_ExpandedProps as ExpandedProps, type index_FilterQuality as FilterQuality, index_FittedBox as FittedBox, type index_FittedBoxProps as FittedBoxProps, type index_FontStyle as FontStyle, type index_FontWeight as FontWeight, index_GestureDetector as GestureDetector, type index_GestureDetectorProps as GestureDetectorProps, index_Gif as Gif, type index_GifProps as GifProps, type index_GridDelegateWithFixedCrossAxisCount as GridDelegateWithFixedCrossAxisCount, type index_GridDelegateWithMaxCrossAxisExtent as GridDelegateWithMaxCrossAxisExtent, index_GridView as GridView, type index_GridViewCommonProps as GridViewCommonProps, type index_GridViewFixedCrossAxisCountProps as GridViewFixedCrossAxisCountProps, type index_GridViewMaxCrossAxisExtentProps as GridViewMaxCrossAxisExtentProps, type index_GridViewProps as GridViewProps, index_Hero as Hero, type index_HeroProps as HeroProps, index_Icon as Icon, type index_IconProps as IconProps, index_IgnorePointer as IgnorePointer, type index_IgnorePointerProps as IgnorePointerProps, index_Image as Image, type index_ImageByteFormat as ImageByteFormat, type index_ImageFilter as ImageFilter, type index_ImageFilterBlur as ImageFilterBlur, type index_ImageFilterCompose as ImageFilterCompose, type index_ImageFilterDilate as ImageFilterDilate, type index_ImageFilterErode as ImageFilterErode, type index_ImageFilterMaxtrix as ImageFilterMaxtrix, type index_ImageProps as ImageProps, type index_ImageRepeat as ImageRepeat, index_IndexedStack as IndexedStack, type index_IndexedStackProps as IndexedStackProps, index_InkWell as InkWell, type index_InkWellProps as InkWellProps, type index_IntervalCurve as IntervalCurve, index_IntrinsicHeight as IntrinsicHeight, type index_IntrinsicHeightProps as IntrinsicHeightProps, index_IntrinsicWidth as IntrinsicWidth, type index_IntrinsicWidthProps as IntrinsicWidthProps, type index_KeyProps as KeyProps, index_LayerLink as LayerLink, type index_LinearGradient as LinearGradient, index_LinearProgressIndicator as LinearProgressIndicator, type index_LinearProgressIndicatorProps as LinearProgressIndicatorProps, index_ListView as ListView, type index_ListViewProps as ListViewProps, type index_MainAxisAlignment as MainAxisAlignment, type index_MainAxisSize as MainAxisSize, index_Material as Material, type index_MaterialProps as MaterialProps, index_Navigator as Navigator, type index_NavigatorProps as NavigatorProps, type index_NavigatorRef as NavigatorRef, index_NestedScrollView as NestedScrollView, type index_NestedScrollViewProps as NestedScrollViewProps, index_NetworkImage as NetworkImage, type index_NetworkImageProps as NetworkImageProps, type index_NormalCurve as NormalCurve, type index_Offset as Offset, index_Opacity as Opacity, type index_OpacityProps as OpacityProps, type index_OverScrollNotification as OverScrollNotification, index_OverflowBox as OverflowBox, type index_OverflowBoxProps as OverflowBoxProps, index_Overlay as Overlay, type index_OverlayProps as OverlayProps, type index_OverlayVisibilityMode as OverlayVisibilityMode, index_Padding as Padding, type index_PaddingProps as PaddingProps, index_PageView as PageView, type index_PageViewProps as PageViewProps, type index_PaintRect as PaintRect, type index_PaintSize as PaintSize, index_PopScope as PopScope, type index_PopScopeProps as PopScopeProps, index_Positioned as Positioned, type index_PositionedProps as PositionedProps, index_QrImage as QrImage, type index_QrImageProps as QrImageProps, type index_RadialGradient as RadialGradient, type index_RefProps as RefProps, index_RefreshIndicator as RefreshIndicator, type index_RefreshIndicatorProps as RefreshIndicatorProps, type index_RelativeRect as RelativeRect, index_ReorderableListView as ReorderableListView, type index_ReorderableListViewProps as ReorderableListViewProps, index_RepaintBoundary as RepaintBoundary, type index_RepaintBoundaryProps as RepaintBoundaryProps, type index_RepaintBoundaryRef as RepaintBoundaryRef, index_RichText as RichText, type index_RichTextProps as RichTextProps, index_RotatedBox as RotatedBox, type index_RotatedBoxProps as RotatedBoxProps, index_Row as Row, type index_RowProps as RowProps, index_SafeArea as SafeArea, type index_SafeAreaProps as SafeAreaProps, type index_ScaleEndDetails as ScaleEndDetails, type index_ScaleStartDetails as ScaleStartDetails, type index_ScaleUpdateDetails as ScaleUpdateDetails, type index_ScrollEndNotification as ScrollEndNotification, type index_ScrollMetrics as ScrollMetrics, type index_ScrollNotification as ScrollNotification, index_ScrollNotificationListener as ScrollNotificationListener, type index_ScrollNotificationListenerProps as ScrollNotificationListenerProps, type index_ScrollOrientation as ScrollOrientation, type index_ScrollPhysics as ScrollPhysics, type index_ScrollStartNotification as ScrollStartNotification, type index_ScrollUpdateNotification as ScrollUpdateNotification, type index_ScrollViewKeyboardDismissBehavior as ScrollViewKeyboardDismissBehavior, index_Scrollbar as Scrollbar, type index_ScrollbarProps as ScrollbarProps, index_SingleChildScrollView as SingleChildScrollView, type index_SingleChildScrollViewProps as SingleChildScrollViewProps, index_SizedBox as SizedBox, type index_SizedBoxProps as SizedBoxProps, index_SliverFillRemaining as SliverFillRemaining, type index_SliverFillRemainingProps as SliverFillRemainingProps, index_SliverFixedHeightPersistentHeader as SliverFixedHeightPersistentHeader, type index_SliverFixedHeightPersistentHeaderProps as SliverFixedHeightPersistentHeaderProps, index_SliverToBoxAdapter as SliverToBoxAdapter, type index_SliverToBoxAdapterProps as SliverToBoxAdapterProps, index_Spacer as Spacer, type index_SpacerProps as SpacerProps, index_Stack as Stack, type index_StackFit as StackFit, type index_StackProps as StackProps, index_StickyHeader as StickyHeader, type index_StickyHeaderProps as StickyHeaderProps, index_StringSvg as StringSvg, type index_StringSvgProps as StringSvgProps, type index_StrokeCap as StrokeCap, type index_StrutStyle as StrutStyle, index_Svg as Svg, type index_SvgProps as SvgProps, index_Swiper as Swiper, index_SwiperPagination as SwiperPagination, type index_SwiperPaginationProps as SwiperPaginationProps, type index_SwiperProps as SwiperProps, index_Switch as Switch, type index_SwitchProps as SwitchProps, type index_TabAlignment as TabAlignment, index_TabBar as TabBar, type index_TabBarIndicatorSize as TabBarIndicatorSize, type index_TabBarProps as TabBarProps, index_TabBarView as TabBarView, type index_TabBarViewProps as TabBarViewProps, index_TabController as TabController, index_TabControllerConsumer as TabControllerConsumer, index_TabControllerContext as TabControllerContext, type index_TabControllerProps as TabControllerProps, index_TabControllerProvider as TabControllerProvider, type index_TabControllerRef as TabControllerRef, type index_TabControllerRenderNode as TabControllerRenderNode, type index_TapDownDetails as TapDownDetails, type index_TapUpDetails as TapUpDetails, index_Text as Text, type index_TextAlign as TextAlign, type index_TextBaseLine as TextBaseLine, type index_TextDecoration as TextDecoration, type index_TextDecorationStyle as TextDecorationStyle, type index_TextDirection as TextDirection, index_TextField as TextField, type index_TextFieldProps as TextFieldProps, type index_TextHeightBehavior as TextHeightBehavior, type index_TextInputType as TextInputType, type index_TextLeadingDistribution as TextLeadingDistribution, type index_TextOverflow as TextOverflow, type index_TextProps as TextProps, index_TextSpan as TextSpan, type index_TextSpanProps as TextSpanProps, type index_TextStyle as TextStyle, type index_TextWidthBasis as TextWidthBasis, index_Ticker as Ticker, index_TickerManager as TickerManager, index_TickerManagerConsumer as TickerManagerConsumer, index_TickerManagerProvider as TickerManagerProvider, type index_TickerManagerProviderProps as TickerManagerProviderProps, type index_TickerManagerRef as TickerManagerRef, type index_TileMode as TileMode, index_TransformRotate as TransformRotate, type index_TransformRotateProps as TransformRotateProps, index_TransformScale as TransformScale, type index_TransformScaleProps as TransformScaleProps, index_TransformTranslate as TransformTranslate, type index_TransformTranslateProps as TransformTranslateProps, type index_Tween as Tween, type index_TweenSequence as TweenSequence, type index_TweenSequenceConstantItem as TweenSequenceConstantItem, type index_TweenSequenceItem as TweenSequenceItem, type index_TweenType as TweenType, index_UnconstrainedBox as UnconstrainedBox, type index_UnconstrainedBoxProps as UnconstrainedBoxProps, type index_UserScrollNotification as UserScrollNotification, type index_Velocity as Velocity, type index_VerticalDirection as VerticalDirection, index_WebView as WebView, index_WebViewController as WebViewController, type index_WebViewProps as WebViewProps, type index_WebViewSettings as WebViewSettings, index_Wrap as Wrap, type index_WrapAlignment as WrapAlignment, type index_WrapCrossAlignment as WrapCrossAlignment, type index_WrapProps as WrapProps, index_useAnimationController as useAnimationController, index_useLayerLink as useLayerLink, index_useNavigator as useNavigator, index_useTabController as useTabController, index_useTickerManager as useTickerManager };
}

declare global {
  const console: {
      log: (...args: any[]) => void;
  };
  const setTimeout: (callback: () => void, timeout?: number) => number;
  const clearTimeout: (timerId: number) => void;
  namespace JSX {
      interface Element extends VirtualNode {
      }
      interface ElementChildrenAttribute {
          children: {};
      }
      interface IntrinsicAttributes extends KeyProps, RefProps {
      }
  }
}

export { type AixsDirection, type Alignment, type AppLifeCycleState, type Axis, type BlendMode, type BlurStyle, type BorderRadius, type BorderSide, type BoxConstraints, type BoxDecoration, type BoxFit, type BoxShadow, type Brightness, CancelToken, ChildrenRule, type Clip, Clipboard, type Color, type ComponentCallback, type ComponentEffect, type ComponentMemo, type ComponentProps, type Consumer, type ConsumerProps, type Context, type CrossAxisAlignment, type CupertinoDialogRoute, type CupertinoModalPopupRoute, type CupertinoPageRoute, type Curve, Device, Dialog, type DialogRoute, type DismissDirection, type Dispatch, type DragDownDetails, type DragEndDetails, type DragUpdateDetails, type EdgeInsets, type EdgeInsetsDirectional, type EffectCallback, type EffectDestructor, type EventPosition, FilePicker, type FilterQuality, type FontStyle, type FontWeight, type FunctionComponent, type ImageFilter, type ImageFilterBlur, type ImageFilterCompose, type ImageFilterDilate, type ImageFilterErode, type ImageFilterMaxtrix, type ImageRepeat, ImageSaver, type IndexRouteObject, type InternalWidgetRender, type IntervalCurve, type KeyProps, type LinearGradient, type LocaleState, type MainAxisAlignment, type MainAxisSize, type MaterialPageRoute, type MediaQueryData, type ModalBottomSheetRoute, type MutableRefObject, Navigation, type NormalCurve, type NormalRouteObject, type Offset, type OtherwiseRouteObject, type OverScrollNotification, type OverlayVisibilityMode, type PageInfo, type PageParamsUpdateEvent, type PagePopEvent, type PagePopResultEvent, type PagePushEvent, type PageRoute, type PaintRect, type PaintSize, type PermissionStatus, type PermissionType, type Provider, type ProviderProps, type PushNamedRouteOptions, type PushRouteOptions, type RadialGradient, type Reducer, type ReducerAction, type ReducerState, type RefObject, type RefProps, type RelativeRect, type RenderNode, type RenderObject, type RenderObjectShowOnScreenOptions, Request, type RouteObject, type RouteParams, Router, RouterProvider, type ScaleEndDetails, type ScaleStartDetails, type ScaleUpdateDetails, ScriptingAppEvents, type ScriptingDeviceInfo, type ScrollEndNotification, type ScrollMetrics, type ScrollNotification, type ScrollOrientation, type ScrollPhysics, type ScrollStartNotification, type ScrollUpdateNotification, type ScrollViewKeyboardDismissBehavior, type SetStateAction, Share, type ShareResultStatus, SocketIO, type StackFit, type StateInitializer, Storage, type StrokeCap, type StrutStyle, type TabAlignment, type TabBarIndicatorSize, type TapDownDetails, type TapUpDetails, type TextAlign, type TextBaseLine, type TextDecoration, type TextDecorationStyle, type TextDirection, type TextHeightBehavior, type TextInputType, type TextLeadingDistribution, type TextOverflow, type TextStyle, type TextWidthBasis, type ThemeState, type TileMode, type TypedParams, type UserScrollNotification, type Velocity, type VerticalDirection, type VirtualNode, index as Widgets, type WrapAlignment, type WrapCrossAlignment, type WrappedRouter, addAppEvent, createContext, createElement, index$1 as fs, getPermissionStatus, isApiEnabled, requestPermission, runApp, useByTheme, useCallback, useCancelToken, useContext, useEffect, useLocale, useMediaQuery, useMemo, useReducer, useRef, useRouteParams, useRouter, useSelector, useState, useThemeState };
export as namespace Scripting;