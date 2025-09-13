import React, { useState, useRef, useEffect, useId } from "react";
import "../css/Tooltip.css";


export default function Tooltip({
    content,
    children,
    disabled = false,
    className = "",
    delay = 50,
    width
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
                className="tooltip-content"
                style={{width}}
            >
                {content}
            </span>
        </span>
    );
}
