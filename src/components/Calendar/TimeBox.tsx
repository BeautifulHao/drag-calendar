import React, { useState, useEffect, MouseEvent } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import moment from "moment";

export type TimeBoxType = {
    top: number,
    height: number,
    dayIndex: number,
    tail: number,
    unique: number
}

export interface TimeBoxProps {
    item: TimeBoxType
    onLocationChange: (timeBoxObject: TimeBoxType) => void,
    onLocationChanging?: (timeBoxObject: TimeBoxType) => void,
    onClose: (TimeBoxObject: TimeBoxType) => void
}

const defaultShowStyle = { zIndex: 0, opacity: 0.9 };
const handlerStyle = { zIndex: 1, opacity: 0.8 };
const maxHeight = 1440;

const ComputerShowTime = (time: number) => {
    return moment("2020-08-08 00:00").add(time, "minutes").format("HH:mm");
};

export const TimeBox: React.FC<TimeBoxProps> = (props) => {
    const {
        onLocationChange,
        onLocationChanging,
        onClose,
        item: {
            top,
            height,
            dayIndex,
            unique,
            tail,
        }
    } = props;

    const [itemTop, setItemTop] = useState(top);
    const [itemHeight, setItemHeight] = useState(height);
    const [focusStyle, setFocusStyle] = useState({ ...defaultShowStyle });
    let beginTime = ComputerShowTime(top);
    let endTime = ComputerShowTime(tail);

    useEffect(() => {
        setItemTop(top);
        setItemHeight(height);
    }, [top, height]);

    const MouseDownHander = (event: MouseEvent) => {
        let orgY = event.pageY;
        let eleY = itemTop;
        let hasMove = true;
        let lastTop = itemTop;
        setFocusStyle({ ...handlerStyle });

        document.onmousemove = (e: globalThis.MouseEvent) => {
            if (hasMove) {
                lastTop = eleY + Math.round((e.pageY - orgY) / 15) * 15;
                lastTop = lastTop <= 0 ? 0 : lastTop;
                lastTop =
                    lastTop + itemHeight >= maxHeight ? maxHeight - itemHeight : lastTop;

                setItemTop(lastTop);

                if (
                    onLocationChanging &&
                    onLocationChanging instanceof Function &&
                    top !== lastTop
                ) {
                    onLocationChanging(
                        {
                            top: lastTop,
                            height: itemHeight,
                            dayIndex: dayIndex,
                            unique: unique,
                            tail: top + height
                        }
                    );
                }
            }
        };

        document.onmouseup = (e) => {
            setFocusStyle({ ...defaultShowStyle });
            hasMove = false;
            document.onmousemove = null;
            document.onmouseup = null;

            if (
                onLocationChange &&
                onLocationChange instanceof Function &&
                top !== lastTop
            ) {
                onLocationChange({ top: lastTop, height: itemHeight, dayIndex, unique, tail: lastTop + itemHeight });
            }
        };
    };

    const ResizeHander = (event: React.MouseEvent) => {
        let disY = event.clientY;
        let height = itemHeight;
        let hasResize = true;
        let lastHeight = itemHeight;
        event.stopPropagation();
        setFocusStyle({ ...handlerStyle });

        document.onmousemove = (ev: globalThis.MouseEvent) => {
            if (hasResize) {
                lastHeight = Math.round((ev.clientY - disY) / 15) * 15 + height;
                if (lastHeight < 15) {
                    lastHeight = 15;
                }
                if (itemTop + lastHeight > maxHeight) {
                    lastHeight = maxHeight - itemTop;
                }
                setItemHeight(lastHeight);

                if (
                    onLocationChanging &&
                    onLocationChanging instanceof Function &&
                    lastHeight !== height
                ) {
                    onLocationChanging(
                        {
                            top: itemTop,
                            height: lastHeight,
                            dayIndex: dayIndex,
                            unique: unique,
                            tail: itemTop + lastHeight
                        }
                    );
                }
            }
        };
        document.onmouseup = () => {
            setFocusStyle({ ...defaultShowStyle });
            hasResize = false;
            document.onmousemove = null;
            document.onmouseup = null;
            if (
                onLocationChange &&
                onLocationChange instanceof Function &&
                lastHeight !== height
            ) {
                onLocationChange({ top: itemTop, height: lastHeight, dayIndex, unique, tail: lastHeight + itemTop });
            }
        };
    };

    const CloseHander = (event: MouseEvent) => {
        if (onClose && onClose instanceof Function) {
            onClose({ top, height, unique, dayIndex, tail });
        }
    };

    return (
        <div
            className="calendar-timebox"
            style={{
                top: itemTop,
                height: itemHeight,
                left: dayIndex * 90,
                ...focusStyle,
            }}
            onMouseDown={MouseDownHander}
            title={itemHeight === 15 ? `${beginTime}-${endTime}` : undefined}
        >
            {itemHeight > 15 ? (
                <span className="calendar-time-label">{`${beginTime}-${endTime}`}</span>
            ) : null}
            <FontAwesomeIcon
                style={{ color: "#FA5858" }}
                className="calendar-timebox-close"
                icon={faTimesCircle}
                onClick={CloseHander}
            ></FontAwesomeIcon>
            <div className="calendar-timebox-resize" onMouseDown={ResizeHander}></div>
        </div>
    );
}

export default TimeBox