/**
 * scripting v1.0.0
 * Copyright (c) 2024-present thomfang <tilfon9017@gmail.com>
 * All rights reserved.
 */

type RefObject<T> = {
  readonly current: T | null;
};
type MutableRefObject<T> = {
  current: T;
};
/**
* `useRef` is a Hook that lets you reference a value that’s not needed for rendering.
* @group Hooks
* @example
* ```tsx
* function App() {
*   const [count, setCount] = useState(0)
*   const timerIdRef = useRef<number>() // MutableRefObject
*   const renderObjectRef = useRef<RenderObject>(null)
*
*   useEffect(() => {
*     console.log(
*       renderObjectRef
*         .current?
*         .renderObject
*         .getPaintBounds()
*     )
*   }, [])
*
*   useEffect(() => {
*     function startTimer() {
*       timerIdRef.current = setTimeout(() => {
*         startTimer()
*         setCount(count => count + 1)
*       }, 1000)
*     }
*     return () => {
*       if (timerIdRef.current != null) {
*          clearTimeout(timerIdRef.current)
*       }
*     }
*   }, [])
*
*   return (
*     <Text
*       ref={renderObjectRef}
*     >{count}</Text>
*   )
* }
* ```
*/
declare function useRef<T>(initialValue: T): MutableRefObject<T>;
declare function useRef<T>(initialValue: T | null): RefObject<T>;
declare function useRef<T = undefined>(): MutableRefObject<T | undefined>;

/**
* @group Navigation
*/
declare function runApp(node: VirtualNode): void;

/**
* `useCallback` is a React Hook that lets you cache a function definition between re-renders.
*  You can’t call it inside loops or conditions. If you need that, extract a new component and move the state into it.
*
* @group Hooks
* @example
* ```tsx
* function App() {
*   const [count, setCount] = useState(0)
*   const onButtonClicked = useCallback(() => {
*     setCount(count => count + 1)
*   }, [])
*
*   return (
*     <Column>
*       <Text>{count}</Text>
*       <Button
*         onClick={onButtonClicked}
*       />
*     </Column>
*   )
* }
*
* // This component would not render any more after first render.
* function Button({onClick}: {onClick: () => void}) {
*   return (
*     <CupertinoButton onPressed={onClick}>
*       <Text>Click Me</Text>
*     </CupertinoButton>
*   )
* }
* ```
*/
declare function useCallback<T extends Function>(func: T, deps: any[]): T;

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

/**
* `useContext` is a Hook that lets you read and subscribe to context from your component.
* @group Hooks
* @example
* ```tsx
* const MyContext = createContext<{
*   value: string
* }>()
*
* function Provider({children}: {children: JSX.Element}) {
*   return (
*     <MyContext.Provider value={{
*       value: 'some value here'
*     }}>
*     {children}
*     </MyContext.Provider>
*   )
* }
*
* function App() {
*   const {value} = useContext(MyContext)
*   return (
*     <Text>{value}</Text>
*   )
* }
*
* navigator.push({
*   element: (
*     <Provider>
*       <App/>
*     </Provider>
*   )
* })
* ```
*/
declare function useContext<T>(context: Context<T>): T;
/**
* `useSelector` is a Hook that lets you read and subscribe to a prop of context from your component.
* @group Hooks
* @example
* ```tsx
* const UserContext = createContext<{
*   name: string
*   age: number
*   sex: 'male' | 'female'
* }>()
*
* function Provider({children}: {children: JSX.Element}) {
*   return (
*     <UserContext.Provider value={{
*       name: 'Jerry',
*       age: 8,
*       sex: 'female'
*     }}>
*     {children}
*     </UserContext.Provider>
*   )
* }
*
* function App() {
*   const name = useSelector(UserContext, context => context.name)
*   return (
*     <Text>{name}</Text>
*   )
* }
*
* navigator.push({
*   element: (
*     <Provider>
*       <App/>
*     </Provider>
*   )
* })
* ```
*/
declare function useSelector<T, R>(context: Context<T>, selector: (context: T) => R): R;

/**
* `useEffect` is a Hook that lets you synchronize a component with an external system.
*
* @group Hooks
* @example
* ```tsx
* function ChartRoom({roomId}: {roomId: string}) {
*   const [messages, setMessages] = useState<string[]>([])
*
*   useEffect(() => {
*     // this setup function runs when your component is added to the page (mounts).
*
*     const listener: (message: string) => {
*       setMessages(list => [message, ...list])
*     }
*     subscribeChatMessage(listener)
*
*     // return a cleanup function
*     return () => {
*       // this function would be called when `roomId` is changed or the component is disposed.
*       unsubscribeChatMessage(listener)
*     }
*   }, [roomId])
* }
* ```
*/
declare function useEffect(setup: EffectSetup, deps: any[]): void;

/**
* `useMemo` is a Hook that lets you cache the result of a calculation between re-renders.
* Call useMemo at the top level of your component to cache a calculation between re-renders:
*
* `calculateValue`: The function calculating the value that you want to cache.
* It should be pure, should take no arguments, and should return a value of any type.
* This function would be called during the initial render. On next renders, would
* return the same value again if the dependencies have not changed since the last render.
* Otherwise, it will call calculateValue, return its result, and store it so it can be
* reused later.
*
* `deps`: The list of all reactive values referenced inside of the calculateValue code.
* Reactive values include props, state, and all the variables and functions declared
* directly inside your component body. The list of dependencies must have a constant number of items and be written inline like `[dep1, dep2, dep3]`.
* Will compare each dependency with its previous value using the `Object.is` comparison.
*
* @group Hooks
* @example
* ```tsx
* type Item = {time: number}
* function App({list}: {list: Item[]}) {
*   const [filterTime, setFilterTime] = useState(Date.now())
*   const visibleItems = useMemo(() => {
*      return list.filter(item => item.time <= filterTime)
*   }, [list, filterTime])
*
*   return (
*     <ListView
*       itemCount={visibleItems.length}
*       itemBuilder={index => (
*          <YourListItemView item={visibleItems[index]} />
*       )}
*     />
*   )
* }
* ```
*/
declare function useMemo<T>(calculateValue: () => T, deps: any[]): T;

/**
* `useReducer` is a Hook that lets you add a reducer to your component.
* Call `useReducer` at the top level of your component to manage its state with a reducer.
*
* The `reducer` function that specifies how the state gets updated. It must be pure,
* should take the state and action as arguments, and should return the next state. State and action can be of any types.
*
* The value from which the `initialState` is calculated. It can be a value of any type.
* How the initial state is calculated from it depends on the next init argument.
*
* The `initializer` function that should return the initial state. If it’s not specified,
* the initial state is set to `initialArg`. Otherwise, the initial state is set to the
* result of calling `initializer(initialArg)`.
*
* `useReducer` returns an array with exactly two items:
*   - The `current state` of this state variable, initially set to the initial state you provided.
*   - The `dispatch function` that lets you change it in response to interaction.
*
* To update what’s on the screen, call dispatch with an object representing what the user did, called an action.
*
* @group Hooks
* @example
* ```tsx
* type State = {
*   username: string
*   password: string
* }
* type UpdateUsernameAction = {
*   type: 'updateUsername'
*   payload: string
* }
* type UpdatePasswordAction = {
*   type: 'updatePassword'
*   payload: string
* }
* type Action = UpdateUsernameAction | UpdatePasswordAction
* function Reducer(state: State, action: Action): State {
*   switch (action.type) {
*     case 'updateUsername':
*       return { ...state, username: action.payload }
*     case 'updatePassword':
*       return { ...state, password: action.payload }
*   }
* }
* const initialState: State = {
*   username: '',
*   password: '',
* }
*
* function Form() {
*   const [state, dispatch] = useReducer(Reducer, initialState)
*
*   function updateUsername(value: string) {
*     dispatch({
*       type: 'updateUsername',
*       payload: value,
*     })
*   }
*
*   function updatePassword(value: string) {
*     dispatch({
*       type: 'updatePassword',
*       payload: value,
*     })
*   }
*
*   return (
*     <Column>
*       <CupertinoTextField
*         placeholder="User Name"
*         value={state.username}
*         onChanged={updateUsername}
*       />
*       <CupertinoTextField
*         placeholder="Password"
*         value={state.password}
*         onChanged={updatePassword}
*       />
*     </Column>
*   )
* }
* ```
*/
declare function useReducer<R extends Reducer<any, any>, I>(reducer: R, initializerArg: I & ReducerState<R>, initializer: (arg: I & ReducerState<R>) => ReducerState<R>): [ReducerState<R>, Dispatch<ReducerAction<R>>];
declare function useReducer<R extends Reducer<any, any>>(reducer: R, initialState: ReducerState<R>, initializer?: undefined): [ReducerState<R>, Dispatch<ReducerAction<R>>];

/**
* `useState` is a Hook that lets you add a state variable to your component.
* Call `useState` at the top level of your component to declare a state variable.
*
* `useState` returns an array with exactly two values:
*   - The current state. During the first render, it will match the initialState you have passed.
*   - The set function that lets you update the state to a different value and trigger a re-render.
*
* @group Hooks
* @example
* ```tsx
* function App() {
*   const [count, setCount] = useState()
*
*   // The `setCount` function returned by useState lets you update the state to a different value
*   // and trigger a re-render. You can pass the next state directly, or a function that
*   // calculates it from the previous state:
*   function handlePlus() {
*      setCount(count + 1)
*   }
*   function handleMinus() {
*      setCount(count => count - 1)
*   }
*
*   return (
*     <Row>
*       <CupertinoButton onPressed={handleMinus}>
*        <Text>Minus</Text>
*       </CupertinoButton>
*       <Text>{count}</Text>
*       <CupertinoButton onPressed={handlePlus}>
*        <Text>Plus</Text>
*       </CupertinoButton>
*     </Row>
*   )
* }
* ```
*/
declare function useState<T = undefined>(): [T | undefined, (state: SetStateAction<T | undefined>) => void];
declare function useState<T>(value: T | StateInitializer<T>): [T, (state: SetStateAction<T>) => void];

/**
* @group Hooks
*/
declare function useEffectEvent<T extends any[], R>(callback: ComponentEffectEvent<T, R>): ComponentEffectEvent<T, R>;

