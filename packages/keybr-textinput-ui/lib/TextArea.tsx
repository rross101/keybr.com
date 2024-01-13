import { type LineList, type TextDisplaySettings } from "@keybr/textinput";
import {
  type KeyEvent,
  ModifierState,
  TextEvents,
  type TextInputEvent,
} from "@keybr/textinput-events";
import { useWindowEvent } from "@keybr/widget";
import {
  type BaseSyntheticEvent,
  type ComponentType,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { FormattedMessage } from "react-intl";
import * as styles from "./TextArea.module.less";
import { TextLines, type TextLineSize } from "./TextLines.tsx";

export type Focusable = {
  blur(): void;
  focus(): void;
};

export function TextArea({
  settings,
  lines,
  wrap,
  size,
  lineTemplate,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp,
  onTextInput,
  focusRef,
}: {
  readonly settings: TextDisplaySettings;
  readonly lines: LineList;
  readonly wrap?: boolean;
  readonly size?: TextLineSize;
  readonly lineTemplate?: ComponentType<any>;
  readonly onFocus?: () => void;
  readonly onBlur?: () => void;
  readonly onKeyDown?: (event: KeyEvent) => void;
  readonly onKeyUp?: (event: KeyEvent) => void;
  readonly onTextInput?: (event: TextInputEvent) => void;
  readonly focusRef?: RefObject<Focusable>;
}): ReactNode {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<Focusable>(null);
  useImperativeHandle(focusRef, () => ({
    focus() {
      innerRef.current?.focus();
    },
    blur() {
      innerRef.current?.blur();
    },
  }));
  const [focus, setFocus] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (element != null) {
      setElementSize(element);
    }
  }, [settings, lines.text, wrap, size]);
  useEffect(() => {
    const element = ref.current;
    if (element != null) {
      setElementCursor(element, focus ? "none" : "default");
    }
  });
  useWindowEvent("mousemove", () => {
    const element = ref.current;
    if (element != null) {
      setElementCursor(element, "default");
    }
  });
  useWindowEvent("keydown", (ev) => {
    if (ev.key === "Enter") {
      innerRef.current?.focus();
    }
  });
  const handleFocus = useCallback(() => {
    setFocus(true);
    onFocus?.();
  }, [onFocus]);
  const handleBlur = useCallback(() => {
    // setFocus(false);
    onBlur?.();
  }, [onBlur]);
  const handleClick = (event: BaseSyntheticEvent): void => {
    innerRef.current?.focus();
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    <div
      ref={ref}
      className={styles.textArea}
      onMouseDown={handleClick}
      onMouseUp={handleClick}
    >
      <TextEvents
        focusRef={innerRef}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onTextInput={onTextInput}
      />
      <TextLines
        settings={settings}
        lines={lines}
        wrap={wrap}
        size={size}
        lineTemplate={lineTemplate}
        cursor={focus}
        focus={focus}
      />
      {focus && ModifierState.capsLock && (
        <div className={styles.messageArea}>
          <div className={styles.messageText}>
            <FormattedMessage
              id="textArea.capsLock.message"
              defaultMessage="Caps Lock is on"
            />
          </div>
        </div>
      )}
      {focus || (
        <div className={styles.messageArea}>
          <div className={styles.messageText}>
            <FormattedMessage
              id="textArea.focus.message"
              defaultMessage="Click or press Enter to activate..."
            />
          </div>
        </div>
      )}
    </div>
  );
}

function setElementSize(element: HTMLDivElement): void {
  const { style } = element;
  style.contain = "none";
  style.width = "auto";
  style.height = "auto";
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  style.contain = "strict";
  style.width = `${width}px`;
  style.height = `${height}px`;
}

function setElementCursor(element: HTMLDivElement, cursor: string): void {
  const { style } = element;
  style.cursor = cursor;
}
