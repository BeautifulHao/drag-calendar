import React, { useState, useRef, useEffect } from "react";
import TimeBox from "./TimeBox";
import { TimeBoxType } from './TimeBox'

type common = {
    [key: string]: number
}

export const weekend: common = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
};

const hours: string[] = [
    "00:00",
    "01:00",
    "02:00",
    "03:00",
    "04:00",
    "05:00",
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
];

const maxScrollTop: number = 743;
const modelHeight: number = 700;

export type TimeBoxObjectWrap = {
    data: TimeBoxType[]
}

export interface CalendarProps {
    fetchCalendarData: () => Promise<TimeBoxObjectWrap>;
    onCalendarChange: (calendar: TimeBoxType[]) => void;
}

export const Calendar: React.FC<CalendarProps> = (props) => {
    const { fetchCalendarData, onCalendarChange } = props
    const [calendar, setCalendar] = useState<TimeBoxType[]>([]);
    const modelRef = useRef<HTMLDivElement>(null);
    const hasInit = useRef<boolean>(false);
    let beginKey: number = new Date().valueOf();


    useEffect(() => {
        fetchCalendarData().then((res) => {
            const { data: calendarList } = res;
            setCalendar(calendarList);
            hasInit.current = true;

            if (calendarList && calendarList.length > 0) {
                let minTopItem = { ...calendarList[0] };
                calendarList.forEach((item) => {
                    if (item.top < minTopItem.top) {
                        minTopItem = { ...item };
                    }
                });
                moveScroll(minTopItem.top - 60);
            }
        });
    }, [fetchCalendarData]);

    useEffect(() => {
        if (hasInit.current===true && onCalendarChange) {
            onCalendarChange(calendar)
        }
    }, [calendar, onCalendarChange])

    const moveScroll = (value: number) => {
        value = value < 0 ? 0 : value;
        value = Math.min(maxScrollTop, value);
        if (modelRef.current !== null) {
            modelRef.current.scrollTop = value;
        }
    };

    const handlerTimeBoxChange = (item: TimeBoxType) => {
        const { top, height, dayIndex, unique } = item
        handlerScrollAtMoveAndResize(item);
        let handler = handlerData({ top, height, dayIndex, unique, tail: top + height });
        setCalendar(handler);
    };

    const handlerScrollAtMoveAndResize = (item: TimeBoxType) => {
        const { top, height, unique } = item
        //处理时间块调整滚动条位置的变化
        calendar
            .filter((item) => item.unique === unique)
            .forEach((target) => {
                const { top: _top } = target;
                if (top === _top) {
                    //resize过程,判断tail外放15px是否会超过下边缘
                    const beautifulTailHeight = top + height + 60;
                    if (modelRef.current && beautifulTailHeight > modelRef.current.scrollTop + modelHeight) {
                        moveScroll(beautifulTailHeight - modelHeight);
                    }
                } else {
                    //move过程
                    if (top > _top) {
                        //下移位置
                        const beautifulTailHeight = top + height + 15;
                        if (
                            modelRef.current && beautifulTailHeight >
                            modelRef.current.scrollTop + modelHeight
                        ) {
                            moveScroll(beautifulTailHeight - modelHeight);
                        }
                    } else {
                        //上移位置
                        const beautifulTailHeight = top;
                        if (modelRef.current && beautifulTailHeight < modelRef.current.scrollTop) {
                            moveScroll(beautifulTailHeight - 15);
                        }
                    }
                }
            });
    };

    const handlerTimeBoxClose = (timeBox: TimeBoxType) => {
        const { unique, dayIndex } = timeBox
        const lastCalendar = calendar.filter(
            (item) => dayIndex !== item.dayIndex || item.unique !== unique
        );
        setCalendar([...lastCalendar]);
    };

    const handlerData = (change: TimeBoxType) => {
        const calendarDate = [...calendar];
        change.tail = change.top + change.height;
        let changeDay = [];

        //同天非当前时间段数据
        let changeDayList = calendarDate.filter(
            (item) =>
                item.dayIndex === change.dayIndex && item.unique !== change.unique
        );

        //其他天不变
        let otherDayList = calendarDate.filter(
            (item) => item.dayIndex !== change.dayIndex
        );

        changeDayList.forEach((item) => {
            let keepItem = true;
            //同天非修改的时间段
            if (change.top >= item.top && change.top <= item.tail) {
                change.top = item.top;
                change.tail = Math.max(change.tail, item.tail);
                keepItem = false;
            }

            if (change.tail >= item.top && change.tail <= item.tail) {
                change.top = Math.min(change.top, item.top);
                change.tail = item.tail;
                keepItem = false;
            }

            if (item.top >= change.top && item.tail <= change.tail) {
                keepItem = false;
            }

            change.height = change.tail - change.top;

            if (keepItem) {
                changeDay.push({ ...item });
            }
        });

        changeDay.push({ ...change });

        return [...otherDayList, ...changeDay];
    };

    const computerScrollTop = (item: TimeBoxType) => {
        let top = item.top + Math.floor(item.height / 2) - modelHeight / 2;
        top = Math.min(maxScrollTop, top);
        top = Math.max(0, top);
        moveScroll(top);
    };

    const addATime = (dayIndex: number, event: React.MouseEvent) => {
        const currentDayCalendar = calendar.filter(
            (item) => item.dayIndex === dayIndex
        );
        //最大末尾时间
        let maxTail = 0;
        currentDayCalendar.forEach((item) => {
            maxTail = Math.max(maxTail, item.tail);
        });
        const lastGap = 60 * 24 - maxTail;

        //末尾有时间，则在末尾添加
        if (lastGap > 0) {
            //大于一个小时，新增一个小时
            addItem(lastGap, maxTail, dayIndex);
        } else {
            //从开始添加可用空隙
            addTimeAtOtherSpace(dayIndex, event);
        }
    };

    const addTimeAtOtherSpace = (dayIndex: number, event: React.MouseEvent) => {
        const currentDayCalendar = calendar
            .filter((item) => item.dayIndex === dayIndex)
            .sort((a, b) => a.top - b.top);

        let lastItem = undefined;

        for (let index = 0; index < currentDayCalendar.length; index++) {
            const current = currentDayCalendar[index];
            let gap = 0;
            if (index === 0) {
                if (current.top > 0) {
                    gap = current.top;
                    addItem(gap, 0, dayIndex);
                    break;
                } else {
                    lastItem = current;
                }
            } else {
                //最后一个直接结束
                if (index === currentDayCalendar.length - 1) {
                    gap = 60 * 24 - current.tail;
                    if (gap > 0) {
                        addItem(gap, current.tail, dayIndex);
                    }
                } else {
                    if (lastItem) {
                        gap = current.top - lastItem.tail;
                        if (gap > 0) {
                            addItem(gap, lastItem.tail, dayIndex);
                            break;
                        } else {
                            lastItem = current;
                        }
                    }
                }
            }
        }
    };

    const addItem = (gap: number, top: number, dayIndex: number) => {
        const height = gap >= 60 ? 60 : gap;
        const tail = top + height;
        const unique = beginKey++;
        console.log(unique)

        let addTime: TimeBoxType = {
            top, height, dayIndex, tail, unique
        };

        setCalendar((calendar) => {
            return [...calendar, addTime];
        });

        computerScrollTop(addTime);
    };

    const allInOne = (dayIndex: number, event: React.MouseEvent) => {
        const currentDayCalendar = calendar.filter(
            (item) => item.dayIndex === dayIndex
        );

        const allInOneCalendar = [...currentDayCalendar];

        Object.keys(weekend).forEach((key) => {
            if (weekend[key] !== dayIndex) {
                currentDayCalendar.forEach((item) => {
                    allInOneCalendar.push({
                        ...item,
                        dayIndex: weekend[key],
                        unique: beginKey++,
                    });
                });
            }
        });
        setCalendar([...allInOneCalendar]);
    };

    return (
        <React.Fragment>
            <div className="calendar-week-warp">
                <div className="calendar-week-bar">
                    {Object.keys(weekend).map((key) => {
                        return (
                            <div className="calendar-week-title" key={key}>
                                <div>{key}</div>
                                <div>
                                    <button onClick={(e) => addATime(weekend[key], e)}>+</button>
                                    <button onClick={(e) => allInOne(weekend[key], e)} style={{ marginLeft: 4 }}>√</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="calendar-model" ref={modelRef}>
                <div className="calendar-time">
                    {hours.map((hour) => {
                        return (
                            <div key={hour} className="calendar-time-hour">
                                {hour}
                            </div>
                        );
                    })}
                </div>
                <div className="calendar-container">
                    {calendar.map((item) => {
                        return (
                            <TimeBox
                                key={item.unique}
                                item={{ ...item }}
                                onLocationChange={handlerTimeBoxChange}
                                onClose={handlerTimeBoxClose}
                            ></TimeBox>
                        );
                    })}
                </div>
            </div>
        </React.Fragment>
    );
}

export default Calendar