import React, { useState, useRef, useEffect, useId } from "react";
import "../css/Tooltip.css";

/**
 * Tooltip usage:
 * <Tooltip content="Hello" position="top"> <button>Hover me</button> </Tooltip>
 */
export default function Tooltip({
    content,
    children,
    position = "top", // top | right | bottom | left
    align = "center", // center | start | end (for left/right adjustments)
    disabled = false,
    className = "",
    delay = 100,
}) {
    const [visible, setVisible] = useState(false);
    const [timer, setTimer] = useState(null);
    const id = useId();
    const tooltipRef = useRef(null);
    const wrapperRef = useRef(null);

    useEffect(() => () => timer && clearTimeout(timer), [timer]);

    const show = () => {
        if (disabled) return;
        if (timer) clearTimeout(timer);
        setTimer(setTimeout(() => setVisible(true), delay));
    };
    const hide = () => {
        if (timer) clearTimeout(timer);
        setVisible(false);
    };

    // Clone child to add aria-describedby for accessibility
    let target = children;
    if (React.isValidElement(children)) {
        target = React.cloneElement(children, {
            "aria-describedby": visible ? id : undefined,
            onFocus: (e) => {
                children.props.onFocus && children.props.onFocus(e);
                show();
            },
            onBlur: (e) => {
                children.props.onBlur && children.props.onBlur(e);
                hide();
            },
            onMouseEnter: (e) => {
                children.props.onMouseEnter && children.props.onMouseEnter(e);
                show();
            },
            onMouseLeave: (e) => {
                children.props.onMouseLeave && children.props.onMouseLeave(e);
                hide();
            },
        });
    }

    return (
        <span className={`tooltip-wrapper ${className}`} ref={wrapperRef}>
            {target}
            <span
                ref={tooltipRef}
                id={id}
                role="tooltip"
                data-visible={visible}
                data-position={position}
                data-align={align}
                className="tooltip-content"
            >
                {content}
            </span>
        </span>
    );
}
