import React from 'react'
import { render, RenderResult, fireEvent, waitFor } from '@testing-library/react'
import { CalendarProps, Calendar } from './Calendar'


const defaultProps:CalendarProps ={
    fetchCalendarData:jest.fn()
}

let wrapper: RenderResult;

describe('test Calendar component', () => {

    beforeEach(() => {
        wrapper = render(<Calendar {...defaultProps} />)
    })

    it('test basic Calendar behavior', async () => {

    })

})