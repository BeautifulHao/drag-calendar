import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import { Calendar, CalendarProps, TimeBoxObjectWrap, weekend } from './Calendar'
import { TimeBoxType } from './TimeBox'
import moment from 'moment'

const someDay = "2020-08-08";
const someDayBegin = moment("2020-08-08 00:00");
let beginKey = new Date().valueOf();

type common = {
    [key: string]: dayItem[]
}

interface dayItem {
    startTime: string;
    endTime: string;
    opened: boolean;
}

const calendarData: common = {
    monday: [
        {
            startTime: "10:00",
            endTime: "12:00",
            opened: true,
        },
        {
            startTime: "13:00",
            endTime: "14:00",
            opened: false,
        },
        {
            startTime: "14:00",
            endTime: "18:00",
            opened: true,
        },
    ],
    tuesday: [
        {
            startTime: "10:00",
            endTime: "12:00",
            opened: true,
        },
        {
            startTime: "13:00",
            endTime: "14:00",
            opened: false,
        },
        {
            startTime: "14:00",
            endTime: "18:00",
            opened: true,
        },
    ],
    wednesday: [
        {
            startTime: "10:00",
            endTime: "12:00",
            opened: true,
        },
        {
            startTime: "13:00",
            endTime: "14:00",
            opened: false,
        },
        {
            startTime: "14:00",
            endTime: "18:00",
            opened: true,
        },
    ],
    thursday: [
        {
            startTime: "10:00",
            endTime: "12:00",
            opened: true,
        },
        {
            startTime: "13:00",
            endTime: "14:00",
            opened: false,
        },
        {
            startTime: "14:00",
            endTime: "18:00",
            opened: true,
        },
    ],
    friday: [
        {
            startTime: "10:00",
            endTime: "12:00",
            opened: true,
        },
        {
            startTime: "13:00",
            endTime: "14:00",
            opened: false,
        },
        {
            startTime: "14:00",
            endTime: "18:00",
            opened: true,
        },
    ],
    saturday: [
        {
            startTime: "10:00",
            endTime: "12:00",
            opened: true,
        },
        {
            startTime: "13:00",
            endTime: "14:00",
            opened: false,
        },
        {
            startTime: "14:00",
            endTime: "18:00",
            opened: true,
        },
    ],
    sunday: [
        {
            startTime: "10:00",
            endTime: "12:00",
            opened: true,
        },
        {
            startTime: "13:00",
            endTime: "14:00",
            opened: false,
        },
        {
            startTime: "14:00",
            endTime: "18:00",
            opened: true,
        },
    ],
};

export default {
    title: 'Example/Calendar',
    component: Calendar
} as Meta;

const getInitData: () => Promise<TimeBoxObjectWrap> = () => {

    const formatInfo: TimeBoxType[] = [];

    Object.keys(weekend).forEach((day) => {
        let dayIndex = weekend[day];
        calendarData[day].forEach((item) => {
            let startTime = moment(`${someDay} ${item.startTime}`);
            let endTime = moment(`${someDay} ${item.endTime}`);

            let diffTop = startTime.diff(someDayBegin, "minutes");
            let top = Math.floor(diffTop / 15) * 15;
            let diffHeight = endTime.diff(startTime, "minutes");
            let height = Math.floor(diffHeight / 15) * 15;

            formatInfo.push({
                top,
                height,
                dayIndex,
                tail: top + height,
                unique: beginKey++,
            });
        });
    });

    return Promise.resolve({ data: formatInfo });
};

const Template: Story<CalendarProps> = (args: CalendarProps) => (<Calendar {...args} />);

export const DefaultCalendar = Template.bind({});

DefaultCalendar.args = { fetchCalendarData: getInitData };