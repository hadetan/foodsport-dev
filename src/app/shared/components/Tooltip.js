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

    if (!content) return;
    const [visible, setVisible] = useState(false);
    const [timer, setTimer] = useState(null);
    const [position, setPosition] = useState('top');
    const [alignment, setAlignment] = useState('center');
    const id = useId();
    const tooltipRef = useRef(null);
    const wrapperRef = useRef(null);

    useEffect(() => () => timer && clearTimeout(timer), [timer]);

    useEffect(() => {
        if (!visible) return;

        // Calculate position when tooltip becomes visible
        calculatePosition();

        // Recalculate on resize and scroll with debouncing
        let resizeTimer;
        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (visible) calculatePosition();
            }, 100);
        };

        const handleScroll = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (visible) calculatePosition();
            }, 50);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll, true);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll, true);
            clearTimeout(resizeTimer);
        };
    }, [visible]);

    const calculatePosition = () => {
        if (!tooltipRef.current || !wrapperRef.current) return;

        const tooltip = tooltipRef.current.getBoundingClientRect();
        const wrapper = wrapperRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const margin = 8; // Minimum spacing from viewport edges
        const arrowSize = 15; // Match CSS arrow size

        // Calculate available space in all directions
        const spaceAbove = wrapper.top;
        const spaceBelow = viewportHeight - wrapper.bottom;
        const spaceLeft = wrapper.left;
        const spaceRight = viewportWidth - wrapper.right;

        let bestPosition = 'top';
        let bestAlignment = 'center';

        // Helper function to check if tooltip fits with given position and alignment
        const checkFit = (pos, align) => {
            let fitsVertically = false;
            let fitsHorizontally = false;

            if (pos === 'top' || pos === 'bottom') {
                const space = pos === 'top' ? spaceAbove : spaceBelow;
                fitsVertically = space >= tooltip.height + arrowSize + margin;

                // Check horizontal fit based on alignment
                if (align === 'center') {
                    const leftEdge = wrapper.left + wrapper.width / 2 - tooltip.width / 2;
                    const rightEdge = leftEdge + tooltip.width;
                    fitsHorizontally = leftEdge >= margin && rightEdge <= viewportWidth - margin;
                } else if (align === 'start') {
                    fitsHorizontally = wrapper.left + tooltip.width <= viewportWidth - margin;
                } else if (align === 'end') {
                    fitsHorizontally = wrapper.right - tooltip.width >= margin;
                }
            } else if (pos === 'left' || pos === 'right') {
                const space = pos === 'left' ? spaceLeft : spaceRight;
                fitsHorizontally = space >= tooltip.width + arrowSize + margin;

                // Check vertical fit based on alignment
                if (align === 'center') {
                    const topEdge = wrapper.top + wrapper.height / 2 - tooltip.height / 2;
                    const bottomEdge = topEdge + tooltip.height;
                    fitsVertically = topEdge >= margin && bottomEdge <= viewportHeight - margin;
                } else if (align === 'start') {
                    fitsVertically = wrapper.top + tooltip.height <= viewportHeight - margin;
                } else if (align === 'end') {
                    fitsVertically = wrapper.bottom - tooltip.height >= margin;
                }
            }

            return fitsVertically && fitsHorizontally;
        };

        // Priority order: top → bottom → left → right
        const positions = ['top', 'bottom', 'left', 'right'];
        const alignments = ['center', 'start', 'end'];

        // Try each position with each alignment
        let found = false;
        for (const pos of positions) {
            for (const align of alignments) {
                if (checkFit(pos, align)) {
                    bestPosition = pos;
                    bestAlignment = align;
                    found = true;
                    break;
                }
            }
            if (found) break;
        }

        // If no position fits perfectly, use the one with most space
        if (!found) {
            const spaces = [
                { pos: 'top', space: spaceAbove },
                { pos: 'bottom', space: spaceBelow },
                { pos: 'left', space: spaceLeft },
                { pos: 'right', space: spaceRight }
            ];
            spaces.sort((a, b) => b.space - a.space);
            bestPosition = spaces[0].pos;

            // Adjust alignment based on horizontal position for top/bottom
            if (bestPosition === 'top' || bestPosition === 'bottom') {
                const centerX = wrapper.left + wrapper.width / 2;
                const tooltipHalfWidth = tooltip.width / 2;

                if (centerX - tooltipHalfWidth < margin) {
                    bestAlignment = 'start';
                } else if (centerX + tooltipHalfWidth > viewportWidth - margin) {
                    bestAlignment = 'end';
                } else {
                    bestAlignment = 'center';
                }
            } else {
                // Adjust alignment based on vertical position for left/right
                const centerY = wrapper.top + wrapper.height / 2;
                const tooltipHalfHeight = tooltip.height / 2;

                if (centerY - tooltipHalfHeight < margin) {
                    bestAlignment = 'start';
                } else if (centerY + tooltipHalfHeight > viewportHeight - margin) {
                    bestAlignment = 'end';
                } else {
                    bestAlignment = 'center';
                }
            }
        }

        setPosition(bestPosition);
        setAlignment(bestAlignment);
    };

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
                data-position={position}
                data-align={alignment}
                className="tooltip-content"
                style={{width}}
            >
                {content}
            </span>
        </span>
    );
}
