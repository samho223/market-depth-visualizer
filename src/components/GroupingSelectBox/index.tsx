import React, { ChangeEvent, FunctionComponent } from 'react';

import { Container } from "./Container";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { selectGrouping, setGrouping } from "../OrderBook/orderbookSlice";

interface GroupingSelectBoxProps {
  options: number[]
}

export const GroupingSelectBox: FunctionComponent<GroupingSelectBoxProps> = ({options}) => {
  // groupingSize is found by useAppSelector, with selectGrouping as its call-back
  // as a result, groupingSize = state.orderbook.groupingSize
  const groupingSize: number = useAppSelector(selectGrouping);
  const dispatch = useAppDispatch();

  // used for onchange event
  // ChangeEvent<HTMLSelectElement> is the type for change event in select
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatch(setGrouping(Number(event.target.value)));
  };

  return (
    <Container>
      <select data-testid="groupings" name="groupings" onChange={handleChange} defaultValue={groupingSize}>
        {/* key is neccesssary for .map() in jsx.  */}
        {options.map((option, idx) => <option key={idx} value={option}>Group {option}</option>)}
      </select>

    </Container>
  );
};

export default GroupingSelectBox;
