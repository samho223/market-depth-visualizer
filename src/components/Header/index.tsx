import React, { FunctionComponent } from 'react';

import { Container } from "./styles";
import GroupingSelectBox from "../GroupingSelectBox";

interface HeaderProps {
  options: number[];
}
// Header is a FunctionComponent that receive HeaderProps as props.
// and the call-back function has to do something with the childen in HeaderProps, 
// here options is the childen
const Header: FunctionComponent<HeaderProps> = ({options}) => {
  return (
    <Container>
      <h3>Market Depth Visualizer</h3>
      <GroupingSelectBox options={options} />
    </Container>
  );
};

export default Header;