declare function createElement<P = {}>(type: FunctionComponent<P>, props: ComponentProps<P>, ...children: VirtualNode[]): VirtualNode;
type CreateElementFunc = typeof createElement;
declare global {
  const createElement: CreateElementFunc;
}

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
type RenderObject = {
  renderObject: {
      showOnScreen(options?: RenderObjectShowOnScreenOptions): void;
      ensureVisible(): void;
      getPaintBounds(): Promise<PaintRect | null>;
      localToGlobal(offset: Offset): Promise<EventPosition | null>;
      globalToLocal(offset: Offset): Promise<EventPosition | null>;
  };
};

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
/**
* An 2D, axis-aligned, floating-point rectangle whose coordinates
* are given relative to another rectangle's edges, known as the container.
* Since the dimensions of the rectangle are relative to those of the container,
* this class has no width and height members.
*/
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
type ColorValueHex = `#${string}`;
type ColorValueRgb = `rgb(${string})`;
type ColorValueRgba = `rgba(${string})`;
type ColorValueHsl = `hsl(${string})`;
type ColorValueHsla = `hsla(${string})`;
/**
* CSS color strings according to CSS Color Module Level 3.
* Hex, RGB(A), HSL(A) and X11 keywords are supported.
* You can also use objects to describe colors.
*
* @example
*  const hex: Color = "#ff0000"
*  const rgbaString: Color = "rgba(0, 0, 255, 1)"
*  const rgbo: Color = { r: 0, g: 255, b: 255, o: 1 }
*  const rgba: Color = { r: 0, g: 255, b: 255, a: 255 }
*  const hexAndOpacity: Color = { hex: '#ff0000', opacity: 0.5 }
*  const cssKeyword: Color = 'transparent'
*/
type Color = CSSColorKeywords | ColorValueHex | ColorValueHsl | ColorValueHsla | ColorValueRgb | ColorValueRgba | {
  r: number;
  g: number;
  b: number;
  /**
   *alpha, 0 ~ 255
   */
  a: number;
} | {
  r: number;
  g: number;
  b: number;
  /**
   * opacity, 0 ~ 1
   */
  o: number;
} | {
  hex: ColorValueHex;
  opacity: number;
};
/**
* How a box should be inscribed into another box.
*/
type BoxFit = 'contain' | 'cover' | 'fill' | 'fitHeight' | 'fitWidth' | 'scaleDown' | 'none';
type ImageRepeat = 'noRepeat' | 'repeat' | 'repeatX' | 'repeatY';
/**
* Typically used for an offset from each of the four sides of a box.
*  For example, the padding inside a box can be represented using this class.
*/
type EdgeInsets = {
  horizontal?: number;
  vertical?: number;
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
};
/**
* A map of offsets in each of the four cardinal directions,
* but whose horizontal components are dependent on the writing direction.
* This can be used to indicate padding from the left in [TextDirection.ltr]
* text and padding from the right in [TextDirection.rtl] text without
* having to be aware of the current text direction.
*/
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
type TextAlignVertical = 'top' | 'center' | 'bottom';
type TextCapitalization = 'none' | 'characters' | 'sentences' | 'words';
type TextInputAction = 'none' | 'continueAction' | 'done' | 'emergencyCall' | 'go' | 'join' | 'newline' | 'next' | 'previous' | 'route' | 'search' | 'send' | 'unspecified';
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
* A point within a rectangle, also keyword strings is supported.
*
* ```
*  topLeft: {x: -1, y: -1}
*  center: {x: 0, y: 0}
*  bottomRight: {x: 1, y: 1}
* ```
*/
type Alignment = Offset | 'topLeft' | 'topCenter' | 'topRight' | 'centerLeft' | 'center' | 'centerRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight';
/**
* How `<Wrap/>` should align objects.
* Used both to align children within a run in the main axis as well
* as to align the runs themselves in the cross axis.
*/
type WrapAlignment = 'start' | 'end' | 'center' | 'spaceBetween' | 'spaceAround' | 'spaceEvenly';
/**
* How `<Wrap/>` should align children within a run in the cross axis.
*/
type WrapCrossAlignment = 'start' | 'end' | 'center';
/**
* A side of a border of a box.
* Setting `BorderSide.width` to 0.0 will result in hairline rendering;
* see `BorderSide.width` for a more involved explanation.
*/
type BorderSide = {
  color?: Color;
  /**
   * The width of this side of the border, in logical pixels.
   *
   * Setting width to 0.0 will result in a hairline border. This means that
   * the border will have the width of one physical pixel. Hairline
   * rendering takes shortcuts when the path overlaps a pixel more than once.
   * This means that it will render faster than otherwise, but it might
   * double-hit pixels, giving it a slightly darker/lighter result.
   *
   * To omit the border entirely, set the `style` to "none".
   */
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
/**
* A shadow cast by a box.
* `BoxShadow` can cast non-rectangular shadows if the box is non-rectangular
* (e.g., has a border radius or a circular shape).
*
* This map is similar to CSS box-shadow.
*/
type BoxShadow = {
  color: Color;
  blurRadius: number;
  offset?: Offset;
  spreadRadius?: number;
  blurStyle?: BlurStyle;
};
type TileMode = 'clamp' | 'repeated' | 'mirror' | 'decal';
type BoxShape = 'rectangle' | 'circle';
/**
* A description of how to paint a box.
*
* The box has a `border`, a body, and may cast a `boxShadow`.
*
* The `shape` of the box can be a circle or a rectangle.
* If it is a rectangle, then the `borderRadius` property controls
* the roundness of the corners.
*
* The body of the box is painted in layers. The bottom-most layer is the `color`,
* which fills the box. Above that is the `gradient`, which also fills the box.
*
* The `border` paints over the body; the `boxShadow`, naturally, paints below it.
*/
type BoxDecoration = {
  color?: Color;
  border?: BorderSide | {
      left?: BorderSide;
      right?: BorderSide;
      top?: BorderSide;
      bottom?: BorderSide;
  };
  /**
   * If the value is set to a number, all will take effect.
   */
  borderRadius?: number | BorderRadius;
  boxShadow?: BoxShadow[];
  gradient?: LinearGradient | RadialGradient | SweepGradient;
};
type BoxConstraints = {
  minWidth?: number;
  maxWidth?: number | 'infinity';
  minHeight?: number;
  maxHeight?: number | 'infinity';
};
type LinearGradient = {
  type: 'LinearGradient';
  begin?: Alignment;
  end?: Alignment;
  colors: Color[];
  /**
   * If it is not empty, it must be consistent with the array length of "colors",
   * indicating the distribution of each color in 0 ~ 1
   */
  stops?: number[];
  tileMode?: TileMode;
};
type RadialGradient = {
  type: 'RadialGradient';
  colors: Color[];
  center?: Alignment;
  radius?: number;
  /**
   * If it is not empty, it must be consistent with the array length of "colors",
   * indicating the distribution of each color in 0 ~ 1
   */
  stops?: number[];
  tileMode?: TileMode;
  focal?: Alignment;
  focalRadius?: number;
};
type SweepGradient = {
  type: 'SweepGradient';
  colors: Color[];
  center?: Alignment;
  /**
   * If it is not empty, it must be consistent with the array length of "colors",
   * indicating the distribution of each color in 0 ~ 1
   */
  stops?: number[];
  startAngle?: number;
  endAngle?: number;
  tileMode?: TileMode;
};
type MainAxisAlignment = 'start' | 'end' | 'center' | 'spaceBetween' | 'spaceAround' | 'spaceEvenly';
type CrossAxisAlignment = 'start' | 'end' | 'center' | 'stretch' | 'baseline';
type MainAxisSize = 'max' | 'min';
type VerticalDirection = 'down' | 'up';
type HitTestBehavior = 'opaque' | 'deferToChild' | 'translucent';
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
   *   *  `horizontalScale`, which is the scale along the horizontal axis.
   *   *  `verticalScale`, which is the scale along the vertical axis.
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
/**
* `left` Place towards the left of the screen.
*
* `right` Place towards the right of the screen.
*
* `top` Place on top of the screen.
*
* `bottom` Place on the bottom of the screen.
*/
type ScrollOrientation = 'left' | 'right' | 'top' | 'bottom';
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
   * The current scroll position, in logical pixels along the  `axisDirection`
   */
  pixels: number;
  /**
   * The maximum in-range value for  `pixels`.
   *
   * The actual  `pixels` value might be  `outOfRange`.
   *
   * This value should typically be non-null and greater than or equal to  `minScrollExtent`. It can be infinity, if the scroll is unbounded.
   */
  maxScrollExtent: number;
  /**
   * The minimum in-range value for  `pixels`.
   *
   * The actual  `pixels` value might be  `outOfRange`.
   *
   * This value should typically be non-null and less than or equal to  `maxScrollExtent`. It can be negative infinity, if the scroll is unbounded.
   */
  minScrollExtent: number;
  /**
   * The extent of the viewport along the  `axisDirection`.
   */
  viewportDimension: number;
  /**
   * The quantity of content conceptually "below" the viewport in the scrollable.
   *
   * This is the content below the content described by  `extentInside`.
   */
  extentAfter: number;
  /**
   * The quantity of content conceptually "above" the viewport in the scrollable.
   *
   * This is the content above the content described by  `extentInside`.
   */
  extentBefore: number;
  /**
   * The quantity of content conceptually "inside" the viewport in the scrollable.
   *
   * The value is typically the height of the viewport when  `outOfRange` is false. It could be less if there is less content visible than the size of the viewport, such as when overscrolling.
   *
   * The value is always non-negative, and less than or equal to  `viewportDimension`.
   */
  extentInside: number;
  /**
   * Whether the  `pixels` value is exactly at the  `minScrollExtent` or the  `maxScrollExtent`
   */
  atEdge: boolean;
  /**
   * Whether the  `pixels` value is outside the  `minScrollExtent` and  `maxScrollExtent`.
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
   * Typically listeners only respond to notifications with a  `depth` of zero.
   *
   * Specifically, this is the number of  `Widget`s representing  `RenderAbstractViewport` render objects through which this notification has bubbled.
   */
  depth: number;
  /**
   * A description of a  `Scrollable`'s contents, useful for modeling the state of its viewport.
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
   * The number of logical pixels that the  `Scrollable` avoided scrolling.
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
/**
* - `never` Overlay will never appear regardless of the text entry state.
*
* - `editing` Overlay will only appear when the current text entry is not empty.
*
* This includes prefilled text that the user did not type in manually. But
* does not include text in placeholders.
*
* - `notEditing` Overlay will only appear when the current text entry is empty.
*
* This also includes not having prefilled text that the user did not type
* in manually. Texts in placeholders are ignored.
*
* - `always` Always show the overlay regardless of the text entry state.
*/
type OverlayVisibilityMode = 'never' | 'editing' | 'notEditing' | 'always';
type TabAlignment = 'start' | 'startOffset' | 'fill' | 'center';
/**
* Where to vertically align the placeholder relative to the surrounding text.
*
* - `baseline`
* Match the baseline of the placeholder with the baseline.
 
* The  `TextBaseline` to use must be specified and non-null when using this
* alignment mode.

* - `aboveBaseline`
* Align the bottom edge of the placeholder with the baseline such that the
* placeholder sits on top of the baseline.

* The  `TextBaseline` to use must be specified and non-null when using this
* alignment mode.
* - `belowBaseline`
* Align the top edge of the placeholder with the baseline specified
* such that the placeholder hangs below the baseline.

* The  `TextBaseline` to use must be specified and non-null when using this
* alignment mode.
* - `top`
* Align the top edge of the placeholder with the top edge of the text.

* When the placeholder is very tall, the extra space will hang from
* the top and extend through the bottom of the line.
* - `bottom`
* Align the bottom edge of the placeholder with the bottom edge of the text.

* When the placeholder is very tall, the extra space will rise from the
* bottom and extend through the top of the line.

* - `middle`
* Align the middle of the placeholder with the middle of the text.

* When the placeholder is very tall, the extra space will grow equally
* from the top and bottom of the line.
*/
type PlaceholderAlignment = 'aboveBaseline' | 'baseline' | 'belowBaseline' | 'top' | 'middle';
type CSSColorKeywords = "transparent" | "aliceblue" | "antiquewhite" | "aqua" | "aquamarine" | "azure" | "beige" | "bisque" | "black" | "blanchedalmond" | "blue" | "blueviolet" | "brown" | "burlywood" | "cadetblue" | "chartreuse" | "chocolate" | "coral" | "cornflowerblue" | "cornsilk" | "crimson" | "cyan" | "darkblue" | "darkcyan" | "darkgoldenrod" | "darkgray" | "darkgreen" | "darkgrey" | "darkkhaki" | "darkmagenta" | "darkolivegreen" | "darkorange" | "darkorchid" | "darkred" | "darksalmon" | "darkseagreen" | "darkslateblue" | "darkslategray" | "darkslategrey" | "darkturquoise" | "darkviolet" | "deeppink" | "deepskyblue" | "dimgray" | "dimgrey" | "dodgerblue" | "firebrick" | "floralwhite" | "forestgreen" | "fuchsia" | "gainsboro" | "ghostwhite" | "gold" | "goldenrod" | "gray" | "green" | "greenyellow" | "grey" | "honeydew" | "hotpink" | "indianred" | "indigo" | "ivory" | "khaki" | "lavender" | "lavenderblush" | "lawngreen" | "lemonchiffon" | "lightblue" | "lightcoral" | "lightcyan" | "lightgoldenrodyellow" | "lightgray" | "lightgreen" | "lightgrey" | "lightpink" | "lightsalmon" | "lightseagreen" | "lightskyblue" | "lightslategray" | "lightslategrey" | "lightsteelblue" | "lightyellow" | "lime" | "limegreen" | "linen" | "magenta" | "maroon" | "mediumaquamarine" | "mediumblue" | "mediumorchid" | "mediumpurple" | "mediumseagreen" | "mediumslateblue" | "mediumspringgreen" | "mediumturquoise" | "mediumvioletred" | "midnightblue" | "mintcream" | "mistyrose" | "moccasin" | "navajowhite" | "navy" | "oldlace" | "olive" | "olivedrab" | "orange" | "orangered" | "orchid" | "palegoldenrod" | "palegreen" | "paleturquoise" | "palevioletred" | "papayawhip" | "peachpuff" | "peru" | "pink" | "plum" | "powderblue" | "purple" | "red" | "rosybrown" | "royalblue" | "saddlebrown" | "salmon" | "sandybrown" | "seagreen" | "seashell" | "sienna" | "silver" | "skyblue" | "slateblue" | "slategray" | "slategrey" | "snow" | "springgreen" | "steelblue" | "tan" | "teal" | "thistle" | "tomato" | "turquoise" | "violet" | "wheat" | "white" | "whitesmoke" | "yellow" | "yellowgreen";

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
type EffectSetup = () => EffectDestructor | void | undefined;
type ComponentEffect = [any[], EffectSetup, boolean, ReturnType<EffectSetup>];
type ComponentEffectEvent<T extends any[], R> = (...args: T) => R;
type ComponentCallback<T extends Function> = [T, any[]];
type ComponentMemo = [any, any[]];
type Reducer<S, A> = (preState: S, action: A) => S;
type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any> ? S : never;
type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<any, infer A> ? A : never;
type Dispatch<A> = (action: A) => void;

type PagePopEvent<T> = {
  pageId: string;
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
/**
* A route that is used as an index and rendered as the default route after the `Router` resolves it.
*/
type IndexRouteObject = NormalRouteObject & {
  index: true;
  defaultParams?: {
      [key: string]: any;
  };
};
/**
* Rendered as a fallback route when no route is matched.
*/
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
/**
* @group Navigation
*/
declare class Router {
  routes: RouteObject[];
  constructor(routes: RouteObject[]);
  private _pages;
  private _callbacks;
  private _isInited;
  private _navigatorKey?;
  private _sentMap;
  /**
   * @internal
   */
  get pages(): PageInfo[];
  private _onPagePop;
  private _notify;
  /**
   * @internal
   */
  init(navigatorKey?: string): void;
  /**
   * @internal
   */
  reset(): void;
  /**
   * @internal
   */
  push<T, P extends RouteParams>(options: PushRouteOptions<P>): Promise<T | null | undefined>;
  /**
   * @internal
   */
  pushNamed<T, P extends RouteParams = object>(options: PushNamedRouteOptions<P>): Promise<T | null | undefined>;
  /**
   * @internal
   */
  pop<T>(result?: T): void;
  /**
   * @internal
   */
  getPageCount(): number;
  /**
   * @internal
   */
  subscribe(callback: PageInfoSubscriber): () => void;
  /**
   * @internal
   */
  getIndexRouteElement(): VirtualNode | undefined;
  /**
   * @internal
   */
  pageReady(page: PageInfo, componentId: string): void;
}

/**
* @group Hooks
*/
declare function useRouteParams<T extends RouteParams>(): T | undefined | null;

type WrappedRouter = {
  push: <T, P extends RouteParams>(options: PushRouteOptions<P>) => Promise<T | null | undefined>;
  pushNamed: <T, P extends RouteParams>(options: PushNamedRouteOptions<P>) => Promise<T | null | undefined>;
  pop: <T>(result?: T | undefined) => void;
  getPageCount: () => number;
};

/**
* @group Hooks
*/
declare function useRouter(): WrappedRouter;
/**
* @group Widgets
* @group Navigation
*/
declare function RouterProvider({ router }: {
  router: Router;
}): JSX.Element;

/**
* @group Navigation
*/
declare const navigator: {
  /**
   * Push a page by `element`, `pageRoute` and `params`.
   * @example
   * ```tsx
   * function App({title}: {title: string}) {
   *   const {value} = useRouteParams<{value: number}>()!
   *   return (
   *     <Column>
   *       <Text>{title}</Text>
   *       <Center>
   *         <Text>{value}</Text>
   *       </Center>
   *     </Column>
   *   )
   * }
   *
   * navigator.push({
   *   element: <App title="" />,
   *   pageRoute: {
   *     type: 'CupertinoPageRoute',
   *   },
   *   params: {
   *     value: 123
   *   }
   * })
   * ```
   */
  push<T, P extends RouteParams>(options: PushRouteOptions<P>): Promise<T | null | undefined>;
  /**
   * Pop the top-most route off the navigator that most tightly encloses the given context.
   *
   * @example
   * ```tsx
   * function App() {
   *   function pop() {
   *     navigator.pop(123)
   *   }
   *
   *   return (
   *     <Center>
   *       <CupertinoButton onPressed={pop}>
   *         <Text>Close</Text>
   *       </CupertinoButton>
   *     </Center>
   *   )
   * }
   *
   * async function run() {
   *   const result = await navigator.push({
   *     element: <App/>
   *   })
   *   console.log(result) // output: 123
   * }
   * run()
   * ```
   */
  pop<T_1>(result?: T_1 | undefined): void;
};

type Orientation = 'portrait' | 'landscape';
type ThemeMode = 'light' | 'dark' | 'system';
type DeviceOrientation = 'portraitUp' | 'landscapeLeft' | 'portraitDown' | 'landscapeRight';
type MediaQueryData = {
  size: {
      width: number;
      height: number;
  };
  orientation: Orientation;
  devicePixelRatio: number;
  textScaleFactor: number;
  platformBrightness: Brightness;
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
/**
* @internal
*/
type ScriptingDeviceInfo = {
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
  brightness: Brightness;
};
type LocaleState = {
  locale: string;
};
type ShareResultStatus = 'success' | 'dismissed' | 'unavailable';
type AppLifeCycleState = 'resumed' | 'inactive' | 'paused' | 'detached' | 'hidden';

/**
* @group Hooks
*/
declare function useByTheme<T>({ dark, light }: {
  dark: T;
  light: T;
}): T;

/**
* @group Hooks
*/
declare function useLocale(): string;

/**
* @group Hooks
*/
declare function useThemeState(): ThemeState;

/**
* @group Hooks
*/
declare function useMediaQuery(): MediaQueryData;

declare class AppEventEmitter<R> {
  private event;
  constructor(event: string);
  on(listener: (data: R) => void): void;
  off(listener: (data: R) => void): void;
}
/**
* @group UI
*/
declare class AppEvents {
  static appLifeCycleStateChanged: AppEventEmitter<AppLifeCycleState>;
  static mediaQueryDataChanged: AppEventEmitter<MediaQueryData>;
  static localeChanged: AppEventEmitter<LocaleState>;
  static appDispose: AppEventEmitter<void>;
}

/**
* @group Ability
*/
declare class Clipboard {
  /**
   * Copy text to clipboard.
   * @param text Text content
   * @returns
   */
  static copyText(text: string): Promise<boolean>;
  /**
   * Get text form clipboard.
   * @returns Text content string or null
   */
  static getText(): Promise<string | null>;
}

/**
* Indicates the current battery state.
*/
declare enum BatteryState {
  /**
   * The battery is fully charged.
   */
  full = 0,
  /**
   * The battery is currently charging.
   */
  charging = 1,
  /**
   * Device is connected to external power source, but not charging the battery.
   *
   * Usually happens when device has charge limit enabled and this limit is reached.
   * Also, battery might be in this state if connected power source isn't powerful enough to charge the battery.
   *
   * Available on Android, MacOS and Linux platforms only.
   */
  connectedNotCharging = 2,
  /**
   * The battery is currently losing energy.
   */
  discharging = 3,
  /**
   * The state of the battery is unknown.
   */
  unknown = 4
}

type ImpactFeedBackStyle = 'heavyImpact' | 'lightImpact' | 'mediumImpact' | 'selectionClick';

type AnimatedAlignProps = {
  alignment: Alignment;
  duration: number;
  heightFactor?: number;
  widthFactor?: number;
  curve?: Curve;
  onEnd?: () => void;
  children?: VirtualNode;
};
/**
* Animated version of `Align` which automatically transitions the child's
* position over a given `duration` whenever the given `alignment` changes.
*
* @group Widgets
* @group Animation
* @example
* ```tsx
* // This will control the `alignment` of the first `Container`
* <AnimatedAlign
*   alignment={'topLeft'}
*   duration={200}
*   curve={'ease'}
* >
*   <Container
*     width={200}
*     height={200}
*   >
*    <Container
*      width={50}
*      height={50}
*      color={'red'}
*    />
*   </Container>
* </AnimatedAlign>
* ```
*/
declare const AnimatedAlign: FunctionComponent<AnimatedAlignProps>;

type ContainerProps = BoxDecoration & BoxConstraints & {
  children?: VirtualNode;
  width?: number | 'infinity';
  height?: number | 'infinity';
  /** Setting the value to number will take effect for left, top, right and bottom. */
  margin?: EdgeInsets | number;
  /** Setting the value will take effect for left, top, right and bottom. */
  padding?: EdgeInsets | number;
  alignment?: Alignment;
  clipBehavior?: Clip;
  foregroundDecoration?: BoxDecoration;
};
/**
* Creates a widget that combines common painting, positioning, and sizing widgets.
*
* The `height` and `width` values include the padding.
*
* @group Widgets
* @group Layout
* @group Basic
*/
declare const Container: FunctionComponent<ContainerProps>;

type AnimatedContainerProps = ContainerProps & {
  duration: number;
  curve?: Curve;
  onEnd?: () => void;
};
/**
* Animated version of `Container` that gradually changes its values over a period of time.
*
* The `AnimatedContainer` will automatically animate between the old and new values of
* properties when they change using the provided curve and duration.
* Properties that are null are not animated. Its child and descendants are not animated.
*
* @group Widgets
* @group Animation
*/
declare const AnimatedContainer: FunctionComponent<AnimatedContainerProps>;

type AnimatedOpacityProps = {
  opacity: number;
  duration: number;
  curve?: Curve;
  onEnd?: () => void;
  alwaysIncludeSemantics?: boolean;
  children?: VirtualNode;
};
/**
* Animated version of `Opacity` which automatically transitions the child's opacity
* over a given duration whenever the given opacity changes.
*
* @group Widgets
* @group Animation
* @example
* ```tsx
* function App() {
*   const [visible, setVisible] = useState(true)
*
*   return (
*     <GesutureDetector onTap={() => {
*       setVisible(!visible)
*     }}>
*       <AnimatedOpacity
*         opacity={visible ? 1 : 0}
*       >
*         <Container
*           width={50}
*           height={50}
*           color={'red'}
*         />
*       </AnimatedOpacity>
*     </GesutureDetector>
*   )
* }
* ```
*/
declare const AnimatedOpacity: FunctionComponent<AnimatedOpacityProps>;

type AnimatedPaddingProps = {
  padding: EdgeInsets | number;
  duration: number;
  curve?: Curve;
  onEnd?: () => void;
  children?: VirtualNode;
};
/**
* Animated version of `Padding` which automatically transitions the
* indentation over a given duration whenever the given inset changes.
*
* @group Widgets
* @group Animation
* @example
* ```tsx
* function App() {
*   const [hasPadding, setHasPadding] = useState(false)
*
*   return (
*     <GesutureDetector onTap={() => {
*       setVisible(!visible)
*     }}>
*       <Container
*          width={50}
*          height={50}
*          color={'red'}
*        >
*       <AnimatedPadding
*         padding={hasPadding ? 16 : 0}
*       />
*       </Container>
*     </GesutureDetector>
*   )
* }
* ```
*/
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
/**
* Animated version of `Positioned` which automatically transitions the child's
* position over a given duration whenever the given position changes.
*
* Only works if it's the child of a Stack.
*
* This widget is a good choice if the size of the child would end up changing as a result of this animation.
* If the size is intended to remain the same, with only the position changing over time,
* then consider `SlideTransition` instead. `SlideTransition` only triggers a repaint each frame of the animation,
* whereas `AnimatedPositioned` will trigger a relayout as well.
*
* @group Widgets
* @group Animation
* @example
* ```tsx
* function App() {
*   const [top, setTop] = useState(0)
*   const [left, setLeft] = useState(0)
*
*   return (
*     <GesutureDetector onTap={() => {
*       setTop(Math.random() * 100)
*       setLeft(Math.random() * 100)
*     }}>
*       <Stack>
*         <AnimatedPositioned>
*           <Container
*             width={50}
*             height={50}
*             color={'red'}
*           >
*           </Container>
*         </AnimatedPositioned>
*       </Stack>
*     </GesutureDetector>
*   )
* }
* ```
*/
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
/**
* Animated version of `TransformRotate` which automatically transitions the child's
* rotation over a given duration whenever the given rotation changes.
*
* @group Widgets
* @group Animation
*/
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
/**
* Animated version of `TransformScale` which automatically transitions the child's
* scale over a given duration whenever the given scale changes.
*
* @group Widgets
* @group Animation
*/
declare const AnimatedScale: FunctionComponent<AnimatedScaleProps>;

type AnimatedSizeProps = {
  alignment?: Alignment;
  duration: number;
  reverseDuration?: number;
  curve?: Curve;
  clipBehavior?: Clip;
  children?: VirtualNode;
};
/**
* Animated widget that automatically transitions its size over a given duration
* whenever the given child's size changes.
*
* @group Widgets
* @group Animation
*/
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
/**
* Widget which automatically transitions the child's `offset` relative to its normal
* position whenever the given `offset` changes.
*
* The translation is expressed as an `Offset` scaled to the child's size.
* For example, an `Offset` with a x of 0.25 will result in a horizontal translation of
* one quarter the width of the child.
*
* @group Widgets
* @group Animation
*/
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
type AnimationControllerInitialOptions = {
  value?: number;
  duration: number;
  reverseDuration?: number;
  lowerBound?: number;
  upperBound?: number;
  auto?: 'forward' | 'repeat' | 'reverseRepeat';
};

declare class AnimationBase {
  private _statusListeners;
  addStatusListener(listener: AnimationStatusListener): this;
  removeStatusListener(listener: AnimationStatusListener): this;
  removeAllStatusListener(): this;
  private __triggerStatusListener__;
  protected _checkCallInEffect(methodName: string): void;
  protected _checkCallInRenderLoop(methodName: string): void;
}

/**
* @group UI
*/
declare class Animation<T extends AnimationValue> extends AnimationBase {
  /**
   * @internal
   */
  readonly key: string;
  /**
   * @internal
   */
  readonly controllerKey: string;
  /**
   * @internal
   */
  readonly tickerProviderKey: string;
  readonly options: AnimationInitalOptions<T>;
  /**
   * @internal
   */
  readonly isSequence: boolean;
  /**
   * @internal
   */
  constructor(
  /**
   * @internal
   */
  key: string, 
  /**
   * @internal
   */
  controllerKey: string, 
  /**
   * @internal
   */
  tickerProviderKey: string, options: AnimationInitalOptions<T>, 
  /**
   * @internal
   */
  isSequence: boolean);
  private _getTweenType;
  /**
   * @internal
   */
  readonly type: TweenType;
  /**
   * @internal
   */
  toJson(): {
      animationKey: string;
      controllerKey: string;
      tickerProviderKey: string;
  };
  /**
   * @internal
   */
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
  /**
   * @internal
   */
  toTweenSequenceJson(): {
      animationKey: string;
      controllerKey: string;
      tickerProviderKey: string;
      type: TweenType;
      options: TweenSequence<T>;
  };
}

/**
* @group UI
*/
declare class AnimationController extends AnimationBase {
  /**
   * @internal
   */
  readonly key: string;
  /**
   * @internal
   */
  readonly tickerProviderKey: string;
  /**
   * @internal
   */
  constructor(
  /**
   * @internal
   */
  key: string, 
  /**
   * @internal
   */
  tickerProviderKey: string);
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
  /**
   * @group Hooks
   * @example
   * ```tsx
   * const [animated, setAnimated] = useState(false)
   * const ctrl = useAnimationController({duration: 200})
   * const opacityAnim = ctrl.useTween({
   *   begin: 0,
   *   end: 1,
   * })
   * const decorationAnim = ctrl.useTween({
   *   begin: {
   *     color: 'red',
   *     borderRadius: 0,
   *   },
   *   end: {
   *     color: 'blue',
   *     borderRadius: 16,
   *   }
   * })
   *
   * return (
   *   <Column>
   *    <CupertinoButton onPressed={() => {
   *      if (animated) {
   *        ctrl.reverse()
   *        setAnimated(false)
   *      } else {
   *        ctrl.forward()
   *        setAnimated(true)
   *      }
   *    }}><Text>Toggle Animation</Text>
   *    </CupertinoButton>
   *    <FadeTransition opacity={opacityAnim}>
   *      ...
   *    </FadeTransition>
   *    <DecoratedBoxTransition decoration={decorationAnim}>
   *      ...
   *    </DecoratedBoxTransition>
   *   </Column>
   * )
   * ```
   */
  useTween<T extends AnimationValue>(options: Tween<T>): Animation<T>;
  /**
   * @group Hooks
   */
  useTweenSequence<T extends AnimationValue>(options: TweenSequence<T>): Animation<T>;
  private _createAnimation;
}

/**
* This hook must use with `Transition` widgets like `ScaleTransition` `SizeTransition`.
*
* @group Hooks
* @group Animation
* @example
* ```tsx
* function AnimationTest() {
*   const ctrl = useAnimationController({
*     duration: 200,
*   })
*   const scaleAnim = ctrl.useTween({
*     begin: 0,
*     end: 1,
*   })
*
*   useEffect(() => {
*     ctrl.forward()
*     // ctrl.repeat({reverse: true})
*   }, [])
*
*   return (
*     <ScaleTransition
*       scale={scaleAnim}
*     >
*         <Container
*         width={50}
*         height={50}
*         color={'red'}
*         />
*     </ScaleTransition>
*   )
* }
* function App() {
*   return (
*     <TickerManagerProvider>
*       <AnimationTest />
*     </TickerManagerProvider>
*   )
* }
* ```
*/
declare function useAnimationController(options: AnimationControllerInitialOptions): AnimationController;

type CSSFilterMatrix = {
  type: 'contrast' | 'blur' | 'brightness' | 'grayscale' | 'hueRotate' | 'invert' | 'opacity' | 'saturate' | 'sepia';
  value?: number;
};
type CSSFilterProps = {
  filters: CSSFilterMatrix[];
  children: VirtualNode;
};
/**
* @group Widgets
*/
declare const CSSFilter: FunctionComponent<CSSFilterProps>;

/**
* @group UI
* @group Canvas
*/
declare abstract class CanvasGradient {
  /**
   * Adds a new color stop, defined by an offset and a color, to a given canvas gradient.
   * @param offset A number between 0 and 1, inclusive, representing the position of the color stop. 0 represents the start of the gradient and 1 represents the end.
   * @param color
   */
  abstract addColorStop(offset: number, color: Color): void;
  /**
   * @internal
   */
  abstract toJson(): {
      [key: string]: any;
  };
}

declare class Event {
  type: string;
  constructor(type: string);
  preventDefault(): void;
  stopPropagation(): void;
  stopImmediatePropagation(): void;
}
type EventListener = (event: Event) => void;
declare abstract class EventListenerManager {
  private _eventMap;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
  dispatchEvent(event: Event): void;
}

/**
* @group UI
* @group Canvas
*/
declare class Image extends EventListenerManager {
  private _src;
  get src(): string;
  set src(value: string);
  private _width;
  get width(): number;
  set width(value: number);
  private _height;
  get height(): number;
  set heihgt(value: number);
  private _complete;
  get complete(): boolean;
  private _onload?;
  get onload(): EventListener | undefined;
  set onload(listener: EventListener | undefined);
  private _onerror?;
  get onerror(): EventListener | undefined;
  set onerror(listener: EventListener | undefined);
}

type CanvasFontKerning = 'auto' | 'normal' | 'none';
type CanvasImageSmoothingQuality = 'none' | 'low' | 'medium' | 'high';
type CanvasLineCap = "butt" | "round" | "square";
type CanvasLineJoin = "round" | "bevel" | "miter";
type CanvasColorSpace = 'srgb' | 'display-p3';
type CanvasFillRule = 'nonzero' | 'evenodd';
type CanvasBlendMode = "source-over" | "source-in" | "source-out" | "source-atop" | "destination-over" | "destination-in" | "destination-out" | "destination-atop" | "lighter" | "copy" | "xor" | "multiply" | "screen" | "overlay" | "darken" | "lighten" | "color-dodge" | "color-burn" | "hard-light" | "soft-light" | "difference" | "exclusion" | "hue" | "saturation" | "color" | "luminosity";
type CanvasTextMetrics = {
  width: number;
  height: number;
  alphabeticBaseline: number;
  ideographicBaseline: number;
};
type CanvasTextRendering = 'auto' | 'optimizeSpeed' | 'optimizeLegibility' | 'geometricPrecision';

/**
* @group UI
* @group Canvas
*/
declare class ImageData {
  readonly width: number;
  readonly height: number;
  readonly data: Uint8ClampedArray;
  readonly colorSpace: CanvasColorSpace;
  private key;
  constructor(width: number, height: number, data: Uint8ClampedArray, colorSpace: CanvasColorSpace);
}

/**
* @group UI
* @group Canvas
*/
declare class Matrix3 {
  private _storage;
  get storage(): number[];
  set storage(value: number[]);
  get f(): number;
  set f(value: number);
  get e(): number;
  set e(value: number);
  get d(): number;
  set d(value: number);
  get c(): number;
  set c(value: number);
  get b(): number;
  set(value: number): void;
  get a(): number;
  set a(value: number);
  multiply(mat: Matrix3 | number[]): void;
  rotate(rotationInRadians: number): void;
  translate(x: number, y: number): void;
  scale(sx: number, sy: number): void;
  static from(a: number, b: number, c: number, d: number, e: number, f: number): Matrix3;
  static make(a: number, b: number, c: number, d: number, e: number, f: number): number[];
  static makeIdentity(): number[];
  static makeTranslation(x: number, y: number): number[];
  static makeScale(sx: number, sy: number): number[];
  static makeRotationInRadians(rotationInRadians: number): number[];
  static makeRotationInDegree(rotationInDegree: number): number[];
  static vectorMultiplyMatrix(vec3: number[], mat33: number[]): number[];
  static matrixMultiply(mat1: number[], mat2: number[]): number[];
  static make2DProjection(width: number, height: number): number[];
}

/**
* @group UI
* @group Canvas
*/
declare class Path2D {
  private _operationManager;
  addPath(path: Path2D, transform?: Matrix3): void;
  closePath(): void;
  lineTo(x: number, y: number): void;
  moveTo(x: number, y: number): void;
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
  beginPath(): void;
  ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
  rect(x: number, y: number, width: number, height: number): void;
  roundRect(x: number, y: number, width: number, height: number, 
  /**
   * all-corners
   *
   * [all-corners]
   *
   * [top-left-and-bottom-right, top-right-and-bottom-left]
   *
   * [top-left, top-right-and-bottom-left, bottom-right]
   *
   * [top-left, top-right, bottom-right, bottom-left]
   */
  radii: number | [number] | [number, number] | [number, number, number] | [number, number, number, number]): void;
  /**
   * @internal
   */
  toJson(): any[];
}

/**
* @group UI
* @group Canvas
*/
declare class CanvasRenderingContext2D {
  readonly canvas: Canvas;
  /**
   * @internal
   */
  constructor(canvas: Canvas);
  private _operationManager;
  /**
   * @internal
   */
  get isDirty(): boolean;
  private _direction;
  set direction(value: TextDirection);
  get direction(): TextDirection;
  private _fillStyle;
  set fillStyle(value: Color | CanvasGradient);
  get fillStyle(): Color | CanvasGradient;
  private _strokeStyle;
  set strokeStyle(value: Color | CanvasGradient);
  get strokeStyle(): Color | CanvasGradient;
  private _filter;
  set filter(value: string | CSSFilterMatrix);
  get filter(): string | CSSFilterMatrix;
  private _font;
  private _parsedFont;
  set font(value: string);
  get font(): string;
  private _fontKerning;
  set fontKerning(value: CanvasFontKerning);
  get fontKerning(): CanvasFontKerning;
  private _globalAlpha;
  set globalAlpha(value: number);
  get globalAlpha(): number;
  private _globalCompositeOperation;
  set globalCompositeOperation(value: CanvasBlendMode);
  get globalCompositeOperation(): CanvasBlendMode;
  private _imageSmoothingEnabled;
  set imageSmoothingEnabled(value: boolean);
  get imageSmoothingEnabled(): boolean;
  private _imageSmoothingQuality;
  set imageSmoothingQuality(value: CanvasImageSmoothingQuality);
  get imageSmoothingQuality(): CanvasImageSmoothingQuality;
  private _letterSpacing;
  private _letterSpacingNum;
  set letterSpacing(value: string);
  get letterSpacing(): string;
  private _lineCap;
  set lineCap(value: CanvasLineCap);
  get lineCap(): CanvasLineCap;
  private _lineDashOffset;
  set lineDashOffset(value: number);
  get lineDashOffset(): number;
  private _lineJoin;
  set lineJoin(value: CanvasLineJoin);
  get lineJoin(): CanvasLineJoin;
  private _lineWidth;
  set lineWidth(value: number);
  get lineWidth(): number;
  private _miterLimit;
  set miterLimit(value: number);
  get miterLimit(): number;
  private _shadowBlur;
  set shadowBlur(value: number);
  get shadowBlur(): number;
  private _shadowColor;
  set shadowColor(value: Color);
  get shadowColor(): Color;
  private _shadowOffsetX;
  private _shadowOffsetY;
  set shadowOffsetX(value: number);
  set shadowOffsetY(value: number);
  get shadowOffsetX(): number;
  get shadowOffsetY(): number;
  private _textAlign;
  set textAlign(value: TextAlign);
  get textAlign(): TextAlign;
  private _textBaseline;
  set textBaseline(value: TextBaseLine);
  get textBaseline(): TextBaseLine;
  private _textRendering;
  set textRendering(value: CanvasTextRendering);
  get textRendering(): CanvasTextRendering;
  private _wordSpacing;
  private _wordSpacingNum;
  set wordSpacing(value: string);
  get wordSpacing(): string;
  /**
   * This method is specified by four parameters defining the start and end points of the gradient line.
   * @param x0 The x-axis coordinate of the start point.
   * @param y0 The y-axis coordinate of the start point.
   * @param x1 The x-axis coordinate of the end point.
   * @param y1 The y-axis coordinate of the end point.
   */
  createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient;
  createConicGradient(startAngle: number, x: number, y: number): CanvasGradient;
  /**
   * This method is specified by six parameters, three defining the gradient's start circle, and three defining the end circle.
   * @param x0 The x-axis coordinate of the start circle.
   * @param y0 The y-axis coordinate of the start circle.
   * @param r0 The radius of the start circle. Must be non-negative and finite.
   * @param x1 The x-axis coordinate of the end circle.
   * @param y1 The y-axis coordinate of the end circle.
   * @param r1 The radius of the end circle. Must be non-negative and finite.
   */
  createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient;
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
  beginPath(): void;
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
  clearRect(x: number, y: number, width: number, height: number): void;
  clip(): void;
  clip(path: Path2D): void;
  clip(fillRule: CanvasFillRule): void;
  closePath(): void;
  createImageData(width: number, height: number): ImageData;
  createImageData(width: number, height: number, settings: {
      colorSpace: CanvasColorSpace;
  }): ImageData;
  createImageData(imageData: ImageData): ImageData;
  createPattern(image: string, repetition: "repeat" | "repeat-x" | "repeat-y" | "no-repeat" | "" | null): void;
  drawImage(image: Image, dx: number, dy: number): void;
  drawImage(image: Image, dx: number, dy: number, dWidth: number, dHeight: number): void;
  drawImage(image: Image, sx: number, sy: number, sWidth: number, sHeight: number, dx: number, dy: number, dWidth: number, dHeight: number): void;
  ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
  fill(): void;
  fill(path: Path2D): void;
  fill(fillRule: CanvasFillRule): void;
  fill(path: Path2D, fillRule: CanvasFillRule): void;
  fillRect(x: number, y: number, width: number, height: number): void;
  fillText(text: string, x: number, y: number, maxWidth?: number): void;
  getContextAttributes(): {
      alpha: boolean;
      colorSpace: string;
      desynchronized: boolean;
      willReadFrequently: string;
  };
  getImageData(sx: number, sy: number, sw: number, sh: number, settings?: {
      colorSpace: CanvasColorSpace;
  }): Promise<ImageData | null>;
  private _lineDash;
  getLineDash(): number[];
  setLineDash(value: number[]): void;
  private _transform;
  getTransform(): Matrix3;
  setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;
  transform(a: number, b: number, c: number, d: number, e: number, f: number): void;
  lineTo(x: number, y: number): void;
  measureText(text: string): CanvasTextMetrics;
  moveTo(x: number, y: number): void;
  putImageData(imageData: ImageData, dx: number, dy: number): void;
  putImageData(imageData: ImageData, dx: number, dy: number, dirtyX: number, dirtyY: number, dirtyWidth: number, dirtyHeight: number): void;
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
  rect(x: number, y: number, width: number, height: number): void;
  reset(): void;
  resetTransform(): void;
  restore(): void;
  rotate(angle: number): void;
  roundRect(x: number, y: number, width: number, height: number, 
  /**
   * all-corners
   * [all-corners]
   * [top-left-and-bottom-right, top-right-and-bottom-left]
   * [top-left, top-right-and-bottom-left, bottom-right]
   * [top-left, top-right, bottom-right, bottom-left]
   */
  radii: number | [number] | [number, number] | [number, number, number] | [number, number, number, number]): void;
  save(): void;
  scale(x: number, y: number): void;
  stroke(path?: Path2D): void;
  strokeRect(x: number, y: number, width: number, height: number): void;
  strokeText(text: string, x: number, y: number, maxWidth?: number): void;
  translate(x: number, y: number): void;
}

/**
* @group UI
* @group Canvas
*/
declare class Canvas extends EventListenerManager {
  /**
   * @internal
   */
  readonly key: string;
  constructor(
  /**
   * @internal
   */
  key: string);
  private _isActived;
  private _width;
  get width(): number;
  set width(value: number);
  private _height;
  get height(): number;
  set height(value: number);
  private _context;
  get context(): CanvasRenderingContext2D;
  getContext(_: '2d'): CanvasRenderingContext2D;
  private _timerId;
  private _startTimer;
  /**
   * @internal
   */
  dispose(): void;
}

type CupertinoActionSheetProps = {
  title?: VirtualNode;
  message?: VirtualNode;
  actions?: VirtualNode[];
  cancelButton?: VirtualNode;
};
/**
* An iOS-style action sheet. `Dialog.showBottomSheet` is a shortcut method.
*
* An action sheet is a specific style of alert that presents the user with a set of two or
* more choices related to the current context. An action sheet can have a title,
* an additional message, and a list of actions. The title is displayed above the message
* and the actions are displayed below this content.
*
* This action sheet styles its title and message to match standard iOS action sheet title
* and message text style.
*
* To display action buttons that look like standard iOS action sheet buttons, provide
* `CupertinoActionSheetActions` for the `actions` given to this action sheet.
*
* To include a iOS-style cancel button separate from the other buttons, provide an
* `CupertinoActionSheetAction` for the `cancelButton` given to this action sheet.
*
* @group Widgets
*/
declare const CupertinoActionSheet: FunctionComponent<CupertinoActionSheetProps>;

type CupertinoActionSheetActionProps = {
  /**
   * Whether this action is the default choice in the action sheet.
   */
  isDefaultAction?: boolean;
  /**
   * Whether this action might change or delete data.
   */
  isDestructiveAction?: boolean;
  onPressed: () => void;
  children: VirtualNode;
};
/**
* A button typically used in a `CupertinoActionSheet`.
*
* @group Widgets
*/
declare const CupertinoActionSheetAction: FunctionComponent<CupertinoActionSheetActionProps>;

type CupertinoActivityIndicatorProps = {
  color?: Color;
  animating?: boolean;
  radius?: number;
  partiallyRevealed?: boolean;
};
/**
* An iOS-style activity indicator that spins clockwise.
*
* @group Widgets
*/
declare const CupertinoActivityIndicator: FunctionComponent<CupertinoActivityIndicatorProps>;

type CupertinoAlertDialogProps = {
  title?: VirtualNode;
  content?: VirtualNode;
  actions?: VirtualNode[];
  insetAnimationDuration?: number;
  insetAnimationCurve?: Curve;
};
/**
* @group Widgets
*/
declare const CupertinoAlertDialog: FunctionComponent<CupertinoAlertDialogProps>;

type CupertinoButtonProps = {
  /**
   * Creates an iOS-style button with a filled background.
   */
  filled?: boolean;
  padding?: number | EdgeInsets;
  /**
   * The color of the button's background.
   */
  color?: Color;
  /**
   * The color of the button's background when the button is disabled.
   */
  disabledColor?: Color;
  /**
   * Minimum size of the button.
   */
  minSize?: number;
  /**
   * The opacity that the button will fade to when it is pressed.
   * The button will have an opacity of 1.0 when it is not pressed.
   */
  pressedOpacity?: number;
  /**
   * The radius of the button's corners when it has a background color.
   */
  borderRadius?: BorderRadius | number;
  /**
   * The alignment of the button's child.
   */
  alignment?: Alignment;
  /**
   * The callback that is called when the button is tapped or otherwise activated.
   */
  onPressed?: () => void;
  children: VirtualNode;
};
/**
* An iOS-style button.
*
* Takes in a text or an icon that fades out and in on touch. May optionally have a background.
*
* The padding defaults to 16.0 pixels. When using a `CupertinoButton` within a fixed height
* parent, like a `CupertinoNavigationBar`, a smaller, or even `EdgeInsets: 0`, should be used
* to prevent clipping larger child widgets.
*
* @group Widgets
* @group Basic
*/
declare const CupertinoButton: FunctionComponent<CupertinoButtonProps>;

type CupertinoColors = Record<"white" | "black" | "lightBackgroundGray" | "extraLightBackgroundGray" | "darkBackgroundGray" | "inactiveGray" | "systemBlue" | "systemGreen" | "systemMint" | "systemIndigo" | "systemOrange" | "systemPink" | "systemBrown" | "systemPurple" | "systemRed" | "systemTeal" | "systemCyan" | "systemYellow" | "systemGrey" | "systemGrey2" | "systemGrey3" | "systemGrey4" | "systemGrey5" | "systemGrey6" | "label" | "secondaryLabel" | "tertiaryLabel" | "quaternaryLabel" | "systemFill" | "secondarySystemFill" | "tertiarySystemFill" | "quaternarySystemFill" | "placeholderText" | "systemBackground" | "secondarySystemBackground" | "tertiarySystemBackground" | "systemGroupedBackground" | "secondarySystemGroupedBackground" | "tertiarySystemGroupedBackground" | "separator" | "opaqueSeparator" | "link" | "activeBlue" | "activeGreen" | "activeOrange" | "destructiveRed", Color>;
/**
* @group UI
*/
declare const CupertinoColorsWithBrightness: {
  light: CupertinoColors;
  dark: CupertinoColors;
};
/**
* @group Hooks
* @group Basic
*/
declare function useCupertinoColors(): CupertinoColors;

type CupertinoContextMenuProps = {
  enableHapticFeedback?: boolean;
  actions: VirtualNode[];
  children: VirtualNode;
};
/**
* @group Widgets
*/
declare const CupertinoContextMenu: FunctionComponent<CupertinoContextMenuProps>;

/**
* @group UI
*/
type CupertinoIcons = "left_chevron" | "right_chevron" | "share" | "share_solid" | "book" | "book_solid" | "bookmark" | "bookmark_solid" | "info" | "reply" | "conversation_bubble" | "profile_circled" | "plus_circled" | "minus_circled" | "flag" | "search" | "check_mark" | "check_mark_circled" | "check_mark_circled_solid" | "circle" | "circle_filled" | "back" | "forward" | "home" | "shopping_cart" | "ellipsis" | "phone" | "phone_solid" | "down_arrow" | "up_arrow" | "battery_charging" | "battery_empty" | "battery_full" | "battery_75_percent" | "battery_25_percent" | "bluetooth" | "restart" | "reply_all" | "reply_thick_solid" | "share_up" | "shuffle" | "shuffle_medium" | "shuffle_thick" | "photo_camera" | "photo_camera_solid" | "video_camera" | "video_camera_solid" | "switch_camera" | "switch_camera_solid" | "collections" | "collections_solid" | "folder" | "folder_solid" | "folder_open" | "delete" | "delete_solid" | "delete_simple" | "pen" | "pencil" | "create" | "create_solid" | "refresh" | "refresh_circled" | "refresh_circled_solid" | "refresh_thin" | "refresh_thick" | "refresh_bold" | "clear_thick" | "clear_thick_circled" | "clear" | "clear_circled" | "clear_circled_solid" | "add" | "add_circled" | "add_circled_solid" | "gear" | "gear_solid" | "gear_big" | "settings" | "settings_solid" | "music_note" | "double_music_note" | "play_arrow" | "play_arrow_solid" | "pause" | "pause_solid" | "loop" | "loop_thick" | "volume_down" | "volume_mute" | "volume_off" | "volume_up" | "fullscreen" | "fullscreen_exit" | "mic_off" | "mic" | "mic_solid" | "clock" | "clock_solid" | "time" | "time_solid" | "padlock" | "padlock_solid" | "eye" | "eye_solid" | "person" | "person_solid" | "person_add" | "person_add_solid" | "group" | "group_solid" | "mail" | "mail_solid" | "location" | "location_solid" | "tag" | "tag_solid" | "tags" | "tags_solid" | "bus" | "car" | "car_detailed" | "train_style_one" | "train_style_two" | "paw" | "paw_solid" | "game_controller" | "game_controller_solid" | "lab_flask" | "lab_flask_solid" | "heart" | "heart_solid" | "bell" | "bell_solid" | "news" | "news_solid" | "brightness" | "brightness_solid" | "airplane" | "alarm" | "alarm_fill" | "alt" | "ant" | "ant_circle" | "ant_circle_fill" | "ant_fill" | "antenna_radiowaves_left_right" | "app" | "app_badge" | "app_badge_fill" | "app_fill" | "archivebox" | "archivebox_fill" | "arrow_2_circlepath" | "arrow_2_circlepath_circle" | "arrow_2_circlepath_circle_fill" | "arrow_2_squarepath" | "arrow_3_trianglepath" | "arrow_branch" | "arrow_clockwise" | "arrow_clockwise_circle" | "arrow_clockwise_circle_fill" | "arrow_counterclockwise" | "arrow_counterclockwise_circle" | "arrow_counterclockwise_circle_fill" | "arrow_down" | "arrow_down_circle" | "arrow_down_circle_fill" | "arrow_down_doc" | "arrow_down_doc_fill" | "arrow_down_left" | "arrow_down_left_circle" | "arrow_down_left_circle_fill" | "arrow_down_left_square" | "arrow_down_left_square_fill" | "arrow_down_right" | "arrow_down_right_arrow_up_left" | "arrow_down_right_circle" | "arrow_down_right_circle_fill" | "arrow_down_right_square" | "arrow_down_right_square_fill" | "arrow_down_square" | "arrow_down_square_fill" | "arrow_down_to_line" | "arrow_down_to_line_alt" | "arrow_left" | "arrow_left_circle" | "arrow_left_circle_fill" | "arrow_left_right" | "arrow_left_right_circle" | "arrow_left_right_circle_fill" | "arrow_left_right_square" | "arrow_left_right_square_fill" | "arrow_left_square" | "arrow_left_square_fill" | "arrow_left_to_line" | "arrow_left_to_line_alt" | "arrow_merge" | "arrow_right" | "arrow_right_arrow_left" | "arrow_right_arrow_left_circle" | "arrow_right_arrow_left_circle_fill" | "arrow_right_arrow_left_square" | "arrow_right_arrow_left_square_fill" | "arrow_right_circle" | "arrow_right_circle_fill" | "arrow_right_square" | "arrow_right_square_fill" | "arrow_right_to_line" | "arrow_right_to_line_alt" | "arrow_swap" | "arrow_turn_down_left" | "arrow_turn_down_right" | "arrow_turn_left_down" | "arrow_turn_left_up" | "arrow_turn_right_down" | "arrow_turn_right_up" | "arrow_turn_up_left" | "arrow_turn_up_right" | "arrow_up" | "arrow_up_arrow_down" | "arrow_up_arrow_down_circle" | "arrow_up_arrow_down_circle_fill" | "arrow_up_arrow_down_square" | "arrow_up_arrow_down_square_fill" | "arrow_up_bin" | "arrow_up_bin_fill" | "arrow_up_circle" | "arrow_up_circle_fill" | "arrow_up_doc" | "arrow_up_doc_fill" | "arrow_up_down" | "arrow_up_down_circle" | "arrow_up_down_circle_fill" | "arrow_up_down_square" | "arrow_up_down_square_fill" | "arrow_up_left" | "arrow_up_left_arrow_down_right" | "arrow_up_left_circle" | "arrow_up_left_circle_fill" | "arrow_up_left_square" | "arrow_up_left_square_fill" | "arrow_up_right" | "arrow_up_right_circle" | "arrow_up_right_circle_fill" | "arrow_up_right_diamond" | "arrow_up_right_diamond_fill" | "arrow_up_right_square" | "arrow_up_right_square_fill" | "arrow_up_square" | "arrow_up_square_fill" | "arrow_up_to_line" | "arrow_up_to_line_alt" | "arrow_uturn_down" | "arrow_uturn_down_circle" | "arrow_uturn_down_circle_fill" | "arrow_uturn_down_square" | "arrow_uturn_down_square_fill" | "arrow_uturn_left" | "arrow_uturn_left_circle" | "arrow_uturn_left_circle_fill" | "arrow_uturn_left_square" | "arrow_uturn_left_square_fill" | "arrow_uturn_right" | "arrow_uturn_right_circle" | "arrow_uturn_right_circle_fill" | "arrow_uturn_right_square" | "arrow_uturn_right_square_fill" | "arrow_uturn_up" | "arrow_uturn_up_circle" | "arrow_uturn_up_circle_fill" | "arrow_uturn_up_square" | "arrow_uturn_up_square_fill" | "arrowshape_turn_up_left" | "arrowshape_turn_up_left_2" | "arrowshape_turn_up_left_2_fill" | "arrowshape_turn_up_left_circle" | "arrowshape_turn_up_left_circle_fill" | "arrowshape_turn_up_left_fill" | "arrowshape_turn_up_right" | "arrowshape_turn_up_right_circle" | "arrowshape_turn_up_right_circle_fill" | "arrowshape_turn_up_right_fill" | "arrowtriangle_down" | "arrowtriangle_down_circle" | "arrowtriangle_down_circle_fill" | "arrowtriangle_down_fill" | "arrowtriangle_down_square" | "arrowtriangle_down_square_fill" | "arrowtriangle_left" | "arrowtriangle_left_circle" | "arrowtriangle_left_circle_fill" | "arrowtriangle_left_fill" | "arrowtriangle_left_square" | "arrowtriangle_left_square_fill" | "arrowtriangle_right" | "arrowtriangle_right_circle" | "arrowtriangle_right_circle_fill" | "arrowtriangle_right_fill" | "arrowtriangle_right_square" | "arrowtriangle_right_square_fill" | "arrowtriangle_up" | "arrowtriangle_up_circle" | "arrowtriangle_up_circle_fill" | "arrowtriangle_up_fill" | "arrowtriangle_up_square" | "arrowtriangle_up_square_fill" | "asterisk_circle" | "asterisk_circle_fill" | "at" | "at_badge_minus" | "at_badge_plus" | "at_circle" | "at_circle_fill" | "backward" | "backward_end" | "backward_end_alt" | "backward_end_alt_fill" | "backward_end_fill" | "backward_fill" | "badge_plus_radiowaves_right" | "bag" | "bag_badge_minus" | "bag_badge_plus" | "bag_fill" | "bag_fill_badge_minus" | "bag_fill_badge_plus" | "bandage" | "bandage_fill" | "barcode" | "barcode_viewfinder" | "bars" | "battery_0" | "battery_100" | "battery_25" | "bed_double" | "bed_double_fill" | "bell_circle" | "bell_circle_fill" | "bell_fill" | "bell_slash" | "bell_slash_fill" | "bin_xmark" | "bin_xmark_fill" | "bitcoin" | "bitcoin_circle" | "bitcoin_circle_fill" | "bold" | "bold_italic_underline" | "bold_underline" | "bolt" | "bolt_badge_a" | "bolt_badge_a_fill" | "bolt_circle" | "bolt_circle_fill" | "bolt_fill" | "bolt_horizontal" | "bolt_horizontal_circle" | "bolt_horizontal_circle_fill" | "bolt_horizontal_fill" | "bolt_slash" | "bolt_slash_fill" | "book_circle" | "book_circle_fill" | "book_fill" | "bookmark_fill" | "briefcase" | "briefcase_fill" | "bubble_left" | "bubble_left_bubble_right" | "bubble_left_bubble_right_fill" | "bubble_left_fill" | "bubble_middle_bottom" | "bubble_middle_bottom_fill" | "bubble_middle_top" | "bubble_middle_top_fill" | "bubble_right" | "bubble_right_fill" | "building_2_fill" | "burn" | "burst" | "burst_fill" | "calendar" | "calendar_badge_minus" | "calendar_badge_plus" | "calendar_circle" | "calendar_circle_fill" | "calendar_today" | "camera" | "camera_circle" | "camera_circle_fill" | "camera_fill" | "camera_on_rectangle" | "camera_on_rectangle_fill" | "camera_rotate" | "camera_rotate_fill" | "camera_viewfinder" | "capslock" | "capslock_fill" | "capsule" | "capsule_fill" | "captions_bubble" | "captions_bubble_fill" | "car_fill" | "cart" | "cart_badge_minus" | "cart_badge_plus" | "cart_fill" | "cart_fill_badge_minus" | "cart_fill_badge_plus" | "chart_bar" | "chart_bar_alt_fill" | "chart_bar_circle" | "chart_bar_circle_fill" | "chart_bar_fill" | "chart_bar_square" | "chart_bar_square_fill" | "chart_pie" | "chart_pie_fill" | "chat_bubble" | "chat_bubble_2" | "chat_bubble_2_fill" | "chat_bubble_fill" | "chat_bubble_text" | "chat_bubble_text_fill" | "checkmark" | "checkmark_alt" | "checkmark_alt_circle" | "checkmark_alt_circle_fill" | "checkmark_circle" | "checkmark_circle_fill" | "checkmark_rectangle" | "checkmark_rectangle_fill" | "checkmark_seal" | "checkmark_seal_fill" | "checkmark_shield" | "checkmark_shield_fill" | "checkmark_square" | "checkmark_square_fill" | "chevron_back" | "chevron_compact_down" | "chevron_compact_left" | "chevron_compact_right" | "chevron_compact_up" | "chevron_down" | "chevron_down_circle" | "chevron_down_circle_fill" | "chevron_down_square" | "chevron_down_square_fill" | "chevron_forward" | "chevron_left" | "chevron_left_2" | "chevron_left_circle" | "chevron_left_circle_fill" | "chevron_left_slash_chevron_right" | "chevron_left_square" | "chevron_left_square_fill" | "chevron_right" | "chevron_right_2" | "chevron_right_circle" | "chevron_right_circle_fill" | "chevron_right_square" | "chevron_right_square_fill" | "chevron_up" | "chevron_up_chevron_down" | "chevron_up_circle" | "chevron_up_circle_fill" | "chevron_up_square" | "chevron_up_square_fill" | "circle_bottomthird_split" | "circle_fill" | "circle_grid_3x3" | "circle_grid_3x3_fill" | "circle_grid_hex" | "circle_grid_hex_fill" | "circle_lefthalf_fill" | "circle_righthalf_fill" | "clear_fill" | "clock_fill" | "cloud" | "cloud_bolt" | "cloud_bolt_fill" | "cloud_bolt_rain" | "cloud_bolt_rain_fill" | "cloud_download" | "cloud_download_fill" | "cloud_drizzle" | "cloud_drizzle_fill" | "cloud_fill" | "cloud_fog" | "cloud_fog_fill" | "cloud_hail" | "cloud_hail_fill" | "cloud_heavyrain" | "cloud_heavyrain_fill" | "cloud_moon" | "cloud_moon_bolt" | "cloud_moon_bolt_fill" | "cloud_moon_fill" | "cloud_moon_rain" | "cloud_moon_rain_fill" | "cloud_rain" | "cloud_rain_fill" | "cloud_sleet" | "cloud_sleet_fill" | "cloud_snow" | "cloud_snow_fill" | "cloud_sun" | "cloud_sun_bolt" | "cloud_sun_bolt_fill" | "cloud_sun_fill" | "cloud_sun_rain" | "cloud_sun_rain_fill" | "cloud_upload" | "cloud_upload_fill" | "color_filter" | "color_filter_fill" | "command" | "compass" | "compass_fill" | "control" | "creditcard" | "creditcard_fill" | "crop" | "crop_rotate" | "cube" | "cube_box" | "cube_box_fill" | "cube_fill" | "cursor_rays" | "decrease_indent" | "decrease_quotelevel" | "delete_left" | "delete_left_fill" | "delete_right" | "delete_right_fill" | "desktopcomputer" | "device_desktop" | "device_laptop" | "device_phone_landscape" | "device_phone_portrait" | "dial" | "dial_fill" | "divide" | "divide_circle" | "divide_circle_fill" | "divide_square" | "divide_square_fill" | "doc" | "doc_append" | "doc_chart" | "doc_chart_fill" | "doc_checkmark" | "doc_checkmark_fill" | "doc_circle" | "doc_circle_fill" | "doc_fill" | "doc_on_clipboard" | "doc_on_clipboard_fill" | "doc_on_doc" | "doc_on_doc_fill" | "doc_person" | "doc_person_fill" | "doc_plaintext" | "doc_richtext" | "doc_text" | "doc_text_fill" | "doc_text_search" | "doc_text_viewfinder" | "dot_radiowaves_left_right" | "dot_radiowaves_right" | "dot_square" | "dot_square_fill" | "download_circle" | "download_circle_fill" | "drop" | "drop_fill" | "drop_triangle" | "drop_triangle_fill" | "ear" | "eject" | "eject_fill" | "ellipses_bubble" | "ellipses_bubble_fill" | "ellipsis_circle" | "ellipsis_circle_fill" | "ellipsis_vertical" | "ellipsis_vertical_circle" | "ellipsis_vertical_circle_fill" | "envelope" | "envelope_badge" | "envelope_badge_fill" | "envelope_circle" | "envelope_circle_fill" | "envelope_fill" | "envelope_open" | "envelope_open_fill" | "equal" | "equal_circle" | "equal_circle_fill" | "equal_square" | "equal_square_fill" | "escape" | "exclamationmark" | "exclamationmark_bubble" | "exclamationmark_bubble_fill" | "exclamationmark_circle" | "exclamationmark_circle_fill" | "exclamationmark_octagon" | "exclamationmark_octagon_fill" | "exclamationmark_shield" | "exclamationmark_shield_fill" | "exclamationmark_square" | "exclamationmark_square_fill" | "exclamationmark_triangle" | "exclamationmark_triangle_fill" | "eye_fill" | "eye_slash" | "eye_slash_fill" | "eyedropper" | "eyedropper_full" | "eyedropper_halffull" | "eyeglasses" | "f_cursive" | "f_cursive_circle" | "f_cursive_circle_fill" | "film" | "film_fill" | "flag_circle" | "flag_circle_fill" | "flag_fill" | "flag_slash" | "flag_slash_fill" | "flame" | "flame_fill" | "floppy_disk" | "flowchart" | "flowchart_fill" | "folder_badge_minus" | "folder_badge_person_crop" | "folder_badge_plus" | "folder_circle" | "folder_circle_fill" | "folder_fill" | "folder_fill_badge_minus" | "folder_fill_badge_person_crop" | "folder_fill_badge_plus" | "forward_end" | "forward_end_alt" | "forward_end_alt_fill" | "forward_end_fill" | "forward_fill" | "function" | "fx" | "gamecontroller" | "gamecontroller_alt_fill" | "gamecontroller_fill" | "gauge" | "gauge_badge_minus" | "gauge_badge_plus" | "gear_alt" | "gear_alt_fill" | "gift" | "gift_alt" | "gift_alt_fill" | "gift_fill" | "globe" | "gobackward" | "gobackward_10" | "gobackward_15" | "gobackward_30" | "gobackward_45" | "gobackward_60" | "gobackward_75" | "gobackward_90" | "gobackward_minus" | "goforward" | "goforward_10" | "goforward_15" | "goforward_30" | "goforward_45" | "goforward_60" | "goforward_75" | "goforward_90" | "goforward_plus" | "graph_circle" | "graph_circle_fill" | "graph_square" | "graph_square_fill" | "greaterthan" | "greaterthan_circle" | "greaterthan_circle_fill" | "greaterthan_square" | "greaterthan_square_fill" | "grid" | "grid_circle" | "grid_circle_fill" | "guitars" | "hammer" | "hammer_fill" | "hand_draw" | "hand_draw_fill" | "hand_point_left" | "hand_point_left_fill" | "hand_point_right" | "hand_point_right_fill" | "hand_raised" | "hand_raised_fill" | "hand_raised_slash" | "hand_raised_slash_fill" | "hand_thumbsdown" | "hand_thumbsdown_fill" | "hand_thumbsup" | "hand_thumbsup_fill" | "hare" | "hare_fill" | "headphones" | "heart_circle" | "heart_circle_fill" | "heart_fill" | "heart_slash" | "heart_slash_circle" | "heart_slash_circle_fill" | "heart_slash_fill" | "helm" | "hexagon" | "hexagon_fill" | "hifispeaker" | "hifispeaker_fill" | "hourglass" | "hourglass_bottomhalf_fill" | "hourglass_tophalf_fill" | "house" | "house_alt" | "house_alt_fill" | "house_fill" | "hurricane" | "increase_indent" | "increase_quotelevel" | "infinite" | "info_circle" | "info_circle_fill" | "italic" | "keyboard" | "keyboard_chevron_compact_down" | "largecircle_fill_circle" | "lasso" | "layers" | "layers_alt" | "layers_alt_fill" | "layers_fill" | "leaf_arrow_circlepath" | "lessthan" | "lessthan_circle" | "lessthan_circle_fill" | "lessthan_square" | "lessthan_square_fill" | "light_max" | "light_min" | "lightbulb" | "lightbulb_fill" | "lightbulb_slash" | "lightbulb_slash_fill" | "line_horizontal_3" | "line_horizontal_3_decrease" | "line_horizontal_3_decrease_circle" | "line_horizontal_3_decrease_circle_fill" | "link" | "link_circle" | "link_circle_fill" | "list_bullet" | "list_bullet_below_rectangle" | "list_bullet_indent" | "list_dash" | "list_number" | "list_number_rtl" | "location_circle" | "location_circle_fill" | "location_fill" | "location_north" | "location_north_fill" | "location_north_line" | "location_north_line_fill" | "location_slash" | "location_slash_fill" | "lock" | "lock_circle" | "lock_circle_fill" | "lock_fill" | "lock_open" | "lock_open_fill" | "lock_rotation" | "lock_rotation_open" | "lock_shield" | "lock_shield_fill" | "lock_slash" | "lock_slash_fill" | "macwindow" | "map" | "map_fill" | "map_pin" | "map_pin_ellipse" | "map_pin_slash" | "memories" | "memories_badge_minus" | "memories_badge_plus" | "metronome" | "mic_circle" | "mic_circle_fill" | "mic_fill" | "mic_slash" | "mic_slash_fill" | "minus" | "minus_circle" | "minus_circle_fill" | "minus_rectangle" | "minus_rectangle_fill" | "minus_slash_plus" | "minus_square" | "minus_square_fill" | "money_dollar" | "money_dollar_circle" | "money_dollar_circle_fill" | "money_euro" | "money_euro_circle" | "money_euro_circle_fill" | "money_pound" | "money_pound_circle" | "money_pound_circle_fill" | "money_rubl" | "money_rubl_circle" | "money_rubl_circle_fill" | "money_yen" | "money_yen_circle" | "money_yen_circle_fill" | "moon" | "moon_circle" | "moon_circle_fill" | "moon_fill" | "moon_stars" | "moon_stars_fill" | "moon_zzz" | "moon_zzz_fill" | "move" | "multiply" | "multiply_circle" | "multiply_circle_fill" | "multiply_square" | "multiply_square_fill" | "music_albums" | "music_albums_fill" | "music_house" | "music_house_fill" | "music_mic" | "music_note_2" | "music_note_list" | "nosign" | "number" | "number_circle" | "number_circle_fill" | "number_square" | "number_square_fill" | "option" | "paintbrush" | "paintbrush_fill" | "pano" | "pano_fill" | "paperclip" | "paperplane" | "paperplane_fill" | "paragraph" | "pause_circle" | "pause_circle_fill" | "pause_fill" | "pause_rectangle" | "pause_rectangle_fill" | "pencil_circle" | "pencil_circle_fill" | "pencil_ellipsis_rectangle" | "pencil_outline" | "pencil_slash" | "percent" | "person_2" | "person_2_alt" | "person_2_fill" | "person_2_square_stack" | "person_2_square_stack_fill" | "person_3" | "person_3_fill" | "person_alt" | "person_alt_circle" | "person_alt_circle_fill" | "person_badge_minus" | "person_badge_minus_fill" | "person_badge_plus" | "person_badge_plus_fill" | "person_circle" | "person_circle_fill" | "person_crop_circle" | "person_crop_circle_badge_checkmark" | "person_crop_circle_badge_exclam" | "person_crop_circle_badge_minus" | "person_crop_circle_badge_plus" | "person_crop_circle_badge_xmark" | "person_crop_circle_fill" | "person_crop_circle_fill_badge_checkmark" | "person_crop_circle_fill_badge_exclam" | "person_crop_circle_fill_badge_minus" | "person_crop_circle_fill_badge_plus" | "person_crop_circle_fill_badge_xmark" | "person_crop_rectangle" | "person_crop_rectangle_fill" | "person_crop_square" | "person_crop_square_fill" | "person_fill" | "personalhotspot" | "perspective" | "phone_arrow_down_left" | "phone_arrow_right" | "phone_arrow_up_right" | "phone_badge_plus" | "phone_circle" | "phone_circle_fill" | "phone_down" | "phone_down_circle" | "phone_down_circle_fill" | "phone_down_fill" | "phone_fill" | "phone_fill_arrow_down_left" | "phone_fill_arrow_right" | "phone_fill_arrow_up_right" | "phone_fill_badge_plus" | "photo" | "photo_fill" | "photo_fill_on_rectangle_fill" | "photo_on_rectangle" | "piano" | "pin" | "pin_fill" | "pin_slash" | "pin_slash_fill" | "placemark" | "placemark_fill" | "play" | "play_circle" | "play_circle_fill" | "play_fill" | "play_rectangle" | "play_rectangle_fill" | "playpause" | "playpause_fill" | "plus" | "plus_app" | "plus_app_fill" | "plus_bubble" | "plus_bubble_fill" | "plus_circle" | "plus_circle_fill" | "plus_rectangle" | "plus_rectangle_fill" | "plus_rectangle_fill_on_rectangle_fill" | "plus_rectangle_on_rectangle" | "plus_slash_minus" | "plus_square" | "plus_square_fill" | "plus_square_fill_on_square_fill" | "plus_square_on_square" | "plusminus" | "plusminus_circle" | "plusminus_circle_fill" | "power" | "printer" | "printer_fill" | "projective" | "purchased" | "purchased_circle" | "purchased_circle_fill" | "qrcode" | "qrcode_viewfinder" | "question" | "question_circle" | "question_circle_fill" | "question_diamond" | "question_diamond_fill" | "question_square" | "question_square_fill" | "quote_bubble" | "quote_bubble_fill" | "radiowaves_left" | "radiowaves_right" | "rays" | "recordingtape" | "rectangle" | "rectangle_3_offgrid" | "rectangle_3_offgrid_fill" | "rectangle_arrow_up_right_arrow_down_left" | "rectangle_arrow_up_right_arrow_down_left_slash" | "rectangle_badge_checkmark" | "rectangle_badge_xmark" | "rectangle_compress_vertical" | "rectangle_dock" | "rectangle_expand_vertical" | "rectangle_fill" | "rectangle_fill_badge_checkmark" | "rectangle_fill_badge_xmark" | "rectangle_fill_on_rectangle_angled_fill" | "rectangle_fill_on_rectangle_fill" | "rectangle_grid_1x2" | "rectangle_grid_1x2_fill" | "rectangle_grid_2x2" | "rectangle_grid_2x2_fill" | "rectangle_grid_3x2" | "rectangle_grid_3x2_fill" | "rectangle_on_rectangle" | "rectangle_on_rectangle_angled" | "rectangle_paperclip" | "rectangle_split_3x1" | "rectangle_split_3x1_fill" | "rectangle_split_3x3" | "rectangle_split_3x3_fill" | "rectangle_stack" | "rectangle_stack_badge_minus" | "rectangle_stack_badge_person_crop" | "rectangle_stack_badge_plus" | "rectangle_stack_fill" | "rectangle_stack_fill_badge_minus" | "rectangle_stack_fill_badge_person_crop" | "rectangle_stack_fill_badge_plus" | "rectangle_stack_person_crop" | "rectangle_stack_person_crop_fill" | "repeat" | "repeat_1" | "resize" | "resize_h" | "resize_v" | "return_icon" | "rhombus" | "rhombus_fill" | "rocket" | "rocket_fill" | "rosette" | "rotate_left" | "rotate_left_fill" | "rotate_right" | "rotate_right_fill" | "scissors" | "scissors_alt" | "scope" | "scribble" | "search_circle" | "search_circle_fill" | "selection_pin_in_out" | "shield" | "shield_fill" | "shield_lefthalf_fill" | "shield_slash" | "shield_slash_fill" | "shift" | "shift_fill" | "sidebar_left" | "sidebar_right" | "signature" | "skew" | "slash_circle" | "slash_circle_fill" | "slider_horizontal_3" | "slider_horizontal_below_rectangle" | "slowmo" | "smallcircle_circle" | "smallcircle_circle_fill" | "smallcircle_fill_circle" | "smallcircle_fill_circle_fill" | "smiley" | "smiley_fill" | "smoke" | "smoke_fill" | "snow" | "sort_down" | "sort_down_circle" | "sort_down_circle_fill" | "sort_up" | "sort_up_circle" | "sort_up_circle_fill" | "sparkles" | "speaker" | "speaker_1" | "speaker_1_fill" | "speaker_2" | "speaker_2_fill" | "speaker_3" | "speaker_3_fill" | "speaker_fill" | "speaker_slash" | "speaker_slash_fill" | "speaker_slash_fill_rtl" | "speaker_slash_rtl" | "speaker_zzz" | "speaker_zzz_fill" | "speaker_zzz_fill_rtl" | "speaker_zzz_rtl" | "speedometer" | "sportscourt" | "sportscourt_fill" | "square" | "square_arrow_down" | "square_arrow_down_fill" | "square_arrow_down_on_square" | "square_arrow_down_on_square_fill" | "square_arrow_left" | "square_arrow_left_fill" | "square_arrow_right" | "square_arrow_right_fill" | "square_arrow_up" | "square_arrow_up_fill" | "square_arrow_up_on_square" | "square_arrow_up_on_square_fill" | "square_favorites" | "square_favorites_alt" | "square_favorites_alt_fill" | "square_favorites_fill" | "square_fill" | "square_fill_line_vertical_square" | "square_fill_line_vertical_square_fill" | "square_fill_on_circle_fill" | "square_fill_on_square_fill" | "square_grid_2x2" | "square_grid_2x2_fill" | "square_grid_3x2" | "square_grid_3x2_fill" | "square_grid_4x3_fill" | "square_lefthalf_fill" | "square_line_vertical_square" | "square_line_vertical_square_fill" | "square_list" | "square_list_fill" | "square_on_circle" | "square_on_square" | "square_pencil" | "square_pencil_fill" | "square_righthalf_fill" | "square_split_1x2" | "square_split_1x2_fill" | "square_split_2x1" | "square_split_2x1_fill" | "square_split_2x2" | "square_split_2x2_fill" | "square_stack" | "square_stack_3d_down_dottedline" | "square_stack_3d_down_right" | "square_stack_3d_down_right_fill" | "square_stack_3d_up" | "square_stack_3d_up_fill" | "square_stack_3d_up_slash" | "square_stack_3d_up_slash_fill" | "square_stack_fill" | "squares_below_rectangle" | "star" | "star_circle" | "star_circle_fill" | "star_fill" | "star_lefthalf_fill" | "star_slash" | "star_slash_fill" | "staroflife" | "staroflife_fill" | "stop" | "stop_circle" | "stop_circle_fill" | "stop_fill" | "stopwatch" | "stopwatch_fill" | "strikethrough" | "suit_club" | "suit_club_fill" | "suit_diamond" | "suit_diamond_fill" | "suit_heart" | "suit_heart_fill" | "suit_spade" | "suit_spade_fill" | "sum" | "sun_dust" | "sun_dust_fill" | "sun_haze" | "sun_haze_fill" | "sun_max" | "sun_max_fill" | "sun_min" | "sun_min_fill" | "sunrise" | "sunrise_fill" | "sunset" | "sunset_fill" | "t_bubble" | "t_bubble_fill" | "table" | "table_badge_more" | "table_badge_more_fill" | "table_fill" | "tag_circle" | "tag_circle_fill" | "tag_fill" | "text_aligncenter" | "text_alignleft" | "text_alignright" | "text_append" | "text_badge_checkmark" | "text_badge_minus" | "text_badge_plus" | "text_badge_star" | "text_badge_xmark" | "text_bubble" | "text_bubble_fill" | "text_cursor" | "text_insert" | "text_justify" | "text_justifyleft" | "text_justifyright" | "text_quote" | "textbox" | "textformat" | "textformat_123" | "textformat_abc" | "textformat_abc_dottedunderline" | "textformat_alt" | "textformat_size" | "textformat_subscript" | "textformat_superscript" | "thermometer" | "thermometer_snowflake" | "thermometer_sun" | "ticket" | "ticket_fill" | "tickets" | "tickets_fill" | "timelapse" | "timer" | "timer_fill" | "today" | "today_fill" | "tornado" | "tortoise" | "tortoise_fill" | "tram_fill" | "trash" | "trash_circle" | "trash_circle_fill" | "trash_fill" | "trash_slash" | "trash_slash_fill" | "tray" | "tray_2" | "tray_2_fill" | "tray_arrow_down" | "tray_arrow_down_fill" | "tray_arrow_up" | "tray_arrow_up_fill" | "tray_fill" | "tray_full" | "tray_full_fill" | "tree" | "triangle" | "triangle_fill" | "triangle_lefthalf_fill" | "triangle_righthalf_fill" | "tropicalstorm" | "tuningfork" | "tv" | "tv_circle" | "tv_circle_fill" | "tv_fill" | "tv_music_note" | "tv_music_note_fill" | "uiwindow_split_2x1" | "umbrella" | "umbrella_fill" | "underline" | "upload_circle" | "upload_circle_fill" | "videocam" | "videocam_circle" | "videocam_circle_fill" | "videocam_fill" | "view_2d" | "view_3d" | "viewfinder" | "viewfinder_circle" | "viewfinder_circle_fill" | "wand_rays" | "wand_rays_inverse" | "wand_stars" | "wand_stars_inverse" | "waveform" | "waveform_circle" | "waveform_circle_fill" | "waveform_path" | "waveform_path_badge_minus" | "waveform_path_badge_plus" | "waveform_path_ecg" | "wifi" | "wifi_exclamationmark" | "wifi_slash" | "wind" | "wind_snow" | "wrench" | "wrench_fill" | "xmark" | "xmark_circle" | "xmark_circle_fill" | "xmark_octagon" | "xmark_octagon_fill" | "xmark_rectangle" | "xmark_rectangle_fill" | "xmark_seal" | "xmark_seal_fill" | "xmark_shield" | "xmark_shield_fill" | "xmark_square" | "xmark_square_fill" | "zoom_in" | "zoom_out" | "zzz";

type CupertinoContextMenuActionProps = {
  isDefaultAction?: boolean;
  isDestructiveAction?: boolean;
  onPressed?: () => void;
  trailingIcon?: CupertinoIcons;
  children: VirtualNode;
};
/**
* @group Widgets
*/
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
/**
* A date picker widget in iOS style.
* There are several modes of the date picker listed in `CupertinoDatePickerMode`.
*
* The class will display its children as consecutive columns. Its children order
* is based on internationalization, or the dateOrder property if specified.
*
* @group Widgets
*/
declare const CupertinoDatePicker: FunctionComponent<CupertinoDatePickerProps>;

type CupertinoDialogActionProps = {
  isDefaultAction?: boolean;
  isDestructiveAction?: boolean;
  textStyle?: TextStyle;
  onPressed?: () => void;
  children: VirtualNode;
};
/**
* @group Widgets
*/
declare const CupertinoDialogAction: FunctionComponent<CupertinoDialogActionProps>;

type CupertinoFormRowProps = {
  padding?: EdgeInsets | number;
  prefix?: VirtualNode;
  helper?: VirtualNode;
  error?: VirtualNode;
  children: VirtualNode;
};
/**
* @group Widgets
*/
declare const CupertinoFormRow: FunctionComponent<CupertinoFormRowProps>;

type CupertinoFormSectionProps = {
  insetGrouped?: boolean;
  margin?: EdgeInsets | number;
  clipBehavior?: Clip;
  backgroundColor?: Color;
  decoration?: BoxDecoration;
  header?: VirtualNode;
  footer?: VirtualNode;
  children: (VirtualNode | undefined | null | (VirtualNode | undefined | null)[])[] | VirtualNode;
};
/**
* @group Widgets
*/
declare const CupertinoFormSection: FunctionComponent<CupertinoFormSectionProps>;

type CupertinoListSectionProps = {
  /**
   * Creates a section that mimics standard "Inset Grouped" iOS list section.
   */
  insetGrouped?: boolean;
  margin?: number | EdgeInsets;
  decoration?: BoxDecoration;
  backgroundColor?: Color;
  clipBehavior?: Clip;
  /**
   * The starting offset of a margin between two list tiles.
   */
  dividerMargin?: number;
  /**
   * Additional starting inset of the divider used between rows. This is used when adding a
   * leading icon to children and a divider should start at the text inset instead of the icon.
   */
  additionalDividerMargin?: number;
  topMargin?: number;
  hasLeading?: boolean;
  /**
   * Sets the color for the dividers between rows, and borders on top and bottom of the rows.
   */
  separatorColor?: Color;
  header?: VirtualNode;
  footer?: VirtualNode;
  children?: (VirtualNode | undefined | null | (VirtualNode | undefined | null)[])[] | VirtualNode;
};
/**
* An iOS-style list section.
*
* The `CupertinoListSection` is a container for children widgets.
* These are most often `CupertinoListTile`s.
*
* @group Widgets
*/
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
/**
* @group Widgets
*/
declare const CupertinoListTile: FunctionComponent<CupertinoListTileProps>;

/**
* @group Widgets
*/
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
/**
* An iOS-styled navigation bar.
*
* The navigation bar is a toolbar that minimally consists of a widget, normally a page title, in the middle of the toolbar.
*
* It also supports a `leading` and `trailing` widget before and after the `middle` widget while keeping the `middle` widget centered.
*
* The `leading` widget will automatically be a back chevron icon button (or a close button in case of a fullscreen dialog) to pop the current route if none is provided and `automaticallyImplyLeading` is `true` (`true` by default).
*
* The `middle` widget will automatically be a title text from the current `CupertinoPageRoute` if none is provided and automaticallyImplyMiddle is `true` (`true` by default).
*
* It should be placed at top of the screen and automatically accounts for the OS's status bar.
*
* If the given `backgroundColor`'s opacity is not 1.0 (which is the case by default), it will produce a blurring effect to the content behind it.
*
* @group Widgets
* @group Basic
*/
declare const CupertinoNavigationBar: FunctionComponent<CupertinoNavigationBarProps>;

type CupertinoNavigationBarBackButtonProps = {
  color?: Color;
  previousPageTitle?: string;
  onPressed?: () => void;
};
/**
* A nav bar back button typically used in `CupertinoNavigationBar`.
*
* This is automatically inserted into `CupertinoNavigationBar` and `CupertinoSliverNavigationBar`'s leading slot when `automaticallyImplyLeading` is true.
*
* When manually inserted, the `CupertinoNavigationBarBackButton` should only be used in routes that can be popped unless a custom `onPressed` is provided.
*
* Shows a back chevron and the previous route's title when available from the previous `CupertinoPageRoute.title`. If `previousPageTitle` is specified, it will be shown instead.
*
* @group Widgets
*/
declare const CupertinoNavigationBarBackButton: FunctionComponent<CupertinoNavigationBarBackButtonProps>;

type CupertinoPageScaffoldProps = {
  /**
   * The color of the widget that underlies the entire scaffold.
   */
  backgroundColor?: Color;
  /**
   * Whether the child should size itself to avoid the window's bottom inset.
   */
  resizeToAvoidBottomInset?: boolean;
  /**
   * Must use `<CupertinoNavigationBar />`
   */
  navigationBar?: VirtualNode;
  children: VirtualNode;
};
/**
* Implements a single iOS application page's layout.
*
* The scaffold lays out the navigation bar on top and the content between or
* behind the navigation bar.
*
* @group Widgets
* @group Basic
*/
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
/**
* @group Widgets
*/
declare const CupertinoPicker: FunctionComponent<CupertinoPickerProps>;

type CupertinoPickerDefaultSelectionOverlayProps = {
  background?: Color;
  capStartEdge?: boolean;
  capEndEdge?: boolean;
};
/**
* @group Widgets
*/
declare const CupertinoPickerDefaultSelectionOverlay: FunctionComponent<CupertinoPickerDefaultSelectionOverlayProps>;

type CupertinoPopupSurfaceProps = {
  isSurfacePainted?: boolean;
  children?: VirtualNode;
};
/**
* @group Widgets
*/
declare const CupertinoPopupSurface: FunctionComponent<CupertinoPopupSurfaceProps>;

type CupertinoScrollerBarProps = {
  thumbVisibility?: boolean;
  thickness?: number;
  thicknessWhileDragging?: number;
  radius?: number;
  radiusWhileDragging?: number;
  scrollbarOrientation?: ScrollOrientation;
  children: VirtualNode;
};
/**
* @group Widgets
* @group Scrolling
*/
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
/**
* @group Widgets
*/
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
/**
* @group Widgets
*/
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
/**
* @group Widgets
*/
declare const CupertinoSlider: FunctionComponent<CupertinoSliderProps>;

type CupertinoSlidingSegmentedControlProps = {
  value: number;
  onChanged: (value: number) => void;
  children: VirtualNode[];
  padding?: EdgeInsets | number;
  thumbColor?: Color;
  backgroundColor?: Color;
};
/**
* @group Widgets
*/
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
/**
* @group Widgets
*/
declare const CupertinoSliverNavigationBar: FunctionComponent<CupertinoSliverNavigationBarProps>;

type CupertinoSliverRefreshControlProps = {
  refreshTriggerPullDistance?: number;
  refreshIndicatorExtent?: number;
  onRefresh?: () => Promise<void>;
};
/**
* @group Widgets
*/
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
/**
* @group Widgets
*/
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
/**
* @group Widgets
*/
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
  padding?: number | EdgeInsets;
  scrollPadding?: number | EdgeInsets;
  onChanged?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  keyboardType?: TextInputType;
  textAlign?: TextAlign;
  textAlignVertical?: TextAlignVertical;
  textCapitalization?: TextCapitalization;
  textInputAction?: TextInputAction;
  textDirection?: TextDirection;
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
  borderless?: boolean;
};
/**
* @group Widgets
* @group Basic
*/
declare const CupertinoTextField: FunctionComponent<CupertinoTextFieldProps>;

type CupertinoThemeProps = {
  brightness?: Brightness;
  applyThemeToAll?: boolean;
  primaryColor?: Color;
  primaryContrastingColor?: Color;
  barBackgroundColor?: Color;
  scaffoldBackgroundColor?: Color;
  children: VirtualNode;
};
/**
* Applies a visual styling theme to descendant Cupertino widgets.
*
* Affects the color and text styles of Cupertino widgets whose styling
* are not overridden when constructing the respective widgets instances.
*
* @group Widgets
* @example
* ```tsx
* fuction App() {
*   const colors = useCupertinoColors()
*
*   return (
*     <CupertinoTheme
*       primaryColor={colors.activeGreen}
*     >
*       <CupertinoPageScaffold
*         navigationBar={
*           <CupertinoNavigationBar
*             middle={<Text>Cupertino App</Text>}
*           />
*         }
*       >
*         <Center>
*           <Text>A green color theme app</Text>
*         </Center>
*       </CupertinoPageScaffold>
*     </CupertinoTheme>
*   )
* }
* ```
*/
declare const CupertinoTheme: FunctionComponent<CupertinoThemeProps>;

/**
* - `hm` Mode that shows the timer duration in hour and minute.
*
*    Examples: 16 hours | 14 min.
*
* - `ms` Mode that shows the timer duration in minute and second.
*
*    Examples: 14 min | 43 sec.
*
* - `hms` Mode that shows the timer duration in hour, minute, and second.
*
*    Examples: 16 hours | 14 min | 43 sec.
*/
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
/**
* @group Widgets
*/
declare const CupertinoTimerPicker: FunctionComponent<CupertinoTimerPickerProps>;

type WidgetUIColor = "systemRed" | "systemGreen" | "systemBlue" | "systemOrange" | "systemYellow" | "systemPink" | "systemPurple" | "systemTeal" | "systemIndigo" | "systemGray" | "systemGray2" | "systemGray3" | "systemGray4" | "systemGray5" | "systemGray6" | "label" | "secondaryLabel" | "tertiaryLabel" | "quaternaryLabel" | "placeholderText" | "separator" | "opaqueSeparator" | "link" | "darkText" | "lightText" | "black" | "darkGray" | "lightGray" | "white" | "gray" | "red" | "green" | "blue" | "cyan" | "yellow" | "magenta" | "orange" | "purple" | "brown" | "clear" | "systemFill" | "secondarySystemFill" | "tertiarySystemFill" | "quaternarySystemFill" | "systemBackground" | "secondarySystemBackground" | "tertiarySystemBackground" | "systemGroupedBackground" | "secondarySystemGroupedBackground" | "tertiarySystemGroupedBackground";
type WidgetColor = ColorValueHex | WidgetUIColor;
type WidgetCommonProps = {
  width?: number | 'infinity';
  height?: number | 'infinity';
  foregroundColor?: WidgetColor;
  backgroundColor?: WidgetColor;
  defaultPadding?: boolean;
  padding?: number | WidgetPadding;
  borderWidth?: number;
  borderColor?: WidgetColor;
  cornerRadius?: number;
  /**
   * widget url
   */
  widgetURL?: string;
};
type WidgetPadding = {
  horizontal?: number;
  vertical?: number;
  leading?: number;
  trailing?: number;
  top?: number;
  bottom?: number;
};

type HStackProps = WidgetCommonProps & {
  /**
   * The guide for aligning the subviews in this stack.
   * This guide has the same vertical screen coordinate for every subview.
   * Default is `center`
   */
  alignment?: "top" | "center" | "bottom" | "firstTextBaseline" | "lastTextBaseline";
  /**
   * The distance between adjacent subviews, or `undefined` if you want the stack to
   * choose a default distance for each pair of subviews.
   */
  spacing?: number;
  children?: (VirtualNode | undefined | null | (VirtualNode | undefined | null)[])[] | VirtualNode;
};
/**
* A view that arranges its subviews in a vertical line.
*
* @group iOS Widgets
* @example
*
* <HStack
*  alignment="top"
*  spacing={10}
* >
*   <WidgetText>
*     Item1
*   </WidgetText>
*   <WidgetText>
*     Item2
*   </WidgetText>
* </HStack>
*/
declare const HStack: FunctionComponent<HStackProps>;

type VStackProps = WidgetCommonProps & {
  /**
   * The guide for aligning the subviews in this stack.
   * This guide has the same vertical screen coordinate for every subview.
   * Default is `center`.
   */
  alignment?: 'leading' | 'center' | 'trailing';
  /**
   * The distance between adjacent subviews, or `undefined` if you want the stack to
   * choose a default distance for each pair of subviews.
   */
  spacing?: number;
  children?: (VirtualNode | undefined | null | (VirtualNode | undefined | null)[])[] | VirtualNode;
};
/**
* A view that arranges its subviews in a vertical line.
*
* @group iOS Widgets
* @example
*
* <VStack
*  alignment="leading"
*  spacing={10}
* >
*   <WidgetText>
*     Item1
*   </WidgetText>
*   <WidgetText>
*     Item2
*   </WidgetText>
* </VStack>
*/
declare const VStack: FunctionComponent<VStackProps>;

type WidgetTextProps = WidgetCommonProps & {
  /**
   * Default is `body`
   */
  font?: "largeTitle" | "title" | "headline" | "subheadline" | "body" | "callout" | "footnote" | "caption";
  /**
   * If you set `fontSize` and `font` at the same time, the `font` will be ignored.
   * and `system` font and `fontSize` will be used to set the text style.
   */
  fontSize?: number;
  fontWeight?: "ultraLight" | "thin" | "light" | "regular" | "medium" | "semibold" | "bold" | "heavy" | "black";
  italic?: boolean;
  monospaced?: boolean;
  /**
   * Applies a strikethrough with a specified color to the text.
   */
  strikethrough?: WidgetColor;
  /**
   * Applies a underline with a specified color to the text.
   */
  underline?: WidgetColor;
  lineLimit?: number;
  textAlign?: 'leading' | 'center' | 'trailing';
  children: string | number | boolean | Array<string | number | boolean>;
};
/**
* @group iOS Widgets
* @example
* <WidgetText
*  font={'title'}
* >
*   iOS Widget
* </WidgetText>
*/
declare const WidgetText: FunctionComponent<WidgetTextProps>;

type WidgetDateTextProps = Omit<WidgetTextProps, "children">;
type WidgetDateProps = WidgetDateTextProps & {
  /**
   * Future date timestamp: `Date.now() + 1000 * 60`
   */
  timestamp: number;
  style: 'date' | 'time' | 'timer' | 'relative' | 'offset';
};
/**
* Displaying dynamic dates in widgets.
*
* Show up-to-date, time-based information in your widget even when it isn’t running.
*
* @group iOS Widgets
*
* @example
*
*  // A style displaying a date, example output: `June 3, 2019`
*  <WidgetDate timestamp={Date.now()} style="date" />
*
*  // A style displaying only the time component for a date, example output: `11:23PM`
*  <WidgetDate timestamp={Date.now()} style="time" />
*
*  // A style displaying a date as timer counting from now, example output: `2:32`, `36:59:01`
*  <WidgetDate timestamp={Date.now()} style="timer" />
*
*  // A style displaying a date as relative to now, example ouput: `2 hours, 23 minutes`,  `1 year, 1 month`
*  <WidgetDate timestamp={Date.now()} style="relative" />
*
*  // A style displaying a date as offset from now, example output: `+2 hours`, `-3 months`
*  <WidgetDate timestamp={Date.now()} style="offset" />
*/
declare const WidgetDate: FunctionComponent<WidgetDateProps>;
type WidgetDateRangeProps = WidgetDateTextProps & {
  /**
   * Timestamp of the start date
   */
  from: number;
  /**
   * Timestamp of the end date
   */
  to: number;
};
/**
* Displays a localized range between two dates.
*
* @group iOS Widgets
*
* @example
*
* <WidgetDateRange from={Date.now()} to={Date.now() + 1000 * 60} />
*/
declare const WidgetDateRange: FunctionComponent<WidgetDateRangeProps>;
type WidgetDateIntervalProps = WidgetDateTextProps & {
  /**
   * Timestamp of the start date
   */
  from: number;
  /**
   * Timestamp of the end date
   */
  to: number;
};
/**
* Displays a localized range between two dates.
*
* @group iOS Widgets
*
* @example
* ```tsx
* // Example output: `9:30AM - 3:30PM`
*
* let fromDate = new Date()
* fromDate.setHours(9)
* fromDate.setMinutes(30)
*
* let toDate = new Date()
* toDate.setHours(15)
* toDate.setMinutes(30)
*
* <WidgetDateInterval
*   from={fromDate.getTime()}
*   to={toDate.getTime()}
* />
* ```
*/
declare const WidgetDateInterval: FunctionComponent<WidgetDateRangeProps>;
type WidgetTimerIntervalProps = WidgetDateTextProps & {
  /**
   * Timestamp of the start date
   */
  from: number;
  /**
   * Timestamp of the end date
   */
  to: number;
  /**
   * If present, the date at which to pause the timer.
   *
   * The default is `undefined` which indicates to never pause.
   */
  pauseTime?: number;
  /**
   * Whether to count up or down. The default is `true`.
   */
  countsDown?: boolean;
  /**
   * Whether to include an hours component if there are
   * more than 60 minutes left on the timer. The default is `true`.
   */
  showsHours?: boolean;
};
/**
* Displays a timer counting within the provided interval.
*
* @group iOS Widgets
*
* @example
* ```tsx
* // The example above shows a text that displays a timer counting down
* // from "12:00" and will pause when reaching "10:00".
* <WidgetTimerInterval
*   from={Date.now()}
*   to={Date.now() + 1000 * 60 * 12}
*   pauseTime={Date.now() + 1000 * 60 * 10}
* />
*
* // `from` and `to`: The interval between where to run the timer.
* // `pauseTime`: If present, the date at which to pause the timer. The default is `undefined` which indicates to never pause.
* // `countsDown`: Whether to count up or down. The default is `true`.
* // `showsHours`: Whether to include an hours component if there are more than 60 minutes left on the timer. The default is `true`.
* ```
*/
declare const WidgetTimerInterval: FunctionComponent<WidgetTimerIntervalProps>;

/**
* A visual element that can be used to separate other content.
*
* @group iOS Widgets
*/
declare const WidgetDivider: FunctionComponent<{}>;

type WidgetImageProps = WidgetCommonProps & {
  /**
   * Creates an image using a system-provided symbol.
   * Use [SF Symbols](https://developer.apple.com/design/resources/#sf-symbols) to find symbols and their corresponding names.
   * You can also browse symbol names in the [SF Symbols Browser](https://apps.apple.com/cn/app/sf-symbols-reference/id1491161336?l=en-GB) app for iOS.
   */
  systemName?: string;
  /**
   * Creates an image using a network image url.
   */
  imageUrl?: string;
  /**
   * Creates an image using a local file path.
   */
  filePath?: string;
  scaleToFit?: boolean;
  scaleToFill?: boolean;
};
/**
* A view that displays an image.
* You can create images from many sources:
*
*  - `filePath` display an image using local image file path.
*  - `systemName` display an image using a system-provided symbol.
*  - `imageUrl` display an image using a network image link.
*
* @group iOS Widgets
* @example
*    <WidgetImage systemName="globe" width={20} height={20} />
*/
declare const WidgetImage: FunctionComponent<WidgetImageProps>;

type WidgetLinkProps = WidgetCommonProps & {
  url: string;
  children: string | VirtualNode;
};
/**
* A control for navigating to a URL.
*
* The `widgetURL` will be ignored.
*
* @group iOS Widgets
* @example
* ```tsx
* <WidgetLink
*   url={Script.createOpenURLScheme('Script A')}
* >Open Script A
* </WidgetLink>
*
* <WidgetLink
*   url='https://example.com'
* >
*   <HStack>
*     <WidgetImage
*       systemName='globe'
*       width={20}
*       height={20}
*       padding={{
*         trailing: 8,
*       }}
*     />
*     <WidgetText>Open Link</WidgetText>
*   </HStack>
* </WidgetLink>
* ```
*/
declare const WidgetLink: FunctionComponent<WidgetLinkProps>;

/**
* A flexible space that expands along the major axis of its containing stack layout,
* or on both axes if not contained in a stack.
*
* @group iOS Widgets
*/
declare const WidgetSpacer: FunctionComponent<{}>;

type ZStackProps = {
  /**
   * The guide for aligning the subviews in this stack on both the x- and y-axes.
   * Default is `center`
   */
  alignment?: 'topLeading' | 'top' | 'topTrailing' | 'leading' | 'center' | 'trailing' | 'bottomLeading' | 'bottom' | 'bottomTrailing' | 'leadingFirstTextBaseline' | 'centerFirstTextBaseline' | 'trailingFirstTextBaseline' | 'leadingLastTextBaseline' | 'centerLastTextBaseline' | 'trailingLastTextBaseline';
  children?: (VirtualNode | undefined | null | (VirtualNode | undefined | null)[])[] | VirtualNode;
};
/**
* A view that arranges its subviews in a vertical line.
*
* @group iOS Widgets
* @example
*
* <ZStack
*  alignment="top"
*  spacing={10}
* >
*   <WidgetText>
*     Item1
*   </WidgetText>
*   <WidgetText>
*     Item2
*   </WidgetText>
* </ZStack>
*/
declare const ZStack: FunctionComponent<ZStackProps>;

type TransformRotateProps = {
  /**
   * 90 * Math.PI / 180
   */
  angle: number;
  origin?: Offset;
  alignment?: Alignment;
  transformHitTests?: boolean;
  filterQuality?: FilterQuality;
  children?: VirtualNode;
};
/**
* Creates a widget that transforms its child using a rotation around the center.
*
* The `angle` argument gives the rotation in clockwise radians.
*
* @group Widgets
* @group Layout
* @example
* ```tsx
* <TransformRotate
*   angle={-Math.PI / 12}
* >
* <Container
*   width={50}
*   height={50}
*   color={'red'}
* />
* </TransformRotate>
* ```
*/
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
/**
* Creates a widget that scales its child along the 2D plane.
*
* The `scaleX` argument provides the scalar by which to multiply the x axis,
* and the `scaleY` argument provides the scalar by which to multiply the y axis.
* Either may be omitted, in which case the scaling factor for that axis defaults to 1.0.
*
* For convenience, to scale the child uniformly, instead of providing `scaleX` and `scaleY`,
* the `scale` parameter may be used.
*
* At least one of `scale`, `scaleX`, and `scaleY` must be non-null. If `scale` is provided,
* the other two must be null; similarly, if it is not provided, one of the other two must be provided.
*
* The `alignment` controls the origin of the scale; by default, this is the `center` of the box.
*
* @group Widgets
* @group Layout
*/
declare const TransformScale: FunctionComponent<TransformScaleProps>;

type TransformTranslateProps = {
  offset: Offset;
  transformHitTests?: boolean;
  filterQuality?: FilterQuality;
  children?: VirtualNode;
};
/**
* @group Widgets
* @group Layout
*/
declare const TransformTranslate: FunctionComponent<TransformTranslateProps>;

type DecoratedBoxTransitionProps = {
  decoration: Animation<BoxDecoration>;
  children: VirtualNode;
};
/**
* @group Widgets
* @group Animation
*/
declare const DecoratedBoxTransition: FunctionComponent<DecoratedBoxTransitionProps>;

type FadeTransitionProps = {
  opacity: Animation<number>;
  children?: VirtualNode;
};
/**
* @group Widgets
* @group Animation
*/
declare const FadeTransition: FunctionComponent<FadeTransitionProps>;

type PositionedTransitionProps = {
  rect: Animation<RelativeRect>;
  children: VirtualNode;
};
/**
* @group Widgets
* @group Animation
*/
declare const PositionedTransition: FunctionComponent<PositionedTransitionProps>;

type RotationTransitionProps = {
  turns: Animation<number>;
  alignment?: Alignment;
  children?: VirtualNode;
};
/**
* @group Widgets
* @group Animation
*/
declare const RotationTransition: FunctionComponent<RotationTransitionProps>;

type ScaleTransitionProps = {
  scale: Animation<number>;
  alignment?: Alignment;
  children?: VirtualNode;
};
/**
* @group Widgets
* @group Animation
*/
declare const ScaleTransition: FunctionComponent<ScaleTransitionProps>;

type SizeTransitionProps = {
  sizeFactor: Animation<number>;
  axis?: Axis;
  /**
   * Describes how to align the child along the axis that `sizeFactor` is modifying.
   *
   * A value of -1.0 indicates the top when `axis` is `Axis.vertical`, and the start when `axis` is `Axis.horizontal`. The start is on the left when the text direction in effect is `TextDirection.ltr` and on the right when it is `TextDirection.rtl`.
   *
   * A value of 1.0 indicates the bottom or end, depending upon the `axis`.
   *
   * A value of 0.0 (the default) indicates the center for either [axis] value.
   */
  axisAlignment?: number;
  children?: VirtualNode;
};
/**
* @group Widgets
* @group Animation
*/
declare const SizeTransition: FunctionComponent<SizeTransitionProps>;

type SlideTransitionProps = {
  position: Animation<Offset>;
  transformHitTests?: boolean;
  textDirection?: TextDirection;
  children?: VirtualNode;
};
/**
* @group Widgets
* @group Animation
*/
declare const SlideTransition: FunctionComponent<SlideTransitionProps>;

type AbsorbPointerProps = {
  absorbing?: boolean;
  children?: VirtualNode;
};
/**
* @group Widgets
*/
declare const AbsorbPointer: FunctionComponent<AbsorbPointerProps>;

type AlignProps = {
  /**
   * Defaults to 'center'
   */
  alignment?: Alignment;
  widthFactor?: number;
  heightFactor?: number;
  children?: VirtualNode;
};
/**
* A widget that aligns its child within itself and optionally sizes itself
* based on the child's size.
*
* This widget will be as big as possible if its dimensions are constrained and
* `widthFactor` and `heightFactor` are null.
*
* @group Widgets
* @group Layout
* @group Basic
* @example
* ```tsx
* function App() {
*   return (
*     <Align alignment="centerRight">
*       <Container width={50} height={50} color="red" />
*     </Align>
*   )
* }
* ```
*/
declare const Align: FunctionComponent<AlignProps>;

type AspectRatioProps = {
  aspectRatio: number;
  children?: VirtualNode;
};
/**
* @group Widgets
* @group Layout
*/
declare const AspectRatio: FunctionComponent<AspectRatioProps>;

type AssetImageProps = {
  src: string;
  width?: number | 'infinity';
  height?: number | 'infinity';
  color?: Color;
  fit?: BoxFit;
  repeat?: ImageRepeat;
  alignment?: Alignment;
  semanticLabel?: string;
};
/**
* Display an image in the script directory, src is a relative path.
*
* @group Widgets
* @group Basic
* @example
* ```tsx
* <AssetImage
*   src="assets/example.jpg"
*   fit="fill"
* />
* ```
*/
declare const AssetImage: FunctionComponent<AssetImageProps>;

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
/**
* @group Widgets
* @group Text
*/
declare const AutoSizeText: FunctionComponent<AutoSizeTextProps>;

type BackdropFilterProps = {
  filter: ImageFilter;
  blendMode?: BlendMode;
  children?: VirtualNode;
};
/**
* @group Widgets
*/
declare const BackdropFilter: FunctionComponent<BackdropFilterProps>;

type BaselineProps = {
  baseline: number;
  baselineType: TextBaseLine;
  children?: VirtualNode;
};
/**
* @group Widgets
* @group Layout
*/
declare const Baseline: FunctionComponent<BaselineProps>;

type BottomNavigationBarItemProps = {
  label?: string;
  tooltip?: string;
  icon?: VirtualNode;
  activeIcon?: VirtualNode;
};
/**
* @group Widgets
*/
declare const BottomNavigationBarItem: FunctionComponent<BottomNavigationBarItemProps>;

type CSSFilterPresetsEffect = 'ins1977' | 'ins1977V2' | 'insAden' | 'insAmaro' | 'insAshby' | 'insBrannan' | 'insBrooklyn' | 'insClarendon' | 'insDogpatch' | 'insEarlybird' | 'insGingham' | 'insHelena' | 'insHudson' | 'insInkwell' | 'insInkwellV2' | 'insJuno' | 'insKelvin' | 'insLark' | 'insLofi' | 'insLudwig' | 'insMaven' | 'insMayfair' | 'insMoon' | 'insMoonV2' | 'insNashville' | 'insNashvilleV2' | 'insPerpetua' | 'insPoprocket' | 'insReyes' | 'insRise' | 'insSierra' | 'insSkyline' | 'insSlumber' | 'insStinson' | 'insSutro' | 'insToaster' | 'insToasterV2' | 'insValencia' | 'insVesper' | 'insWalden' | 'insWaldenV2' | 'insWillow' | 'insXpro2' | 'origin';
type CSSFilterPresetsProps = {
  effect: CSSFilterPresetsEffect;
  children: VirtualNode;
};
/**
* @group Widgets
*/
declare const CSSFilterPresets: FunctionComponent<CSSFilterPresetsProps>;

type CenterProps = {
  widthFactor?: number;
  heightFactor?: number;
  children?: VirtualNode;
};
/**
* A widget that centers its child within itself.
*
* This widget will be as big as possible if its dimensions are constrained and
* `widthFactor` and `heightFactor` are null. If a dimension is unconstrained and
* the corresponding size factor is null then the widget will match its child's
* size in that dimension. If a size factor is non-null then the corresponding
* dimension of this widget will be the product of the child's dimension and the
* size factor. For example if `widthFactor` is 2.0 then the width of this widget
* will always be twice its child's width.
*
* @group Widgets
* @group Layout
* @group Basic
*/
declare const Center: FunctionComponent<CenterProps>;

type ChartsCommonDataGroup = {
  list: number[];
  type: 'bar' | 'line' | 'point';
  secondaryMeasureAxis?: boolean;
  lineStyle?: ChartsLineStyle;
  barStyle?: ChartsBarStyle;
};
type ChartsStackedDataGroup = {
  list: number[];
  type: 'stackedBar';
  secondaryMeasureAxis?: boolean;
  lineStyle?: ChartsLineStyle;
  barStyle?: ChartsBarStyle;
  stackedId: string;
};
type ChartsDataGroup = ChartsCommonDataGroup | ChartsStackedDataGroup;
type ChartsBarStyle = {
  width?: number;
  spacing?: number;
  fill?: boolean;
  color?: Color;
  strokeWidth?: number;
  bottomLeftRadius?: number;
  bottomRightRadius?: number;
  topRightRadius?: number;
  topLeftRadius?: number;
};
type ChartsLineStyle = {
  lineWidth?: number;
  color?: Color;
};
type ChartsPointStyle = {
  radius?: number;
  color?: Color;
};
type ChartsMeasureAxisStyle = {
  gridNums?: number;
  lineWidth?: number;
  gap?: number;
  color?: Color;
  renderNone?: boolean;
  dashPattern?: number[];
};
type ChartsDomainAxisStyle = {
  textAlign?: TextAlign;
  textDirection?: TextDirection;
  textStyle?: TextStyle;
  renderNone?: boolean;
  gap?: number;
};
type ChartsWidgetProps = {
  width: number;
  height: number;
  data: ChartsDataGroup[];
  domainLabels?: string[];
  direction?: Axis;
  barStyle?: ChartsBarStyle;
  lineStyle?: ChartsLineStyle;
  pointStyle?: ChartsPointStyle;
  domainAxisStyle?: ChartsDomainAxisStyle;
  measureAxisStyle?: ChartsMeasureAxisStyle;
};
/**
* @group Widgets
*/
declare const ChartsWidget: FunctionComponent<ChartsWidgetProps>;

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
/**
* @group Widgets
*/
declare const CircularProgressIndicator: FunctionComponent<CircularProgressIndicatorProps>;

type ClipOvalProps = {
  clipBehavior?: Clip;
  children?: VirtualNode;
};
/**
* @group Widgets
*/
declare const ClipOval: FunctionComponent<ClipOvalProps>;

type ClipRRectProps = {
  clipBehavior?: Clip;
  borderRadius?: number | BorderRadius;
  children?: VirtualNode;
};
/**
* @group Widgets
*/
declare const ClipRRect: FunctionComponent<ClipRRectProps>;

type ClipRectProps = {
  clipBehavior?: Clip;
  children?: VirtualNode;
};
/**
* @group Widgets
*/
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
/**
* Creates a vertical array of children.
*
* If `crossAxisAlignment` is `CrossAxisAlignment.baseline`, then `textBaseline`
* must not be null.
*
* The `textDirection` argument defaults to the ambient `Directionality`, if any.
* If there is no ambient directionality, and a text direction is going to be necessary to
* disambiguate start or end values for the `crossAxisAlignment`, the `textDirection` must
* not be null.

* @group Widgets
* @group Layout
* @group Basic
*/
declare const Column: FunctionComponent<ColumnProps>;

type CompositedTransformOverlayProps = KeyProps & {
  target: VirtualNode;
  follower: VirtualNode;
  visible: boolean;
  onBarrierDismiss?: () => void;
  maskColor?: Color;
  offset?: Offset;
  targetAnchor?: Alignment;
  followerAnchor?: Alignment;
  animation?: Animation<any>;
};
/**
* Overlays let independent child widgets "float" visual elements on top of other
* widgets by inserting them into the overlay's stack.
*
* `target` is a flutter `CompositedTransformTarget` widget that can be targeted by follower
* (as a flutter `CompositedTransformFollower` widget).
*
* When this widget is composited during the compositing phase (which comes after the paint
* phase), it updates the `link` object so that the `CompositedTransformFollower` widget that
* is subsequently composited in the same frame and were given the same `LayerLink` can position
* themselves at the same screen location. flutter `LayerLink` object is created and managed
* internally by the `CompoistedTransformLayer` widget.
*
* You can pass an `Animation`(by setting the `animation` property) to control the transition
* animation when the `follower` is displayed and hidden, and `visible` is the property to
* control whether the `follower` is displayed or hidden.
*
* @group Widgets
* @group Layout
*/
declare const CompositedTransformOverlay: FunctionComponent<CompositedTransformOverlayProps>;

type ConstrainedBoxProps = BoxConstraints & {
  children?: VirtualNode;
};
/**
* @group Widgets
* @group Layout
*/
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
/**
* @group Widgets
* @group Scrolling
*/
declare const CustomScrollView: FunctionComponent<CustomScrollViewProps>;

/**
* @group UI
* @group Canvas
*/
type CustomPaintRef = RenderObject & {
  canvas: Canvas;
};
type CustomPaintProps = {
  width: number;
  height: number;
  isComplex?: boolean;
  willChange?: boolean;
  ref?: RefObject<CustomPaintRef>;
};
/**
* @group Widgets
* @group Canvas
*/
declare const CustomPaint: FunctionComponent<CustomPaintProps>;

type DefaultTabControllerProps = {
  initialIndex?: number;
  length: number;
  animationDuration?: number;
  children: VirtualNode;
};
/**
* @group Widgets
*/
declare const DefaultTabController: FunctionComponent<DefaultTabControllerProps>;

type DefaultTextStyleProps = TextStyle & {
  children: VirtualNode;
};
/**
* @group Widgets
* @group Text
*/
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
/**
* `Dismissable` must set the `ref` property.
*
* @group Widgets
*/
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
/**
* @group Widgets
*/
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
/**
* @group Widgets
*/
declare const DottedLine: FunctionComponent<DottedLineProps>;

type ExpandedProps = {
  children: VirtualNode;
  flex?: number;
};
/**
* @group Widgets
* @group Layout
*/
declare const Expanded: FunctionComponent<ExpandedProps>;

type FileImageProps = {
  filePath: string;
  width?: number | 'infinity';
  height?: number | 'infinity';
  color?: Color;
  fit?: BoxFit;
  repeat?: ImageRepeat;
  alignment?: Alignment;
  semanticLabel?: string;
};
/**
* @group Widgets
*/
declare const FileImage: FunctionComponent<FileImageProps>;

type FittedBoxProps = {
  fit?: BoxFit;
  alignment?: Alignment;
  clipBehavior?: Clip;
  children?: VirtualNode;
};
/**
* @group Widgets
* @group Layout
*/
declare const FittedBox: FunctionComponent<FittedBoxProps>;

type GestureDetectorProps = KeyProps & {
  children?: VirtualNode;
  behavior?: HitTestBehavior;
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
/**
* @group Widgets
* @group Basic
*/
declare const GestureDetector: FunctionComponent<GestureDetectorProps>;

type GifProps = {
  src: string;
  duration: number;
  width?: number;
  height?: number;
  repeat?: boolean;
};
/**
* @group Widgets
*/
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
/**
* @group Widgets
* @group Scrolling
*/
declare const GridView: FunctionComponent<GridViewProps>;

type HeroProps = {
  tag: string;
  children: VirtualNode;
};
/**
* A widget that marks its child as being a candidate for hero animations.
* @group Widgets
* @see https://api.flutter.dev/flutter/widgets/Hero-class.html
*/
declare const Hero: FunctionComponent<HeroProps>;

type HighlighterViewProps = {
  /**
   * The original code to be highlighted
   */
  code: string;
  /**
   * Highlight language
   *
   * It is recommended to give it a value for performance
   *
   * [All available languages](https://github.com/predatorx7/highlight/tree/master/highlight/lib/languages)
   */
  language?: string;
  theme?: "a11yDark" | "a11yLight" | "atomOneDark" | "atomOneLight" | "dark" | "default" | "github" | "monokaiSublime" | "monokai" | "vs2015" | "xcode";
  /**
   * Defaults to 2
   */
  tabSize?: number;
  padding?: number | EdgeInsets;
  /**
   * Specify text styles such as font family and font size
   */
  textStyle?: TextStyle;
};
declare const HighlighterView: FunctionComponent<HighlighterViewProps>;

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
/**
* @group Widgets
*/
declare const Icon: FunctionComponent<IconProps>;

type IgnorePointerProps = {
  ignoring?: boolean;
  children?: VirtualNode;
};
/**
* @group Widgets
*/
declare const IgnorePointer: FunctionComponent<IgnorePointerProps>;

type IndexedStackProps = {
  index?: number;
  alignment?: Alignment;
  textDirection?: TextDirection;
  sizing?: StackFit;
  children?: VirtualNode[];
};
/**
* @group Widgets
*/
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
/**
* @group Widgets
*/
declare const InkWell: FunctionComponent<InkWellProps>;

type IntrinsicHeightProps = {
  children?: VirtualNode;
};
/**
* @group Widgets
* @group Layout
*/
declare const IntrinsicHeight: FunctionComponent<IntrinsicHeightProps>;

type IntrinsicWidthProps = {
  stepWidth?: number;
  stepHeight?: number;
  children?: VirtualNode;
};
/**
* @group Widgets
* @group Layout
*/
declare const IntrinsicWidth: FunctionComponent<IntrinsicWidthProps>;

type KeyboardVisibilityProps = {
  visibleOnKeyboardShow: boolean;
  children: VirtualNode;
};
/**
* A widget that controls display or not when keyboard visibility changed.
*
* @group Widgets
* @example
* ```tsx
* <KeyboardVisibility
*   visibleOnKeyboardShow={false}
* >
*   <Text>I will disppear when keyboard show.</Text>
* </KeyboardVisibility>
* ```
*/
declare const KeyboardVisibility: FunctionComponent<KeyboardVisibilityProps>;

type LinearProgressIndicatorProps = {
  value?: number;
  backgroundColor?: Color;
  color?: Color;
  minHeight?: number;
  semanticsLabel?: string;
  semanticsValue?: string;
  borderRadius?: BorderRadius | number;
};
/**
* A Material Design linear progress indicator, also known as a progress bar.
*
* @group Widgets
*/
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
/**
* @group Widgets
* @group Scrolling
*/
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
/**
* @group Widgets
*/
declare const Material: FunctionComponent<MaterialProps>;

type MediaQueryProps = {
  size?: {
      width: number;
      height: number;
  };
  devicePixelRatio?: number;
  textScaleFactor?: number;
  platformBrightness?: Brightness;
  padding?: EdgeInsets | number;
  viewPadding?: EdgeInsets | number;
  viewInsets?: EdgeInsets | number;
  systemGestureInsets?: EdgeInsets | number;
  alwaysUse24HourFormat?: boolean;
  accessibleNavigation?: boolean;
  highContrast?: boolean;
  disableAnimations?: boolean;
  invertColors?: boolean;
  boldText?: boolean;
  onOffSwitchLabels?: boolean;
  children: VirtualNode;
};
/**
* @group Widgets
*/
declare const MediaQuery: FunctionComponent<MediaQueryProps>;
type MediaQueryRemoveEdgeInsetsProps = {
  removeLeft?: boolean;
  removeTop?: boolean;
  removeBottom?: boolean;
  removeRight?: boolean;
  children: VirtualNode;
};
declare const MediaQueryRemovePadding: FunctionComponent<MediaQueryRemoveEdgeInsetsProps>;
declare const MediaQueryRemoveViewInsets: FunctionComponent<MediaQueryRemoveEdgeInsetsProps>;
declare const MediaQueryRemoveViewPadding: FunctionComponent<MediaQueryRemoveEdgeInsetsProps>;

type MemoryImageProps = {
  bytes: number[];
  width?: number | 'infinity';
  height?: number | 'infinity';
  color?: Color;
  fit?: BoxFit;
  repeat?: ImageRepeat;
  alignment?: Alignment;
  semanticLabel?: string;
};
/**
* @group Widgets
*/
declare const MemoryImage: FunctionComponent<MemoryImageProps>;

type MenuProps = {
  backgroundColor?: Color;
  children: (VirtualNode | undefined | null | (VirtualNode | undefined | null)[])[] | VirtualNode;
};
/**
* @group Widgets
*/
declare const Menu: FunctionComponent<MenuProps>;

type MenuActionProps = {
  leading: VirtualNode;
  trailing?: VirtualNode;
  onTap?: () => void;
};
/**
* @group Widgets
*/
declare const MenuAction: FunctionComponent<MenuActionProps>;

type NavigatorRef = RenderObject & {
  navigator: WrappedRouter;
};
type NavigatorProps = {
  router: Router;
  ref?: RefObject<NavigatorRef>;
};
/**
* A widget that manages a set of child widgets with a stack discipline.
*
* @group Widgets
* @group Navigation
*/
declare function Navigator({ router, ref, }: NavigatorProps): JSX.Element;
/**
* @group Hooks
* @group Navigation
*/
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
/**
* @group Widgets
* @group Scrolling
*/
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
/**
* A widget that display image from network url.
* @group Widgets
* @group Basic
*/
declare const NetworkImage: FunctionComponent<NetworkImageProps>;

type OffstageProps = {
  offstage?: boolean;
  children?: VirtualNode;
};
/**
* A widget that visually hides its child.
*
* @group Widgets
*/
declare const Offstage: FunctionComponent<OffstageProps>;

type OpacityProps = {
  opacity: number;
  alwaysIncludeSemantics?: boolean;
  children?: VirtualNode;
};
/**
* @group Widgets
*/
declare const Opacity: FunctionComponent<OpacityProps>;

type OverflowBoxProps = BoxConstraints & {
  alignment?: Alignment;
  children?: VirtualNode;
};
/**
* @group Widgets
* @group Layout
*/
declare const OverflowBox: FunctionComponent<OverflowBoxProps>;

type PaddingProps = KeyProps & EdgeInsets & {
  all?: number;
  children?: VirtualNode;
};
/**
* A widget that insets its child by the given padding.
*
* @group Widgets
* @group Layout
* @group Basic
*/
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
/**
* @group Widgets
* @group Scrolling
*/
declare const PageView: FunctionComponent<PageViewProps>;

type PopScopeProps = {
  canPop?: boolean;
  onPopInvoked?: (didPop: boolean) => void;
  children: VirtualNode;
};
/**
* @group Widgets
*/
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
/**
* A widget that controls where a child of a `Stack` is positioned.
*
* A `Positioned` widget must be a descendant of a `Stack`.
*
* @group Widgets
* @group Layout
*/
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
/**
* @group Widgets
*/
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
/**
* @group Widgets
*/
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
  proxyDecorator?: (index: number) => VirtualNode;
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
/**
* A list whose items the user can interactively reorder by dragging.
*
* All list items must have a key.
*
* @group Widgets
*/
declare const ReorderableListView: FunctionComponent<ReorderableListViewProps>;

type ReorderableColumnProps = {
  padding?: number | EdgeInsets;
  needsLongPressDraggable?: boolean;
  crossAxisAlignment?: CrossAxisAlignment;
  mainAxisAlignment?: MainAxisAlignment;
  textDirection?: TextDirection;
  verticalDirection?: VerticalDirection;
  reorderAnimationDuration?: number;
  scrollAnimationDuration?: number;
  textBaseline?: TextBaseLine;
  draggingWidgetOpacity?: number;
  onNoReorder?: (index: number) => void;
  onReorderStarted?: (index: number) => void;
  onReorder: (details: {
      oldIndex: number;
      newIndex: number;
  }) => void;
  header?: VirtualNode;
  footer?: VirtualNode;
  children: (VirtualNode | undefined | null)[] | VirtualNode;
};
declare const ReorderableColumn: FunctionComponent<ReorderableColumnProps>;

type ReorderableTableRowProps = {
  mainAxisAlignment?: MainAxisAlignment;
  crossAxisAlignment?: CrossAxisAlignment;
  mainAxisSize?: MainAxisSize;
  textDirection?: TextDecoration;
  textBaseline?: TextBaseLine;
  verticalDirection?: VerticalDirection;
  decoration?: BoxDecoration;
  children: (VirtualNode | undefined | null)[] | VirtualNode;
};
declare const ReorderableTableRow: FunctionComponent<ReorderableTableRowProps>;
type TableCellVerticalAlignment = "baseline" | "bottom" | "fill" | "intrinsicHeight" | "middle" | "top";
type ReorderableTableProps = {
  needsLongPressDraggable?: boolean;
  textDirection?: TextDirection;
  textBaseline?: TextBaseLine;
  reorderAnimationDuration?: number;
  scrollAnimationDuration?: number;
  defaultColumnWidth?: number;
  columnWidths?: Record<number, number>;
  defaultVerticalAlignment?: TableCellVerticalAlignment;
  onNoReorder?: (index: number) => void;
  onReorder: (details: {
      oldIndex: number;
      newIndex: number;
  }) => void;
  header?: VirtualNode;
  footer?: VirtualNode;
  children: (VirtualNode | undefined | null)[] | VirtualNode;
};
declare const ReorderableTable: FunctionComponent<ReorderableTableProps>;

type ReorderableWrapProps = {
  enableReorder?: boolean;
  padding?: number | EdgeInsets;
  direction?: Axis;
  needsLongPressDraggable?: boolean;
  alignment?: WrapAlignment;
  runAlignment?: WrapAlignment;
  crossAxisAlignment?: WrapCrossAlignment;
  spacing?: number;
  runSpacing?: number;
  textDirection?: TextDirection;
  verticalDirection?: VerticalDirection;
  minMainAxisCount?: number;
  maxMainAxisCount?: number;
  reorderAnimationDuration?: number;
  scrollAnimationDuration?: number;
  scrollDirection?: Axis;
  scrollPhysics?: ScrollPhysics;
  onNoReorder?: (index: number) => void;
  onReorderStarted?: (index: number) => void;
  onReorder: (details: {
      oldIndex: number;
      newIndex: number;
  }) => void;
  header?: VirtualNode;
  footer?: VirtualNode;
  children?: (VirtualNode | undefined | null)[] | VirtualNode;
};
declare const ReorderableWrap: FunctionComponent<ReorderableWrapProps>;

type ImageByteFormat = 'png' | 'rawRgba' | 'rawStraightRgba' | 'rawUnmodified';
/**
* @group UI
*/
type RepaintBoundaryRef = RenderObject & {
  getImageBytes(format?: ImageByteFormat, pixelRatio?: number): Promise<number[] | null>;
  /**
   * Create image and share
   */
  shareImage(pixelRatio?: number): Promise<ShareResultStatus | null>;
  /**
   * Create image and save to gallery
   */
  saveImage(options?: {
      format?: ImageByteFormat;
      /**
       * 0 - 100
       */
      quality?: number;
      pixelRatio?: number;
      /**
       * Image name
       */
      name?: string;
  }): Promise<boolean | null>;
};
type RepaintBoundaryProps = {
  ref?: RefObject<RepaintBoundaryRef>;
  children?: VirtualNode;
};
/**
* @group Widgets
*/
declare const RepaintBoundary: FunctionComponent<RepaintBoundaryProps>;

type RichSelectableTextProps = {
  textAlign?: TextAlign;
  textDirection?: TextDirection;
  overflow?: TextOverflow;
  textScaleFactor?: number;
  minLines?: number;
  maxLines?: number;
  strutStyle?: StrutStyle;
  textWidthBasis?: TextWidthBasis;
  enableInteractiveSelection?: boolean;
  onTap?: () => void;
  /**
   * Just accept `<TextSpan />`
   */
  children: VirtualNode;
};
/**
* Creates a selectable text widget with a  `<TextSpan />`
*
* @group Widgets
* @group Text
*
* @example
* <RichText>
*   <TextSpan>
*     <WidgetSpan>
*       <Container width={10} height={10} color={'red'} />
*     </WidgetSpan>
*     <TextSpan text="Hello" />
*     <TextSpan text=" World!" />
*   </TextSpan>
* </RichText>
*/
declare const RichSelectableText: FunctionComponent<RichSelectableTextProps>;

type TextSpanProps = TextStyle & {
  text?: string;
  spellOut?: boolean;
  semanticsLabel?: string;
  /**
   * Just accept `<TextSpan />` or `<WidgetSpan />`
   */
  children?: VirtualNode[] | VirtualNode;
  onTap?: () => void;
  onTapDown?: (details: TapDownDetails) => void;
  onTapUp?: (details: TapUpDetails) => void;
  onTapCancel?: () => void;
};
/**
* Can only be a child node of `<RichText>`
*
* @group Widgets
* @group Text
*
* @example
* <RichText>
*   <TextSpan>
*     <TextSpan text="Hello" />
*     <TextSpan text=" World!" />
*   </TextSpan>
* </RichText>
*/
declare const TextSpan: FunctionComponent<TextSpanProps>;
type WidgetSpanProps = TextStyle & {
  baseline?: TextBaseLine;
  alignment?: PlaceholderAlignment;
  children: VirtualNode;
};
/**
* The  `children` property is the widget that will be embedded.
* Children are constrained by the width of the paragraph.
*
* The  `children` property may contain its own  `Widget` children (if applicable),
* including  `Text` and  `RichText` widgets which may include additional  `WidgetSpan`s.
* Child  `Text` and  `RichText` widgets will be laid out independently and occupy a rectangular space in the parent text layout.
*
* `WidgetSpan` is a leaf node in the  inline span tree.
* Child widgets are constrained by the width of the paragraph they occupy.
* Child widget heights are unconstrained, and may cause the text to overflow and be ellipsized/truncated.

A  `TextStyle` may be provided, but only the decoration, background, and spacing options will be used.
*
* @group Widgets
* @group Text
*
* @example
* <RichText>
*   <TextSpan>
*     <WidgetSpan>
*       <Container width={10} height={10} color={'red'} />
*     </WidgetSpan>
*     <TextSpan text="Hello" />
*     <TextSpan text=" World!" />
*   </TextSpan>
* </RichText>
*/
declare const WidgetSpan: FunctionComponent<WidgetSpanProps>;
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
   * Just accept `<TextSpan />` or `<WidgetSpan />`
   */
  children: VirtualNode;
};
/**
* Creates a text widget with a  `<TextSpan />` or `<WidgetSpan />`.

* The following widgets may be used to build rich text:

*  `TextSpan`s define text and children  `TextSpan`s or `WidgetSpan`s.
*  `WidgetSpan`s define embedded inline widgets.
*
* @group Widgets
* @group Text
*
* @example
* <RichText>
*   <TextSpan>
*     <WidgetSpan>
*       <Container width={10} height={10} color={'red'} />
*     </WidgetSpan>
*     <TextSpan text="Hello" />
*     <TextSpan text=" World!" />
*   </TextSpan>
* </RichText>
*/
declare const RichText: FunctionComponent<RichTextProps>;

type RotatedBoxProps = {
  /**
   * The number of clockwise quarter turns the child should be rotated.
   */
  quarterTurns: number;
  children?: VirtualNode;
};
/**
* A widget that rotates its child by a integral number of quarter turns.
*
* Unlike `Transform`, which applies a transform just prior to painting,
* this object applies its rotation prior to layout, which means the entire
* rotated box consumes only as much space as required by the rotated child.
*
* @group Widgets
*/
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
/**
* Creates a horizontal array of children.
*
* If `crossAxisAlignment` is `CrossAxisAlignment.baseline`, then `textBaseline` must not be null.
*
* The `textDirection` argument defaults to the ambient `Directionality`, if any.
* If there is no ambient directionality, and a text direction is going to be necessary
* to determine the layout order (which is always the case unless the row has no children or
* only one child) or to disambiguate start or end values for the `mainAxisAlignment`,
* the `textDirection` must not be null.
*
* @group Widgets
* @group Layout
* @group Basic
*/
declare const Row: FunctionComponent<RowProps>;

type SelectableTextProps = TextStyle & {
  children: string | number | boolean | Array<string | number | boolean>;
  textAlign?: TextAlign;
  textDirection?: TextDirection;
  textScaleFactor?: number;
  minLines?: number;
  maxLines?: number;
  semanticsLabel?: string;
  textWidthBasis?: TextWidthBasis;
  strutStyle?: StrutStyle;
  enableInteractiveSelection?: boolean;
  textHeightBehavior?: TextHeightBehavior;
  onTap?: () => void;
};
/**
* @group Widgets
* @group Text
*/
declare const SelectableText: FunctionComponent<SelectableTextProps>;

type SafeAreaProps = KeyProps & {
  children: VirtualNode;
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  minimum?: EdgeInsets | number;
  maintainBottomViewPadding?: boolean;
};
/**
* A widget that insets its child by sufficient padding to avoid intrusions by the operating system.

* For example, this will indent the child by enough to avoid the status bar at the top of the screen.

* It will also indent the child by the amount necessary to avoid The Notch on the iPhone X, or other similar creative physical features of the display.

* When a minimum padding is specified, the greater of the minimum padding or the safe area padding will be applied.
*
* @group Widgets
*/
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
/**
* @group Widgets
* @group Scrolling
*/
declare const Scrollbar: FunctionComponent<ScrollbarProps>;

type ScrollNotificationListenerProps = KeyProps & {
  onScrollStart?: (notification: ScrollStartNotification) => void;
  onScrollUpdate?: (notification: ScrollUpdateNotification) => void;
  onScrollEnd?: (notification: ScrollEndNotification) => void;
  onOverScroll?: (notification: OverScrollNotification) => void;
  onUserScroll?: (notificaiton: UserScrollNotification) => void;
  children: VirtualNode;
};
/**
* @group Widgets
* @group Scrolling
*/
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
   * Default: `hardEdge`
   */
  clipBehavior?: Clip;
  /**
   * Default: `manual`
   */
  keyboardDismissBehavior?: ScrollViewKeyboardDismissBehavior;
  children?: VirtualNode;
};
/**
* @group Widgets
* @group Scrolling
* @group Basic
*/
declare const SingleChildScrollView: FunctionComponent<SingleChildScrollViewProps>;

type SizedBoxProps = {
  width?: number | 'infinity';
  height?: number | 'infinity';
  children?: VirtualNode;
};
/**
* Creates a fixed size box.
* The `width` and `height` parameters can be null to indicate that the size of the box
* should not be constrained in the corresponding dimension.
*
* @group Widgets
* @group Layout
*/
declare const SizedBox: FunctionComponent<SizedBoxProps>;

type SliverFillRemainingProps = KeyProps & {
  hasScrollBody?: boolean;
  fillOverscroll?: boolean;
  children: VirtualNode;
};
/**
* @group Widgets
*/
declare const SliverFillRemaining: FunctionComponent<SliverFillRemainingProps>;

type SliverFixedHeightPersistentHeaderProps = KeyProps & {
  height: number;
  children: VirtualNode;
  pinned?: boolean;
  floating?: boolean;
};
/**
* @group Widgets
*/
declare const SliverFixedHeightPersistentHeader: FunctionComponent<SliverFixedHeightPersistentHeaderProps>;

type SliverToBoxAdapterProps = KeyProps & {
  children: VirtualNode;
};
/**
* @group Widgets
*/
declare const SliverToBoxAdapter: FunctionComponent<SliverToBoxAdapterProps>;

type SpacerProps = {
  flex?: number;
};
/**
* @group Widgets
*/
declare const Spacer: FunctionComponent<SpacerProps>;

type StackProps = KeyProps & {
  alignment?: Alignment;
  textDirection?: TextDecoration;
  fit?: StackFit;
  clipBehavior?: Clip;
  children?: VirtualNode | (VirtualNode | null | undefined)[];
};
/**
* A widget that positions its children relative to the edges of its box.

* This widget is useful if you want to overlap several children in a simple way, for example having some text and an image, overlaid with a gradient and a button attached to the bottom.

* @group Widgets
* @group Layout
*/
declare const Stack: FunctionComponent<StackProps>;

type StickyHeaderProps = {
  header: VirtualNode;
  content: VirtualNode;
  overlapHeaders?: boolean;
};
/**
* @group Widgets
*/
declare const StickyHeader: FunctionComponent<StickyHeaderProps>;

type StringSvgProps = KeyProps & {
  source: string;
};
/**
* A widget based on svg string rendering.
* @group Widgets
*
* @example
*
* <StringSvg
*   source={`<svg>...</svg>`}
* />
*/
declare const StringSvg: FunctionComponent<StringSvgProps>;

type SvgProps = KeyProps & {
  src: string;
  width?: number;
  height?: number;
  size?: number;
  color?: Color;
};
/**
* A widget based on svg file path rendering
* @group Widgets
*
* @example
*
* <Svg
*   src="../assets/icons/logo.svg"
*   width={48}
*   height={48}
* />
*/
declare const Svg: FunctionComponent<SvgProps>;

type SwiperProps = {
  autoplay?: boolean;
  /**
   * Millisecond, default `3000`
   */
  autoplayDelay?: number;
  autoplayDisableOnInteraction?: boolean;
  /**
   * Millisecond, defulat `300`
   */
  duration?: number;
  /**
   * Initial index
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
   * When `viewportFraction` is not null and < 1.0, this property is ignored.
   */
  scale?: number;
  /**
   * When `viewportFraction` is not null and < 1.0, this property is ignored.
   */
  fade?: number;
  /**
   * Set whether indicator ui is outer the widget
   */
  outer?: boolean;
  layout?: 'default' | 'stack' | 'tinder';
  indicatorLayout?: 'none' | 'color' | 'drop' | 'scale' | 'slide' | 'warm';
  children: VirtualNode[] | VirtualNode;
  /**
   * This property only accept `<SwiperPagination />` as child node.
   */
  pagination?: VirtualNode;
};
type SwiperPaginationProps = {
  alignment?: Alignment;
  margin?: EdgeInsets | number;
  children: VirtualNode;
};
/**
* @group Widgets
*/
declare const Swiper: FunctionComponent<SwiperProps>;
/**
* Can only be a child widget of `Swiper`
* @group Widgets
*/
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
/**
* @group Widgets
*/
declare const Switch: FunctionComponent<SwitchProps>;

/**
* @internal
*/
type TabControllerRenderNode = {
  key: string;
  initialIndex?: number;
  length: number;
  animationDuration?: number;
  listener?: string;
};
/**
* @group UI
*/
declare class TabController {
  /**
   * @internal
   */
  readonly key: string;
  /**
   * @internal
   */
  constructor(
  /**
   * @internal
   */
  key: string);
  private _listeners;
  private _renderNode;
  /**
   * @internal
   */
  get renderNode(): TabControllerRenderNode;
  getIndex(): Promise<number>;
  animateTo(index: number, duration?: number): void;
  addListener(listener: () => void): void;
  removeListener(listener: () => void): void;
  private __setup__;
  /**
   * @internal
   */
  dispose(): void;
}
/**
* @group UI
*/
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
/**
* @group Widgets
*/
declare function TabControllerProvider({ children, ref, ...props }: TabControllerProps): JSX.Element;
/**
* @group Widgets
*/
declare function TabControllerConsumer({ children, }: {
  children: (tabController: TabController) => VirtualNode;
}): JSX.Element;
/**
* @group Hooks
*/
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
/**
* @group Widgets
*/
declare const TabBar: FunctionComponent<TabBarProps>;

type TabBarViewProps = {
  controller?: TabController;
  physics?: ScrollPhysics;
  viewportFraction?: number;
  clipBehavior?: Clip;
  children: (VirtualNode | undefined | null | (VirtualNode | undefined | null)[])[] | VirtualNode;
};
/**
* @group Widgets
*/
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
/**
* @group Widgets
* @group Text
* @group Basic
*/
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
/**
* @group Widgets
*/
declare const TextField: FunctionComponent<TextFieldProps>;

/**
* @group UI
*/
type TickerManagerRef = {
  tickerManager: TickerManager;
};
type TickerManagerProviderProps = {
  children: VirtualNode;
  ref?: RefObject<TickerManagerRef>;
};
/**
* @group UI
*/
declare class TickerManager {
  /**
   * @internal
   */
  readonly key: string;
  /**
   * @internal
   */
  constructor(
  /**
   * @internal
   */
  key: string);
  private _tickers;
  get tickers(): Ticker[];
  createTicker(onTick: (elapsed: number) => void): Ticker;
  /**
   * @internal
   */
  dispose(): void;
}
/**
* @group UI
*/
declare class Ticker {
  private readonly _manager;
  private readonly _tickerKey;
  private readonly _remove;
  /**
   * @internal
   */
  constructor(_manager: TickerManager, _tickerKey: string, _remove: () => void);
  start(): Promise<boolean>;
  stop(canceled?: boolean): Promise<boolean>;
  remove(): void;
}
/**
* When you need to use `AnimationController`, you must provide a `TickerManagerProvider`
* as a parent node for the animation to take effect.
*
* @group Widgets
*/
declare function TickerManagerProvider({ children, ref, }: TickerManagerProviderProps): JSX.Element;
/**
* @group Widgets
*/
declare function TickerManagerConsumer({ children }: {
  children: (tickerManager: TickerManager) => VirtualNode;
}): JSX.Element;
/**
* @group Hooks
*/
declare function useTickerManager(): TickerManager;

type UnconstrainedBoxProps = {
  textDirection?: TextDecoration;
  alignment?: Alignment;
  constrainedAxis?: Axis;
  clipBehavior?: Clip;
  children?: VirtualNode;
};
/**
* @group Widgets
*/
declare const UnconstrainedBox: FunctionComponent<UnconstrainedBoxProps>;

/**
* @group UI
*/
declare class WebViewController {
  /**
   * @internal
   */
  readonly key: string;
  /**
   * @internal
   */
  constructor(
  /**
   * @internal
   */
  key: string);
  /**
   * Load by url
   */
  loadUrl(url: string): void;
  /**
   * Load string data
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
   * Initial `url` to load.
   */
  url?: string;
  /**
   * If `url` not given, `data` will be used.
   *
   * Initial `data` as a content for an `WebView` Component, using `baseUrl` as the base URL for it.
   */
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
/**
* @group Widgets
*/
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
/**
* @group Widgets
* @group Layout
*/
declare const Wrap: FunctionComponent<WrapProps>;

type SystemUIOverlayStyle = {
  systemNavigationBarColor?: Color;
  systemNavigationBarDividerColor?: Color;
  statusBarColor?: Color;
  systemNavigationBarIconBrightness?: Brightness;
  statusBarBrightness?: Brightness;
  statusBarIconBrightness?: Brightness;
  systemNavigationBarContrastEnforced?: boolean;
  systemStatusBarContrastEnforced?: boolean;
};

/**
* @group Ability
*/
declare class Device {
  static get model(): string;
  /**
   * The locale used by the current App, can be set via Device.setLocale
   */
  static get locale(): string;
  static get systemLocale(): string;
  static get systemLocales(): string[];
  static get systemLanguageTag(): string;
  static get sysmtemLanguageCode(): string;
  static get systemCountryCode(): string | undefined;
  static get systemScriptCode(): string | undefined;
  /**
   * This API is intentionally terse since it calls default platform behavior.
   * It is not suitable for precise control of the system's haptic feedback module.
   */
  static hapticFeedback(type: ImpactFeedBackStyle): void;
  static getBatteryLevel(): Promise<number>;
  static getBatteryState(): Promise<BatteryState>;
  /**
   * Suscribe battery state
   * @param listener subscribe batter state listener
   * @returns unsubscribe function
   */
  static onBatteryStateChanged(listener: (state: BatteryState) => void): () => void;
  /**
   * Set app locale
   * @param locale Please use the standard locale format, or you can use value of `Device.sysmtemLocales`
   * @returns
   */
  static setLocale(locale: string): void;
  /**
   * Describes which theme will be used by app.
   *  - `system`: Use either the light or dark theme based on what the user has selected in the system settings.
   *  - `light`: Always use the light mode regardless of system preference.
   *  - `dark`: Always use the dark mode (if available) regardless of system preference.
   */
  static setThemeMode(themeMode: ThemeMode): void;
  /**
   * Specifies the set of orientations the application interface can be displayed in.
   *
   * The orientation argument is a list of `DeviceOrientation` values. The
   * empty list causes the application to defer to the operating system default.
   */
  static setPreferredOrientation(orientations: DeviceOrientation[]): void;
  /**
   * Specifies the style to use for the system overlays that are visible.
   */
  static setSystemUIOverlayStyle(brightness: Brightness): void;
  static setCustomSystemUIOverlayStyle(style: SystemUIOverlayStyle): void;
  /**
   * Enable or disable the wakelock.
   */
  static setWakeLockEnabled(enabled: boolean): void;
  /**
   * Retrieve the current wakelock status.
   */
  static isWakeLockEnabled(): Promise<boolean>;
}

/**
* @group UI
* @group Basic
*/
declare class Dialog {
  static showLoading(options: {
      message?: string;
      color?: Color;
  }): void;
  static hideLoading(): void;
  static showAlert(options: {
      content: string;
      title?: string;
      buttonLabel?: string;
  }): Promise<void>;
  static showPrompt(options: {
      title: string;
      message?: string;
      defaultValue?: string;
      obscureText?: boolean;
      selectAll?: boolean;
      placeholder?: string;
      cancelLabel?: string;
      confirmLabel?: string;
      keyboardType?: TextInputType;
  }): Promise<string | null>;
  static showConfirm(options: {
      content: string;
      title?: string;
      cancelLabel?: string;
      confirmLabel?: string;
  }): Promise<boolean>;
  static showToast(options: {
      content: string;
      duration?: number;
  }): Promise<void>;
  static showBottomSheet(options: {
      title?: string;
      message?: string;
      cancelButton?: boolean;
      actions: {
          label: string;
          isDefaultAction?: boolean;
          isDestructiveAction?: boolean;
      }[];
  }): Promise<number | null>;
}

type ConsoleMessageLevel = 'DEBUG' | 'ERROR' | 'LOG' | 'TIP' | 'WARNING';
declare class HeadlessWebView {
  constructor();
  private _id;
  private _consoleMessageCallbackId?;
  private _shouldAllowRequestCallbackId?;
  set onConsoleMessage(callback: (level: ConsoleMessageLevel, message: string) => void);
  set shouldAllowRequest(callback: (url: string) => Promise<boolean>);
  loadUrl(url: string): Promise<void>;
  loadHtml(html: string, baseUrl?: string): Promise<void>;
  getHtml(): Promise<string | null>;
  /**
   * Evaluate javascript and get js value, this method should not return `Promise`.
   * @example
   * ```ts
   * headlessWebView.evaluateJavascript("1+1")
   * // output: 2
   * ```
   */
  evaluateJavascript<T>(javascript: string): Promise<T | null>;
  /**
   * Call async javascript and returns a Promise.
   * @example
   * ```ts
   * headlessWebView.callAsyncJavascript(`return new Promise(resolve => {
   *   setTimeout(() => resolve(123), 1000)
   * })`)
   * ```
   */
  callAsyncJavascript<T>(javascript: string): Promise<T | null>;
  dispose(): void;
}

type PickFileOptions = {
  /**
   * If specified `maxWidth` `maxHeight`, the image will be at most `maxWidth` wide and `maxHeight` tall.
   * Otherwise the image will be returned at it's original width and height.
   */
  maxWidth?: number;
  /**
   * If specified `maxWidth` `maxHeight`, the image will be at most `maxWidth` wide and `maxHeight` tall.
   * Otherwise the image will be returned at it's original width and height.
   */
  maxHeight?: number;
  /**
   * The `imageQuality` argument modifies the quality of the image, ranging from 0-100
   * where 100 is the original/max quality. If imageQuality is null, the image with the
   * original quality will be returned. Compression is only supported for certain image
   * types such as JPEG.
   */
  imageQuality?: number;
  /**
   * Use requestFullMetadata (defaults to true) to control how much additional
   * information the plugin tries to get. If requestFullMetadata is set to true,
   * the plugin tries to get the full image metadata which may require extra
   * permission requests on some platforms, such as Photo Library Usage permission on iOS.
   */
  requestFullMetadata?: boolean;
};

type TakePhotoOptions = PickFileOptions & {
  /**
   * Defaults to `rear`.
   */
  preferredCameraDevice?: 'front' | 'rear';
};

/**
* Take photo or pick images/medias from Photos app.
* @group Ability
*/
declare class ImageGallery {
  static pickImage(options?: PickFileOptions): Promise<string | null>;
  static pickMultipleImage(options?: PickFileOptions): Promise<string[]>;
  static pickMedia(options?: PickFileOptions): Promise<string | null>;
  static pickMultipleMedia(options?: PickFileOptions): Promise<string[]>;
  static takePhoto(options?: TakePhotoOptions): Promise<string | null>;
}

/**
* Save images to Photos app.
* @group Ability
*/
declare class ImageSaver {
  static saveBytesImage(options: {
      image: ArrayBuffer;
      quality?: number;
      name?: string;
  }): Promise<boolean>;
  static saveBase64Image(options: {
      image: string;
      quality?: number;
      name?: string;
  }): Promise<boolean>;
  static saveNetworkImage(options: {
      url: string;
      quality?: number;
      name?: string;
  }): Promise<boolean>;
}

type GetDirectoryPathOptions = {
  dialogTitle?: string;
  initialDirectory?: string;
};

type PickFileOption = {
  dialogTitle?: string;
  initialDirectory?: string;
  type?: 'custom' | 'audio' | 'image' | 'media' | 'video';
  allowedExtensions?: string[];
  allowCompression?: boolean;
  compressionQuality?: number;
};

type SaveFileOption = {
  bytes: number[];
  fileName?: string;
  dialogTitle?: string;
  initialDirectory?: string;
  type?: 'custom' | 'audio' | 'image' | 'media' | 'video';
  allowedExtensions?: string[];
};

/**
* Pick files from Files app.
* @group Ability
*/
declare class FilePicker {
  /**
   * Pick single file
   * @example
   * ```ts
   * const imageFilePath = await FilePicker.pickFile({type: 'image'})
   * if (imageFilePath != null) {
   *   // ...
   * }
   * ```
   */
  static pickFile(options?: PickFileOption): Promise<string | null>;
  /**
   * Pick multiple files.
   * @example
   * ```ts
   * const filePaths = await FilePicker.pickMultipleFile({
   *   type: 'custom',
   *   allowedExtensions: ['jpg', 'pdf']
   * })
   * ```
   */
  static pickMultipleFile(options?: PickFileOption): Promise<string[]>;
  /**
   * Save file dialog
   * @example
   * ```ts
   * const  outputFilePath = await FilePicker.saveFile({
   *   bytes: [0, 0, 0, 0, ...], // some bytes array
   *   fileName: 'test.txt',
   * })
   * if (outputFilePath == null) {
   *   // user canceled the dialog
   * }
   * ```
   */
  static saveFile(options: SaveFileOption): Promise<String | null>;
  /**
   * Pick a directory
   * @example
   * ```ts
   * const selectedDirectory = await FilePicker.getDirectoryPath()
   * if (selectedDirectory == null) {
   *   // user canceled the picker
   * }
   * ```
   */
  static getDirectoryPath(options?: GetDirectoryPathOptions): Promise<string | null>;
}

type Encoding = 'utf-8' | 'ascii' | 'latin1';
/**
* @group Ability
*/
declare class FileManager {
  static isiCloudEnabled(): Promise<boolean>;
  static iCloudDocumentsDirectory(): Promise<string>;
  static isFileStoredIniCloud(filePath: string): Promise<boolean>;
  static isiCloudFileDownloaded(filePath: string): Promise<boolean>;
  static downloadFileFromiCloud(filePath: string): Promise<boolean>;
  static getShareUrlOfiCloudFile(filePath: string, expirationTimestamp?: number): Promise<string | null>;
  static documentsDirectory(): Promise<string>;
  static temporaryDirectory(): Promise<string>;
  static createDirectory(path: string, recursive?: boolean): Promise<void>;
  static createLink(path: string, target: string): Promise<void>;
  static copyFile(path: string, newPath: string): Promise<void>;
  static readDirectory(path: string, recursive?: boolean): Promise<string[]>;
  static exists(path: string): Promise<boolean>;
  static isFile(path: string): Promise<boolean>;
  static isDirectory(path: string): Promise<boolean>;
  static isLink(path: string): Promise<boolean>;
  static readAsString(path: string, encoding?: Encoding): Promise<string>;
  static readAsBytes(path: string): Promise<number[]>;
  static writeAsString(path: string, contents: string, encoding?: Encoding): Promise<void>;
  static writeAsBytes(path: string, data: number[]): Promise<void>;
  static stat(path: string): Promise<{
      creationDate: number;
      modificationDate: number;
      type: string;
      size: number;
  }>;
  static rename(path: string, newPath: string): Promise<void>;
  static remove(path: string): Promise<void>;
  /**
   * Zips the file or directory contents at the specified `srcPath` to the `destPath`.
   * `shouldKeepParent` indicates that the directory name of a source item should be used as root element
   * within the archive. Default is `true`.
   *
   * @example
   * ```ts
   * const docsDir = await FileManager.documentsDirectory()
   *
   * // zip a single file
   * await FileManager.zip(
   *   docsDir + '/test.txt',
   *   docsDir + '/test.zip',
   * )
   *
   * // zip a directory
   * await FileManager.zip(
   *   docsDir + '/MyScript',
   *   docsDir + '/MyScript.zip'
   * )
   * ```
   */
  static zip(srcPath: string, destPath: string, shouldKeepParent?: boolean): Promise<void>;
  /**
   * Unzips the contents at the specified `srcPath` to the `destPath`.
   *
   * @example
   * ```ts
   * await FileManager.unzip(
   *   (await FileManager.temporaryDirectory()) + '/MyScript.zip',
   *   await FileManager.documentsDirectory()
   * )
   * ```
   */
  static unzip(srcPath: string, destPath: string): Promise<void>;
}

type LaunchMode = 'externalApplication' | 'externalNonBrowserApplication' | 'inAppBrowserView' | 'inAppWebView';
/**
* Passes [url] to the underlying platform for handling.
*
* @param url Url to launch, `"https://x.com"`
* @param mode support varies significantly by platform. Platforms will fall back to other modes if the requested mode is not supported.
* @returns Returns true if the URL was launched successfully, otherwise either returns
* false or throws a [PlatformException] depending on the failure.
*/
declare function launchUrl(url: string, mode?: LaunchMode): Promise<boolean>;

/**
* @group Ability
*/
declare class Notification {
  static show({ title, body, }: {
      title: string;
      body: string;
  }): Promise<boolean>;
}

/**
* Parse the QR code image file, or open the scan code page to scan.
* @group Ability
* @group UI
*/
declare class QRCode {
  /**
   * Parse QRCode file.
   * @example
   * ```ts
   * const filePath = (await FileManager.documentsDirectory()) + '/qrcode.png'
   * const result = await QRCode.parse(filePath)
   * if (result != null) {
   *   // handle QRCode result
   * }
   * ```
   */
  static parse(filePath: string): Promise<string | null>;
  /**
   * Open the QRCode scan page and scan.
   * @example
   * const result = await QRCode.scan()
   * if (result != null) {
   *   // handle result
   * }
   */
  static scan(): Promise<string | null>;
}

/**
* Controls cancellation of requests.
*
* The same token can be shared between different requests.
* When `cancel` is invoked, requests bound to this token will be cancelled.
*/
declare class CancelToken {
  readonly token: string;
  private _isCancelled;
  /**
   * Whether the token is cancelled.
   */
  get isCancelled(): boolean;
  /**
   * Cancel the request.
   */
  cancel(): void;
}
type CancelTokenHook = {
  /**
   * Get the `CancelToken` instance, if `create` hasn't been called, it would return `undefined`.
   */
  get(): CancelToken | undefined;
  /**
   * Create a `CancelToken` instance, if `create` was called, it return the exists instance,
   * otherwise a new instance will be create.
   */
  create(): CancelToken;
};
/**
* If you want to use `CancelToken` in `FunctionComponent`, use this hook.
*
* @group Hooks
* @example
* ```tsx
* function App() {
*   const cancelToken = useCancelToken()
*
*   async function request() {
*     // Cancel last request
*     cancelToken.get()?.cancel()
*
*     const result = await fetch('https://example.com', {
*      // Create a new `CancelToken` instance
*       cancelToken: cancelToken.create(),
*     })
*     // ...
*   }
*
*   return (
*     <CupertinoButton
*       onPressed={request}
*     >
*      <Text>Request</Text>
*     </CupertinoButton>
*   )
* }
* ```
*/
declare function useCancelToken(): CancelTokenHook;

declare class Blob {
  private parts;
  private _type;
  constructor(parts?: (string | ArrayBuffer | ArrayBufferView | Blob)[], options?: {
      type?: string;
  });
  slice(start?: number, end?: number, contentType?: string): Blob;
  get size(): number;
  get type(): string;
  static stringToUtf8ArrayBuffer(str: string): ArrayBuffer;
  static utf8ArrayBufferToString(buffer: ArrayBuffer): string;
  text(): Promise<string>;
  arrayBuffer(): Promise<ArrayBuffer>;
}
/**
* Provides a way to easily construct a set of key/value pairs representing form fields and their values, which can then be easily sent using the XMLHttpRequest.send() method. It uses the same format a form would use if the encoding type were set to "multipart/form-data".
*
* [MDN Reference](https://developer.mozilla.org/docs/Web/API/FormData)
*/
declare class FormData {
  private formData;
  append(name: string, value: string): void;
  append(name: string, value: Blob, filename?: string): void;
  get(name: string): string | Blob;
  getAll(name: string): any[];
  has(name: string): boolean;
  delete(name: string): void;
  set(name: string, value: string): void;
  set(name: string, value: Blob, filename?: string): void;
  forEach(callback: (value: any, name: string, parent: FormData) => void): void;
  entries(): [string, any][];
}
type HeadersInit = [string, string][] | Record<string, string> | Headers;
/**
* This Fetch API interface allows you to perform various actions on HTTP request and response headers. These actions include retrieving, setting, adding to, and removing. A Headers object has an associated header list, which is initially empty and consists of zero or more name and value pairs.  You can add to this using methods like append() (see Examples.) In all methods of this interface, header names are matched by case-insensitive byte sequence.
*
* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Headers)
*/
declare class Headers {
  private map;
  constructor(init?: HeadersInit);
  append(name: string, value: string): void;
  get(name: string): string | null;
  has(name: string): boolean;
  set(name: string, value: string): void;
  delete(name: string): void;
  forEach(callback: (value: string, name: string) => void): void;
  keys(): string[];
  values(): string[];
  entries(): [string, string][];
  toJson(): {
      [x: string]: string;
  };
}
type ResponseInit = {
  status?: number;
  statusText?: string;
  headers?: HeadersInit;
};
/**
* This Fetch API interface represents the response to a request.
*
* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response)
*/
declare class Response {
  private body;
  private _status;
  private _statusText;
  private _headers;
  private _ok;
  constructor(body: Blob | null, init?: ResponseInit);
  json(): Promise<any>;
  text(): Promise<string>;
  blob(): Promise<Blob>;
  formData(): Promise<FormData>;
  arrayBuffer(): Promise<ArrayBuffer>;
  get status(): number;
  get statusText(): string;
  get headers(): Headers;
  get ok(): boolean;
}
type RequestInit = {
  method?: string;
  headers?: HeadersInit;
  body?: any;
  cancelToken?: CancelToken;
  /**
   * Debug label will display in log panel.
   */
  debugLabel?: string;
};
/**
* The Request interface of the Fetch API represents a resource request.
*/
declare class Request {
  url: string;
  method: string;
  headers: Headers;
  body: any;
  constructor(input: string | Request, init?: RequestInit);
  clone(): Request;
}
/**
* The fetch() method starts the process of fetching a resource from the network,
* returning a promise that is fulfilled once the response is available.
*
* The promise resolves to the Response object representing the response to your request.
*
* A fetch() promise only rejects when the request fails, for example, because of a
* badly-formed request URL or a network error. A fetch() promise does not reject if
* the server responds with HTTP status codes that indicate errors (404, 504, etc.).
* Instead, a then() handler must check the Response.ok and/or Response.status properties.
*
* @group Ability
* @group Network
* @group Basic
*/
declare function fetch(input: string | Request, init?: RequestInit): Promise<Response>;

/**
* Send a download file request.
* @group Ability
* @group Network
* @example
* ```ts
* const success = await downloadFile({
*   url: 'https://example.com/json_data',
*   savePath: (await FileManager.documentsDirectory()) + '/data.json',
* })
* ```
*/
declare function downloadFile(options: {
  url: string;
  savePath: string;
  headers?: {
      [key: string]: any;
  };
  cancelToken?: CancelToken;
  /**
   * Debug label will display in log panel.
   */
  debugLabel?: string;
}): Promise<boolean>;

/**
* Send a request and returns a bytes array.
* @group Ability
* @group Network
* @example
* ```ts
* const bytes = await loadBytes('https://example.com/data')
* const uint8Array = new Uint8Array(bytes)
* ```
*/
declare function loadBytes(options: {
  url: string;
  noCache?: boolean;
  timeout?: number;
  debugLabel?: string;
  headers?: {
      [key: string]: any;
  };
  cancelToken?: CancelToken;
}): Promise<number[] | null>;

/**
* Load font from network.
* @group Ability
* @group Network
* @example
* ```ts
* await loadFont({
*   family: 'Source Code Pro',
*   urls: [
*     'https://exmple.com/fonts/Source_Code_Pro_Regular.ttf', // weight: 400,
*     'https://exmple.com/fonts/Source_Code_Pro_SemidBold.ttf', // weight: 500,
*     'https://exmple.com/fonts/Source_Code_Pro_Bold.ttf', // weight: 600,
*   ],
*   type: 'ttf',
* })
*
* // After the font loaded, you can use in `Text`
* function App() {
*    return (
*      <Text
*        family={'Source Code Pro'}
*        fontWeight={500} // use SemidBold
*      >Hello</Text>
*   )
* }
* ```
*/
declare function loadFont(options: {
  family: string;
  urls: string[];
  type?: 'otf' | 'ttf';
}): Promise<boolean>;

/**
* Send a request and returns a JSON.
* @group Ability
* @group Network
* @example
* ```ts
* const jsonData = await loadJson('https://example.com/json_data')
* ```
*/
declare function loadJson<T>(options: {
  url: string;
  noCache?: boolean;
  timeout?: number;
  debugLabel?: string;
  headers?: {
      [key: string]: any;
  };
  queryParameters?: {
      [key: string]: any;
  };
  cancelToken?: CancelToken;
}): Promise<T | null>;

/**
* Send a request and returns a string.
*
* @group Ability
* @group Network
* @example
* ```ts
* const result = await loadString('https://example.com')
* console.log(result)
* ```
*/
declare function loadString<T>(options: {
  url: string;
  noCache?: boolean;
  timeout?: number;
  debugLabel?: string;
  headers?: {
      [key: string]: any;
  };
  queryParameters?: {
      [key: string]: any;
  };
  cancelToken?: CancelToken;
}): Promise<T | null>;

/**
* @group Ability
*/
declare class Script {
  /**
   * Get current script name.
   */
  static get name(): string;
  /**
   * If a widget has set the `Parameter` field, and the current script is opened and run
   * after clicking the widget, you can access the configuration from this property.
   */
  static get widgetParameter(): string;
  /**
   * If the current script is opened and run by the `run URL scheme`(
   * like `scripting://run/{script_name}?a=1&b=2`).
   */
  static get queryParameters(): Record<string, string>;
  /**
   * Creates a URL scheme for opening a specified script.
   *
   * @param scriptName
   * @param queryParameters
   * @returns `scripting://open/example_script?a=1&b=2`
   */
  static createOpenURLScheme(scriptName: string, queryParameters?: Record<string, string>): string;
  /**
   * Creates a URL scheme for running a specified script.
   *
   * @param scriptName
   * @param queryParameters
   * @returns `scripting://run/example_script?a=1&b=2`
   * @example
   * ```tsx
   * // Script A: widget.tsx
   * async function MyWidget() {
   *   const url = Script.createRunURLScheme("Script A", {
   *     param1: 1,
   *     param2: 2,
   *   })
   *   return (
   *     <WidgetText
   *       widgetURL={url}
   *     >
   *        Run Script A
   *      </WidgetText>
   *   )
   * }
   *
   * // Script A: index.tsx
   * console.log(
   *   JSON.stringify(Script.queryParameters)
   * ) // output: {"param1": 1, "param2": 2}
   * ```
   */
  static createRunURLScheme(scriptName: string, queryParameters?: Record<string, string>): string;
  /**
   * Run a script of Scripting.
   *
   * If the script does not exist, `null` is returned directly.
   *
   * **Caution**: Make sure to call `Script.exit()` in the script to avoid memory leaks.
   *
   * @param options
   * @param options.name Name of the script
   * @param options.queryParameters Params passed to the script, you can access by `Script.queryParameters`.
   * @returns The result returned by the script, if the script passes result to `Script.exit(result)`
   *
   * @example
   * ```ts
   * // Script A: index.tsx
   * Script.exit(
   *   Script.queryParameters["name"] + '123'
   * )
   *
   * // Script B: index.tsx
   * async function run() {
   *   const result = await Script.run({
   *     name: 'Script A',
   *     queryParameters: {
   *       name: 'AAAA',
   *     }
   *   })
   *
   *   console.log(result) // output: AAAA123
   * }
   * run()
   * ```
   */
  static run<T>(options: {
      name: string;
      queryParameters?: {
          [key: string]: any;
      };
  }): Promise<T | null>;
  /**
   * Exit current script
   * @param result The result is returned to the calling script
   */
  static exit(result?: any): void;
}

/**
* Share text, images or files.
* @group Ability
*/
declare class Share {
  /**
   * Share text
   * @param options
   * @param options.text Share text content
   * @param options.subject Share subject
   */
  static shareText(options: {
      text: string;
      subject?: string;
  }): Promise<{
      status: ShareResultStatus;
  }>;
  /**
   * Share base64 image
   * @param options
   * @param options.image base64 format, e.g. data:image/png;base64,xxxxx...
   * @param options.text Share text content
   * @param options.subject Share subject
   */
  static shareBase64Image(options: {
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
  static shareFiles(options: {
      files: string[];
      text: string;
      subject?: string;
  }): Promise<{
      status: ShareResultStatus;
  }>;
}

type SocketIOOptions = {
  forceNew?: boolean;
  forceNewConnection?: boolean;
  multiplex?: boolean;
  query?: Record<string, any>;
  autoConnect?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  randomizationFactor?: number;
  timeout?: number;
  reconnection?: boolean;
  extraHeaders?: Record<string, any>;
  auth?: Record<string, any>;
};

/**
* Connect with socket.io server.
*
* @group Ability
* @group Network
* @example
* ```ts
* const io = SocketIO.open('https://your.socket.io/server', {
*   autoconnect: true,
*   query: {
*     customQuery: '1111',
*   }
* })
* ```
*/
declare class SocketIO {
  private key;
  url: string;
  static open(url: string, options?: SocketIOOptions): Promise<SocketIO>;
  private _eventMap;
  /**
   * @internal
   */
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
}

/**
* You can stored data by using `Storage`.
*
* Data supportes:
*  - `string`
*  - `number`
*  - `boolean`
*  - `JSON`
* @group Ability
*/
declare class Storage {
  static setItem<T>(key: string, value: T): Promise<boolean>;
  static getItem<T>(key: string): Promise<T | null>;
  static removeItem(key: string): Promise<boolean>;
}

type WidgetFamily = "systemSmall" | "systemMedium" | "systemLarge" | "systemExtraLarge" | "accessoryCircular" | "accessoryRectangular" | "accessoryInline";
type WidgetDisplaySize = {
  width: number;
  height: number;
};
type WidgetContext = {
  family: WidgetFamily;
  displaySize: WidgetDisplaySize;
  widgetParameter: string;
};
type WidgetInitializer = (context: WidgetContext) => Promise<VirtualNode>;
/**
*
* @group iOS Widgets
*/
declare class Widget {
  /**
   * Render iOS widget by a `WidgetInitializer`
   *
   * You cannot use `FunctionComponent` or non-iOS widgets(like `Column` `Padding`)
   * when building iOS widget UI.
   * You should only use iOS widgets such as `VStack`, `WidgetText`.
   *
   * Widgets that support building iOS Widget UI include:
   *
   *  - `VStack`
   *  - `HStack`
   *  - `ZStack`
   *  - `WidgetText`
   *  - `WidgetImage`
   *  - `WidgetLink`
   *  - `WidgetSpacer`
   *  - `WidgetDivider`
   *
   * @param func A `WidgetInitializer` function, call access the `WidgetFamily` and `WidgetDisplaySize`
   */
  static render(func: WidgetInitializer): Promise<void>;
  /**
   * Present a preview of the widget.
   * While working on you widget, you my want to preview it in the app.
   *
   * @param func A `WidgetInitializer` function
   * @param family The `WidgetFamily` you want to preview
   * @returns Promise that is fullfilled when the preview is dismissed
   * @example
   * ```tsx
   * // widget.tsx
   * export async function MyWidget() {
   *   return (
   *     <WidgetText>Hello Scripting!</WidgetText>
   *   )
   * }
   *
   * // index.tsx
   * import { MyWidget } from './widget'
   * Widget.preview(
   *   MyWidget,
   *   {
   *     family: 'systemSmall',
   *   }
   * )
   * ```
   */
  static preview(func: WidgetInitializer, options: {
      family: WidgetFamily;
      widgetParameter?: string;
  }): Promise<void>;
  /**
   * Reloads the timelines for all configured widgets belonging to the containing app.
   */
  static reloadAll(): void;
}

type WorkerMessageListener = (event: {
  data: any;
}) => void;
type WorkerErrorListener = (event: {
  filename: string;
  message: string;
  stack?: string;
}) => void;
/**
* @group Ability
*/
declare class Worker {
  readonly scriptPath: string;
  constructor(scriptPath: string);
  private _id;
  private _callbackId;
  private _isInited;
  private _isActived;
  private _waitForInitPromise?;
  private _onmessage?;
  private _onerror?;
  private _init;
  set onmessage(listener: WorkerMessageListener | undefined);
  get onmessage(): WorkerMessageListener | undefined;
  set onerror(listener: WorkerErrorListener | undefined);
  get onerror(): WorkerErrorListener | undefined;
  postMessage(message: any): void;
  terminate(): void;
}

declare global {
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

export { AbsorbPointer, type AbsorbPointerProps, type AixsDirection, Align, type AlignProps, type Alignment, AnimatedAlign, type AnimatedAlignProps, AnimatedContainer, type AnimatedContainerProps, AnimatedOpacity, type AnimatedOpacityProps, AnimatedPadding, type AnimatedPaddingProps, AnimatedPositioned, type AnimatedPositionedProps, AnimatedRotation, type AnimatedRotationProps, AnimatedScale, type AnimatedScaleProps, AnimatedSize, type AnimatedSizeProps, AnimatedSlide, type AnimatedSlideProps, Animation, AnimationBase, AnimationController, type AnimationControllerInitialOptions, type AnimationInitalOptions, type AnimationStatus, type AnimationStatusListener, type AnimationValue, AppEventEmitter, AppEvents, type AppLifeCycleState, AspectRatio, type AspectRatioProps, AssetImage, type AssetImageProps, AutoSizeText, type AutoSizeTextProps, type Axis, BackdropFilter, type BackdropFilterProps, Baseline, type BaselineProps, BatteryState, type BlendMode, Blob, type BlurStyle, type BorderRadius, type BorderSide, BottomNavigationBarItem, type BottomNavigationBarItemProps, type BoxConstraints, type BoxDecoration, type BoxFit, type BoxShadow, type BoxShape, type Brightness, type CSSColorKeywords, CSSFilter, type CSSFilterMatrix, CSSFilterPresets, type CSSFilterPresetsEffect, type CSSFilterPresetsProps, type CSSFilterProps, CancelToken, type CancelTokenHook, Canvas, type CanvasBlendMode, type CanvasColorSpace, type CanvasFillRule, type CanvasFontKerning, CanvasGradient, type CanvasImageSmoothingQuality, type CanvasLineCap, type CanvasLineJoin, CanvasRenderingContext2D, type CanvasTextMetrics, type CanvasTextRendering, Center, type CenterProps, type ChartsBarStyle, type ChartsCommonDataGroup, type ChartsDataGroup, type ChartsDomainAxisStyle, type ChartsLineStyle, type ChartsMeasureAxisStyle, type ChartsPointStyle, type ChartsStackedDataGroup, ChartsWidget, type ChartsWidgetProps, CircularProgressIndicator, type CircularProgressIndicatorProps, type Clip, ClipOval, type ClipOvalProps, ClipRRect, type ClipRRectProps, ClipRect, type ClipRectProps, Clipboard, type Color, type ColorValueHex, type ColorValueHsl, type ColorValueHsla, type ColorValueRgb, type ColorValueRgba, Column, type ColumnProps, type ComponentCallback, type ComponentEffect, type ComponentEffectEvent, type ComponentMemo, type ComponentProps, CompositedTransformOverlay, type CompositedTransformOverlayProps, type ConsoleMessageLevel, ConstrainedBox, type ConstrainedBoxProps, type Consumer, type ConsumerProps, Container, type ContainerProps, type Context, type CrossAxisAlignment, CupertinoActionSheet, CupertinoActionSheetAction, type CupertinoActionSheetActionProps, type CupertinoActionSheetProps, CupertinoActivityIndicator, type CupertinoActivityIndicatorProps, CupertinoAlertDialog, type CupertinoAlertDialogProps, CupertinoButton, type CupertinoButtonProps, type CupertinoColors, CupertinoColorsWithBrightness, CupertinoContextMenu, CupertinoContextMenuAction, type CupertinoContextMenuActionProps, type CupertinoContextMenuProps, CupertinoDatePicker, type CupertinoDatePickerMode, type CupertinoDatePickerProps, CupertinoDialogAction, type CupertinoDialogActionProps, type CupertinoDialogRoute, CupertinoFormRow, type CupertinoFormRowProps, CupertinoFormSection, type CupertinoFormSectionProps, type CupertinoIcons, CupertinoListSection, type CupertinoListSectionProps, CupertinoListTile, CupertinoListTileChevron, type CupertinoListTileProps, type CupertinoModalPopupRoute, CupertinoNavigationBar, CupertinoNavigationBarBackButton, type CupertinoNavigationBarBackButtonProps, type CupertinoNavigationBarProps, type CupertinoPageRoute, CupertinoPageScaffold, type CupertinoPageScaffoldProps, CupertinoPicker, CupertinoPickerDefaultSelectionOverlay, type CupertinoPickerDefaultSelectionOverlayProps, type CupertinoPickerProps, CupertinoPopupSurface, type CupertinoPopupSurfaceProps, CupertinoScrollerBar, type CupertinoScrollerBarProps, CupertinoSearchTextField, type CupertinoSearchTextFieldProps, CupertinoSegmentedControl, type CupertinoSegmentedControlProps, CupertinoSlider, type CupertinoSliderProps, CupertinoSlidingSegmentedControl, type CupertinoSlidingSegmentedControlProps, CupertinoSliverNavigationBar, type CupertinoSliverNavigationBarProps, CupertinoSliverRefreshControl, type CupertinoSliverRefreshControlProps, CupertinoSwitch, type CupertinoSwitchProps, CupertinoTabBar, type CupertinoTabBarProps, CupertinoTextField, type CupertinoTextFieldProps, CupertinoTheme, type CupertinoThemeProps, CupertinoTimerPicker, type CupertinoTimerPickerMode, type CupertinoTimerPickerProps, type Curve, CustomPaint, type CustomPaintProps, type CustomPaintRef, CustomScrollView, type CustomScrollViewProps, type DatePickerDateOrder, DecoratedBoxTransition, type DecoratedBoxTransitionProps, DefaultTabController, type DefaultTabControllerProps, DefaultTextStyle, type DefaultTextStyleProps, Device, type DeviceOrientation, Dialog, type DialogRoute, type DismissDirection, Dismissable, type DismissableProps, type Dispatch, DottedBorder, type DottedBorderProps, DottedLine, type DottedLineProps, type DragDownDetails, type DragEndDetails, type DragUpdateDetails, type EdgeInsets, type EdgeInsetsDirectional, type EffectDestructor, type EffectSetup, type Encoding, Event, type EventListener, EventListenerManager, type EventPosition, Expanded, type ExpandedProps, FadeTransition, type FadeTransitionProps, FileImage, type FileImageProps, FileManager, FilePicker, type FilterQuality, FittedBox, type FittedBoxProps, type FontStyle, type FontWeight, FormData, type FunctionComponent, GestureDetector, type GestureDetectorProps, type GetDirectoryPathOptions, Gif, type GifProps, type GridDelegateWithFixedCrossAxisCount, type GridDelegateWithMaxCrossAxisExtent, GridView, type GridViewCommonProps, type GridViewFixedCrossAxisCountProps, type GridViewMaxCrossAxisExtentProps, type GridViewProps, HStack, type HStackProps, Headers, type HeadersInit, HeadlessWebView, Hero, type HeroProps, HighlighterView, type HighlighterViewProps, type HitTestBehavior, Icon, type IconProps, IgnorePointer, type IgnorePointerProps, Image, type ImageByteFormat, ImageData, type ImageFilter, type ImageFilterBlur, type ImageFilterCompose, type ImageFilterDilate, type ImageFilterErode, type ImageFilterMaxtrix, ImageGallery, type ImageRepeat, ImageSaver, type ImpactFeedBackStyle, type IndexRouteObject, IndexedStack, type IndexedStackProps, InkWell, type InkWellProps, type InternalWidgetRender, type IntervalCurve, IntrinsicHeight, type IntrinsicHeightProps, IntrinsicWidth, type IntrinsicWidthProps, type KeyProps, KeyboardVisibility, type KeyboardVisibilityProps, type LaunchMode, type LinearGradient, LinearProgressIndicator, type LinearProgressIndicatorProps, ListView, type ListViewProps, type LocaleState, type MainAxisAlignment, type MainAxisSize, Material, type MaterialPageRoute, type MaterialProps, Matrix3, MediaQuery, type MediaQueryData, type MediaQueryProps, type MediaQueryRemoveEdgeInsetsProps, MediaQueryRemovePadding, MediaQueryRemoveViewInsets, MediaQueryRemoveViewPadding, MemoryImage, type MemoryImageProps, Menu, MenuAction, type MenuActionProps, type MenuProps, type ModalBottomSheetRoute, type MutableRefObject, Navigator, type NavigatorProps, type NavigatorRef, NestedScrollView, type NestedScrollViewProps, NetworkImage, type NetworkImageProps, type NormalCurve, type NormalRouteObject, Notification, type Offset, Offstage, type OffstageProps, Opacity, type OpacityProps, type Orientation, type OtherwiseRouteObject, type OverScrollNotification, OverflowBox, type OverflowBoxProps, type OverlayVisibilityMode, Padding, type PaddingProps, type PageInfo, type PagePopEvent, type PagePopResultEvent, type PageRoute, PageView, type PageViewProps, type PaintRect, type PaintSize, Path2D, type PickFileOption, type PickFileOptions, type PlaceholderAlignment, PopScope, type PopScopeProps, Positioned, type PositionedProps, PositionedTransition, type PositionedTransitionProps, type Provider, type ProviderProps, type PushNamedRouteOptions, type PushRouteOptions, QRCode, QrImage, type QrImageProps, type RadialGradient, type Reducer, type ReducerAction, type ReducerState, type RefObject, type RefProps, RefreshIndicator, type RefreshIndicatorProps, type RelativeRect, type RenderNode, type RenderObject, type RenderObjectShowOnScreenOptions, ReorderableColumn, type ReorderableColumnProps, ReorderableListView, type ReorderableListViewProps, ReorderableTable, type ReorderableTableProps, ReorderableTableRow, type ReorderableTableRowProps, ReorderableWrap, type ReorderableWrapProps, RepaintBoundary, type RepaintBoundaryProps, type RepaintBoundaryRef, Request, type RequestInit, Response, type ResponseInit, RichSelectableText, type RichSelectableTextProps, RichText, type RichTextProps, RotatedBox, type RotatedBoxProps, RotationTransition, type RotationTransitionProps, type RouteObject, type RouteParams, Router, RouterProvider, Row, type RowProps, SafeArea, type SafeAreaProps, type SaveFileOption, type ScaleEndDetails, type ScaleStartDetails, ScaleTransition, type ScaleTransitionProps, type ScaleUpdateDetails, Script, type ScriptingDeviceInfo, type ScrollEndNotification, type ScrollMetrics, type ScrollNotification, ScrollNotificationListener, type ScrollNotificationListenerProps, type ScrollOrientation, type ScrollPhysics, type ScrollStartNotification, type ScrollUpdateNotification, type ScrollViewKeyboardDismissBehavior, Scrollbar, type ScrollbarProps, SelectableText, type SelectableTextProps, type SetStateAction, Share, type ShareResultStatus, SingleChildScrollView, type SingleChildScrollViewProps, SizeTransition, type SizeTransitionProps, SizedBox, type SizedBoxProps, SlideTransition, type SlideTransitionProps, SliverFillRemaining, type SliverFillRemainingProps, SliverFixedHeightPersistentHeader, type SliverFixedHeightPersistentHeaderProps, SliverToBoxAdapter, type SliverToBoxAdapterProps, SocketIO, type SocketIOOptions, Spacer, type SpacerProps, Stack, type StackFit, type StackProps, type StateInitializer, StickyHeader, type StickyHeaderProps, Storage, StringSvg, type StringSvgProps, type StrokeCap, type StrutStyle, Svg, type SvgProps, type SweepGradient, Swiper, SwiperPagination, type SwiperPaginationProps, type SwiperProps, Switch, type SwitchProps, type SystemUIOverlayStyle, type TabAlignment, TabBar, type TabBarIndicatorSize, type TabBarProps, TabBarView, type TabBarViewProps, TabController, TabControllerConsumer, type TabControllerProps, TabControllerProvider, type TabControllerRef, type TabControllerRenderNode, type TableCellVerticalAlignment, type TakePhotoOptions, type TapDownDetails, type TapUpDetails, Text, type TextAlign, type TextAlignVertical, type TextBaseLine, type TextCapitalization, type TextDecoration, type TextDecorationStyle, type TextDirection, TextField, type TextFieldProps, type TextHeightBehavior, type TextInputAction, type TextInputType, type TextLeadingDistribution, type TextOverflow, type TextProps, TextSpan, type TextSpanProps, type TextStyle, type TextWidthBasis, type ThemeMode, type ThemeState, Ticker, TickerManager, TickerManagerConsumer, TickerManagerProvider, type TickerManagerProviderProps, type TickerManagerRef, type TileMode, TransformRotate, type TransformRotateProps, TransformScale, type TransformScaleProps, TransformTranslate, type TransformTranslateProps, type Tween, type TweenSequence, type TweenSequenceConstantItem, type TweenSequenceItem, type TweenType, type TypedParams, UnconstrainedBox, type UnconstrainedBoxProps, type UserScrollNotification, VStack, type VStackProps, type Velocity, type VerticalDirection, type VirtualNode, WebView, WebViewController, type WebViewProps, type WebViewSettings, Widget, type WidgetColor, type WidgetCommonProps, type WidgetContext, WidgetDate, WidgetDateInterval, type WidgetDateIntervalProps, type WidgetDateProps, WidgetDateRange, type WidgetDateRangeProps, type WidgetDateTextProps, type WidgetDisplaySize, WidgetDivider, type WidgetFamily, WidgetImage, type WidgetImageProps, type WidgetInitializer, WidgetLink, type WidgetLinkProps, type WidgetPadding, WidgetSpacer, WidgetSpan, type WidgetSpanProps, WidgetText, type WidgetTextProps, WidgetTimerInterval, type WidgetTimerIntervalProps, type WidgetUIColor, Worker, type WorkerErrorListener, type WorkerMessageListener, Wrap, type WrapAlignment, type WrapCrossAlignment, type WrapProps, type WrappedRouter, ZStack, type ZStackProps, createContext, downloadFile, fetch, launchUrl, loadBytes, loadFont, loadJson, loadString, navigator, runApp, useAnimationController, useByTheme, useCallback, useCancelToken, useContext, useCupertinoColors, useEffect, useEffectEvent, useLocale, useMediaQuery, useMemo, useNavigator, useReducer, useRef, useRouteParams, useRouter, useSelector, useState, useTabController, useThemeState, useTickerManager };
